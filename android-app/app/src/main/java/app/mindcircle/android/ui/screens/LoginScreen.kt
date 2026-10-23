package app.mindcircle.android.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.R
import app.mindcircle.android.auth.GoogleSignIn
import app.mindcircle.android.core.AppViewModel
import app.mindcircle.android.ui.components.ErrorBanner
import app.mindcircle.android.ui.components.GradientButton
import app.mindcircle.android.ui.theme.Palette
import app.mindcircle.android.ui.theme.Shapes
import kotlinx.coroutines.launch

/**
 * Sign-in. Same order as the web's /login: logo, display headline, then the
 * Google button — except the button is a native Credential Manager call.
 */
@Composable
fun LoginScreen(viewModel: AppViewModel) {
    val scope = rememberCoroutineScope()
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Box(
            modifier = Modifier
                .size(96.dp)
                .clip(CircleShape)
                .background(Brush.linearGradient(listOf(Palette.Plum, Palette.Terracotta))),
            contentAlignment = Alignment.Center,
        ) {
            // The web's mark, not a brain emoji.
            Image(
                painter = painterResource(R.drawable.logo),
                contentDescription = null,
                contentScale = ContentScale.Fit,
                modifier = Modifier.size(58.dp),
            )
        }

        Spacer(Modifier.height(24.dp))
        Text(
            "Welcome back",
            style = MaterialTheme.typography.displayMedium,
            color = Palette.Plum,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            "Log in to continue your wellness journey.",
            style = MaterialTheme.typography.bodyLarge,
            color = Palette.WarmGray,
            textAlign = TextAlign.Center,
        )

        Spacer(Modifier.height(32.dp))

        // Observed so the banner disappears once the Google client has been
        // attached and found to be configured.
        val signInAvailable by viewModel.signInAvailable.collectAsState()

        if (!signInAvailable) {
            ErrorBanner(
                "Google sign-in is not configured yet. Create the *Web* OAuth client ID in " +
                    "Google Cloud Console and add it to android-app/local.properties — " +
                    "the steps are in docs/ANDROID.md.",
            )
            Spacer(Modifier.height(16.dp))
        }

        GoogleButton(
            // Disabled while unconfigured so tapping it can't raise a second,
            // duplicate copy of the "not configured" message above.
            enabled = !busy && signInAvailable,
            onClick = {
                error = null
                busy = true
                scope.launch {
                    when (val result = viewModel.signInWithGoogle()) {
                        is GoogleSignIn.Result.Success -> Unit
                        is GoogleSignIn.Result.Cancelled -> busy = false
                        is GoogleSignIn.Result.Failure -> {
                            error = result.message
                            busy = false
                        }
                    }
                }
            },
        )

        if (busy) {
            Spacer(Modifier.height(12.dp))
            Text("Signing you in…", style = MaterialTheme.typography.bodyMedium, color = Palette.WarmGray)
        }

        error?.let {
            Spacer(Modifier.height(16.dp))
            ErrorBanner(it)
        }

        Spacer(Modifier.height(40.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(Shapes.Card)
                .background(Palette.Mint)
                .padding(16.dp),
        ) {
            Column {
                Text(
                    "🔒  Private by design",
                    style = MaterialTheme.typography.titleSmall,
                    color = Palette.SageDark,
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    "Your journal and mood check-ins are visible only to you. Community spaces " +
                        "show a generated alias, never your name.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Palette.SageDark,
                )
            }
        }
    }
}

/** The web's Google button: white pill, hairline border, Google mark. */
@Composable
private fun GoogleButton(enabled: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Palette.White)
            .border(1.5.dp, Palette.Border, RoundedCornerShape(16.dp))
            .clickable(enabled = enabled, onClick = onClick)
            .padding(vertical = 16.dp),
        contentAlignment = Alignment.Center,
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("G", fontWeight = FontWeight.Bold, color = Palette.Plum, fontSize = 18.sp)
            Spacer(Modifier.width(10.dp))
            Text(
                "Continue with Google",
                style = MaterialTheme.typography.labelLarge,
                color = Palette.Charcoal,
            )
        }
    }
}
