package app.mindcircle.android.core.e2ee

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import app.mindcircle.android.core.ApiClient
import app.mindcircle.android.core.jsonBody
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerialName
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonPrimitive
import java.math.BigInteger
import java.security.KeyStore
import java.security.interfaces.ECPublicKey
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * The Android runtime for E2EE — the twin of `src/lib/e2ee/client.ts`.
 *
 * Holds the account root key (ARK) in memory, seals it for this device with a
 * non-exportable AndroidKeyStore AES key so relaunches stay unlocked, and talks
 * to `/api/e2ee` for the envelopes the server stores (all ciphertext).
 *
 * The 12-word recovery phrase is the only way onto a new device. It is shown
 * once, never stored, and cannot be reset — that is the property that keeps
 * MindCircle itself out of the data.
 */
object E2eeManager {

    enum class State { UNKNOWN, NOT_SETUP, LOCKED, UNLOCKED, UNAVAILABLE }

    @Serializable
    data class StatusDto(
        val initialized: Boolean = false,
        val userId: String = "",
        val publicKey: String? = null,
        val encryptedPrivateKey: String? = null,
        val kdf: String? = null,
        val iterations: Int? = null,
        val salt: String? = null,
        val wrappedRootKey: String? = null,
    )

    /** One row of GET /api/e2ee/pubkeys — identity PUBLIC keys only. */
    @Serializable
    data class PeerKeyDto(
        @SerialName("user_id") val userId: String = "",
        @SerialName("public_key") val publicKey: String = "",
    )

    @Serializable
    data class PeerKeysDto(val data: List<PeerKeyDto> = emptyList())

    var state by mutableStateOf(State.UNKNOWN)
        private set
    var busy by mutableStateOf(false)
        private set
    var error by mutableStateOf<String?>(null)
        private set

    private var ark: ByteArray? = null
    private var identityPrivate: java.security.PrivateKey? = null
    private var identityPublicB64: String? = null
    private var journalKey: ByteArray? = null
    private var userId: String? = null
    private var pending: PendingSetup? = null

    /** Application context, captured once so lock()/seal() work anywhere. */
    @Volatile
    private var appContext: Context? = null

    private const val PREFS = "mindcircle_e2ee"
    private const val KEY_ALIAS = "mc_e2ee_wrap"

    fun attach(context: Context) {
        if (appContext == null) appContext = context.applicationContext
    }

    // ── device seal (AndroidKeyStore, non-exportable) ───────────────

    private fun deviceWrapKey(): SecretKey {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (store.getEntry(KEY_ALIAS, null) as? KeyStore.SecretKeyEntry)?.let { return it.secretKey }
        val generator = KeyGenerator.getInstance("AES", "AndroidKeyStore")
        generator.init(
            KeyGenParameterSpec.Builder(KEY_ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build(),
        )
        return generator.generateKey()
    }

    private fun prefs() = appContext!!.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    private fun sealForDevice(material: ByteArray) {
        val id = userId ?: return
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, deviceWrapKey())
        val iv = cipher.iv
        val ct = cipher.doFinal(material)
        prefs().edit().putString("sealed_ark_$id", E2ee.b64u(iv) + "|" + E2ee.b64u(ct)).apply()
    }

    private fun unsealFromDevice(): ByteArray? = try {
        val id = userId ?: return null
        val raw = prefs().getString("sealed_ark_$id", null) ?: return null
        val parts = raw.split('|')
        require(parts.size == 2)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, deviceWrapKey(), GCMParameterSpec(128, E2ee.unb64u(parts[0])))
        cipher.doFinal(E2ee.unb64u(parts[1]))
    } catch (_: Exception) {
        null
    }

    private fun clearDeviceSeal() {
        val id = userId ?: return
        prefs().edit().remove("sealed_ark_$id").apply()
    }

    // ── wordlist ────────────────────────────────────────────────────

    fun wordlist(context: Context): List<String> =
        context.assets.open("bip39-english.txt").bufferedReader().readLines().filter { it.isNotBlank() }

    // ── lifecycle ───────────────────────────────────────────────────

    /**
     * Refresh state from the server and try this device's sealed key. Call once
     * after sign-in; safe to call repeatedly.
     */
    suspend fun init(context: Context): Boolean {
        attach(context)
        busy = true
        error = null
        try {
            val dto = ApiClient.get<StatusDto>("/api/e2ee")
            userId = dto.userId
            if (!dto.initialized || dto.wrappedRootKey == null || dto.salt == null || dto.encryptedPrivateKey == null) {
                resetKeys()
                state = State.NOT_SETUP
                return false
            }
            if (ark != null && identityPublicB64 == dto.publicKey) {
                state = State.UNLOCKED
                return true
            }
            // Sealed-on-this-device restore: the phrase is only asked once.
            val sealed = unsealFromDevice()
            if (sealed != null) {
                try {
                    loadIdentity(dto, sealed)
                    state = State.UNLOCKED
                    return true
                } catch (_: Exception) {
                    clearDeviceSeal()
                }
            }
            resetKeys()
            state = State.LOCKED
            return false
        } catch (e: Exception) {
            resetKeys()
            error = e.message ?: "Encryption service unreachable."
            state = State.UNAVAILABLE
            return false
        } finally {
            busy = false
        }
    }

    private fun loadIdentity(dto: StatusDto, rootKey: ByteArray) {
        val jwkBytes = dto.encryptedPrivateKey
            ?.let { E2ee.unwrapKeyBytes(rootKey, it, E2ee.AAD_ACCOUNT) }
            ?: throw IllegalStateException("Could not open the account key envelope.")
        val jwk = Json.parseToJsonElement(jwkBytes.decodeToString()) as JsonObject
        val d = E2ee.unb64u((jwk["d"] as JsonPrimitive).content)
        identityPrivate = E2ee.importIdentityPrivate(d)
        identityPublicB64 = dto.publicKey
        ark = rootKey
        journalKey = null
    }

    /** Generate phrase + ARK; nothing is sent until [confirmSetup]. */
    suspend fun startSetup(context: Context): List<String>? {
        attach(context)
        busy = true
        error = null
        try {
            val dto = ApiClient.get<StatusDto>("/api/e2ee")
            userId = dto.userId
            if (dto.initialized) throw IllegalStateException("Encryption is already set up for this account.")
            val words = E2ee.entropyToMnemonic(E2ee.randomBytes(16), wordlist(context))
            val rootKey = E2ee.randomBytes(32)
            val salt = "mindcircle-recovery-v1:${dto.userId}"
            val kek = E2ee.pbkdf2Sha256(words.joinToString(" "), salt, E2ee.KDF_ITERATIONS)
            val wrappedRootKey = E2ee.wrapKeyBytes(kek, rootKey, E2ee.AAD_ARK)
            val identity = E2ee.generateIdentityKeyPair()
            val pub = identity.public as ECPublicKey
            // The same JWK shape the web stores, so either platform can import.
            val jwk = "{\"kty\":\"EC\",\"crv\":\"P-256\"" +
                ",\"x\":\"" + E2ee.b64u(E2ee.toFixed32(pub.w.affineX)) +
                "\",\"y\":\"" + E2ee.b64u(E2ee.toFixed32(pub.w.affineY)) +
                "\",\"d\":\"" + E2ee.b64u(E2ee.encodePrivateScalar(identity.private)) +
                "\"}"
            pending = PendingSetup(
                words = words,
                rootKey = rootKey,
                salt = salt,
                wrappedRootKey = wrappedRootKey,
                publicB64 = E2ee.b64u(E2ee.encodePublicPoint(identity.public)),
                encryptedPrivateKey = E2ee.wrapKeyBytes(rootKey, jwk.encodeToByteArray(), E2ee.AAD_ACCOUNT),
            )
            return words
        } catch (e: Exception) {
            pending = null
            error = e.message ?: "Could not start setup."
            return null
        } finally {
            busy = false
        }
    }

    /** Persist the pending setup. Call only after the phrase was confirmed. */
    suspend fun confirmSetup(): Boolean {
        val p = pending ?: run {
            error = "Setup was not started."
            return false
        }
        busy = true
        try {
            ApiClient.postIgnoring(
                "/api/e2ee",
                jsonBody(
                    "public_key" to p.publicB64,
                    "encrypted_private_key" to p.encryptedPrivateKey,
                    "kdf" to E2ee.KDF_ID,
                    "iterations" to E2ee.KDF_ITERATIONS,
                    "salt" to p.salt,
                    "wrapped_root_key" to p.wrappedRootKey,
                ),
            )
            ark = p.rootKey
            journalKey = null
            pending = null
            sealForDevice(p.rootKey)
            state = State.UNLOCKED
            return true
        } catch (e: Exception) {
            error = e.message ?: "Could not enable encryption."
            return false
        } finally {
            busy = false
        }
    }

    fun cancelSetup() {
        pending = null
    }

    /** Restore on this device from the 12 words. False + error on a mismatch. */
    suspend fun unlockWithPhrase(context: Context, input: String): Boolean {
        attach(context)
        busy = true
        error = null
        try {
            val dto = ApiClient.get<StatusDto>("/api/e2ee")
            userId = dto.userId
            if (!dto.initialized || dto.wrappedRootKey == null || dto.salt == null) {
                throw IllegalStateException("Encryption is not set up on this account yet.")
            }
            val words = E2ee.normalizePhrase(input)
            E2ee.mnemonicToEntropy(words, wordlist(context)) // throws on typos
            val kek = E2ee.pbkdf2Sha256(words.joinToString(" "), dto.salt, dto.iterations ?: E2ee.KDF_ITERATIONS)
            val rootKey = E2ee.unwrapKeyBytes(kek, dto.wrappedRootKey, E2ee.AAD_ARK)
            if (rootKey == null) {
                error = "That phrase did not match. Check every word."
                return false
            }
            loadIdentity(dto, rootKey)
            sealForDevice(rootKey)
            state = State.UNLOCKED
            return true
        } catch (e: Exception) {
            error = e.message ?: "Could not unlock."
            return false
        } finally {
            busy = false
        }
    }

    /** Wipe key material from memory and this device. The phrase still works. */
    fun lock() {
        clearDeviceSeal()
        resetKeys()
        state = State.LOCKED
    }

    /** New 12 words, same ARK — for users who lost their copy. Needs unlock. */
    suspend fun rotatePhrase(context: Context): List<String>? {
        attach(context)
        val rootKey = ark ?: run {
            error = "Unlock first."
            return null
        }
        busy = true
        error = null
        try {
            val words = E2ee.entropyToMnemonic(E2ee.randomBytes(16), wordlist(context))
            val salt = "mindcircle-recovery-v1:$userId"
            val kek = E2ee.pbkdf2Sha256(words.joinToString(" "), salt, E2ee.KDF_ITERATIONS)
            val wrappedRootKey = E2ee.wrapKeyBytes(kek, rootKey, E2ee.AAD_ARK)
            ApiClient.patchIgnoring(
                "/api/e2ee",
                jsonBody(
                    "kdf" to E2ee.KDF_ID,
                    "iterations" to E2ee.KDF_ITERATIONS,
                    "salt" to salt,
                    "wrapped_root_key" to wrappedRootKey,
                ),
            )
            return words
        } catch (e: Exception) {
            error = e.message ?: "Could not rotate the phrase."
            return null
        } finally {
            busy = false
        }
    }

    // ── content helpers (journal today, chats in Phase 2) ───────────

    private fun contentKey(): ByteArray {
        val root = ark ?: throw IllegalStateException("Encryption is locked.")
        if (journalKey == null) journalKey = E2ee.deriveJournalKey(root)
        return journalKey!!
    }

    fun encryptPrivateText(plaintext: String): String =
        E2ee.sealText(contentKey(), plaintext, E2ee.AAD_CONTENT)

    /** Legacy plaintext rows pass through unchanged; sealed rows open or throw. */
    fun decryptPrivateText(stored: String): String {
        if (!E2ee.isEnvelope(stored)) return stored
        return E2ee.openText(contentKey(), stored, E2ee.AAD_CONTENT)
            ?: throw IllegalStateException("This entry could not be decrypted on this device.")
    }

    suspend fun selfTest(context: Context): List<Pair<String, Boolean>> =
        E2eeSelfTest.run(wordlist(context))

    // ── internals ───────────────────────────────────────────────────

    private class PendingSetup(
        val words: List<String>,
        val rootKey: ByteArray,
        val salt: String,
        val wrappedRootKey: String,
        val publicB64: String,
        val encryptedPrivateKey: String,
    )

    private fun resetKeys() {
        ark = null
        identityPrivate = null
        identityPublicB64 = null
        journalKey = null
        pending = null
        dmCeks.clear()
    }

    // ── chats (Phase 2): one key per DM pair, derived without exchange ──

    /** Shown for sealed content this device cannot open right now. */
    const val DM_PLACEHOLDER = "🔒 Encrypted message"

    private val dmCeks = HashMap<String, ByteArray>()
    private val peerKeys = HashMap<String, String>()

    /** Peers without an identity row, remembered briefly so the 12-second
     *  poller does not re-request them every cycle. */
    private val peerMiss = HashMap<String, Long>()

    /**
     * The peer's identity public key. Absent when they have not set up
     * encryption yet — a normal state that falls back to the legacy path.
     */
    suspend fun peerPublicKey(peerId: String): String? {
        peerKeys[peerId]?.let { return it }
        peerMiss[peerId]?.let { if (android.os.SystemClock.elapsedRealtime() - it < 60_000L) return null }
        return try {
            val res = ApiClient.get<PeerKeysDto>("/api/e2ee/pubkeys?ids=$peerId")
            val key = res.data.firstOrNull { it.userId == peerId }?.publicKey
            if (!key.isNullOrEmpty()) {
                peerKeys[peerId] = key
                key
            } else {
                peerMiss[peerId] = android.os.SystemClock.elapsedRealtime()
                null
            }
        } catch (_: Exception) {
            peerMiss[peerId] = android.os.SystemClock.elapsedRealtime()
            null
        }
    }

    /** Both sides derive the same id no matter who messages first. */
    fun dmConversationId(a: String, b: String): String =
        if (a < b) "dm:$a:$b" else "dm:$b:$a"

    private suspend fun dmKey(peerId: String): Pair<String, ByteArray>? {
        val my = userId ?: return null
        val priv = identityPrivate ?: return null
        val peerPub = peerPublicKey(peerId) ?: return null
        val convId = dmConversationId(my, peerId)
        dmCeks[convId]?.let { return convId to it }
        val cek = E2ee.deriveDmKey(E2ee.computeSharedSecret(priv, peerPub), convId)
        dmCeks[convId] = cek
        return convId to cek
    }

    /**
     * Seal one outgoing DM. Null means the peer has not enrolled (or the vault
     * is locked) — callers send plaintext and surface the hint, matching the
     * web's fallback.
     */
    suspend fun encryptDmText(peerId: String, plaintext: String): String? {
        if (plaintext.isEmpty()) return plaintext
        val k = dmKey(peerId) ?: return null
        return E2ee.sealText(k.second, plaintext, E2ee.AAD_CONTENT)
    }

    /** Legacy plaintext passes through; sealed content opens or degrades to the placeholder. */
    suspend fun decryptDmText(peerId: String, stored: String): String {
        if (!E2ee.isEnvelope(stored)) return stored
        val k = dmKey(peerId) ?: return DM_PLACEHOLDER
        return E2ee.openText(k.second, stored, E2ee.AAD_CONTENT) ?: DM_PLACEHOLDER
    }

    // ── chat media (photos) ─────────────────────────────────────────

    /**
     * Seal one photo: `iv ‖ ct` for an `.enc` upload. Null means the peer has
     * not enrolled or the vault is locked — the caller then uploads plaintext
     * with a `.jpg` path, exactly the fallback the web uses.
     */
    suspend fun encryptDmMedia(peerId: String, bytes: ByteArray): ByteArray? {
        val k = dmKey(peerId) ?: return null
        return E2ee.sealBytes(k.second, bytes, E2ee.AAD_MEDIA)
    }

    /** Open a sealed photo. Null = no key here or these bytes are not for this pair. */
    suspend fun decryptDmMedia(peerId: String, sealed: ByteArray): ByteArray? {
        val k = dmKey(peerId) ?: return null
        return E2ee.openBytes(k.second, sealed, E2ee.AAD_MEDIA)
    }
}
