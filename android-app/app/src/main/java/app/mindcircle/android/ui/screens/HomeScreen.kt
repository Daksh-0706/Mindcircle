package app.mindcircle.android.ui.screens

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
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.R
import app.mindcircle.android.core.ApiClient
import app.mindcircle.android.data.HOME_SUGGESTIONS
import app.mindcircle.android.data.Activity
import app.mindcircle.android.core.AppViewModel
import app.mindcircle.android.core.DataList
import app.mindcircle.android.core.JournalEntry
import app.mindcircle.android.core.MoodLog
import app.mindcircle.android.core.jsonBody
import app.mindcircle.android.data.MoodOption
import app.mindcircle.android.data.Reference
import app.mindcircle.android.ui.components.Chip
import app.mindcircle.android.ui.components.ErrorBanner
import app.mindcircle.android.ui.components.GradientButton
import app.mindcircle.android.ui.components.McCard
import app.mindcircle.android.ui.components.MoodGrid
import app.mindcircle.android.ui.components.TintedCard
import app.mindcircle.android.ui.theme.Palette
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

/**
 * Dashboard. Section order mirrors `AppHomeClient` on the web: sunset hero,
 * "How are you feeling?" with the Save pill, "This Week", then the private
 * journal nudge.
 */
@Composable
fun HomeScreen(
    viewModel: AppViewModel,
    onOpenJournal: () -> Unit,
    onOpenInsights: () -> Unit,
    onOpenCrisis: () -> Unit,
    onOpenAssessment: () -> Unit,
    onOpenActivities: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    val state by viewModel.state.collectAsState()
    val me = (state as? AppViewModel.AuthState.SignedIn)?.me

    var selected by remember { mutableStateOf<MoodOption?>(null) }
    var saving by remember { mutableStateOf(false) }
    var saved by remember { mutableStateOf(false) }
    var moodError by remember { mutableStateOf<String?>(null) }

    // Mood logs double as the "This Week" source: check-in days + today's mood.
    val moodLogs by produceState<List<MoodLog>>(initialValue = emptyList()) {
        value = runCatching { ApiClient.get<DataList<MoodLog>>("/api/mood").data }
            .getOrDefault(emptyList())
    }
    val journalEntries by produceState<List<JournalEntry>>(initialValue = emptyList()) {
        value = runCatching { ApiClient.get<DataList<JournalEntry>>("/api/journal").data }
            .getOrDefault(emptyList())
    }

    // Week stats, computed the way the web's home does: everything inside the
    // last 7 days, and a day counts as "active" if it has a mood OR a journal
    // entry. Days are compared as local yyyy-MM-dd so a late-night log lands on
    // the day the user would name, not on UTC's.
    val weekStats = remember(moodLogs, journalEntries) {
        val cutoff = weekAgo()
        val weekMoods = moodLogs.filter { (isoToLocalDay(it.createdAt) ?: "") >= cutoff }
        val weekEntries = journalEntries.filter { (isoToLocalDay(it.createdAt) ?: "") >= cutoff }
        val active = (
            weekMoods.mapNotNull { isoToLocalDay(it.createdAt) } +
                weekEntries.mapNotNull { isoToLocalDay(it.createdAt) }
            ).toSet()
        Triple(
            weekMoods.size + weekEntries.size,
            weekEntries.mapNotNull { isoToLocalDay(it.createdAt) }.distinct().size,
            active,
        )
    }
    val totalActions = weekStats.first
    val journalDays = weekStats.second

    // Monday-first strip, like the reference design. Anything after today is
    // always empty, and today is the only bold label.
    val weekdayLabels = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
    val localDayFmt = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    val todayIndex = (Calendar.getInstance().get(Calendar.DAY_OF_WEEK) + 5) % 7
    val dayDone = weekdayLabels.indices.map { i ->
        if (i > todayIndex) {
            false
        } else {
            val offsetDays = (todayIndex - i).toLong()
            weekStats.third.contains(
                localDayFmt.format(Date(System.currentTimeMillis() - offsetDays * 24L * 60 * 60 * 1000)),
            )
        }
    }

    val name = me?.profile?.displayName ?: me?.user?.fullName
    val greeting = when (SimpleDateFormat("HH", Locale.getDefault()).format(Date()).toInt()) {
        in 0..11 -> "Good morning"
        in 12..16 -> "Good afternoon"
        else -> "Good evening"
    }
    val today = SimpleDateFormat("EEEE, d MMMM", Locale.getDefault()).format(Date())

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        // A profile that fails to load used to be swallowed silently: the
        // greeting just lost the name and the counters showed zeros, which
        // looks like "new account" rather than "something is broken".
        val profileError by viewModel.profileError.collectAsState()
        profileError?.let {
            ErrorBanner(it)
            Spacer(Modifier.height(4.dp))
        }

        // ── Sunset hero ────────────────────────────────────────────────
        // Capped in height: the web's banner is a compact strip, and letting
        // this size itself pushed the mood check-in below the fold.
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(250.dp)
                .clip(app.mindcircle.android.ui.theme.Shapes.Card)
                .background(Palette.Plum),
        ) {
            Image(
                painter = painterResource(R.drawable.hero_sunset),
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
                alpha = 0.85f,
            )
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.horizontalGradient(
                            listOf(Palette.PlumDark.copy(alpha = 0.75f), Palette.PlumDark.copy(alpha = 0.15f)),
                        ),
                    ),
            )
            Column(Modifier.padding(20.dp)) {
                Text(
                    today,
                    style = MaterialTheme.typography.bodySmall,
                    color = Palette.Cream.copy(alpha = 0.85f),
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = if (name.isNullOrBlank()) "$greeting." else "$greeting,",
                    style = MaterialTheme.typography.headlineLarge,
                    color = Palette.Cream,
                )
                if (!name.isNullOrBlank()) {
                    Text(
                        text = "$name.",
                        style = MaterialTheme.typography.headlineLarge,
                        color = Palette.Gold,
                    )
                }
                Spacer(Modifier.height(4.dp))
                Text(
                    // The web's line — and it is a prompt to check in, which is
                    // what the button below actually does.
                    "Take a minute to center your head space.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Palette.Cream.copy(alpha = 0.9f),
                )
                Spacer(Modifier.height(14.dp))
                Box(
                    modifier = Modifier
                        .clip(app.mindcircle.android.ui.theme.Shapes.Pill)
                        .background(Palette.White)
                        .clickable(onClick = onOpenAssessment)
                        .padding(start = 20.dp, end = 18.dp, top = 9.dp, bottom = 9.dp),
                ) {
                    Text(
                        // Opens the assessment, so the label says so.
                        "Check in now  →",
                        style = MaterialTheme.typography.labelLarge,
                        color = Palette.Plum,
                    )
                }
            }
        }

        // ── Mood check-in ──────────────────────────────────────────────
        McCard {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "How are you feeling?",
                        style = MaterialTheme.typography.headlineMedium,
                        color = Palette.Charcoal,
                        modifier = Modifier.weight(1f),
                    )
                    Box(
                        modifier = Modifier
                            .clip(app.mindcircle.android.ui.theme.Shapes.Pill)
                            .background(if (selected != null && !saved) Palette.GradientStart else Palette.Border)
                            .clickable(enabled = selected != null && !saving && !saved) {
                                val mood = selected ?: return@clickable
                                saving = true
                                moodError = null
                                scope.launch {
                                    runCatching {
                                        ApiClient.postIgnoring(
                                            "/api/mood",
                                            jsonBody(
                                                "mood_score" to mood.score,
                                                "mood_emoji" to mood.emoji,
                                            ),
                                        )
                                    }.onSuccess {
                                        saved = true
                                        saving = false
                                    }.onFailure {
                                        moodError = it.message ?: "Could not save your mood."
                                        saving = false
                                    }
                                }
                            }
                            .padding(horizontal = 18.dp, vertical = 9.dp),
                    ) {
                        Text(
                            text = when {
                                saved -> "✓  Saved"
                                saving -> "Saving…"
                                else -> "Save"
                            },
                            color = if (saved) Palette.White else Palette.Cream,
                            style = MaterialTheme.typography.labelLarge,
                        )
                    }
                }
                Spacer(Modifier.height(4.dp))
                Text(
                    "Pick what feels closest. No wrong answers.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Palette.WarmGray,
                )
                Spacer(Modifier.height(18.dp))
                MoodGrid(
                    selected = selected,
                    onSelect = {
                        selected = it
                        saved = false
                    },
                )
                moodError?.let {
                    Spacer(Modifier.height(14.dp))
                    ErrorBanner(it)
                }
            }
        }

        // ── This week ──────────────────────────────────────────────────
        McCard {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "This Week",
                        style = MaterialTheme.typography.headlineSmall.copy(
                            fontWeight = FontWeight.Bold,
                        ),
                        color = Palette.Charcoal,
                        modifier = Modifier.weight(1f),
                    )
                    Chip(text = "View details  →", background = Palette.Plum.copy(alpha = 0.10f), onClick = onOpenInsights)
                }
                Spacer(Modifier.height(18.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    WeekStat(
                        modifier = Modifier.weight(1f),
                        icon = app.mindcircle.android.R.drawable.ic_check,
                        value = totalActions.toString(),
                        label = "Total completed actions",
                        cardTint = Palette.Plum.copy(alpha = 0.07f),
                        iconTint = Palette.Plum,
                    )
                    WeekStat(
                        modifier = Modifier.weight(1f),
                        icon = app.mindcircle.android.R.drawable.ic_journal,
                        value = journalDays.toString(),
                        label = "Journal days completed",
                        cardTint = Palette.Terracotta.copy(alpha = 0.08f),
                        iconTint = Palette.Terracotta,
                    )
                }
                Spacer(Modifier.height(22.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    weekdayLabels.forEachIndexed { i, day ->
                        Column(
                            modifier = Modifier.weight(1f),
                            horizontalAlignment = Alignment.CenterHorizontally,
                        ) {
                            Text(
                                day,
                                style = MaterialTheme.typography.labelMedium.copy(
                                    fontWeight = if (i == todayIndex) FontWeight.Bold else FontWeight.Normal,
                                ),
                                color = if (i == todayIndex) Palette.Charcoal else Palette.WarmGray,
                            )
                            Spacer(Modifier.height(8.dp))
                            Box(
                                modifier = Modifier
                                    .size(30.dp)
                                    .clip(CircleShape)
                                    .background(if (dayDone[i]) Palette.Plum else Color.White)
                                    .border(
                                        width = if (dayDone[i]) 0.dp else 2.dp,
                                        color = if (dayDone[i]) Color.Transparent else Palette.Border,
                                        shape = CircleShape,
                                    ),
                                contentAlignment = Alignment.Center,
                            ) {
                                if (dayDone[i]) {
                                    Icon(
                                        painter = painterResource(
                                            app.mindcircle.android.R.drawable.ic_check,
                                        ),
                                        contentDescription = "$day completed",
                                        tint = Color.White,
                                        modifier = Modifier.size(15.dp),
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // ── Try something that helps ─────────────────────────────
        McCard {
            Column {
                Text(
                    "Try something that helps",
                    style = MaterialTheme.typography.headlineSmall.copy(
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Palette.Plum,
                )
                Spacer(Modifier.height(16.dp))
                HOME_SUGGESTIONS.forEach { suggestion ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(suggestion.background)
                            .clickable {
                                when (suggestion.destination) {
                                    Activity.Destination.ACTIVITIES -> onOpenActivities()
                                    Activity.Destination.JOURNAL -> onOpenJournal()
                                    // Nothing on Home links to a detail screen.
                                    Activity.Destination.SELF -> Unit
                                }
                            }
                            .padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Image(
                            painter = painterResource(suggestion.imageRes),
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                                .size(52.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color.White.copy(alpha = 0.7f)),
                        )
                        Spacer(Modifier.width(14.dp))
                        Column(Modifier.weight(1f)) {
                            Text(
                                suggestion.title,
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                ),
                                color = Palette.Charcoal,
                            )
                            Text(
                                suggestion.detail,
                                style = MaterialTheme.typography.labelMedium,
                                color = Palette.WarmGray,
                            )
                        }
                        Icon(
                            painter = painterResource(
                                app.mindcircle.android.R.drawable.ic_chevron,
                            ),
                            contentDescription = null,
                            tint = Palette.WarmGray,
                            modifier = Modifier.size(16.dp),
                        )
                    }
                    Spacer(Modifier.height(10.dp))
                }
            }
        }

        // ── Private by design ──────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(212.dp)
                .clip(app.mindcircle.android.ui.theme.Shapes.Card)
                .background(Palette.Plum),
        ) {
            Image(
                painter = painterResource(R.drawable.art_private_room),
                contentDescription = null,
                // Anchored right, the way the web's object-right does it. Centred
                // it instead, the crop cut off the lamp and the armchair and
                // left only flat purple behind the text.
                modifier = Modifier
                    .fillMaxSize()
                    .align(Alignment.CenterEnd),
                contentScale = ContentScale.Crop,
            )
            // Left-edge scrim so the copy stays legible over the artwork.
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.horizontalGradient(
                            listOf(
                                Palette.PlumDark.copy(alpha = 0.92f),
                                Palette.PlumDark.copy(alpha = 0.55f),
                                Color.Transparent,
                            ),
                        ),
                    ),
            )
            Column(
                modifier = Modifier
                    .fillMaxWidth(0.63f)
                    .padding(20.dp),
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "Private ",
                        style = MaterialTheme.typography.titleMedium,
                        color = Palette.Cream,
                    )
                    Text(
                        "by design",
                        style = MaterialTheme.typography.titleMedium,
                        color = Palette.Gold,
                    )
                }
                Spacer(Modifier.height(6.dp))
                Text(
                    "Your journal belongs to you alone. Only you can read what you write " +
                        "here — not other members, not counsellors.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Palette.Cream.copy(alpha = 0.9f),
                )
                Spacer(Modifier.height(12.dp))
                GradientButton(text = "Open journal", onClick = onOpenJournal)
            }
        }

        // ── Gentle nudge ───────────────────────────────────────────────
        TintedCard(colors = listOf(Palette.Mint, Palette.White)) {
            Column {
                Text("Need to talk to someone?", style = MaterialTheme.typography.titleSmall, color = Palette.SageDark)
                Spacer(Modifier.height(4.dp))
                Text(
                    "Crisis support is one tap away, 24/7 — no sign-in required.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Palette.SageDark,
                )
                Spacer(Modifier.height(12.dp))
                SecondaryLink("Open crisis support", onOpenCrisis)
            }
        }

        Spacer(Modifier.height(8.dp))
    }

    LaunchedEffect(saved) {
        if (saved) {
            kotlinx.coroutines.delay(2200)
            saved = false
            selected = null
        }
    }
}

@Composable
private fun WeekStat(
    value: String,
    label: String,
    icon: Int,
    cardTint: Color,
    iconTint: Color,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
            .background(cardTint)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(42.dp)
                .clip(CircleShape)
                .background(iconTint.copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                painter = painterResource(icon),
                contentDescription = null,
                tint = iconTint,
                modifier = Modifier.size(19.dp),
            )
        }
        Spacer(Modifier.width(12.dp))
        Column {
            Text(
                value,
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontWeight = FontWeight.Bold,
                ),
                color = Palette.Charcoal,
            )
            Text(
                label,
                style = MaterialTheme.typography.bodySmall,
                color = Palette.WarmGray,
            )
        }
    }
}

/**
 * Turns an API timestamp into the local calendar day it belongs to.
 *
 * The API returns ISO-8601 with a UTC offset and sometimes microseconds. The
 * web compares `new Date(iso)` against a local midnight; doing the same here
 * keeps the weekday dots agreeing with the web instead of drifting by a day.
 */
private fun isoToLocalDay(iso: String?): String? = iso?.let { raw ->
    val normalised = raw.replace("Z", "+0000")
    val patterns = listOf(
        "yyyy-MM-dd'T'HH:mm:ss.SSSSSSXXX",
        "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
        "yyyy-MM-dd'T'HH:mm:ssXXX",
    )
    val millis = patterns.firstNotNullOfOrNull { pattern ->
        runCatching {
            SimpleDateFormat(pattern, Locale.US).parse(normalised)?.time
        }.getOrNull()
    } ?: return@let null
    SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date(millis))
}

@Composable
internal fun SecondaryLink(text: String, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clip(app.mindcircle.android.ui.theme.Shapes.Pill)
            .background(Palette.White)
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 9.dp),
    ) {
        Text(text, style = MaterialTheme.typography.labelMedium, color = Palette.Plum)
    }
}

private fun weekAgo(): String =
    SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date(System.currentTimeMillis() - 7L * 24 * 60 * 60 * 1000))

private fun weekDayLetters(): List<String> {
    val format = SimpleDateFormat("EEE", Locale.getDefault())
    val calendar = java.util.Calendar.getInstance()
    val out = mutableListOf<String>()
    repeat(7) {
        out += format.format(calendar.time).take(1)
        calendar.add(java.util.Calendar.DAY_OF_YEAR, 1)
    }
    return out
}
