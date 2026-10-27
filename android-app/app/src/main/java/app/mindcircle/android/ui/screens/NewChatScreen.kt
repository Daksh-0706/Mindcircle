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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.R
import app.mindcircle.android.core.ApiClient
import app.mindcircle.android.core.ConnectionRow
import app.mindcircle.android.core.DataList
import app.mindcircle.android.core.DmThread
import app.mindcircle.android.core.e2ee.E2eeManager
import app.mindcircle.android.core.jsonBody
import app.mindcircle.android.ui.components.EmptyState
import app.mindcircle.android.ui.components.ErrorBanner
import app.mindcircle.android.ui.components.HeroCard
import app.mindcircle.android.ui.components.McCard
import app.mindcircle.android.ui.components.SkeletonRow
import app.mindcircle.android.ui.theme.Palette
import app.mindcircle.android.ui.theme.Shapes
import kotlinx.coroutines.launch

/**
 * "New chat" picker — the web's `/app/chats/new`.
 *
 * Recent conversations come from the real DM threads API; the people list below
 * is the caller's actual connections, so every id here is real. Only accepted
 * connections can be messaged; a pending one shows why, and an incoming request
 * can be accepted in place.
 */
@Composable
fun NewChatScreen(
    onOpenDm: (String) -> Unit,
    onOpenDiscover: () -> Unit,
    onBack: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var query by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    var accepting by remember { mutableStateOf<String?>(null) }

    var connections by remember { mutableStateOf<List<ConnectionRow>?>(null) }

    // Re-fetch after accepting, so the row flips to "Message" without a reload.
    var reloadKey by remember { mutableStateOf(0) }
    val rows by produceState<List<ConnectionRow>?>(null, reloadKey) {
        value = runCatching { ApiClient.get<DataList<ConnectionRow>>("/api/connections").data }
            .onFailure { error = it.message ?: "Could not load your connections." }
            .getOrDefault(emptyList())
    }

    val threads by produceState<List<DmThread>?>(null, reloadKey) {
        // Previews arrive sealed; open them (or fall back to the placeholder)
        // the same way the Chats list does.
        val fetched = runCatching { ApiClient.get<DataList<DmThread>>("/api/chat/dm").data }
            .getOrDefault(emptyList())
        value = fetched.map { t ->
            if (t.lastMessage == null) t
            else t.copy(lastMessage = E2eeManager.decryptDmText(t.participantId, t.lastMessage))
        }
    }

    val q = query.trim().lowercase()
    val visibleThreads = threads.orEmpty().filter {
        q.isEmpty() || (it.lastMessage ?: "").lowercase().contains(q)
    }
    // Anyone already in Recent has been messaged, so they would be a dead "you
    // already have this chat" row here. Their thread is one tap away above.
    val alreadyChatting = threads.orEmpty().map { it.participantId }.toSet()
    val visiblePeople = rows.orEmpty().filter { row ->
        val person = row.person ?: return@filter false
        if (person.id in alreadyChatting) return@filter false
        q.isEmpty() ||
            (person.name ?: "").lowercase().contains(q) ||
            person.interests.any { it.lowercase().contains(q) }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        HeroCard(
            title = "Start a",
            gradientTitle = "New Message",
            subtitle = "Pick someone you have connected with and start a quiet one-on-one.",
            imageRes = app.mindcircle.android.R.drawable.chats_header,
            imageWidth = 0.5f,
        )

        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            placeholder = { Text("Search your chats or people…", color = Palette.WarmGray) },
            singleLine = true,
            leadingIcon = {
                Icon(
                    painter = painterResource(R.drawable.ic_search),
                    contentDescription = null,
                    tint = Palette.WarmGray,
                    modifier = Modifier.size(18.dp),
                )
            },
            modifier = Modifier.fillMaxWidth(),
            shape = Shapes.Pill,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Palette.Plum,
                unfocusedBorderColor = Palette.Border,
                focusedContainerColor = Palette.White,
                unfocusedContainerColor = Palette.White,
            ),
        )

        error?.let { ErrorBanner(it) }

        // ── Recent ─────────────────────────────────────────────
        SectionHeading("Recent")
        val recent = threads
        when {
            recent == null -> repeat(2) { SkeletonRow() }
            visibleThreads.isEmpty() -> DashedNote(
                if (q.isNotEmpty()) "No chats match that search."
                else "No conversations yet — pick someone below.",
            )
            else -> visibleThreads.forEach { thread ->
                McCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onOpenDm(thread.participantId) },
                    color = Palette.White,
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        app.mindcircle.android.ui.components.EmojiAvatar(
                            emoji = thread.avatarEmoji,
                            background = Palette.Rose,
                            size = 42,
                        )
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(
                                "@${thread.alias ?: thread.name ?: "member"}",
                                style = MaterialTheme.typography.titleSmall,
                                color = Palette.InkHero,
                                maxLines = 1,
                            )
                            Text(
                                thread.lastMessage ?: "No messages yet",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Palette.WarmGray,
                                maxLines = 1,
                            )
                        }
                        if (thread.unread > 0) {
                            Box(
                                modifier = Modifier
                                    .size(20.dp)
                                    .clip(CircleShape)
                                    .background(Palette.UnreadRed),
                                contentAlignment = Alignment.Center,
                            ) {
                                Text(
                                    thread.unread.toString(),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Color.White,
                                )
                            }
                            Spacer(Modifier.width(8.dp))
                        }
                        Text(
                            thread.lastAt?.let { timeAgo(it) }.orEmpty(),
                            style = MaterialTheme.typography.labelSmall,
                            color = Palette.WarmGray,
                        )
                    }
                }
            }
        }

        // ── People ─────────────────────────────────────────────
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            SectionHeading("People you connected with", inline = true)
            Row(
                modifier = Modifier
                    .clip(Shapes.Pill)
                    .clickable(onClick = onOpenDiscover)
                    .padding(horizontal = 6.dp, vertical = 3.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(
                    painter = painterResource(R.drawable.ic_user_plus),
                    contentDescription = null,
                    tint = Palette.Plum,
                    modifier = Modifier.size(15.dp),
                )
                Spacer(Modifier.width(4.dp))
                Text(
                    "Find more",
                    style = MaterialTheme.typography.labelMedium.copy(
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Palette.Plum,
                )
            }
        }

        val people = rows
        when {
            people == null -> repeat(2) { SkeletonRow() }
            visiblePeople.isEmpty() -> EmptyState(
                icon = "👥",
                title = if (q.isEmpty()) "Everyone's in Recent" else "Nobody here",
                description = when {
                    q.isNotEmpty() -> "Try a different name, or find someone new in Discover."
                    alreadyChatting.isNotEmpty() ->
                        "You already have a chat with everyone you have connected with."
                    else -> "Try a different name, or find someone new in Discover."
                },
            )
            else -> Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                visiblePeople.forEach { row ->
                    val person = row.person ?: return@forEach
                    val accepted = row.direction == "accepted"
                    McCard(modifier = Modifier.fillMaxWidth(), color = Palette.White) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            app.mindcircle.android.ui.components.EmojiAvatar(
                                emoji = person.avatarEmoji,
                                background = Palette.Lavender,
                                size = 44,
                            )
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Text(
                                    person.name ?: "Member",
                                    style = MaterialTheme.typography.titleSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                    ),
                                    color = Palette.Charcoal,
                                    maxLines = 1,
                                )
                                Text(
                                    text = when {
                                        accepted && person.interests.isNotEmpty() ->
                                            "Into ${person.interests.take(2).joinToString(", ")}"
                                        accepted -> "Connected"
                                        row.direction == "incoming" -> "Wants to connect"
                                        else -> "Request sent"
                                    },
                                    style = MaterialTheme.typography.bodySmall,
                                    color = Palette.WarmGray,
                                    maxLines = 1,
                                )
                            }
                            when {
                                accepted -> ActionPill(
                                    text = "Message",
                                    filled = true,
                                    onClick = { onOpenDm(person.id.orEmpty()) },
                                )
                                row.direction == "incoming" -> ActionPill(
                                    text = if (accepting == row.id) "…" else "Accept",
                                    filled = true,
                                    onClick = {
                                        accepting = row.id
                                        scope.launch {
                                            runCatching {
                                                ApiClient.patchIgnoring(
                                                    "/api/connections",
                                                    jsonBody("user_id" to person.id),
                                                )
                                            }.onSuccess {
                                                accepting = null
                                                reloadKey++
                                            }.onFailure {
                                                accepting = null
                                                error = it.message
                                                    ?: "Could not accept the request."
                                            }
                                        }
                                    },
                                )
                                else -> ActionPill(text = "Pending", filled = false, onClick = {})
                            }
                        }
                    }
                }
            }
        }

        // ── Back ───────────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(Shapes.Pill)
                .border(1.dp, Palette.Plum.copy(alpha = 0.2f), Shapes.Pill)
                .clickable(onClick = onBack)
                .padding(vertical = 11.dp),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                "←  Back to chats",
                style = MaterialTheme.typography.labelMedium.copy(
                    fontWeight = FontWeight.Bold,
                ),
                color = Palette.Plum,
            )
        }
    }
}

@Composable
private fun SectionHeading(text: String, inline: Boolean = false) {
    Text(
        text.uppercase(),
        style = MaterialTheme.typography.labelSmall.copy(
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.6.sp,
        ),
        color = Palette.WarmGray,
        modifier = if (inline) Modifier else Modifier.padding(bottom = 2.dp),
    )
}

@Composable
private fun DashedNote(text: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .border(1.dp, Palette.Border, RoundedCornerShape(18.dp))
            .padding(horizontal = 16.dp, vertical = 22.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text,
            style = MaterialTheme.typography.bodySmall,
            color = Palette.WarmGray,
        )
    }
}

@Composable
private fun ActionPill(text: String, filled: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clip(Shapes.Pill)
            .background(if (filled) Palette.Plum else Color.Transparent)
            .then(if (filled) Modifier else Modifier.border(1.dp, Palette.Plum.copy(alpha = 0.25f), Shapes.Pill))
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 8.dp),
    ) {
        Text(
            text,
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = FontWeight.Bold,
            ),
            color = if (filled) Color.White else Palette.Plum,
        )
    }
}

private fun timeAgo(iso: String): String {
    val millis = parseIso(iso) ?: return ""
    val mins = ((System.currentTimeMillis() - millis) / 60_000).coerceAtLeast(0)
    return when {
        mins < 1 -> "now"
        mins < 60 -> "${mins}m ago"
        mins < 1440 -> "${mins / 60}h ago"
        mins < 2880 -> "Yesterday"
        else -> "${mins / 1440}d ago"
    }
}