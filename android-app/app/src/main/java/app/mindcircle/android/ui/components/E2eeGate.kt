package app.mindcircle.android.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import app.mindcircle.android.ui.theme.Palette
import app.mindcircle.android.ui.theme.Shapes
import kotlinx.coroutines.launch

/**
 * The gate every private screen renders through — the Android twin of
 * `E2eeGate.tsx`.
 *
 * Not setup → walk through the 12 words (shown once, confirmed in writing).
 * Locked → ask for the phrase. Unlocked → the screen itself.
 *
 * The words are deliberately never shown again after setup; rotation issues a
 * NEW phrase but cannot recover the old one. That asymmetry is what keeps the
 * operator out of the data, so it is not a UX bug to be smoothed over.
 */
@Composable
fun E2eeGate(content: @Composable () -> Unit) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        if (E2eeManager.state == E2eeManager.State.UNKNOWN) {
            E2eeManager.init(context)
        }
    }

    when (E2eeManager.state) {
        E2eeManager.State.UNKNOWN -> Column(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Shimmer(Modifier.fillMaxWidth().height(120.dp))
            Shimmer(Modifier.fillMaxWidth().height(200.dp))
        }

        E2eeManager.State.UNAVAILABLE -> Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            ErrorBanner(E2eeManager.error ?: "Encryption could not be reached.")
            GradientButton(text = "Try again", onClick = { scope.launch { E2eeManager.init(context) } })
        }

        E2eeManager.State.NOT_SETUP -> SetupPanel()
        E2eeManager.State.LOCKED -> UnlockPanel()
        E2eeManager.State.UNLOCKED -> content()
    }
}

@Composable
private fun SetupPanel() {
    val context = androidx.compose.ui.platform.LocalContext.current
    val scope = rememberCoroutineScope()
    var words by remember { mutableStateOf<List<String>?>(null) }
    var saved by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        McCard {
            Column {
                Text("🔐 Turn on end-to-end encryption", style = MaterialTheme.typography.titleLarge, color = Palette.Charcoal)
                Spacer(Modifier.height(10.dp))
                BodyLine("Your journal and private chats are sealed on this device before they are sent. The server only stores unreadable ciphertext.")
                BodyLine("You will get 12 words. They are the only key to your data — nobody can reset or recover them.")
                BodyLine("New phone? Enter the words once and everything opens again.")
            }
        }

        val current = words
        if (current == null) {
            E2eeManager.error?.let { ErrorBanner(it) }
            GradientButton(
                text = if (E2eeManager.busy) "Preparing…" else "Set up encryption",
                loading = E2eeManager.busy,
                onClick = { scope.launch { words = E2eeManager.startSetup(context) } },
            )
        } else {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(Palette.Peach)
                    .padding(12.dp),
            ) {
                Text(
                    "Write these 12 words on paper, in order. This screen is the only place they will ever appear.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Palette.Terracotta,
                )
            }
            current.chunked(3).forEachIndexed { rowIdx, row ->
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    row.forEachIndexed { colIdx, word ->
                        val index = rowIdx * 3 + colIdx + 1
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Palette.White)
                                .padding(horizontal = 10.dp, vertical = 9.dp),
                        ) {
                            androidx.compose.foundation.layout.Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("$index", fontSize = 11.sp, color = Palette.WarmGray)
                                Spacer(Modifier.width(8.dp))
                                Text(word, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Palette.Charcoal)
                            }
                        }
                    }
                }
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(
                    checked = saved,
                    onCheckedChange = { saved = it },
                    colors = CheckboxDefaults.colors(checkedColor = Palette.Plum),
                )
                Text(
                    "I wrote the words down and understand they cannot be recovered.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Palette.Charcoal,
                    modifier = Modifier.weight(1f),
                )
            }
            E2eeManager.error?.let { ErrorBanner(it) }
            GradientButton(
                text = if (E2eeManager.busy) "Enabling…" else "Enable encryption",
                loading = E2eeManager.busy,
                enabled = saved && !E2eeManager.busy,
                onClick = {
                    scope.launch {
                        if (E2eeManager.confirmSetup()) words = null
                    }
                },
            )
            TextButton(onClick = { E2eeManager.cancelSetup(); words = null }) {
                Text("Cancel", color = Palette.WarmGray)
            }
        }
    }
}

@Composable
private fun UnlockPanel() {
    val context = androidx.compose.ui.platform.LocalContext.current
    val scope = rememberCoroutineScope()
    var phrase by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        McCard {
            Column {
                Text("🔒 Your private space is locked", style = MaterialTheme.typography.titleLarge, color = Palette.Charcoal)
                Spacer(Modifier.height(6.dp))
                Text(
                    "Enter your 12-word recovery phrase to open it on this device.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Palette.WarmGray,
                )
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = phrase,
                    onValueChange = { phrase = it },
                    placeholder = { Text("word1 word2 … word12", color = Palette.WarmGray) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Palette.Plum,
                        unfocusedBorderColor = Palette.Border,
                    ),
                )
            }
        }
        E2eeManager.error?.let { ErrorBanner(it) }
        GradientButton(
            text = if (E2eeManager.busy) "Unlocking…" else "Unlock",
            loading = E2eeManager.busy,
            enabled = phrase.trim().split(Regex("\\s+")).filter { it.isNotBlank() }.size == 12 && !E2eeManager.busy,
            onClick = { scope.launch { E2eeManager.unlockWithPhrase(context, phrase) } },
        )
        Text(
            "Lost the words? Nobody can restore this data — that is what makes it private.",
            style = MaterialTheme.typography.bodySmall,
            color = Palette.WarmGray,
        )
    }
}

@Composable
private fun BodyLine(text: String) {
    Text("•  $text", style = MaterialTheme.typography.bodyMedium, color = Palette.Charcoal)
}
