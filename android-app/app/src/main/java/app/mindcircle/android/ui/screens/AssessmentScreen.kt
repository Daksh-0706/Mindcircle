package app.mindcircle.android.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.core.ApiClient
import app.mindcircle.android.core.jsonBody
import app.mindcircle.android.ui.components.ErrorBanner
import app.mindcircle.android.ui.components.GradientButton
import app.mindcircle.android.ui.components.McCard
import app.mindcircle.android.ui.theme.Palette
import app.mindcircle.android.ui.theme.Shapes
import kotlinx.coroutines.launch

/** The seven options the web offers, in the same order. */
private val SUPPORT_OPTIONS = listOf(
    "A quiet moment",
    "A gentle walk outside",
    "Music or something creative",
    "Someone to talk to",
    "Time with someone I trust",
    "Just to vent — no advice needed",
    "Professional support",
)

/**
 * Check-in — the web's `/app/assessment`.
 *
 * Two gentle questions and a save. The score is posted to `/api/mood`, which is
 * the same endpoint the mood grid uses, so a check-in shows up on the Home
 * timeline and Insights exactly like one logged from the grid.
 */
@Composable
fun AssessmentScreen(onDone: () -> Unit) {
    val scope = rememberCoroutineScope()

    var energy by remember { mutableIntStateOf(5) }
    var support by remember { mutableStateOf(SUPPORT_OPTIONS.first()) }
    var saving by remember { mutableStateOf(false) }
    var saved by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Spacer(Modifier.height(4.dp))
        Text(
            if (saved) "Saved. Thank you." else "How are things, really?",
            style = MaterialTheme.typography.headlineMedium,
            color = Palette.Plum,
        )
        Text(
            "A few gentle questions can help you notice what you need today. " +
                "There are no wrong answers.",
            style = MaterialTheme.typography.bodyMedium,
            color = Palette.WarmGray,
        )

        error?.let { ErrorBanner(it) }

        // ── Energy ────────────────────────────────────────────────
        McCard(modifier = Modifier.fillMaxWidth()) {
            Column {
                Text(
                    "Energy level",
                    style = MaterialTheme.typography.titleMedium,
                    color = Palette.Charcoal,
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    "1 is completely drained, 10 is full of it.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Palette.WarmGray,
                )
                Spacer(Modifier.height(10.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "$energy",
                        style = MaterialTheme.typography.displaySmall,
                        color = Palette.Plum,
                        modifier = Modifier.width(44.dp),
                    )
                    Slider(
                        value = energy.toFloat(),
                        onValueChange = { energy = it.toInt().coerceIn(1, 10) },
                        valueRange = 1f..10f,
                        steps = 8,
                        enabled = !saving && !saved,
                        modifier = Modifier.weight(1f),
                        colors = SliderDefaults.colors(
                            thumbColor = Palette.Plum,
                            activeTrackColor = Palette.Plum,
                            inactiveTrackColor = Palette.Border,
                        ),
                    )
                }
            }
        }

        // ── Support ────────────────────────────────────────────────
        McCard(modifier = Modifier.fillMaxWidth()) {
            Column {
                Text(
                    "What would support you right now?",
                    style = MaterialTheme.typography.titleMedium,
                    color = Palette.Charcoal,
                )
                Spacer(Modifier.height(12.dp))
                SUPPORT_OPTIONS.forEach { option ->
                    val selected = option == support
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(Shapes.Chip)
                            .background(
                                if (selected) Palette.Lavender else Color.Transparent,
                            )
                            .clickable(enabled = !saving && !saved) { support = option }
                            .padding(horizontal = 12.dp, vertical = 11.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Box(
                            modifier = Modifier
                                .size(20.dp)
                                .clip(CircleShape)
                                .background(if (selected) Palette.Plum else Palette.Border),
                            contentAlignment = Alignment.Center,
                        ) {
                            if (selected) {
                                Box(
                                    Modifier
                                        .size(8.dp)
                                        .clip(CircleShape)
                                        .background(Palette.White),
                                )
                            }
                        }
                        Spacer(Modifier.width(12.dp))
                        Text(
                            option,
                            style = MaterialTheme.typography.bodyMedium,
                            color = if (selected) Palette.Plum else Palette.Charcoal,
                        )
                    }
                    Spacer(Modifier.height(2.dp))
                }
            }
        }

        GradientButton(
            text = when {
                saved -> "Saved"
                saving -> "Saving…"
                else -> "Save check-in"
            },
            onClick = {
                if (saving || saved) return@GradientButton
                saving = true
                error = null
                scope.launch {
                    runCatching {
                        ApiClient.postIgnoring(
                            "/api/mood",
                            jsonBody(
                                "mood_score" to energy,
                                // Same three buckets the web uses, so the
                                // Insights bands (good ≥7, neutral ≥5) line up.
                                "mood_emoji" to when {
                                    energy >= 7 -> "😌"
                                    energy >= 5 -> "😐"
                                    else -> "😔"
                                },
                                "note" to "Check-in: energy $energy/10 · what would help: $support",
                            ),
                        )
                    }.onSuccess {
                        saved = true
                        saving = false
                    }.onFailure {
                        saving = false
                        error = it.message ?: "Could not save your check-in. Please try again."
                    }
                }
            },
            enabled = !saving && !saved,
        )

        Spacer(Modifier.height(4.dp))
        GradientButton(
            text = if (saved) "Back to Home" else "Not now",
            onClick = onDone,
        )
    }
}