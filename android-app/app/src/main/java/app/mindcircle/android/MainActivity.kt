package app.mindcircle.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen

/**
 * The single activity. Everything after sign-in is Compose navigation, so this
 * only installs the splash screen and hands over to [MindCircleApp]'s root.
 */
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            app.mindcircle.android.ui.theme.MindCircleTheme {
                app.mindcircle.android.ui.AppRoot()
            }
        }
    }
}
