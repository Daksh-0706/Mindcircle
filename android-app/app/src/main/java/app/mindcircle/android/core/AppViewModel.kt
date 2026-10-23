package app.mindcircle.android.core

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.mindcircle.android.auth.GoogleSignIn
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.status.SessionStatus
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * The app's auth + profile state, shared by every screen.
 *
 * Sign-in itself happens in Supabase; this class only mirrors the session and
 * pulls `/api/me` once a session exists (provisioning the profile row first,
 * exactly like the web app does after every sign-in).
 */
class AppViewModel : ViewModel() {

    sealed interface AuthState {
        data object Loading : AuthState
        data object SignedOut : AuthState
        data class SignedIn(val me: MeResponse?) : AuthState
    }

    private val _state = MutableStateFlow<AuthState>(AuthState.Loading)
    val state = _state.asStateFlow()

    private val _profileError = MutableStateFlow<String?>(null)
    val profileError = _profileError.asStateFlow()

    private var googleSignIn: GoogleSignIn? = null

    // Observable on purpose. The Google client needs a Context, so it is attached
    // from a LaunchedEffect *after* the login screen has already composed once.
    // As a plain getter, attaching it would not invalidate anything and the
    // screen would stay on "not configured" even though the client ID is set.
    private val _signInAvailable = MutableStateFlow(false)
    val signInAvailable = _signInAvailable.asStateFlow()

    fun attach(context: Context) {
        if (googleSignIn == null) {
            googleSignIn = GoogleSignIn(context.applicationContext)
            _signInAvailable.value = googleSignIn!!.isConfigured
        }
    }

    init {
        viewModelScope.launch {
            Supabase.auth.sessionStatus.collect { status ->
                when (status) {
                    is SessionStatus.Initializing -> _state.value = AuthState.Loading
                    is SessionStatus.NotAuthenticated -> _state.value = AuthState.SignedOut
                    is SessionStatus.Authenticated -> loadMe()
                    // A refresh failed (e.g. the refresh token was revoked).
                    // Treat it as signed out rather than leaving a spinner up.
                    is SessionStatus.RefreshFailure -> _state.value = AuthState.SignedOut
                }
            }
        }
    }

    /** Signs in with Google and lets the session flow above do the rest. */
    suspend fun signInWithGoogle(): GoogleSignIn.Result {
        val result = googleSignIn?.signIn() ?: return GoogleSignIn.Result.Failure("Not attached to a context.")
        if (result is GoogleSignIn.Result.Success) provision()
        return result
    }

    /** Idempotently creates the `users` row, then reads it. */
    private suspend fun provision() {
        runCatching { ApiClient.post<CreatedWrapper<DataWrapper<String>>>("/api/profile/ensure") }
    }

    fun loadMe() {
        viewModelScope.launch {
            _state.value = AuthState.SignedIn((_state.value as? AuthState.SignedIn)?.me)
            val me = runCatching { ApiClient.get<MeResponse>("/api/me") }
                .onFailure { _profileError.value = it.message ?: "Could not load your profile." }
                .getOrNull()
            _state.value = AuthState.SignedIn(me)
        }
    }

    /** Re-reads /api/me after a settings change so every screen stays in sync. */
    fun refreshProfile() = loadMe()

    fun signOut() {
        viewModelScope.launch {
            runCatching { Supabase.auth.signOut() }
            _state.value = AuthState.SignedOut
        }
    }

    val me: MeResponse? get() = (_state.value as? AuthState.SignedIn)?.me
}
