package app.mindcircle.android.ui.screens

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
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.R
import app.mindcircle.android.core.ApiClient
import app.mindcircle.android.core.AppViewModel
import app.mindcircle.android.core.MeResponse
import app.mindcircle.android.core.jsonBody
import app.mindcircle.android.ui.components.ErrorBanner
import app.mindcircle.android.ui.components.GradientButton
import app.mindcircle.android.ui.components.McCard
import app.mindcircle.android.ui.components.SkeletonRow
import app.mindcircle.android.ui.theme.Palette
import app.mindcircle.android.ui.theme.Shapes
import kotlinx.coroutines.launch

/* ──────────────────────────────────────────────────────────────────────────
 * The pages behind Settings' chevron rows: Edit Profile, Change Password, FAQ,
 * Contact Support and About.
 *
 * These are static-content screens on the web, so they are static here too —
 * except Edit Profile and Change Password, which really do write.
 * ────────────────────────────────────────────────────────────────────────── */

private val PlumDeep = Color(0xFF3D2060)

/** Every one of these shares the pastel backdrop the Settings page uses. */
@Composable
private fun PastelPage(content: @Composable (Modifier) -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Palette.Cream),
    ) {
        androidx.compose.foundation.Image(
            painter = painterResource(R.drawable.sidebar_bg),
            contentDescription = null,
            contentScale = androidx.compose.ui.layout.ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
        )
        content(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 12.dp),
        )
    }
}

@Composable
private fun PageHeader(title: String, subtitle: String) {
    Column(Modifier.padding(horizontal = 4.dp, vertical = 6.dp)) {
        Text(
            title,
            fontSize = 32.sp,
            lineHeight = 34.sp,
            fontWeight = FontWeight.Bold,
            color = PlumDeep,
        )
        Spacer(Modifier.height(6.dp))
        Box(
            Modifier
                .width(104.dp)
                .height(4.dp)
                .clip(Shapes.Pill)
                .background(Palette.Terracotta),
        )
        Spacer(Modifier.height(10.dp))
        Text(
            subtitle,
            style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 24.sp),
            color = Palette.Charcoal.copy(alpha = 0.75f),
        )
    }
}

/**
 * A translucent card that stacks its children vertically.
 *
 * McCard's slot is a Box, so two Texts dropped straight into it overlap
 * instead of stacking. Wrapping here keeps every call site from having to
 * remember the Column.
 */
@Composable
private fun GlassCard(content: @Composable () -> Unit) {
    McCard(color = Color.White.copy(alpha = 0.80f)) {
        Column { content() }
    }
}

// ── Edit Profile ───────────────────────────────────────────────────────────

@Composable
fun EditProfileScreen(viewModel: AppViewModel, onBack: () -> Unit) {
    val scope = rememberCoroutineScope()
    val state by viewModel.state.collectAsState()
    val profile = (state as? AppViewModel.AuthState.SignedIn)?.me?.profile

    var name by remember { mutableStateOf("") }
    var pronouns by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var bio by remember { mutableStateOf("") }
    var loaded by remember { mutableStateOf(false) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var saved by remember { mutableStateOf(false) }

    LaunchedEffect(profile?.id) {
        if (loaded || profile?.id == null) return@LaunchedEffect
        name = profile?.displayName.orEmpty()
        pronouns = profile?.pronouns.orEmpty()
        location = profile?.location.orEmpty()
        bio = profile?.bio.orEmpty()
        loaded = true
    }

    fun save() {
        saving = true; saved = false; error = null
        scope.launch {
            runCatching {
                ApiClient.patchIgnoring(
                    "/api/me",
                    jsonBody(
                        "display_name" to name.trim(),
                        "pronouns" to pronouns.trim(),
                        "location" to location.trim(),
                        "bio" to bio.trim(),
                    ),
                )
            }.onSuccess {
                saving = false; saved = true
                viewModel.refreshProfile()
            }.onFailure {
                saving = false
                error = it.message ?: "Could not save your profile."
            }
        }
    }

    PastelPage { modifier ->
        Column(modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
            PageHeader("Edit Profile", "How you show up around MindCircle.")

            if (!loaded) {
                repeat(2) { SkeletonRow() }
            } else {
                GlassCard {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Field("Display name", name, { name = it }, "How others see your name")
                        Field("Pronouns", pronouns, { pronouns = it }, "Optional — e.g. She/Her")
                        Field("Location", location, { location = it }, "City or region")
                        Field("Bio", bio, { bio = it }, "A line or two about you", singleLine = false)
                    }
                }

                error?.let { ErrorBanner(it) }
                if (saved) {
                    Text(
                        "Saved.",
                        style = MaterialTheme.typography.bodySmall,
                        color = Palette.SageDark,
                    )
                }

                GradientButton(
                    text = if (saving) "Saving…" else "Save changes",
                    onClick = { save() },
                )
                SecondaryLink("←  Back to settings", onBack)
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
private fun Field(
    label: String,
    value: String,
    onChange: (String) -> Unit,
    placeholder: String,
    singleLine: Boolean = true,
) {
    Column {
        Text(
            label,
            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
            color = Palette.Plum,
        )
        Spacer(Modifier.height(6.dp))
        OutlinedTextField(
            value = value,
            onValueChange = { onChange(it.take(if (singleLine) 120 else 500)) },
            placeholder = { Text(placeholder, color = Palette.WarmGray) },
            singleLine = singleLine,
            minLines = if (singleLine) 1 else 3,
            shape = Shapes.Card,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Palette.Plum,
                unfocusedBorderColor = Palette.Border,
                focusedContainerColor = Palette.White,
                unfocusedContainerColor = Palette.White,
                cursorColor = Palette.Plum,
            ),
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

// ── Change Password ────────────────────────────────────────────────────────

/**
 * Google is the only sign-in provider here, so there is no stored password to
 * change. Saying that plainly beats shipping a form that cannot work — but the
 * screen still explains where to manage it and offers a way back.
 */
@Composable
fun ChangePasswordScreen(onBack: () -> Unit) {
    PastelPage { modifier ->
        Column(modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
            PageHeader("Change Password", "Keeping your account yours.")

            GlassCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .shadow(2.dp, CircleShape)
                            .clip(CircleShape)
                            .background(Color(0xFFEFEAFB)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            painter = painterResource(R.drawable.ic_lock),
                            contentDescription = null,
                            tint = PlumDeep,
                            modifier = Modifier.size(24.dp),
                        )
                    }
                    Spacer(Modifier.width(14.dp))
                    Column {
                        Text(
                            "You sign in with Google",
                            style = MaterialTheme.typography.titleSmall.copy(
                                fontWeight = FontWeight.Bold,
                            ),
                            color = Palette.Charcoal,
                        )
                        Spacer(Modifier.height(3.dp))
                        Text(
                            "MindCircle never sees or stores a password, so there is " +
                                "nothing to change here.",
                            style = MaterialTheme.typography.bodySmall.copy(lineHeight = 20.sp),
                            color = Palette.WarmGray,
                        )
                    }
                }
            }

            GlassCard {
                Text(
                    "Need to secure your Google account instead?",
                    style = MaterialTheme.typography.titleSmall.copy(
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Palette.Charcoal,
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    "Change your Google password and review signed-in devices at " +
                        "myaccount.google.com. Your MindCircle sign-in follows it " +
                        "automatically.",
                    style = MaterialTheme.typography.bodySmall.copy(lineHeight = 20.sp),
                    color = Palette.WarmGray,
                )
            }

            SecondaryLink("←  Back to settings", onBack)
            Spacer(Modifier.height(8.dp))
        }
    }
}

// ── FAQ ────────────────────────────────────────────────────────────────────

private data class Faq(val q: String, val a: String)

private val FAQS = listOf(
    Faq(
        "Is MindCircle anonymous?",
        "Yes. Your profile is built around a generated alias, never your real " +
            "name. Display names and locations are only shown if you choose to " +
            "add them.",
    ),
    Faq(
        "Who can see my journal?",
        "Only you. Journal entries are private by default and are never shared " +
            "with anyone you connect with.",
    ),
    Faq(
        "What does an aggregated mood trend show?",
        "A rounded summary of how you have been feeling over time. It contains " +
            "no notes, no scores tied to a day, and nothing that identifies you.",
    ),
    Faq(
        "Can I hide my profile from Discover?",
        "Yes. Turn on Private Account in Settings and your profile stops " +
            "appearing to people who have not connected with you.",
    ),
    Faq(
        "How do I leave a room or connection?",
        "Open the person's card in Discover and withdraw the request, or open " +
            "the chat and remove the connection there.",
    ),
    Faq(
        "Is this a replacement for therapy?",
        "No. MindCircle is a place to pause and be heard by peers. If you are " +
            "in crisis, please reach out to a professional or a helpline.",
    ),
)

@Composable
fun FaqScreen(onBack: () -> Unit) {
    PastelPage { modifier ->
        Column(modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
            PageHeader("FAQ", "The things people ask us most.")

            FAQS.forEach { faq ->
                GlassCard {
                    Text(
                        faq.q,
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                        ),
                        color = PlumDeep,
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        faq.a,
                        style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 22.sp),
                        color = Palette.Charcoal.copy(alpha = 0.85f),
                    )
                }
            }

            SecondaryLink("←  Back to settings", onBack)
            Spacer(Modifier.height(8.dp))
        }
    }
}

// ── Contact Support ────────────────────────────────────────────────────────

@Composable
fun SupportScreen(viewModel: AppViewModel, onBack: () -> Unit) {
    val state by viewModel.state.collectAsState()
    val email = (state as? AppViewModel.AuthState.SignedIn)?.me?.user?.email

    PastelPage { modifier ->
        Column(modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
            PageHeader("Contact Support", "Stuck, or something not working?")

            GlassCard {
                Text(
                    "We read every note. Nothing is automated.",
                    style = MaterialTheme.typography.titleSmall.copy(
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Palette.Charcoal,
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    "Email us and tell us what happened. If you include the screen " +
                        "you were on, we can find it much faster.",
                    style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 22.sp),
                    color = Palette.Charcoal.copy(alpha = 0.85f),
                )
                Spacer(Modifier.height(14.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(Shapes.Card)
                        .background(Color(0xFFF7F1FB).copy(alpha = 0.7f))
                        .padding(horizontal = 14.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFFBE7EC)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            painter = painterResource(R.drawable.ic_mail),
                            contentDescription = null,
                            tint = Color(0xFFA34A6B),
                            modifier = Modifier.size(21.dp),
                        )
                    }
                    Spacer(Modifier.width(14.dp))
                    Text(
                        email ?: "Signed in with Google",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Palette.Charcoal,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }

            GlassCard {
                Text(
                    "In immediate danger",
                    style = MaterialTheme.typography.titleSmall.copy(
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Palette.Danger,
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    "Please contact local emergency services or a crisis helpline. " +
                        "Support inbox is not monitored around the clock.",
                    style = MaterialTheme.typography.bodySmall.copy(lineHeight = 20.sp),
                    color = Palette.WarmGray,
                )
            }

            SecondaryLink("←  Back to settings", onBack)
            Spacer(Modifier.height(8.dp))
        }
    }
}

// ── About ──────────────────────────────────────────────────────────────────

@Composable
fun AboutScreen(onBack: () -> Unit) {
    PastelPage { modifier ->
        Column(modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
            PageHeader("About", "What MindCircle is, in one place.")

            GlassCard {
                Text(
                    "MindCircle is a safe, anonymous space for students and young " +
                        "professionals — journal privately, track your mood, and " +
                        "connect with peers who get it.",
                    style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 24.sp),
                    color = Palette.Charcoal.copy(alpha = 0.85f),
                )
            }

            GlassCard {
                Text(
                    "Built around three ideas",
                    style = MaterialTheme.typography.titleSmall.copy(
                        fontWeight = FontWeight.Bold,
                    ),
                    color = PlumDeep,
                )
                Spacer(Modifier.height(12.dp))
                listOf(
                    Triple(R.drawable.ic_lock, "Private by default", "Your journal is yours. Nothing is shared unless you share it."),
                    Triple(R.drawable.ic_wind, "Quiet, not loud", "No follower counts, no public feed, no performance."),
                    Triple(R.drawable.ic_support, "Peers, not strangers", "Anonymous rooms and one-on-ones, moderated for safety."),
                ).forEach { (icon, title, body) ->
                    Row(
                        modifier = Modifier.padding(bottom = 12.dp),
                        verticalAlignment = Alignment.Top,
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFEFEAFB)),
                            contentAlignment = Alignment.Center,
                        ) {
                            Icon(
                                painter = painterResource(icon),
                                contentDescription = null,
                                tint = Color(0xFF6B4A80),
                                modifier = Modifier.size(20.dp),
                            )
                        }
                        Spacer(Modifier.width(12.dp))
                        Column {
                            Text(
                                title,
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                ),
                                color = Palette.Charcoal,
                            )
                            Spacer(Modifier.height(2.dp))
                            Text(
                                body,
                                style = MaterialTheme.typography.bodySmall.copy(lineHeight = 20.sp),
                                color = Palette.WarmGray,
                            )
                        }
                    }
                }
            }

            SecondaryLink("←  Back to settings", onBack)
            Spacer(Modifier.height(8.dp))
        }
    }
}