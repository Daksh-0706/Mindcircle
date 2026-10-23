package app.mindcircle.android.ui.screens

import androidx.compose.animation.core.EaseInOut
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
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
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.data.Reference
import app.mindcircle.android.ui.components.HeroCard
import app.mindcircle.android.ui.components.TintedCard
import app.mindcircle.android.ui.theme.Palette
import app.mindcircle.android.ui.theme.Shapes

/**
 * Crisis support. Deliberately the same content as `/app/crisis` on the web —
 * and, like the web, it never asks you to sign in first.
 */
@Composable
fun CrisisScreen() {
    val context = LocalContext.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        HeroCard(
            title = "You're not alone",
            subtitle = "Free, confidential and available 24/7. Reach out — these lines exist for exactly this.",
            imageRes = app.mindcircle.android.R.drawable.art_crisis,
            background = listOf(Palette.CreamDark, Palette.White),
        )

        Text("Immediate help", style = MaterialTheme.typography.headlineMedium, color = Palette.Charcoal)

        Reference.helplines.forEach { line ->
            TintedCard(colors = line.cardColors) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(52.dp)
                                .clip(CircleShape)
                                .background(line.color.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text("📞", fontSize = 22.sp)
                        }
                        Spacer(Modifier.width(12.dp))
                        Column {
                            Text(line.name, style = MaterialTheme.typography.titleMedium, color = Palette.InkDeep)
                            Text(
                                line.description,
                                style = MaterialTheme.typography.bodySmall,
                                color = Palette.WarmGray,
                            )
                        }
                    }
                    Spacer(Modifier.height(14.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .clip(Shapes.Chip)
                                .background(Palette.White.copy(alpha = 0.7f))
                                .padding(horizontal = 12.dp, vertical = 6.dp),
                        ) {
                            Text("● 24/7", style = MaterialTheme.typography.labelMedium, color = Palette.SageDark)
                        }
                        Spacer(Modifier.width(12.dp))
                        Box(
                            modifier = Modifier
                                .clip(Shapes.Pill)
                                .background(
                                    Brush.horizontalGradient(listOf(line.color, line.color.copy(alpha = 0.75f))),
                                )
                                .clickable {
                                    val intent = android.content.Intent(
                                        android.content.Intent.ACTION_DIAL,
                                        android.net.Uri.parse("tel:${line.dial}"),
                                    )
                                    runCatching { context.startActivity(intent) }
                                }
                                .padding(horizontal = 20.dp, vertical = 11.dp),
                        ) {
                            Text(
                                "Call ${line.number}",
                                color = Palette.White,
                                style = MaterialTheme.typography.labelLarge,
                            )
                        }
                    }
                }
            }
        }

        BreathingCard()

        TintedCard(colors = listOf(Palette.White, Palette.Rose.copy(alpha = 0.4f))) {
            Column {
                Text("⚠️  In immediate danger?", style = MaterialTheme.typography.titleMedium, color = Palette.InkDeep)
                Spacer(Modifier.height(6.dp))
                Text(
                    "If you or someone else is in physical danger right now, call 112 or go to the " +
                        "nearest emergency room first. Do not wait for an app.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Palette.WarmGray,
                )
            }
        }

        Spacer(Modifier.height(8.dp))
    }
}

/**
 * The breathing exercise: 4s in, 2s hold, 5s out — the same rhythm as the web's
 * `/app/crisis` circle.
 */
@Composable
private fun BreathingCard() {
    var running by remember { mutableStateOf(false) }
    var phase by remember { mutableStateOf("Tap to start") }

    val transition = rememberInfiniteTransition(label = "breath")
    val scale by transition.animateFloat(
        initialValue = 1f,
        targetValue = 1.16f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = EaseInOut),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "scale",
    )

    TintedCard(colors = listOf(Palette.Lavender, Palette.White)) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
            Text("Breathing exercise", style = MaterialTheme.typography.titleMedium, color = Palette.InkDeep)
            Spacer(Modifier.height(4.dp))
            Text(
                "Let your body catch up with your mind.",
                style = MaterialTheme.typography.bodySmall,
                color = Palette.WarmGray,
            )
            Spacer(Modifier.height(20.dp))
            Box(
                modifier = Modifier
                    .size(220.dp)
                    .scale(if (running) scale else 1f)
                    .clip(CircleShape)
                    .background(
                        Brush.verticalGradient(
                            listOf(Color0xD6C8EF, Color0xE7D6EE, Color0xF7DFCC),
                        ),
                    )
                    .clickable {
                        running = !running
                        phase = if (running) "Breathe in…" else "Paused"
                    },
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🌸", fontSize = 30.sp)
                    Spacer(Modifier.height(8.dp))
                    Text(
                        phase,
                        style = MaterialTheme.typography.titleMedium,
                        color = Palette.PlumDark,
                        textAlign = TextAlign.Center,
                    )
                }
            }
            Spacer(Modifier.height(16.dp))
            Text(
                if (running) "Follow the circle — in for 4, hold for 2, out for 5."
                else "A minute of slow breathing is enough to start.",
                style = MaterialTheme.typography.bodySmall,
                color = Palette.WarmGray,
                textAlign = TextAlign.Center,
            )
        }
    }
}

private val Color0xD6C8EF = androidx.compose.ui.graphics.Color(0xFFD6C8EF)
private val Color0xE7D6EE = androidx.compose.ui.graphics.Color(0xFFE7D6EE)
private val Color0xF7DFCC = androidx.compose.ui.graphics.Color(0xFFF7DFCC)
