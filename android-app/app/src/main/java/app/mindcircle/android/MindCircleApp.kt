package app.mindcircle.android

import android.app.Application
import app.mindcircle.android.core.Supabase

/**
 * Application entry point. Owns the single Supabase client, which is shared by
 * auth (native Google sign-in), realtime (chat) and storage (photo messages).
 */
class MindCircleApp : Application() {

    override fun onCreate() {
        super.onCreate()
        instance = this
        Supabase.init(this)
    }

    companion object {
        lateinit var instance: MindCircleApp
            private set
    }
}
