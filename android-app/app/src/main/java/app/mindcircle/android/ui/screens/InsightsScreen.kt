package app.mindcircle.android.ui.screens

import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.core.ApiClient
import app.mindcircle.android.core.DataList
import app.mindcircle.android.core.MoodLog
import app.mindcircle.android.data.Reference
import app.mindcircle.android.ui.components.Chip
import app.mindcircle.android.ui.components.EmptyState
import app.mindcircle.android.ui.components.HeroCard
import app.mindcircle.android.ui.components.McCard
import app.mindcircle.android.ui.components.Shimmer
import app.mindcircle.android.ui.components.TintedCard
import app.mindcircle.android.ui.theme.Palette
import app.mindcircle.android.ui.theme.Shapes
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.roundToInt

/**
 * Insights. Built from the same `/api/mood` feed the web's InsightsClient uses,
 * so both clients show identical numbers.
 */
@Composable
fun InsightsScreen() {
    var logs by remember { mutableStateOf<List<MoodLog>?>(null) }
    var rangeDays by remember { mutableStateOf(7) }

    LaunchedEffect(Unit) {
        logs = runCatching { ApiClient.get<DataList<MoodLog>>("/api/mood").data }
            .getOrDefault(emptyList())
    }

    val inRange = remember(logs, rangeDays) {
        val cutoff = System.currentTimeMillis() - rangeDaysLMillis(rangeDays)
        logs.orEmpty()
            .filter { log -> (log.createdAt?.let { parseIso(it) } ?: 0L) >= cutoff }
            .sortedByDescending { parseIso(it.createdAt.orEmpty()) ?: 0L }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        HeroCard(
            title = "Wellbeing",
            gradientTitle = "Insights",
            subtitle = "A gentle mirror of how your days have been feeling.",
            imageRes = app.mindcircle.android.R.drawable.art_insights,
            background = listOf(Palette.CreamDark, Palette.White),
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(7 to "7 Days", 30 to "30 Days", 90 to "3 Months").forEach { (days, label) ->
                    Chip(
                        text = label,
                        selected = rangeDays == days,
                        onClick = { rangeDays = days },
                    )
                }
            }
        }

        val current = logs
        if (current == null) {
            Shimmer(Modifier.fillMaxWidth().height(200.dp))
            Shimmer(Modifier.fillMaxWidth().height(140.dp))
            return@Column
        }

        if (inRange.isEmpty()) {
            EmptyState(
                icon = "📈",
                title = "No check-ins in this range yet",
                description = "Log a mood from the dashboard and your timeline will appear here.",
            )
            return@Column
        }

        val average = inRange.mapNotNull { it.moodScore.takeIf { s -> s > 0 } }.average()
        val band = Reference.bandFor(average.roundToInt().coerceIn(1, 10))

        McCard {
            Column {
                Text("Your head space timeline", style = MaterialTheme.typography.headlineSmall, color = Color(0xFF4A2C6E))
                Spacer(Modifier.height(14.dp))
                MoodLineChart(
                    values = inRange.reversed().mapNotNull { log ->
                        log.moodScore.takeIf { it > 0 }?.toFloat()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(160.dp),
                )
                Spacer(Modifier.height(12.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.CenterVertically) {
                    LegendDot(Reference.Band.GOOD.color, "Good")
                    LegendDot(Reference.Band.NEUTRAL.color, "Okay")
                    LegendDot(Reference.Band.HEAVY.color, "Heavy")
                }
                Spacer(Modifier.height(10.dp))
                Text(
                    "Takeaway: your average in this range is ${"%.1f".format(average)} — ${band.label.lowercase()}.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Palette.WarmGray,
                )
            }
        }

        // Distribution by mood
        McCard {
            Column {
                Text("Mood distribution", style = MaterialTheme.typography.headlineSmall, color = Color(0xFF4A2C6E))
                Spacer(Modifier.height(14.dp))
                val grouped = inRange.groupBy { it.moodEmoji ?: "❓" }
                Reference.moods.forEach { mood ->
                    val count = grouped[mood.emoji]?.size ?: 0
                    val pct = if (inRange.isEmpty()) 0f else count.toFloat() / inRange.size
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 6.dp)) {
                        Text(mood.emoji, fontSize = 18.sp)
                        Spacer(Modifier.width(10.dp))
                        Text(mood.label, style = MaterialTheme.typography.bodyMedium, color = Palette.Charcoal, modifier = Modifier.width(90.dp))
                        Box(
                            Modifier
                                .weight(1f)
                                .height(10.dp)
                                .clip(Shapes.Chip)
                                .background(Palette.CreamDark),
                        ) {
                            Box(
                                Modifier
                                    .fillMaxWidth(pct.coerceIn(0f, 1f))
                                    .height(10.dp)
                                    .clip(Shapes.Chip)
                                    .background(mood.color),
                            )
                        }
                        Spacer(Modifier.width(10.dp))
                        Text("$count", style = MaterialTheme.typography.bodySmall, color = Palette.WarmGray)
                    }
                }
            }
        }

        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            TintedCard(colors = listOf(Color(0xFFF3EFFB), Color(0xFFEFEAFB)), modifier = Modifier.weight(1f)) {
                Column {
                    Text("🧠", fontSize = 18.sp)
                    Spacer(Modifier.height(4.dp))
                    Text("%.1f".format(average), style = MaterialTheme.typography.headlineMedium, color = Palette.Charcoal)
                    Text("Average mood", style = MaterialTheme.typography.bodySmall, color = Palette.WarmGray)
                }
            }
            TintedCard(colors = listOf(Color(0xFFFBEDE7), Color(0xFFFAE9E4)), modifier = Modifier.weight(1f)) {
                Column {
                    Text("🔥", fontSize = 18.sp)
                    Spacer(Modifier.height(4.dp))
                    Text(
                        inRange.mapNotNull { it.createdAt?.take(10) }.distinct().size.toString(),
                        style = MaterialTheme.typography.headlineMedium,
                        color = Palette.Charcoal,
                    )
                    Text("Check-in days", style = MaterialTheme.typography.bodySmall, color = Palette.WarmGray)
                }
            }
        }

        Spacer(Modifier.height(8.dp))
    }
}

@Composable
private fun LegendDot(color: Color, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            Modifier
                .size(8.dp)
                .clip(Shapes.Chip)
                .background(color),
        )
        Spacer(Modifier.width(6.dp))
        Text(label, style = MaterialTheme.typography.labelMedium, color = Palette.WarmGray)
    }
}

/** Catmull-Rom-ish smooth line drawn with Canvas — the web's SVG chart, natively. */
@Composable
private fun MoodLineChart(values: List<Float>, modifier: Modifier = Modifier) {
    if (values.isEmpty()) {
        Box(modifier, contentAlignment = Alignment.Center) {
            Text("Nothing to plot yet", style = MaterialTheme.typography.bodySmall, color = Palette.WarmGray)
        }
        return
    }
    Canvas(modifier = modifier) {
        val maxScore = 10f
        val minScore = 1f
        val widthStep = if (values.size > 1) size.width / (values.size - 1) else size.width
        val path = Path()
        val points = values.mapIndexed { index, value ->
            val x = index * widthStep
            val y = size.height - (((value - minScore) / (maxScore - minScore)) * size.height)
            Offset(x, y.coerceIn(0f, size.height))
        }
        points.forEachIndexed { index, point ->
            if (index == 0) path.moveTo(point.x, point.y)
            else {
                val prev = points[index - 1]
                val midX = (prev.x + point.x) / 2
                path.cubicTo(midX, prev.y, midX, point.y, point.x, point.y)
            }
        }
        drawPath(
            path = path,
            color = Palette.Plum,
            style = Stroke(width = 5f, cap = StrokeCap.Round),
        )
        points.forEach { point ->
            drawCircle(color = Palette.Cream, radius = 7f, center = point)
            drawCircle(color = Palette.Terracotta, radius = 5f, center = point)
        }
    }
}

private fun rangeDaysLMillis(days: Int) = days * 24L * 60 * 60 * 1000

// parseIso() used to be duplicated here as a Date-returning variant, which
// silently disagreed with the ConnectScreen one about timezones and then
// collided as an overload once both became internal. One parser, one answer.
