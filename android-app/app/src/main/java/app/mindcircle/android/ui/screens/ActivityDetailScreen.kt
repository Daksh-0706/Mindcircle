package app.mindcircle.android.ui.screens

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
// matchParentSize is a BoxScope member extension, not a top-level import —
// it resolves inside a Box's content lambda on its own.
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.R
import app.mindcircle.android.data.Activity
import app.mindcircle.android.ui.components.GradientButton
import app.mindcircle.android.ui.theme.Palette
import app.mindcircle.android.ui.theme.Shapes
import kotlinx.coroutines.delay

/**
 * One activity's guided session.
 *
 * Meditation and gratitude are built the way the web builds them — the
 * meditation one runs a real countdown, and gratitude's CTA hands you to the
 * journal. Everything else would have been a bare text list, so those cards are
 * marked unavailable on the grid instead.
 */
@Composable
fun ActivityDetailScreen(
    activity: Activity,
    onBack: () -> Unit,
    onOpenJournal: () -> Unit,
) {
    when (activity.id) {
        "meditation" -> MeditationDetail(activity, onBack)
        "gratitude" -> GratitudeDetail(activity, onBack, onOpenJournal)
        else -> SimpleDetail(activity, onBack)
    }
}

// ── Shared bits ────────────────────────────────────────────────────

@Composable
private fun BackLink(onBack: () -> Unit) {
    Row(
        modifier = Modifier
            .clip(Shapes.Pill)
            .clickable(onClick = onBack)
            .padding(horizontal = 4.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            painter = painterResource(R.drawable.ic_back),
            contentDescription = null,
            tint = Palette.WarmGray,
            modifier = Modifier.size(16.dp),
        )
        Spacer(Modifier.width(6.dp))
        Text("Back to activities", style = MaterialTheme.typography.bodySmall, color = Palette.WarmGray)
    }
}

/**
 * The lavender → peach → indigo artwork the web uses behind both heroes.
 *
 * A BoxScope extension so [matchParentSize] resolves for it: inside a Box in a
 * scrolling column, plain fillMaxSize measures against the incoming max
 * constraint and inflates the Box past its own content, which pushed the
 * timer ring up over the panel above it.
 */
@Composable
private fun BoxScope.MeditationBackdrop() {
    Image(
        painter = painterResource(R.drawable.activity_meditation_grad),
        contentDescription = null,
        contentScale = ContentScale.Crop,
        modifier = Modifier.matchParentSize(),
    )
}

@Composable
private fun DurationPill(text: String, contentColor: Color = Color(0xFF5B3E8E)) {
    Row(
        modifier = Modifier
            .clip(Shapes.Pill)
            .background(Color.White.copy(alpha = 0.85f))
            .padding(horizontal = 11.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            painter = painterResource(R.drawable.ic_clock),
            contentDescription = null,
            tint = contentColor,
            modifier = Modifier.size(13.dp),
        )
        Spacer(Modifier.width(5.dp))
        Text(
            text,
            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
            color = contentColor,
        )
    }
}

private data class Step(val n: String, val title: String, val body: String)

/** Numbered gradient badge, matching the web's `01 / 02 / 03` chips. */
@Composable
private fun StepBadge(n: String) {
    Box(
        modifier = Modifier
            .size(32.dp)
            .clip(CircleShape)
            .background(
                Brush.linearGradient(listOf(Color(0xFF8B7BD8), Color(0xFFD4674C))),
            ),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            n,
            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
            color = Color.White,
        )
    }
}

@Composable
private fun StopAnytimeNote() {
    Row(
        modifier = Modifier.fillMaxWidth().padding(top = 14.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            painter = painterResource(R.drawable.ic_wind),
            contentDescription = null,
            tint = Palette.WarmGray,
            modifier = Modifier.size(14.dp),
        )
        Spacer(Modifier.width(6.dp))
        Text(
            "Stop anytime and return when you feel ready.",
            style = MaterialTheme.typography.bodySmall,
            color = Palette.WarmGray,
        )
    }
}

// ── Meditation: steps + a working 5-minute countdown ───────────────

@Composable
private fun MeditationDetail(activity: Activity, onBack: () -> Unit) {
    val total = activity.durationSeconds
    var started by remember { mutableStateOf(false) }
    var paused by remember { mutableStateOf(false) }
    var secondsLeft by remember { mutableIntStateOf(total) }

    val done = secondsLeft <= 0

    // Ticks once a second while running; pausing simply stops re-arming it.
    LaunchedEffect(started, paused, done) {
        while (started && !paused && !done) {
            delay(1000)
            secondsLeft = (secondsLeft - 1).coerceAtLeast(0)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        BackLink(onBack)

        // Hero — gradient artwork with a breathing circle on the right.
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(210.dp)
                .clip(RoundedCornerShape(28.dp)),
        ) {
            MeditationBackdrop()
            // White wash, as on the web, so the plum copy stays legible.
            Box(
                Modifier
                    .matchParentSize()
                    .background(
                        Brush.linearGradient(
                            listOf(
                                Color.White.copy(alpha = 0.80f),
                                Color.White.copy(alpha = 0.50f),
                                Color.White.copy(alpha = 0.18f),
                            ),
                        ),
                    ),
            )
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(Modifier.weight(1f)) {
                    DurationPill("${activity.durationLong} · Beginner")
                    Spacer(Modifier.height(10.dp))
                    Text(
                        activity.title,
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontWeight = FontWeight.Bold,
                        ),
                        color = Color(0xFF3D2A52),
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        "A short reset to help you return to the present moment.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF3D2A52).copy(alpha = 0.8f),
                    )
                }
                Spacer(Modifier.width(8.dp))
                BreathingCircle(Modifier.size(108.dp))
            }
        }

        // Steps
        val steps = listOf(
            Step("01", "Settle in", activity.steps[0]),
            Step("02", "Breathe slowly", activity.steps[1]),
            Step("03", "Let thoughts pass", activity.steps[2]),
        )
        steps.forEach { step ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(Color.White)
                    .border(1.dp, Palette.Border, RoundedCornerShape(18.dp))
                    .padding(14.dp),
            ) {
                StepBadge(step.n)
                Spacer(Modifier.width(12.dp))
                Column {
                    Text(
                        step.title,
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                        ),
                        color = Color(0xFF3D2A52),
                    )
                    Text(
                        step.body,
                        style = MaterialTheme.typography.bodySmall,
                        color = Palette.WarmGray,
                    )
                }
            }
        }

        // CTA band
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(150.dp)
                .clip(RoundedCornerShape(28.dp)),
        ) {
            MeditationBackdrop()
            Box(
                Modifier
                    .matchParentSize()
                    .background(Color(0xFF2A1B3D).copy(alpha = 0.32f)),
            )
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 20.dp, vertical = 18.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Text(
                    "Ready when you are.",
                    style = MaterialTheme.typography.headlineSmall.copy(
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Color.White,
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    "Give yourself five quiet minutes. There is nowhere else you need to be.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.White.copy(alpha = 0.88f),
                )
                if (!started) {
                    Spacer(Modifier.height(12.dp))
                    Row(
                        modifier = Modifier
                            .clip(Shapes.Pill)
                            .background(Color.White)
                            .clickable {
                                secondsLeft = total
                                paused = false
                                started = true
                            }
                            .padding(horizontal = 22.dp, vertical = 11.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Icon(
                            painter = painterResource(R.drawable.ic_play),
                            contentDescription = null,
                            tint = Color(0xFF8A3E79),
                            modifier = Modifier.size(16.dp),
                        )
                        Spacer(Modifier.width(8.dp))
                        Text(
                            "Start Session",
                            style = MaterialTheme.typography.labelLarge.copy(
                                fontWeight = FontWeight.Bold,
                            ),
                            color = Color(0xFF8A3E79),
                        )
                    }
                }
            }
        }

        // Running session panel
        if (started) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(28.dp)),
            ) {
                MeditationBackdrop()
                Box(
                    Modifier
                        .matchParentSize()
                        .background(Color(0xFF2A1B3D).copy(alpha = 0.35f)),
                )
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    TimerRing(secondsLeft = secondsLeft, total = total)
                    Spacer(Modifier.height(14.dp))
                    Text(
                        if (done) "Session complete." else "Take this moment for yourself.",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.SemiBold,
                        ),
                        color = Color.White,
                    )
                    Text(
                        if (done) "You gave yourself five quiet minutes."
                        else "Follow the rhythm. In… and out…",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White.copy(alpha = 0.82f),
                    )
                    Spacer(Modifier.height(16.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(
                            modifier = Modifier
                                .clip(Shapes.Pill)
                                .background(Color.White)
                                .clickable(enabled = !done) { paused = !paused }
                                .padding(horizontal = 20.dp, vertical = 11.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Icon(
                                painter = painterResource(
                                    if (paused) R.drawable.ic_play else R.drawable.ic_pause,
                                ),
                                contentDescription = null,
                                tint = Color(0xFF2A1B3D),
                                modifier = Modifier.size(15.dp),
                            )
                            Spacer(Modifier.width(8.dp))
                            Text(
                                if (paused) "Resume" else "Pause",
                                style = MaterialTheme.typography.labelLarge.copy(
                                    fontWeight = FontWeight.Bold,
                                ),
                                color = Color(0xFF2A1B3D),
                            )
                        }
                        Row(
                            modifier = Modifier
                                .clip(Shapes.Pill)
                                .background(Color.White.copy(alpha = 0.14f))
                                .border(1.dp, Color.White.copy(alpha = 0.4f), Shapes.Pill)
                                .clickable {
                                    started = false
                                    paused = false
                                    secondsLeft = total
                                }
                                .padding(horizontal = 20.dp, vertical = 11.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Icon(
                                painter = painterResource(R.drawable.ic_wind),
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(15.dp),
                            )
                            Spacer(Modifier.width(8.dp))
                            Text(
                                "End",
                                style = MaterialTheme.typography.labelLarge.copy(
                                    fontWeight = FontWeight.Bold,
                                ),
                                color = Color.White,
                            )
                        }
                    }
                }
            }
        }

        StopAnytimeNote()
        Spacer(Modifier.height(4.dp))
    }
}

/** The cutout figure inside softly pulsing rings, as on the web. */
@Composable
private fun BreathingCircle(modifier: Modifier = Modifier) {
    val transition = rememberInfiniteTransition(label = "breathing")
    val pulse by transition.animateFloat(
        initialValue = 1f,
        targetValue = 1.06f,
        animationSpec = infiniteRepeatable(
            animation = tween(4500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "pulse",
    )
    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        // Two offset rings so it reads as an outward ripple.
        Box(
            Modifier
                .fillMaxSize()
                .drawBehind {
                    drawCircle(
                        color = Color(0xFF8B7BD8).copy(alpha = 0.35f),
                        style = Stroke(width = 1.5f),
                        radius = size.minDimension * 0.46f * pulse,
                    )
                    drawCircle(
                        color = Color(0xFF8B7BD8).copy(alpha = 0.20f),
                        style = Stroke(width = 1.5f),
                        radius = size.minDimension * 0.36f * (2f - pulse),
                    )
                },
        )
        Image(
            painter = painterResource(R.drawable.activity_meditation_figure),
            contentDescription = null,
            contentScale = ContentScale.Fit,
            modifier = Modifier.fillMaxSize(),
        )
    }
}

/** Circular progress ring with the countdown over a faded copy of the figure. */
@Composable
private fun TimerRing(secondsLeft: Int, total: Int) {
    val minutes = secondsLeft / 60
    val seconds = secondsLeft % 60
    val progress = if (total == 0) 0f else secondsLeft.toFloat() / total
    // Eased so the ring glides between ticks instead of jumping a degree.
    val sweep by animateFloatAsState(
        targetValue = progress,
        animationSpec = tween(durationMillis = 800, easing = FastOutSlowInEasing),
        label = "timer",
    )

    Box(Modifier.size(190.dp), contentAlignment = Alignment.Center) {
        Box(
            Modifier
                .fillMaxSize()
                .drawBehind {
                    val stroke = 8.dp.toPx()
                    val radius = size.minDimension / 2f - stroke
                    drawArc(
                        color = Color.White.copy(alpha = 0.16f),
                        startAngle = -90f,
                        sweepAngle = 360f,
                        useCenter = false,
                        style = Stroke(width = stroke),
                    )
                    drawArc(
                        brush = Brush.linearGradient(
                            listOf(Color(0xFFEDB6D2), Color(0xFFDE6951)),
                        ),
                        startAngle = -90f,
                        sweepAngle = 360f * sweep,
                        useCenter = false,
                        style = Stroke(width = stroke, cap = StrokeCap.Round),
                    )
                },
        )
        BreathingCircle(Modifier.fillMaxSize(0.72f).padding(2.dp))
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                "$minutes:${seconds.toString().padStart(2, '0')}",
                style = MaterialTheme.typography.displaySmall.copy(
                    fontWeight = FontWeight.Bold,
                ),
                color = Color.White,
            )
            Text(
                if (secondsLeft <= 0) "COMPLETE" else "MINUTES",
                style = MaterialTheme.typography.labelSmall,
                color = Color.White.copy(alpha = 0.72f),
            )
        }
    }
}

// ── Gratitude: illustration hero + steps + journal hand-off ────────

@Composable
private fun GratitudeDetail(
    activity: Activity,
    onBack: () -> Unit,
    onOpenJournal: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        BackLink(onBack)

        // Hero — gratitude illustration bleeding in from the right.
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp)
                .clip(RoundedCornerShape(28.dp)),
        ) {
            Image(
                painter = painterResource(R.drawable.activity_gratitude_bg),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                alignment = Alignment.CenterEnd,
                modifier = Modifier.matchParentSize(),
            )
            // Left wash so the copy stays readable over the artwork.
            Box(
                Modifier
                    .matchParentSize()
                    .background(
                        Brush.horizontalGradient(
                            listOf(
                                Color(0xFFFDF4EC).copy(alpha = 0.95f),
                                Color(0xFFFDF4EC).copy(alpha = 0.70f),
                                Color(0xFFFDF4EC).copy(alpha = 0.10f),
                            ),
                        ),
                    ),
            )
            Column(
                modifier = Modifier
                    .fillMaxWidth(0.82f)
                    .padding(20.dp),
            ) {
                Row(
                    modifier = Modifier
                        .clip(Shapes.Pill)
                        .background(Color.White.copy(alpha = 0.85f))
                        .padding(horizontal = 11.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(
                        painter = painterResource(R.drawable.ic_activities),
                        contentDescription = null,
                        tint = Color(0xFF5B3E8E),
                        modifier = Modifier.size(13.dp),
                    )
                    Spacer(Modifier.width(5.dp))
                    Text(
                        "JOURNALING",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.4.sp,
                        ),
                        color = Color(0xFF5B3E8E),
                    )
                }
                Spacer(Modifier.height(10.dp))
                DurationPill(
                    "${activity.durationLong} · Beginner",
                    contentColor = Color(0xFF3D2A52),
                )
                Spacer(Modifier.height(10.dp))
                Text(
                    activity.title,
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Color(0xFF3D2A52),
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    "Shift your attention toward the small things that are carrying you.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF3D2A52).copy(alpha = 0.75f),
                )
            }
        }

        // Three steps as compact rows, the way the web lays them out.
        val steps = listOf(
            Step("01", "Name one thing that felt good today.", "It can be anything — big or small."),
            Step("02", "Write why it mattered to you.", "Take a moment to reflect."),
            Step("03", "Notice how your body feels as you remember it.", "Stay with the feeling for a few seconds."),
        )
        steps.forEach { step ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(Color.White.copy(alpha = 0.75f))
                    .border(1.dp, Color.White.copy(alpha = 0.6f), RoundedCornerShape(18.dp))
                    .padding(horizontal = 12.dp, vertical = 11.dp),
            ) {
                StepBadge(step.n)
                Spacer(Modifier.width(12.dp))
                Column {
                    Text(
                        step.title,
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                        ),
                        color = Color(0xFF3D2A52),
                    )
                    Text(
                        step.body,
                        style = MaterialTheme.typography.bodySmall,
                        color = Palette.WarmGray,
                    )
                }
            }
        }

        // The hand-off: starting this activity means writing something.
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(Shapes.Pill)
                .background(
                    Brush.horizontalGradient(
                        listOf(Color(0xFF5B4B9E), Color(0xFF8A4E8E), Color(0xFFD4674C)),
                    ),
                )
                .clickable(onClick = onOpenJournal)
                .padding(vertical = 14.dp),
            contentAlignment = Alignment.Center,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    painter = painterResource(R.drawable.ic_play),
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(16.dp),
                )
                Spacer(Modifier.width(9.dp))
                Text(
                    "Start activity",
                    style = MaterialTheme.typography.labelLarge.copy(
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Color.White,
                )
            }
        }

        StopAnytimeNote()
        Spacer(Modifier.height(4.dp))
    }
}

// ── Fallback for anything without a designed session ───────────────

@Composable
private fun SimpleDetail(activity: Activity, onBack: () -> Unit) {
    var started by remember { mutableStateOf(false) }
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        BackLink(onBack)

        Image(
            painter = painterResource(activity.imageRes),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .fillMaxWidth()
                .height(160.dp)
                .clip(RoundedCornerShape(24.dp)),
        )

        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                activity.title,
                style = MaterialTheme.typography.headlineSmall.copy(
                    fontWeight = FontWeight.Bold,
                ),
                color = Palette.Charcoal,
                modifier = Modifier.weight(1f),
            )
            DurationPill(activity.durationLong, contentColor = Palette.Charcoal)
        }
        Text(
            activity.detailDescription,
            style = MaterialTheme.typography.bodyMedium,
            color = Palette.WarmGray,
        )

        activity.steps.forEachIndexed { index, step ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(Palette.CreamDark.copy(alpha = 0.6f))
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(Palette.Plum),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        "${index + 1}",
                        style = MaterialTheme.typography.labelSmall,
                        color = Palette.Cream,
                    )
                }
                Spacer(Modifier.width(12.dp))
                Text(step, style = MaterialTheme.typography.bodyMedium, color = Palette.Charcoal)
            }
        }

        GradientButton(
            text = if (started) "Pause activity" else "Start activity",
            onClick = { started = !started },
        )

        if (started) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(Palette.Mint)
                    .padding(24.dp),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Image(
                        painter = painterResource(activity.imageRes),
                        contentDescription = null,
                        contentScale = ContentScale.Fit,
                        modifier = Modifier.size(90.dp),
                    )
                    Spacer(Modifier.height(12.dp))
                    Text(
                        "Take this moment for yourself.",
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                        ),
                        color = Palette.Plum,
                    )
                    Text(
                        "Follow the rhythm. There is nowhere else you need to be.",
                        style = MaterialTheme.typography.bodySmall,
                        color = Palette.WarmGray,
                    )
                }
            }
        }

        StopAnytimeNote()
    }
}