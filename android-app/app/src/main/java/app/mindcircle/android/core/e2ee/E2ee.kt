package app.mindcircle.android.core.e2ee

/**
 * E2EE primitives for the Android client.
 *
 * Contract: docs/E2EE.md. The web client (`src/lib/e2ee/crypto.ts`) implements
 * the exact same wire format â€” [E2eeSelfTest] pins the shared test vectors so
 * the two platforms cannot drift apart silently.
 *
 * Only platform-vetted primitives are used, nothing extra ships:
 *   - P-256 ECDH           java.security KeyAgreement "ECDH"
 *   - AES-256-GCM          javax.crypto Cipher "AES/GCM/NoPadding"
 *   - HKDF-SHA256          built here over Mac "HmacSHA256" (RFC 5869)
 *   - PBKDF2-HMAC-SHA256   SecretKeyFactory "PBKDF2WithHmacSHA256"
 *   - BIP-39 12 words      the spec algorithm over assets/bip39-english.txt
 */

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import java.math.BigInteger
import java.security.AlgorithmParameters
import java.security.KeyFactory
import java.security.MessageDigest
import java.security.PrivateKey
import java.security.SecureRandom
import java.security.spec.ECGenParameterSpec
import java.security.spec.ECParameterSpec
import java.security.spec.ECPoint
import java.security.spec.ECPrivateKeySpec
import java.security.spec.ECPublicKeySpec
import javax.crypto.spec.PBEKeySpec
import java.security.KeyPairGenerator
import java.security.KeyPair
import java.security.PublicKey
import java.security.interfaces.ECPrivateKey
import java.security.interfaces.ECPublicKey
import javax.crypto.Cipher
import javax.crypto.KeyAgreement
import javax.crypto.Mac
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

object E2ee {

    const val ENVELOPE_PREFIX = "mc1:"
    const val AAD_CONTENT = "mindcircle:content:v1"
    const val AAD_ARK = "mindcircle:ark:v1"
    const val AAD_ACCOUNT = "mindcircle:account:v1"
    const val KDF_ID = "pbkdf2-sha256"
    const val KDF_ITERATIONS = 600_000

    private val random = SecureRandom()

    // â”€â”€ encoding â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    fun b64u(bytes: ByteArray): String =
        java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)

    fun unb64u(text: String): ByteArray = java.util.Base64.getUrlDecoder().decode(text)

    fun randomBytes(n: Int): ByteArray = ByteArray(n).also { random.nextBytes(it) }

    private fun utf8(text: String): ByteArray = text.encodeToByteArray()

    private fun sha256(bytes: ByteArray): ByteArray =
        MessageDigest.getInstance("SHA-256").digest(bytes)

    // â”€â”€ HKDF-SHA256 (RFC 5869) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private fun hmac(key: ByteArray, data: ByteArray): ByteArray {
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(key, "HmacSHA256"))
        return mac.doFinal(data)
    }

    fun hkdfSha256(ikm: ByteArray, info: ByteArray, salt: ByteArray = ByteArray(32), length: Int = 32): ByteArray {
        val prk = hmac(if (salt.isEmpty()) ByteArray(32) else salt, ikm)
        val t1 = hmac(prk, info + byteArrayOf(1))
        if (length <= t1.size) return t1.copyOf(length)
        val out = ByteArray(length)
        var written = t1.size
        t1.copyInto(out, 0)
        var counter = 2
        var t = t1
        while (written < length) {
            val next = hmac(prk, t + info + byteArrayOf(counter.toByte()))
            val take = minOf(next.size, length - written)
            next.copyInto(out, written, 0, take)
            written += take
            t = next
            counter++
        }
        return out
    }

    /** Deterministic, zero-exchange key for single-owner content (journal). */
    fun deriveJournalKey(rootKey: ByteArray): ByteArray =
        hkdfSha256(rootKey, utf8("mindcircle:journal:v1"))

    /**
     * Static-static key for a DM pair (Phase 2 chats). The conversation id is
     * the HKDF salt, binding the key to exactly this pair of people. The web
     * twin is `deriveDmKey` in src/lib/e2ee/crypto.ts — byte-identical output.
     */
    fun deriveDmKey(shared: ByteArray, conversationId: String): ByteArray =
        hkdfSha256(shared, utf8("mindcircle:dm:v1"), utf8(conversationId))

    // â”€â”€ AES-256-GCM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    fun aeadEncrypt(key: ByteArray, plaintext: ByteArray, aad: String): Pair<ByteArray, ByteArray> {
        val iv = randomBytes(12)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, SecretKeySpec(key, "AES"), GCMParameterSpec(128, iv))
        cipher.updateAAD(utf8(aad))
        return iv to cipher.doFinal(plaintext)
    }

    fun aeadDecrypt(key: ByteArray, iv: ByteArray, ct: ByteArray, aad: String): ByteArray {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, SecretKeySpec(key, "AES"), GCMParameterSpec(128, iv))
        cipher.updateAAD(utf8(aad))
        return cipher.doFinal(ct)
    }

    // â”€â”€ envelopes (the only wire format) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /** `mc1:<b64u of {"v":1,"iv":..,"ct":..}>` â€” identical bytes to the web client. */
    fun packEnvelope(iv: ByteArray, ct: ByteArray, extra: Map<String, String> = emptyMap()): String {
        val json = buildJsonObject {
            put("v", 1)
            put("iv", b64u(iv))
            put("ct", b64u(ct))
            extra.forEach { (k, v) -> put(k, v) }
        }
        return ENVELOPE_PREFIX + b64u(json.toString().encodeToByteArray())
    }

    private fun unpackEnvelope(stored: String): kotlinx.serialization.json.JsonObject {
        require(stored.startsWith(ENVELOPE_PREFIX)) { "Not an encrypted envelope" }
        val json = Json.parseToJsonElement(
            unb64u(stored.removePrefix(ENVELOPE_PREFIX)).decodeToString(),
        ).jsonObject
        require(json["v"]?.jsonPrimitive?.int == 1) { "Unsupported envelope version" }
        return json
    }

    fun isEnvelope(stored: String?): Boolean = stored != null && stored.startsWith(ENVELOPE_PREFIX)

    fun sealText(key: ByteArray, plaintext: String, aad: String): String {
        val (iv, ct) = aeadEncrypt(key, utf8(plaintext), aad)
        return packEnvelope(iv, ct)
    }

    fun openText(key: ByteArray, stored: String, aad: String): String? = try {
        val env = unpackEnvelope(stored)
        val plain = aeadDecrypt(key, unb64u(env["iv"]!!.jsonPrimitive.content), unb64u(env["ct"]!!.jsonPrimitive.content), aad)
        plain.decodeToString()
    } catch (_: Exception) {
        null
    }

    fun wrapKeyBytes(kek: ByteArray, material: ByteArray, aad: String): String {
        val (iv, ct) = aeadEncrypt(kek, material, aad)
        return packEnvelope(iv, ct)
    }

    fun unwrapKeyBytes(kek: ByteArray, stored: String, aad: String): ByteArray? = try {
        val env = unpackEnvelope(stored)
        aeadDecrypt(kek, unb64u(env["iv"]!!.jsonPrimitive.content), unb64u(env["ct"]!!.jsonPrimitive.content), aad)
    } catch (_: Exception) {
        null
    }

    // â”€â”€ PBKDF2 for the recovery phrase â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    fun pbkdf2Sha256(phrase: String, salt: String, iterations: Int): ByteArray {
        val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        val spec = PBEKeySpec(phrase.toCharArray(), utf8(salt), iterations, 256)
        return factory.generateSecret(spec).encoded
    }

    // â”€â”€ identity keys (P-256 ECDH) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /** secp256r1 parameters, resolved once without generating a throwaway key. */
    private val ecParams: ECParameterSpec by lazy {
        val params = AlgorithmParameters.getInstance("EC")
        params.init(ECGenParameterSpec("secp256r1"))
        params.getParameterSpec(ECParameterSpec::class.java)
    }

    fun generateIdentityKeyPair(): KeyPair =
        KeyPairGenerator.getInstance("EC").apply {
            initialize(ecParams, random)
        }.generateKeyPair()

    /** 65-byte uncompressed point (04||X||Y) â€” the same bytes WebCrypto raw-exports. */
    fun encodePublicPoint(publicKey: PublicKey): ByteArray {
        val w = (publicKey as ECPublicKey).w
        return byteArrayOf(4) + toFixed32(w.affineX) + toFixed32(w.affineY)
    }

    fun decodePublicPoint(raw: ByteArray): PublicKey {
        require(raw.size == 65 && raw[0] == 4.toByte()) { "Not an uncompressed P-256 point" }
        val point = ECPoint(
            BigInteger(1, raw.copyOfRange(1, 33)),
            BigInteger(1, raw.copyOfRange(33, 65)),
        )
        return KeyFactory.getInstance("EC").generatePublic(ECPublicKeySpec(point, ecParams))
    }

    /** The JWK `d` scalar: exactly 32 bytes, base64url. */
    fun encodePrivateScalar(privateKey: PrivateKey): ByteArray =
        toFixed32((privateKey as ECPrivateKey).s)

    fun importIdentityPrivate(d: ByteArray): PrivateKey =
        KeyFactory.getInstance("EC").generatePrivate(ECPrivateKeySpec(BigInteger(1, d), ecParams))

    /** BigInteger â†’ exactly 32 bytes, big-endian unsigned (EC field size). */
    internal fun toFixed32(value: BigInteger): ByteArray {
        val bytes = value.toByteArray()
        return when {
            bytes.size == 32 -> bytes
            bytes.size == 33 -> bytes.copyOfRange(1, 33) // sign byte the JWK must not carry
            bytes.size < 32 -> ByteArray(32 - bytes.size) + bytes
            else -> bytes.copyOfRange(bytes.size - 32, bytes.size)
        }
    }

    /**
     * Raw ECDH secret â€” the 32-byte x coordinate, normalized so it always
     * matches WebCrypto's `deriveBits` even if a provider returns a signed
     * length.
     */
    fun computeSharedSecret(privateKey: PrivateKey, peerPublicB64u: String): ByteArray {
        val agreement = KeyAgreement.getInstance("ECDH")
        agreement.init(privateKey)
        agreement.doPhase(decodePublicPoint(unb64u(peerPublicB64u)), true)
        val secret = agreement.generateSecret()
        return toFixed32(BigInteger(1, secret))
    }

    // â”€â”€ BIP-39 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /** 16 bytes â†’ 12 words, checksum included, over the shared wordlist. */
    fun entropyToMnemonic(entropy: ByteArray, wordlist: List<String>): List<String> {
        require(entropy.size == 16) { "Recovery phrase needs exactly 128 bits of entropy" }
        require(wordlist.size == 2048) { "Wordlist must have 2048 words" }
        val hash = sha256(entropy)
        val bits = ArrayList<Boolean>(132)
        for (b in entropy) for (i in 7 downTo 0) bits.add(b.toInt().shr(i) and 1 == 1)
        for (i in 0 until 4) bits.add(hash[0].toInt().shr(7 - i) and 1 == 1)

        val words = ArrayList<String>(12)
        for (start in bits.indices step 11) {
            var index = 0
            for (j in 0 until 11) index = (index shl 1) or (if (bits[start + j]) 1 else 0)
            words.add(wordlist[index])
        }
        return words
    }

    /** Words â†’ 16 bytes, verifying the BIP-39 checksum; throws on any typo. */
    fun mnemonicToEntropy(words: List<String>, wordlist: List<String>): ByteArray {
        require(words.size == 12) { "A recovery phrase is exactly 12 words" }
        val index = words.associate { it.trim().lowercase() to wordlist.indexOf(it.trim().lowercase()) }
        val unknown = index.filterValues { it < 0 }.keys
        require(unknown.isEmpty()) { "Not a recovery word: ${unknown.joinToString()}" }

        val bits = ArrayList<Boolean>(132)
        for (word in words) {
            val i = index.getValue(word.trim().lowercase())
            for (shift in 10 downTo 0) bits.add(i.shr(shift) and 1 == 1)
        }
        val entropy = ByteArray(16)
        for (i in 0 until 128) {
            if (bits[i]) entropy[i shr 3] = (entropy[i shr 3].toInt() or (1 shl (7 - (i % 8)))).toByte()
        }
        val hash = sha256(entropy)
        for (i in 0 until 4) {
            val want = hash[0].toInt().shr(7 - i) and 1 == 1
            require(bits[128 + i] == want) { "One word is wrong (checksum mismatch)" }
        }
        return entropy
    }

    fun normalizePhrase(input: String): List<String> =
        input.lowercase().trim().split(Regex("\\s+")).filter { it.isNotEmpty() }
}

/**
 * Known-answer tests pinning the cross-platform wire format. The vectors were
 * produced by `scripts/e2ee-selftest.ts` against the web core; if these pass
 * on Android, a phrase sealed on the web opens here and vice versa.
 */
object E2eeSelfTest {
    private val results = ArrayList<Pair<String, Boolean>>()

    private fun check(name: String, ok: Boolean) {
        results.add(name to ok)
    }

    fun run(wordlist: List<String>): List<Pair<String, Boolean>> {
        results.clear()

        // 1. BIP-39 vector: 16 bytes of 0x07 â†’ exact 12 words from the web core.
        val entropy = ByteArray(16) { 7 }
        val words = E2ee.entropyToMnemonic(entropy, wordlist)
        check(
            "mnemonic matches web vector",
            words.joinToString(" ") ==
                "alpha deal scrub asthma idea logic bright thought alpha deal scrub autumn",
        )
        val back = runCatching { E2ee.mnemonicToEntropy(words, wordlist) }
        check("mnemonic round trip", back.getOrNull()?.let { it.contentEquals(entropy) } == true)

        // 2. PBKDF2 vector (600k iterations, ~1s on device).
        val kek = E2ee.pbkdf2Sha256("abandon abandon abandon ability", "mindcircle-recovery-v1:test", E2ee.KDF_ITERATIONS)
        check("pbkdf2 matches web vector", E2ee.b64u(kek) == "_p_5CgYivxZsgBjopK5dnPJrXKoOtyktFBYvs3vEHT4")

        // 3. Journal key vector.
        val ark = ByteArray(32) { 9 }
        check("journal key matches web vector", E2ee.b64u(E2ee.deriveJournalKey(ark)) == "cn8Rfp44zDXhWAnEODSGtyjHvP9UnocWrMpiv_BX5-A")

        // 4. Envelope round trip + tamper rejection.
        val key = E2ee.deriveJournalKey(ark)
        val sealed = E2ee.sealText(key, "secret diary text", E2ee.AAD_CONTENT)
        check("seal â†’ open", E2ee.openText(key, sealed, E2ee.AAD_CONTENT) == "secret diary text")
        check("seal starts with mc1:", sealed.startsWith("mc1:"))
        check("wrong AAD rejected", E2ee.openText(key, sealed, "mindcircle:content:v2") == null)
        val flipped = sealed.dropLast(4) + if (sealed.endsWith("AAAA")) "BBBB" else "AAAA"
        check("bit-flip rejected", E2ee.openText(key, flipped, E2ee.AAD_CONTENT) == null)
        check("legacy passthrough flag", !E2ee.isEnvelope("plain old entry"))

        // 5. ECDH agreement between two fresh identities.
        val a = E2ee.generateIdentityKeyPair()
        val b = E2ee.generateIdentityKeyPair()
        val pubA = E2ee.b64u(E2ee.encodePublicPoint(a.public))
        val pubB = E2ee.b64u(E2ee.encodePublicPoint(b.public))
        val ab = E2ee.computeSharedSecret(a.private, pubB)
        val ba = E2ee.computeSharedSecret(b.private, pubA)
        check("ECDH agreement", ab.contentEquals(ba) && ab.size == 32)

        // 6. DM pair key vector: fixed identity scalars from the web core, so a
        // message sealed on the web opens here and vice versa (docs/E2EE.md).
        val dA = E2ee.unb64u("V9Xsawn0dD8bab7U3wvP9Xjz9qNxqJO8A2YgK3GYqmM")
        val dB = E2ee.unb64u("ui5ly0KTZ1ubFzkvAjKVKF2MRZaczhEhtD6CvR_MQs8")
        val pubBFixed = "BInEomOcvwCbD8OVcuQ85Ux98XvFEF855wYo2Kykdndev5VQGn6e17yC295PC3KqBxSywpn9sTs8MMcB60iqUNQ"
        val pubAFixed = "BMpGxltFAdrEdB-7wqGIL0B16xrVqEyvM8OjC8V1yHPjtyk5V8a63DojUdFjZFv0bSEe_2oVg6tp_EE_X6MbJMY"
        val convFixed = "dm:11111111-1111-1111-1111-111111111111:22222222-2222-2222-2222-222222222222"
        val cekA = E2ee.deriveDmKey(E2ee.computeSharedSecret(E2ee.importIdentityPrivate(dA), pubBFixed), convFixed)
        val cekB = E2ee.deriveDmKey(E2ee.computeSharedSecret(E2ee.importIdentityPrivate(dB), pubAFixed), convFixed)
        check("DM key matches web vector", E2ee.b64u(cekA) == "jiSQGReKAryg5Pl9lxHIrfIoAu66082hTI9O3ZJxCjY")
        check("DM key agrees both ways", cekA.contentEquals(cekB))

        return results
    }
}
