package app.mindcircle.android.auth

import android.content.Context
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import app.mindcircle.android.BuildConfig
import app.mindcircle.android.core.Supabase
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.Google
import io.github.jan.supabase.auth.providers.builtin.IDToken
import java.security.MessageDigest
import java.util.UUID

/**
 * Native Google sign-in.
 *
 * Credential Manager asks Google Play services for an ID token directly — no
 * browser, no WebView, and therefore none of the "OAuth in a webview is
 * blocked" problems a wrapped site would have. The token is handed to Supabase
 * (`signInWithIdToken`), which validates it against the authorized client IDs
 * you register in the Supabase dashboard.
 *
 * Note that [BuildConfig.GOOGLE_SERVER_CLIENT_ID] must be the **Web** OAuth
 * client ID, not the Android one. That is a Google design quirk: the Android
 * client ID (registered against this package name + signing SHA-1) is what
 * Supabase uses to trust the app, but the token itself is minted for the Web
 * client. See docs/ANDROID.md.
 */
class GoogleSignIn(private val context: Context) {

    private val credentialManager by lazy { CredentialManager.create(context) }

    /** True when the native client ID has been configured. */
    val isConfigured: Boolean get() = BuildConfig.GOOGLE_SERVER_CLIENT_ID.isNotBlank()

    sealed class Result {
        object Success : Result()
        object Cancelled : Result()
        data class Failure(val message: String) : Result()
    }

    suspend fun signIn(): Result {
        if (!isConfigured) {
            return Result.Failure(
                "Google sign-in is not configured yet. Add the *Web* OAuth client ID to " +
                    "android-app/local.properties — see docs/ANDROID.md.",
            )
        }

        // A nonce binds this ID token to this one sign-in attempt, so a token
        // intercepted in transit cannot be replayed. Google sees the SHA-256
        // hash; Supabase is given the raw value to check against.
        val rawNonce = UUID.randomUUID().toString()
        val hashedNonce = MessageDigest.getInstance("SHA-256")
            .digest(rawNonce.toByteArray())
            .joinToString("") { "%02x".format(it) }

        val option = GetGoogleIdOption.Builder()
            .setServerClientId(BuildConfig.GOOGLE_SERVER_CLIENT_ID)
            .setFilterByAuthorizedAccounts(false)
            .setAutoSelectEnabled(true)
            .setNonce(hashedNonce)
            .build()

        val request = GetCredentialRequest.Builder()
            .addCredentialOption(option)
            .build()

        return try {
            val response = credentialManager.getCredential(context, request)
            val credential = GoogleIdTokenCredential.createFrom(response.credential.data)
            Supabase.auth.signInWith(IDToken) {
                idToken = credential.idToken
                provider = Google
                nonce = rawNonce
            }
            Result.Success
        } catch (e: Exception) {
            val message = e.message.orEmpty()
            // The user dismissing the sheet is not a failure worth reporting.
            if (message.contains("cancellation", ignoreCase = true) ||
                message.contains("cancel", ignoreCase = true)
            ) {
                Result.Cancelled
            } else {
                Result.Failure(e.message ?: "Sign-in failed. Please try again.")
            }
        }
    }
}
