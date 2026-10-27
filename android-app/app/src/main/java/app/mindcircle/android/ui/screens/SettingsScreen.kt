package app.mindcircle.android.ui.screens

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateDpAsState
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.BuildConfig
import app.mindcircle.android.R
import app.mindcircle.android.core.ApiClient
import app.mindcircle.android.core.AppViewModel
import app.mindcircle.android.core.MeResponse
import app.mindcircle.android.core.jsonBody
import app.mindcircle.android.ui.components.ErrorBanner
import app.mindcircle.android.ui.components.fadeEdges
import app.mindcircle.android.ui.theme.Palette
import app.mindcircle.android.ui.theme.Shapes
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.boolean
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

/* ──────────────────────────────────────────────────────────────────────────
 * Settings — mirrors the web's /app/settings at phone width.
 *
 * Five sections (Account, Privacy, Notifications, Appearance, Help), each a
 * translucent card with a round section icon, and every row its own tinted
 * pill. Toggles persist to the profile's notification_toggles blob, which is
 * the same field the web writes, so the two clients stay in agreement.
 * ────────────────────────────────────────────────────────────────────────── */

/** Icon tints, copied from the web so the colour rhythm matches section by section. */
private object Tint {
    val PlumBg = Color(0xFFEFEAFB); val PlumFg = Color(0xFF6B4A80)
    val GreenBg = Color(0xFFEAF3EA); val GreenFg = Color(0xFF5F7F52)
    val MintBg = Color(0xFFEAF3EA); val MintFg = Color(0xFF5F7F52)
    val RoseBg = Color(0xFFFBE7EC); val RoseFg = Color(0xFFA34A6B)
    val PeachBg = Color(0xFFFBEEDC); val PeachFg = Color(0xFFD08A3E)
    val PinkBg = Color(0xFFFDF0F4); val PinkFg = Color(0xFFA34A6B)
}

private val PlumDeep = Color(0xFF3D2060)
private val BeigeTrack = Color(0xFFE5D9CE)
private val RowBg = Color(0xFFF7F1FB).copy(alpha = 0.7f)

private enum class RowAction { Toggle, Chevron, Value }

private class RowSpec(
    val id: String,
    val label: String,
    val icon: Int,
    val action: RowAction,
    val description: String? = null,
    val iconBg: Color = Tint.PlumBg,
    val iconFg: Color = Tint.PlumFg,
    val onNavigate: (() -> Unit)? = null,
)

private class SectionSpec(
    val id: String,
    val label: String,
    val icon: Int,
    val decor: Boolean,
    val rows: List<RowSpec>,
)

@Composable
fun SettingsScreen(
    viewModel: AppViewModel,
    onNavigate: (String) -> Unit = {},
) {
    val scope = rememberCoroutineScope()
    val state by viewModel.state.collectAsState()
    val me = (state as? AppViewModel.AuthState.SignedIn)?.me
    val profile = me?.profile

    var email by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var savingPrefs by remember { mutableStateOf(false) }

    // Same defaults as the web, then overlaid with whatever the profile saved.
    var toggles by remember { mutableStateOf(DEFAULT_TOGGLES) }

    val live = produceState<MeResponse?>(null) {
        value = runCatching { ApiClient.get<MeResponse>("/api/me") }.getOrNull()
    }.value

    LaunchedEffect(live) {
        val fetched = live ?: return@LaunchedEffect
        email = fetched.user?.email
        val saved = runCatching {
            (fetched.profile?.settings as? JsonObject)
                ?.get("notification_toggles")
                ?.jsonObject
        }.getOrNull()
        if (saved != null) {
            toggles = toggles + saved.mapValues { it.value.jsonPrimitive.boolean }
        }
    }

    fun setToggle(id: String, value: Boolean) {
        val next = toggles + (id to value)
        toggles = next
        savingPrefs = true
        error = null
        scope.launch {
            runCatching {
                ApiClient.patchIgnoring(
                    "/api/me",
                    jsonBody(
                        "settings" to kotlinx.serialization.json.buildJsonObject {
                            put(
                                "notification_toggles",
                                kotlinx.serialization.json.buildJsonObject {
                                    next.forEach { (k, v) -> put(k, kotlinx.serialization.json.JsonPrimitive(v)) }
                                },
                            )
                        },
                    ),
                )
            }.onFailure {
                // Roll back so the switch never claims a state the server refused.
                toggles = toggles + (id to !value)
                error = it.message ?: "Could not save that preference."
            }
            savingPrefs = false
        }
    }

    val sections = remember(onNavigate) {
        listOf(
            SectionSpec(
                "account", "Account", R.drawable.ic_user, decor = false,
                rows = listOf(
                    RowSpec("edit-profile", "Edit Profile", R.drawable.ic_user, RowAction.Chevron,
                        iconBg = Tint.PlumBg, iconFg = Tint.PlumFg,
                        onNavigate = { onNavigate("settings/edit-profile") }),
                    RowSpec("profile-setup", "Profile Setup", R.drawable.ic_sparkles, RowAction.Chevron,
                        description = "Revisit the 4-step setup — interests, goals and visibility.",
                        iconBg = Tint.GreenBg, iconFg = Tint.GreenFg,
                        onNavigate = { onNavigate("onboarding") }),
                    RowSpec("change-password", "Change Password", R.drawable.ic_lock, RowAction.Chevron,
                        iconBg = Tint.RoseBg, iconFg = Tint.RoseFg,
                        onNavigate = { onNavigate("settings/change-password") }),
                    RowSpec("email", "Email", R.drawable.ic_mail, RowAction.Value,
                        iconBg = Tint.PlumBg, iconFg = Tint.PlumFg),
                ),
            ),
            SectionSpec(
                "privacy", "Privacy", R.drawable.ic_shield, decor = false,
                rows = listOf(
                    RowSpec("private-account", "Private Account", R.drawable.ic_eye, RowAction.Toggle,
                        description = "Only approved followers can see your content.",
                        iconBg = Tint.PeachBg, iconFg = Tint.PeachFg),
                    RowSpec("show-online", "Show Online Status", R.drawable.ic_smartphone, RowAction.Toggle,
                        description = "Let others see when you're active.",
                        iconBg = Tint.PlumBg, iconFg = Tint.PlumFg),
                    RowSpec("encryption", "End-to-End Encryption", R.drawable.ic_lock, RowAction.Chevron,
                        description = "Your journal and private chats, sealed on your device.",
                        iconBg = Tint.MintBg, iconFg = Tint.MintFg,
                        onNavigate = { onNavigate("settings/encryption") }),
                ),
            ),
            SectionSpec(
                "notifications", "Notifications", R.drawable.ic_bell, decor = true,
                rows = listOf(
                    RowSpec("push", "Push Notifications", R.drawable.ic_smartphone, RowAction.Toggle,
                        description = "Receive notifications on your device.",
                        iconBg = Tint.PinkBg, iconFg = Tint.PinkFg),
                    RowSpec("email-notifs", "Email Notifications", R.drawable.ic_mail, RowAction.Toggle,
                        description = "Receive updates via email.",
                        iconBg = Tint.RoseBg, iconFg = Tint.RoseFg),
                ),
            ),
            SectionSpec(
                "appearance", "Appearance", R.drawable.ic_sun, decor = true,
                rows = listOf(
                    RowSpec("dark-mode", "Dark Mode", R.drawable.ic_moon, RowAction.Toggle,
                        description = "Visual only — not functional settings.",
                        iconBg = Tint.PeachBg, iconFg = Tint.PeachFg),
                ),
            ),
            SectionSpec(
                "help", "Help", R.drawable.ic_help, decor = true,
                rows = listOf(
                    RowSpec("faq", "FAQ", R.drawable.ic_help, RowAction.Chevron,
                        iconBg = Tint.PlumBg, iconFg = Tint.PlumFg,
                        onNavigate = { onNavigate("help/faq") }),
                    RowSpec("support", "Contact Support", R.drawable.ic_support, RowAction.Chevron,
                        iconBg = Tint.RoseBg, iconFg = Tint.RoseFg,
                        onNavigate = { onNavigate("help/support") }),
                    RowSpec("about", "About", R.drawable.ic_info, RowAction.Chevron,
                        iconBg = Tint.PlumBg, iconFg = Tint.PlumFg,
                        onNavigate = { onNavigate("help/about") }),
                ),
            ),
        )
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            // The page itself carries the soft pastel wash, so the screen is one
            // continuous surface instead of cards floating on a flat colour.
            .background(Palette.Cream),
    ) {
        // Pastel blob backdrop (sidebar-bg): tiled-ish cover behind everything.
        Image(
            painter = painterResource(R.drawable.sidebar_bg),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            SettingsHero(savingPrefs = savingPrefs)

            error?.let { ErrorBanner(it) }

            sections.forEach { section ->
                SectionCard(section, email = email) { row ->
                    when (row.action) {
                        RowAction.Toggle -> McToggle(
                            on = toggles[row.id] ?: false,
                            onClick = { setToggle(row.id, !(toggles[row.id] ?: false)) },
                        )

                        RowAction.Chevron -> Icon(
                            painter = painterResource(R.drawable.ic_chevron_right),
                            contentDescription = null,
                            tint = Palette.Charcoal.copy(alpha = 0.6f),
                            modifier = Modifier.size(20.dp),
                        )

                        RowAction.Value -> Unit
                    }
                }
            }

            // Identity card, then sign out — the web has no sign-out row, but a
            // native app needs one and this is where people look for it.
            IdentityCard(
                name = profile?.displayName ?: me?.user?.fullName ?: "MindCircle member",
                alias = profile?.alias,
                pronouns = profile?.pronouns,
                avatar = profile?.avatarEmoji,
            )

            AboutCard()

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(Shapes.Pill)
                    .background(Palette.Danger.copy(alpha = 0.10f))
                    .clickable { viewModel.signOut() }
                    .padding(vertical = 14.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    "Sign out",
                    style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                    color = Palette.Danger,
                )
            }

            Spacer(Modifier.height(8.dp))
        }
    }
}

private val DEFAULT_TOGGLES = mapOf(
    "private-account" to false,
    "show-online" to true,
    "push" to true,
    "email-notifs" to false,
    "dark-mode" to false,
)

@Composable
private fun SettingsHero(savingPrefs: Boolean) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 4.dp),
    ) {
        // Leaves bleed off the top-right, exactly like the web hero. The
        // source art is a hard-edged rectangle, so it dissolves on all four
        // sides -- fading only two left a visible box floating in the corner.
        // The ramp is also wide on purpose: a short one still reads as a cut.
        Image(
            painter = painterResource(R.drawable.settings_leaves),
            contentDescription = null,
            contentScale = ContentScale.Fit,
            alpha = 0.85f,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .offset(x = 30.dp, y = (-18).dp)
                .size(width = 200.dp, height = 148.dp)
                .fadeEdges(
                    horizontal = listOf(
                        0f to Color.Transparent,
                        0.22f to Color.Transparent,
                        0.5f to Color.Black,
                        0.85f to Color.Black,
                        1f to Color.Transparent,
                    ),
                    vertical = listOf(
                        0f to Color.Transparent,
                        0.22f to Color.Transparent,
                        0.5f to Color.Black,
                        0.85f to Color.Black,
                        1f to Color.Transparent,
                    ),
                ),
        )
        Column(
            modifier = Modifier
                .fillMaxWidth(0.72f)
                .padding(top = 6.dp),
        ) {
            Text(
                "Settings",
                fontSize = 40.sp,
                lineHeight = 42.sp,
                fontWeight = FontWeight.Bold,
                color = PlumDeep,
            )
            Spacer(Modifier.height(6.dp))
            // The web draws this as a hand-drawn SVG squiggle; a soft tapered
            // bar reads the same at phone widths and needs no asset.
            Box(
                Modifier
                    .width(132.dp)
                    .height(5.dp)
                    .clip(RoundedCornerShape(3.dp))
                    .background(
                        Brush.horizontalGradient(
                            listOf(Palette.Terracotta, Palette.Terracotta.copy(alpha = 0.25f)),
                        ),
                    ),
            )
            Spacer(Modifier.height(14.dp))
            Text(
                "Manage your account, privacy and preferences.",
                style = MaterialTheme.typography.bodyLarge.copy(lineHeight = 27.sp),
                color = Palette.Charcoal.copy(alpha = 0.75f),
            )
            if (savingPrefs) {
                Spacer(Modifier.height(6.dp))
                Text(
                    "Saving preferences…",
                    modifier = Modifier.fillMaxWidth(),
                    style = MaterialTheme.typography.labelSmall,
                    color = Palette.WarmGray,
                    textAlign = androidx.compose.ui.text.style.TextAlign.End,
                )
            }
        }
    }
}

@Composable
private fun SectionCard(
    section: SectionSpec,
    email: String?,
    trailing: @Composable (RowSpec) -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(4.dp, Shapes.Card, spotColor = Palette.Plum.copy(alpha = 0.06f))
            .clip(Shapes.Card)
            .background(
                Brush.verticalGradient(
                    listOf(Color.White.copy(alpha = 0.82f), Color.White.copy(alpha = 0.68f)),
                ),
            )
            .border(1.dp, Color.White.copy(alpha = 0.8f), Shapes.Card),
    ) {
        if (section.decor) {
            // Decorative blobs + leaf accents top-right, clipped to the card so
            // nothing bleeds past the rounded corner.
            Box(Modifier.matchParentSize()) {
                // The web leans on blur to keep these from competing with the
                // text. Compose has no cheap blur on a plain Box, so the same
                // effect comes from much lower opacity and a tighter radius.
                Box(
                    Modifier
                        .align(Alignment.TopEnd)
                        .offset(x = 30.dp, y = (-34).dp)
                        .size(120.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFEFE3F6).copy(alpha = 0.30f)),
                )
                Box(
                    Modifier
                        .align(Alignment.TopEnd)
                        .offset(x = (-16).dp, y = (-14).dp)
                        .size(58.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFF8E3D3).copy(alpha = 0.34f)),
                )
                Icon(
                    painter = painterResource(R.drawable.ic_leaf),
                    contentDescription = null,
                    tint = Color(0xFF9BB89C).copy(alpha = 0.32f),
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .offset(x = (-16).dp, y = 14.dp)
                        .size(22.dp),
                )
                Icon(
                    painter = painterResource(R.drawable.ic_leaf),
                    contentDescription = null,
                    tint = Color(0xFFB7A7DB).copy(alpha = 0.28f),
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .offset(x = (-48).dp, y = 40.dp)
                        .size(16.dp),
                )
            }
        }

        Column(Modifier.padding(horizontal = 20.dp, vertical = 18.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 14.dp),
            ) {
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .shadow(2.dp, CircleShape, spotColor = Palette.Plum.copy(alpha = 0.08f))
                        .clip(CircleShape)
                        .background(Tint.PlumBg),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        painter = painterResource(section.icon),
                        contentDescription = null,
                        tint = PlumDeep,
                        modifier = Modifier.size(24.dp),
                    )
                }
                Spacer(Modifier.width(14.dp))
                Text(
                    section.label,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = PlumDeep,
                )
            }

            Column(verticalArrangement = Arrangement.spacedBy(9.dp)) {
                section.rows.forEach { row ->
                    McRow(row = row, email = email) { trailing(row) }
                }
            }
        }
    }
}

@Composable
private fun McRow(row: RowSpec, email: String?, trailing: @Composable () -> Unit) {
    val clickable = row.action == RowAction.Chevron && row.onNavigate != null
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(RowBg)
            .then(
                if (clickable) Modifier.clickable { row.onNavigate?.invoke() } else Modifier,
            )
            .padding(horizontal = 14.dp, vertical = 12.dp),
    ) {
        Box(
            modifier = Modifier
                .size(42.dp)
                .clip(CircleShape)
                .background(row.iconBg),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                painter = painterResource(row.icon),
                contentDescription = null,
                tint = row.iconFg,
                modifier = Modifier.size(21.dp),
            )
        }
        Spacer(Modifier.width(14.dp))
        Column(Modifier.weight(1f)) {
            Text(
                row.label,
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                color = Palette.Charcoal,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            val sub = if (row.id == "email") (email ?: "Loading…") else row.description
            if (!sub.isNullOrBlank()) {
                Spacer(Modifier.height(2.dp))
                Text(
                    sub,
                    style = MaterialTheme.typography.bodySmall,
                    color = Palette.WarmGray,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
        Spacer(Modifier.width(10.dp))
        trailing()
    }
}

/**
 * The web's pill toggle: a beige track that turns plum with a big white knob
 * sliding across. Material's Switch is narrower and squarer, so this is drawn
 * by hand to keep the two looking like the same product.
 */
@Composable
private fun McToggle(on: Boolean, onClick: () -> Unit) {
    val track by animateColorAsState(
        if (on) PlumDeep else BeigeTrack,
        label = "toggleTrack",
    )
    val knobOffset by animateDpAsState(
        if (on) 34.dp else 4.dp,
        label = "toggleKnob",
    )
    Box(
        modifier = Modifier
            .width(72.dp)
            .height(40.dp)
            .clip(RoundedCornerShape(20.dp))
            .background(track)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.CenterStart,
    ) {
        Box(
            modifier = Modifier
                .offset(x = knobOffset)
                .size(32.dp)
                .shadow(3.dp, CircleShape)
                .clip(CircleShape)
                .background(Color.White),
        )
    }
}

@Composable
private fun IdentityCard(name: String, alias: String?, pronouns: String?, avatar: String?) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .shadow(4.dp, Shapes.Card, spotColor = Palette.Plum.copy(alpha = 0.06f))
            .clip(Shapes.Card)
            .background(Color.White.copy(alpha = 0.78f))
            .border(1.dp, Color.White.copy(alpha = 0.8f), Shapes.Card)
            .padding(16.dp),
    ) {
        Box(
            modifier = Modifier
                .size(56.dp)
                .clip(CircleShape)
                .background(Brush.linearGradient(listOf(Palette.Plum, Palette.Terracotta))),
            contentAlignment = Alignment.Center,
        ) {
            Text(avatar ?: "🙂", fontSize = 24.sp)
        }
        Spacer(Modifier.width(14.dp))
        Column(Modifier.weight(1f)) {
            Text(
                name,
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = Palette.Charcoal,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                "@${alias ?: "your-alias"}",
                style = MaterialTheme.typography.bodySmall,
                color = Palette.WarmGray,
            )
            if (!pronouns.isNullOrBlank()) {
                Text(
                    pronouns,
                    style = MaterialTheme.typography.bodySmall,
                    color = Palette.WarmGray,
                )
            }
        }
    }
}

@Composable
private fun AboutCard() {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .shadow(4.dp, Shapes.Card, spotColor = Palette.Plum.copy(alpha = 0.06f))
            .clip(Shapes.Card)
            .background(Color.White.copy(alpha = 0.78f))
            .border(1.dp, Color.White.copy(alpha = 0.8f), Shapes.Card)
            .padding(18.dp),
    ) {
        Box(
            modifier = Modifier
                .size(46.dp)
                .shadow(2.dp, CircleShape, spotColor = Palette.Plum.copy(alpha = 0.08f))
                .clip(CircleShape)
                .background(Tint.PlumBg),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                painter = painterResource(R.drawable.ic_info),
                contentDescription = null,
                tint = PlumDeep,
                modifier = Modifier.size(22.dp),
            )
        }
        Spacer(Modifier.width(14.dp))
        Column(Modifier.weight(1f)) {
            Text(
                "About",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = PlumDeep,
            )
            Spacer(Modifier.height(4.dp))
            Text(
                "MindCircle is a safe, anonymous space for students and young " +
                    "professionals — journal privately, track your mood, and " +
                    "connect with peers who get it.",
                style = MaterialTheme.typography.bodySmall.copy(lineHeight = 21.sp),
                color = Palette.WarmGray,
            )
            Spacer(Modifier.height(6.dp))
            Text(
                "Version ${BuildConfig.VERSION_NAME}",
                style = MaterialTheme.typography.labelSmall,
                color = Palette.WarmGrayLight,
            )
        }
    }
}