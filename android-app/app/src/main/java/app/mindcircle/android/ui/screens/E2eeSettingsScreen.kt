package app.mindcircle.android.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.core.e2ee.E2eeManager
import app.mindcircle.android.ui.components.ErrorBanner
import app.mindcircle.android.ui.components.GradientButton
import app.mindcircle.android.ui.components.McCard
import app.mindcircle.android.ui.components.Shimmer
import app.mindcircle.android.ui.theme.Palette
import kotlinx.coroutines.launch

/**
 * Privacy → End-to-End Encryption — the Android twin of the web's
 * /app/settings/encryption. Status, lock, self-test and phrase rotation.
 */
@Composable
fun E2eeSettingsScreen(onBack: () -> Unit) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val scope = rememberCoroutineScope()
    var rotatedWords by remember { mutableStateOf<List<String>?>(null) }
    var savedWords by remember { mutableStateOf(false) }
    var testResults by remember { mutableStateOf<List<Pair<String, Boolean>>?>(null) }
    var testing by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        if (E2eeManager.state == E2eeManager.State.UNKNOWN) E2eeManager.init(context)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Palette.Charcoal)
            }
            Text("End-to-End Encryption", style = MaterialTheme.typography.headlineSmall, color = Palette.Charcoal)
        }

        // ── status ──────────────────────────────────────────────────
        McCard {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(CircleShape)
                            .background(Palette.Mint),
                        contentAlignment = Alignment.Center,
                    ) { Text("🛡", fontSize = 20.sp) }
                    Spacer(Modifier.width(12.dp))
                    Column {
                        Text("End-to-end encryption", style = MaterialTheme.typography.titleMedium, color = Palette.Charcoal)
                        Text("Journal · private chats · stories", style = MaterialTheme.typography.bodySmall, color = Palette.WarmGray)
                    }
                }
                Spacer(Modifier.height(12.dp))
                StatusRow("Status", when (E2eeManager.state) {
                    E2eeManager.State.UNLOCKED -> "Unlocked on this device"
                    E2eeManager.State.LOCKED -> "Locked — enter your phrase to use it here"
                    E2eeManager.State.NOT_SETUP -> "Not set up yet"
                    E2eeManager.State.UNKNOWN -> "Checking…"
                    else -> "Service unreachable"
                })
                StatusRow("Key derivation", "PBKDF2-SHA256 · 600,000 iterations")
                StatusRow("Cipher", "AES-256-GCM + P-256 ECDH")
                Spacer(Modifier.height(10.dp))
                Text(
                    "Content is sealed on your device before it is sent. Neither the server nor MindCircle can read it. " +
                        "The 12-word phrase is the only key — it cannot be reset, and support cannot recover it.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Palette.WarmGray,
                )
            }
        }

        E2eeManager.error?.let { ErrorBanner(it) }

        when (E2eeManager.state) {
            E2eeManager.State.UNLOCKED -> {
                GradientButton(
                    text = "Run self-test",
                    loading = testing,
                    enabled = !testing,
                    onClick = {
                        testing = true
                        scope.launch { testResults = E2eeManager.selfTest(context); testing = false }
                    },
                )
                GradientButton(text = "Lock on this device", onClick = { E2eeManager.lock() })
            }
            E2eeManager.State.LOCKED -> Text(
                "This device does not hold your key. Open the Journal to enter your 12-word phrase — once entered, it stays unlocked here.",
                style = MaterialTheme.typography.bodyMedium,
                color = Palette.Terracotta,
            )
            E2eeManager.State.NOT_SETUP -> Text(
                "Encryption is not set up on this account yet. Open the Journal once — setup runs there.",
                style = MaterialTheme.typography.bodyMedium,
                color = Palette.Terracotta,
            )
            E2eeManager.State.UNKNOWN -> Shimmer(Modifier.fillMaxWidth().height(60.dp))
            else -> Unit
        }

        // ── self-test output ────────────────────────────────────────
        testResults?.let { results ->
            McCard(color = if (results.all { it.second }) Palette.Mint else Palette.Rose) {
                Column {
                    Text(
                        if (results.all { it.second }) "Self-test passed" else "Self-test failed",
                        style = MaterialTheme.typography.titleSmall,
                        color = if (results.all { it.second }) Palette.SageDark else Palette.Danger,
                    )
                    Spacer(Modifier.height(6.dp))
                    results.forEach { (name, ok) ->
                        Text("${if (ok) "✓" else "✗"}  $name", style = MaterialTheme.typography.bodySmall, color = Palette.Charcoal)
                    }
                }
            }
        }

        // ── rotate ──────────────────────────────────────────────────
        if (E2eeManager.state == E2eeManager.State.UNLOCKED && rotatedWords == null) {
            McCard {
                Column {
                    Text("Lost your recovery phrase?", style = MaterialTheme.typography.titleSmall, color = Palette.Charcoal)
                    Spacer(Modifier.height(6.dp))
                    Text(
                        "You can generate a new one. Your data is untouched — only the envelope that protects it changes.",
                        style = MaterialTheme.typography.bodySmall,
                        color = Palette.WarmGray,
                    )
                    Spacer(Modifier.height(10.dp))
                    GradientButton(
                        text = if (E2eeManager.busy) "Working…" else "Create a new phrase",
                        loading = E2eeManager.busy,
                        enabled = !E2eeManager.busy,
                        onClick = { scope.launch { rotatedWords = E2eeManager.rotatePhrase(context) } },
                    )
                }
            }
        }

        rotatedWords?.let { words ->
            McCard {
                Column {
                    Text("Your new phrase", style = MaterialTheme.typography.titleMedium, color = Palette.Charcoal)
                    Text("Replaces the old words. Write them down — this is the only display.", style = MaterialTheme.typography.bodySmall, color = Palette.WarmGray)
                    Spacer(Modifier.height(12.dp))
                    words.chunked(3).forEachIndexed { rowIdx, row ->
                        Row(Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                            row.forEachIndexed { colIdx, word ->
                                Column(Modifier.weight(1f)) {
                                    Text("${rowIdx * 3 + colIdx + 1}", fontSize = 11.sp, color = Palette.WarmGray)
                                    Text(word, fontWeight = FontWeight.Bold, color = Palette.Charcoal)
                                }
                            }
                        }
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = savedWords, onCheckedChange = { savedWords = it }, colors = CheckboxDefaults.colors(checkedColor = Palette.Plum))
                        Text("I wrote them down.", style = MaterialTheme.typography.bodySmall, color = Palette.Charcoal)
                    }
                }
            }
        }

        Spacer(Modifier.height(30.dp))
    }
}

@Composable
private fun StatusRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Palette.CreamDark.copy(alpha = 0.6f))
            .padding(horizontal = 12.dp, vertical = 10.dp),
    ) {
        Text(label, style = MaterialTheme.typography.bodySmall, color = Palette.WarmGray, modifier = Modifier.weight(0.45f))
        Text(value, style = MaterialTheme.typography.bodySmall, color = Palette.Charcoal, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(0.55f))
    }
}
