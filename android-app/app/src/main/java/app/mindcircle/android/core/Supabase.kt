package app.mindcircle.android.core

import android.content.Context
import app.mindcircle.android.BuildConfig
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.storage.Storage

/**
 * The one Supabase client in the app.
 *
 * It is used for three things only: signing in (Google, natively), the realtime
 * websocket for live chat, and signed storage URLs for photo messages. All
 * business logic — validation, rate limits, soft deletes — stays on the
 * Next.js API routes, which the app calls with this session's access token.
 */
object Supabase {

    lateinit var client: SupabaseClient
        private set

    fun init(context: Context) {
        if (::client.isInitialized) return
        client = createSupabaseClient(
            supabaseUrl = BuildConfig.SUPABASE_URL,
            supabaseKey = BuildConfig.SUPABASE_ANON_KEY,
        ) {
            install(Auth) {
                // Sessions survive app restarts. On Android the default
                // SessionManager is already backed by SharedPreferences in the
                // app's private storage, so no explicit configuration is needed.
                alwaysAutoRefresh = true
                autoLoadFromStorage = true
            }
            install(Realtime)
            install(Storage)
        }
    }

    val auth get() = client.auth
}
