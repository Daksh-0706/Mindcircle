package app.mindcircle.android.ui.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
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
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.R
import app.mindcircle.android.core.ApiClient
import app.mindcircle.android.core.AppViewModel
import app.mindcircle.android.core.ConnectionRow
import app.mindcircle.android.core.DataList
import app.mindcircle.android.core.MeResponse
import app.mindcircle.android.core.jsonBody
import app.mindcircle.android.data.GOALS
import app.mindcircle.android.data.INTERESTS
import app.mindcircle.android.data.ONBOARDING_AVATARS
import app.mindcircle.android.data.PRESELECTED_GOALS
import app.mindcircle.android.data.PRONOUNS
import app.mindcircle.android.data.interestLabel
import kotlinx.coroutines.launch

/* ──────────────────────────────────────────────────────────────────────────
 * Profile Setup — the four-step wizard behind Settings → Profile Setup.
 *
 * Ports src/app/(auth)/onboarding: profile details, interests, goals, then a
 * summary with real people you can connect to. Everything writes to /api/me in
 * one PATCH on Finish, so leaving mid-way never leaves a half-written profile.
 * ────────────────────────────────────────────────────────────────────────── */

private val Indigo = Color(0xFF241B4F)
private val IndigoBright = Color(0xFF5B3ACF)
private val Violet = Color(0xFF6C4CE0)
private val Muted = Color(0xFF6E6A8C)
private val Faint = Color(0xFFA3A0B8)
private val StepLabel = Color(0xFF8C88AE)
private val CardBorder = Color(0xFFE4E2F0)
private val RowBorder = Color(0xFFEEECF7)
private val OnboardingBg = Color(0xFFF4F3FC)

/**
 * Everything the four steps read and write.
 *
 * Fields are snapshot-backed so writing one recomposes exactly the steps that
 * show it. A plain data class silently swallowed every edit and every prefill:
 * the values were correct, nothing just ever redrew.
 */
private class Draft {
    var name by mutableStateOf("")
    var pronouns by mutableStateOf("")
    var location by mutableStateOf("")
    var bio by mutableStateOf("")
    var avatar by mutableStateOf("🌱")
    // Private by default: a new member has not chosen to be findable yet, and
    // making it an explicit first step keeps it from being a silent setting.
    var isPublic by mutableStateOf(false)
    var interests by mutableStateOf<List<String>>(emptyList())
    var goals by mutableStateOf<List<String>>(PRESELECTED_GOALS)
}

private data class StepConfig(
    val heading: (Draft) -> String,
    val intro: String,
)

private val STEPS = listOf(
    StepConfig(
        heading = { "Let's set up your profile" },
        intro = "A few details to help you connect with the right people and make " +
            "your experience more meaningful.",
    ),
    StepConfig(
        heading = { "What are you into?" },
        intro = "Pick a few interests so we can show you people and rooms that " +
            "actually match your vibe.",
    ),
    StepConfig(
        heading = { "What do you want from Mindcircle?" },
        intro = "Choose a few goals so we can personalize your experience and show " +
            "you people with similar journeys.",
    ),
    StepConfig(
        heading = { if (it.name.isNotBlank()) "You're all set, ${it.name}! 🎉" else "You're all set! 🎉" },
        intro = "Your profile is ready. Here's a quick summary. You can always edit this later.",
    ),
)

@Composable
fun OnboardingScreen(
    viewModel: AppViewModel,
    onDone: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    val state by viewModel.state.collectAsState()
    val signedIn = state as? AppViewModel.AuthState.SignedIn

    val draft = remember { Draft() }
    var step by remember { mutableStateOf(0) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var prefillDone by remember { mutableStateOf(false) }

    // Prefill from the existing profile so "revisit setup" starts from what is
    // already true rather than blanking fields the member has already filled.
    LaunchedEffect(signedIn?.me) {
        if (prefillDone) return@LaunchedEffect
        val me = signedIn?.me ?: return@LaunchedEffect
        draft.name = me.profile?.displayName
            ?: me.displayName
            ?: me.user?.fullName.orEmpty()
        draft.avatar = me.profile?.avatarEmoji ?: draft.avatar
        draft.pronouns = me.profile?.pronouns.orEmpty()
        draft.location = me.profile?.location.orEmpty()
        draft.bio = me.profile?.bio.orEmpty()
        draft.isPublic = me.profile?.isPublic ?: false
        if (me.profile?.interests?.isNotEmpty() == true) draft.interests = me.profile.interests
        if (me.profile?.goals?.isNotEmpty() == true) draft.goals = me.profile.goals
        prefillDone = true
    }

    val config = STEPS[step]
    val isLast = step == STEPS.size - 1
    // Step 1 is the only gate: a name is what makes a profile recognisable, and
    // the web gates it the same way.
    val canContinue = step != 0 || draft.name.isNotBlank()

    fun goTo(next: Int) {
        if (saving) return
        error = null
        step = next.coerceIn(0, STEPS.size - 1)
    }

    fun save() {
        saving = true
        error = null
        scope.launch {
            runCatching {
                ApiClient.patchIgnoring(
                    "/api/me",
                    jsonBody(
                        "avatar_emoji" to draft.avatar,
                        "display_name" to draft.name.trim(),
                        "pronouns" to draft.pronouns,
                        "location" to draft.location.trim(),
                        "bio" to draft.bio.trim(),
                        "is_public" to draft.isPublic,
                        "interests" to draft.interests,
                        "goals" to draft.goals,
                    ),
                )
            }.onSuccess {
                saving = false
                viewModel.refreshProfile()
                onDone()
            }.onFailure {
                saving = false
                error = it.message ?: "Could not save your profile."
            }
        }
    }

    /** Skip never blocks on the network — the member asked to move on. */
    fun skip() {
        scope.launch {
            runCatching {
                ApiClient.patchIgnoring("/api/me", jsonBody("onboarded_at" to "now"))
            }
            onDone()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(OnboardingBg),
    ) {
        // Full-bleed pastel backdrop, same art as the web's /onboarding/bg-plain.
        Image(
            painter = painterResource(R.drawable.onboarding_bg_plain),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
        )
        Box(Modifier.fillMaxSize().background(Color.White.copy(alpha = 0.25f)))

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp, vertical = 14.dp),
        ) {
            // ── Top bar ──────────────────────────────────────
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                app.mindcircle.android.ui.components.BrandMark(heightDp = 26)
                Spacer(Modifier.width(10.dp))
                Text(
                    "MindCircle",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.ExtraBold,
                    ),
                    color = Color(0xFF7A3355),
                )
                Spacer(Modifier.weight(1f))
                if (!isLast) {
                    Text(
                        "Skip for now",
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.Bold,
                        ),
                        color = Color(0xFF5B5780),
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .clickable { skip() }
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            // ── Progress rail ────────────────────────────────
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                STEPS.indices.forEach { i ->
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(6.dp)
                            .padding(end = if (i == STEPS.size - 1) 0.dp else 8.dp)
                            .clip(RoundedCornerShape(3.dp))
                            .background(
                                if (i <= step) Violet else Color.White.copy(alpha = 0.7f),
                            ),
                    )
                }
                Text(
                    "  ${step + 1}/${STEPS.size}",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Color(0xFF5B5780),
                )
            }

            Spacer(Modifier.height(14.dp))

            // ── Step card ────────────────────────────────────
            // Body scrolls, actions stay pinned. Leaving Next/Finish inside the
            // scroll meant step 4 buried them under the summary — the one screen
            // where finishing is the whole point.
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .shadow(20.dp, RoundedCornerShape(26.dp), spotColor = PalettePlumShadow)
                    .clip(RoundedCornerShape(26.dp))
                    .background(Color.White.copy(alpha = 0.92f))
                    .border(1.dp, Color.White.copy(alpha = 0.7f), RoundedCornerShape(26.dp)),
            ) {
              Column(
                modifier = Modifier
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp, vertical = 20.dp),
            ) {
                AnimatedContent(
                    targetState = step,
                    transitionSpec = {
                        // Slide in from the right going forward, from the left
                        // going back, so direction matches the step change.
                        val forward = targetState > initialState
                        (
                            slideInHorizontally(tween(280)) { if (forward) it / 6 else -it / 6 } +
                                fadeIn(tween(220))
                            ) togetherWith (
                            slideOutHorizontally(tween(280)) { if (forward) -it / 6 else it / 6 } +
                                fadeOut(tween(180))
                            )
                    },
                    label = "onboardingStep",
                ) { current ->
                    Column {
                        Text(
                            "Step ${current + 1} of ${STEPS.size}",
                            style = MaterialTheme.typography.labelMedium,
                            color = StepLabel,
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            STEPS[current].heading(draft),
                            fontSize = 28.sp,
                            lineHeight = 33.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Indigo,
                        )
                        Spacer(Modifier.height(8.dp))
                        Text(
                            STEPS[current].intro,
                            style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 21.sp),
                            color = Muted,
                        )
                        Spacer(Modifier.height(20.dp))

                        when (current) {
                            0 -> StepProfileBody(draft)
                            1 -> StepInterestsBody(draft)
                            2 -> StepGoalsBody(draft)
                            else -> StepSummaryBody(draft) { goTo(it) }
                        }
                    }
                }

                error?.let {
                    Spacer(Modifier.height(16.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFFFDECEC))
                            .padding(14.dp),
                    ) {
                        Text(it, style = MaterialTheme.typography.bodyMedium, color = Color(0xFFB03A3A))
                    }
                }
              }

              // ── Pinned actions ───────────────────────────
              Column(
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 14.dp),
              ) {
                if (step == 0 && !canContinue) {
                    Text(
                        "Add a name to continue — you can change it later.",
                        modifier = Modifier.fillMaxWidth(),
                        style = MaterialTheme.typography.labelSmall,
                        color = Faint,
                        textAlign = androidx.compose.ui.text.style.TextAlign.End,
                    )
                    Spacer(Modifier.height(8.dp))
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    if (step > 0) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color.White)
                                .border(1.dp, CardBorder, RoundedCornerShape(16.dp))
                                .clickable(enabled = !saving) { goTo(step - 1) }
                                .padding(horizontal = 22.dp, vertical = 13.dp),
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    painter = painterResource(R.drawable.ic_chevron_left),
                                    contentDescription = null,
                                    tint = Color(0xFF3F3B63),
                                    modifier = Modifier.size(17.dp),
                                )
                                Spacer(Modifier.width(8.dp))
                                Text(
                                    "Back",
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        fontWeight = FontWeight.Bold,
                                    ),
                                    color = Color(0xFF3F3B63),
                                )
                            }
                        }
                    } else {
                        Spacer(Modifier.weight(1f))
                    }

                    Spacer(Modifier.width(12.dp))

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(16.dp))
                            .background(
                                if (canContinue || isLast) Indigo else Indigo.copy(alpha = 0.35f),
                            )
                            .clickable(enabled = !saving && (canContinue || isLast)) {
                                if (isLast) save() else goTo(step + 1)
                            }
                            .padding(vertical = 14.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        // Row, not overlapping children: the arrow was drawn
                        // straight over the label's centre.
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = when {
                                    isLast && saving -> "Saving…"
                                    isLast -> "Finish"
                                    else -> "Next"
                                },
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                ),
                                color = Color.White,
                            )
                            Spacer(Modifier.width(8.dp))
                            Icon(
                                painter = painterResource(R.drawable.ic_chevron_right),
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(17.dp),
                            )
                        }
                    }
                }
              }
            }
        }
    }
}

private val PalettePlumShadow = Color(0x4A2C5E).copy(alpha = 0.12f)

// ── Step 1 — profile details ──────────────────────────────────────────────

@Composable
private fun StepProfileBody(draft: Draft) {
    Column {
        // Avatar preview + picker, matching the mockup's stacked discs.
        Box(
            modifier = Modifier.fillMaxWidth(),
            contentAlignment = Alignment.Center,
        ) {
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFEDEAFB)),
                contentAlignment = Alignment.Center,
            ) {
                Text(draft.avatar, fontSize = 40.sp)
            }
            // Camera badge, the web's affordance for "tap to change".
            Box(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .offset(x = (-2).dp, y = (-2).dp)
                    .size(36.dp)
                    .shadow(4.dp, CircleShape)
                    .clip(CircleShape)
                    .background(Color.White),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    painter = painterResource(R.drawable.ic_avatar_camera),
                    contentDescription = "Choose an avatar",
                    tint = IndigoBright,
                    modifier = Modifier.size(17.dp),
                )
            }
        }

        Spacer(Modifier.height(14.dp))
        Text(
            "Choose an avatar",
            modifier = Modifier.fillMaxWidth(),
            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
            color = Indigo,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
        )
        Spacer(Modifier.height(12.dp))

        // 3-column grid of avatar discs.
        ONBOARDING_AVATARS.chunked(3).forEach { row ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterHorizontally),
            ) {
                row.forEach { option ->
                    val selected = draft.avatar == option.emoji
                    Box(
                        modifier = Modifier
                            // CircleShape alone let the row's weight stretch the
                            // disc into a pill; a fixed square keeps it round.
                            .size(52.dp)
                            .clip(CircleShape)
                            .background(parseHex(option.disc))
                            .then(
                                if (selected) Modifier.border(2.5.dp, Violet, CircleShape)
                                else Modifier,
                            )
                            .clickable { draft.avatar = option.emoji },
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(option.emoji, fontSize = 22.sp)
                    }
                }
            }
        }

        Spacer(Modifier.height(8.dp))
        OnbField(
            label = "Name",
            value = draft.name,
            onChange = { draft.name = it.take(80) },
            placeholder = "What should we call you?",
        )
        Spacer(Modifier.height(12.dp))
        OnbField(
            label = "Pronouns",
            value = draft.pronouns,
            onChange = { draft.pronouns = it },
            placeholder = "Optional",
            options = PRONOUNS,
        )
        Spacer(Modifier.height(12.dp))
        OnbField(
            label = "Location",
            value = draft.location,
            onChange = { draft.location = it.take(60) },
            placeholder = "City or region",
            leadingIcon = R.drawable.ic_map_pin,
        )
        Spacer(Modifier.height(12.dp))
        OnbField(
            label = "Tell us a little about yourself",
            value = draft.bio,
            onChange = { if (it.length <= 200) draft.bio = it },
            placeholder = "One line is enough — something people can start a conversation with.",
            singleLine = false,
            minLines = 3,
            counter = "${draft.bio.length}/200",
        )

        Spacer(Modifier.height(18.dp))
        VisibilityPicker(draft)
    }
}

@Composable
private fun OnbField(
    label: String,
    value: String,
    onChange: (String) -> Unit,
    placeholder: String,
    singleLine: Boolean = true,
    minLines: Int = 1,
    options: List<String>? = null,
    leadingIcon: Int? = null,
    counter: String? = null,
) {
    Column {
        Text(
            label,
            style = MaterialTheme.typography.labelSmall,
            color = StepLabel,
        )
        Spacer(Modifier.height(6.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onChange,
            placeholder = { Text(placeholder, color = Faint) },
            singleLine = singleLine,
            minLines = minLines,
            shape = RoundedCornerShape(16.dp),
            trailingIcon = counter?.let {
                {
                    Text(
                        it,
                        style = MaterialTheme.typography.labelSmall,
                        color = Faint,
                        modifier = Modifier.padding(end = 14.dp),
                    )
                }
            },
            leadingIcon = leadingIcon?.let {
                {
                    Icon(
                        painter = painterResource(it),
                        contentDescription = null,
                        tint = Violet,
                        modifier = Modifier.size(18.dp),
                    )
                }
            },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Violet,
                unfocusedBorderColor = CardBorder,
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White,
                cursorColor = Violet,
            ),
            modifier = Modifier.fillMaxWidth(),
        )
        // The web renders pronouns as a select; a row of chips does the same
        // job on a phone without a native dropdown covering half the screen.
        if (options != null) {
            Spacer(Modifier.height(8.dp))
            Column(verticalArrangement = Arrangement.spacedBy(7.dp)) {
                options.chunked(3).forEach { row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                        row.forEach { option ->
                            val selected = value == option
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(14.dp))
                                    .background(if (selected) Color(0xFFEDEBFB) else Color(0xFFF6F5FC))
                                    .then(
                                        if (selected) Modifier.border(1.5.dp, Violet, RoundedCornerShape(14.dp))
                                        else Modifier,
                                    )
                                    .clickable { onChange(if (selected) "" else option) }
                                    .padding(horizontal = 12.dp, vertical = 8.dp),
                            ) {
                                Text(
                                    option,
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                                    ),
                                    color = if (selected) IndigoBright else Muted,
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun VisibilityPicker(draft: Draft) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(Color(0xFFF6F4FF))
            .padding(14.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                painter = painterResource(R.drawable.ic_lock),
                contentDescription = null,
                tint = Violet,
                modifier = Modifier.size(17.dp),
            )
            Spacer(Modifier.width(8.dp))
            Text(
                "Profile visibility",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                color = Indigo,
            )
        }
        Spacer(Modifier.height(3.dp))
        Text(
            "Choose who can see your profile.",
            style = MaterialTheme.typography.labelSmall,
            color = Muted,
        )
        Spacer(Modifier.height(12.dp))

        listOf(
            Triple(true, "Public profile", "Anyone on Mindcircle can find you."),
            Triple(false, "Private profile", "Only people you connect with can."),
        ).forEach { (isPublic, title, blurb) ->
            val selected = draft.isPublic == isPublic
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color.White)
                    .then(
                        if (selected) Modifier.border(1.8.dp, Violet, RoundedCornerShape(14.dp))
                        else Modifier.border(1.dp, RowBorder, RoundedCornerShape(14.dp)),
                    )
                    .clickable { draft.isPublic = isPublic }
                    .padding(horizontal = 14.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(
                    painter = painterResource(
                        if (isPublic) R.drawable.ic_globe else R.drawable.ic_lock,
                    ),
                    contentDescription = null,
                    tint = if (selected) Violet else StepLabel,
                    modifier = Modifier.size(19.dp),
                )
                Spacer(Modifier.width(10.dp))
                Text(
                    title,
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                    color = if (selected) IndigoBright else Muted,
                    modifier = Modifier.weight(1f),
                )
                RadioDot(selected)
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
private fun RadioDot(selected: Boolean) {
    Box(
        modifier = Modifier
            .size(20.dp)
            .clip(CircleShape)
            .border(2.dp, if (selected) Violet else StepLabel, CircleShape),
        contentAlignment = Alignment.Center,
    ) {
        if (selected) {
            Box(
                Modifier
                    .size(10.dp)
                    .clip(CircleShape)
                    .background(Violet),
            )
        }
    }
}

// ── Step 2 — interests ─────────────────────────────────────────────────────

@Composable
private fun StepInterestsBody(draft: Draft) {
    Column {
        Text(
            "Pick at least three — you can change these later.",
            style = MaterialTheme.typography.bodyMedium,
            color = Muted,
        )
        Spacer(Modifier.height(12.dp))
        Text(
            "${draft.interests.size} selected",
            modifier = Modifier
                .clip(RoundedCornerShape(10.dp))
                .background(Color(0xFFEDEBFB))
                .padding(horizontal = 10.dp, vertical = 5.dp),
            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
            color = IndigoBright,
        )
        Spacer(Modifier.height(14.dp))

        // Two columns of wrapped pills; a FlowRow keeps the last item from
        // stretching across the row the way weight() would.
        INTERESTS.chunked(2).forEach { row ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 9.dp),
                horizontalArrangement = Arrangement.spacedBy(9.dp),
            ) {
                row.forEach { option ->
                    val selected = option.label in draft.interests
                    Row(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(20.dp))
                            .background(
                                if (selected) Color(0xFFF1EDFF) else Color.White,
                            )
                            .border(
                                if (selected) 1.8.dp else 1.dp,
                                if (selected) Violet else CardBorder,
                                RoundedCornerShape(20.dp),
                            )
                            .clickable {
                                draft.interests = if (selected) {
                                    draft.interests - option.label
                                } else {
                                    draft.interests + option.label
                                }
                            }
                            .padding(horizontal = 13.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Box(
                            modifier = Modifier
                                .size(26.dp)
                                .clip(CircleShape)
                                .background(parseHex(option.disc)),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text(option.emoji, fontSize = 13.sp)
                        }
                        Spacer(Modifier.width(8.dp))
                        Text(
                            option.label,
                            modifier = Modifier.weight(1f),
                            style = MaterialTheme.typography.labelMedium.copy(
                                fontWeight = FontWeight.Medium,
                            ),
                            color = if (selected) IndigoBright else Muted,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                        if (selected) {
                            Icon(
                                painter = painterResource(R.drawable.ic_check),
                                contentDescription = null,
                                tint = Violet,
                                modifier = Modifier.size(14.dp),
                            )
                        }
                    }
                }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
        }
    }
}

// ── Step 3 — goals ────────────────────────────────────────────────────────

@Composable
private fun StepGoalsBody(draft: Draft) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        GOALS.forEach { goal ->
            val selected = goal.id in draft.goals
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(if (selected) Color(0xFFF6F4FF) else Color.White)
                    .border(
                        if (selected) 1.8.dp else 1.dp,
                        if (selected) Violet else CardBorder,
                        RoundedCornerShape(18.dp),
                    )
                    .clickable {
                        draft.goals = if (selected) {
                            draft.goals - goal.id
                        } else {
                            draft.goals + goal.id
                        }
                    }
                    .padding(horizontal = 14.dp, vertical = 13.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .clip(CircleShape)
                        .background(parseHex(goal.disc)),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(goal.emoji, fontSize = 19.sp)
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        goal.title,
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                        ),
                        color = if (selected) IndigoBright else Indigo,
                    )
                    Spacer(Modifier.height(2.dp))
                    Text(
                        goal.description,
                        style = MaterialTheme.typography.bodySmall.copy(lineHeight = 18.sp),
                        color = Muted,
                    )
                }
                Spacer(Modifier.width(10.dp))
                if (selected) {
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .clip(CircleShape)
                            .background(Violet),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            painter = painterResource(R.drawable.ic_check),
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(14.dp),
                        )
                    }
                } else {
                    Box(
                        modifier = Modifier
                            .size(22.dp)
                            .clip(CircleShape)
                            .border(2.dp, CardBorder, CircleShape),
                    )
                }
            }
        }

        Text(
            "${draft.goals.size} goals selected.",
            modifier = Modifier.fillMaxWidth(),
            style = MaterialTheme.typography.labelSmall,
            color = Faint,
        )
    }
}

// ── Step 4 — summary ──────────────────────────────────────────────────────

private const val MAX_INTEREST_CHIPS = 6
private const val MAX_GOAL_CHIPS = 6

@Composable
private fun StepSummaryBody(draft: Draft, onEdit: (Int) -> Unit) {
    // Real connections, ranked by how many interests they share. Same endpoint
    // the New chat page uses, so everyone listed is actually messageable.
    val suggestions by produceState<List<Pair<ConnectionRow, List<String>>>>(emptyList()) {
        value = runCatching {
            ApiClient.get<DataList<ConnectionRow>>("/api/connections?status=accepted")
                .data
                .filter { it.direction == "accepted" && it.person != null }
                .take(4)
                .map { row ->
                    row to row.person?.interests.orEmpty()
                        .filter { it in draft.interests }
                }
        }.getOrDefault(emptyList())
    }

    Column {
        // ── Summary card ───────────────────────────────────
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(18.dp))
                .background(Color.White)
                .border(1.dp, CardBorder, RoundedCornerShape(18.dp))
                .padding(14.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFEDEBFB)),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(draft.avatar, fontSize = 22.sp)
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        draft.name.ifBlank { "You" },
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.ExtraBold,
                        ),
                        color = Indigo,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    if (draft.pronouns.isNotBlank()) {
                        Text(
                            draft.pronouns,
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF5B5780),
                        )
                    }
                    if (draft.location.isNotBlank()) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                painter = painterResource(R.drawable.ic_map_pin),
                                contentDescription = null,
                                tint = Color(0xFF7B7799),
                                modifier = Modifier.size(13.dp),
                            )
                            Spacer(Modifier.width(5.dp))
                            Text(
                                draft.location,
                                style = MaterialTheme.typography.bodySmall,
                                color = Color(0xFF7B7799),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                            )
                        }
                    }
                }
                EditPill { onEdit(0) }
            }

            SummaryRow(icon = R.drawable.ic_text, title = "About you", onEdit = { onEdit(0) }) {
                Text(
                    draft.bio.ifBlank { "No bio yet — add one so people know how to say hi." },
                    style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 21.sp),
                    color = Color(0xFF4A4763),
                )
            }
            SummaryRow(icon = R.drawable.ic_lock, title = "Profile visibility", onEdit = { onEdit(0) }) {
                Text(
                    if (draft.isPublic) {
                        "Public — anyone on Mindcircle can find and view your profile."
                    } else {
                        "Private — only people you connect with can view your profile."
                    },
                    style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 21.sp),
                    color = Color(0xFF4A4763),
                )
            }
            SummaryRow(icon = R.drawable.ic_heart, title = "Interests", onEdit = { onEdit(1) }) {
                if (draft.interests.isEmpty()) {
                    Text(
                        "Nothing picked yet.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF7B7799),
                    )
                } else {
                    ChipWrap(draft.interests, MAX_INTEREST_CHIPS) { label ->
                        val interest = interestLabel(label)
                        "${interest.emoji} ${interest.label}" to interest.disc
                    }
                }
            }
            SummaryRow(icon = R.drawable.ic_target, title = "Goals", onEdit = { onEdit(2) }) {
                if (draft.goals.isEmpty()) {
                    Text(
                        "No goals chosen yet.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF7B7799),
                    )
                } else {
                    ChipWrap(draft.goals, MAX_GOAL_CHIPS) { id ->
                        val goal = GOALS.firstOrNull { it.id == id }
                        "${goal?.emoji.orEmpty()} ${goal?.title ?: id}" to (goal?.disc ?: "#F1EFF9")
                    }
                }
            }
        }

        Spacer(Modifier.height(14.dp))

        // ── Find your people ──────────────────────────────
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(18.dp))
                .background(Color.White)
                .border(1.dp, CardBorder, RoundedCornerShape(18.dp))
                .padding(14.dp),
        ) {
            Text(
                "Find your people",
                fontSize = 19.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Indigo,
            )
            Spacer(Modifier.height(4.dp))
            Text(
                "Based on your interests and goals, here are a few people you " +
                    "might connect with.",
                style = MaterialTheme.typography.bodySmall.copy(lineHeight = 19.sp),
                color = Color(0xFF7B7799),
            )
            Spacer(Modifier.height(12.dp))

            if (suggestions.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .border(1.dp, CardBorder, RoundedCornerShape(12.dp))
                        .padding(16.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        "Once you connect with someone they will show up here, " +
                            "ready to message.",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFF7B7799),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    )
                }
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    suggestions.forEach { (row, shared) ->
                        val person = row.person ?: return@forEach
                        val into = if (shared.isNotEmpty()) {
                            "Also into ${shared.take(2).joinToString(", ")}"
                        } else {
                            "Also into ${person.interests.take(2).joinToString(", ")}"
                        }
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .background(Color(0xFFFBFAFF))
                                .border(1.dp, RowBorder, RoundedCornerShape(14.dp))
                                .padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFEFEAFB)),
                                contentAlignment = Alignment.Center,
                            ) {
                                Text(person.avatarEmoji ?: "🙂", fontSize = 16.sp)
                            }
                            Spacer(Modifier.width(10.dp))
                            Column(Modifier.weight(1f)) {
                                Text(
                                    person.name ?: "Member",
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        fontWeight = FontWeight.Bold,
                                    ),
                                    color = Indigo,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis,
                                )
                                Text(
                                    into,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Color(0xFF7B7799),
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis,
                                )
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(12.dp))
            Text(
                "${INTERESTS.size} interests and ${GOALS.size} goals available — edit " +
                    "any time from Settings.",
                style = MaterialTheme.typography.labelSmall,
                color = Faint,
            )
        }
    }
}

/** Wraps chips two-per-row and folds the overflow into a "+N more" pill. */
@Composable
private fun ChipWrap(
    items: List<String>,
    limit: Int,
    toChip: (String) -> Pair<String, String>,
) {
    val shown = items.take(limit)
    val extra = items.size - limit
    val all = if (extra > 0) shown + "+$extra more" else shown
    all.chunked(2).forEach { row ->
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 7.dp),
            horizontalArrangement = Arrangement.spacedBy(7.dp),
        ) {
            row.forEach { item ->
                val isOverflow = item.startsWith("+")
                val (label, disc) = if (isOverflow) item to "#F1EFF9" else toChip(item)
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(parseHex(disc))
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                ) {
                    Text(
                        label,
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.SemiBold,
                        ),
                        color = if (isOverflow) Color(0xFF7B7799) else IndigoBright,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }
        }
    }
}

@Composable
private fun SummaryRow(
    icon: Int,
    title: String,
    onEdit: () -> Unit,
    content: @Composable () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 12.dp)
            .border(1.dp, RowBorder, RoundedCornerShape(0.dp))
            .padding(top = 12.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(
                painter = painterResource(icon),
                contentDescription = null,
                tint = StepLabel,
                modifier = Modifier.size(16.dp),
            )
            Spacer(Modifier.width(8.dp))
            Text(
                title,
                modifier = Modifier.weight(1f),
                style = MaterialTheme.typography.bodyMedium.copy(
                    fontWeight = FontWeight.Bold,
                ),
                color = Indigo,
            )
            EditPill(onEdit)
        }
        Spacer(Modifier.height(8.dp))
        content()
    }
}

@Composable
private fun EditPill(onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .size(32.dp)
            .clip(RoundedCornerShape(10.dp))
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            painter = painterResource(R.drawable.ic_pencil),
            contentDescription = "Edit",
            tint = StepLabel,
            modifier = Modifier.size(15.dp),
        )
    }
}

/** "#RRGGBB" from the shared option tables into a Compose colour. */
private fun parseHex(hex: String): Color = runCatching {
    Color(android.graphics.Color.parseColor(hex))
}.getOrDefault(Color(0xFFEFEAFB))