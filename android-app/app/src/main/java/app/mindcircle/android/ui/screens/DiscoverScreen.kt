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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.core.ApiClient
import app.mindcircle.android.core.DataList
import app.mindcircle.android.core.DirectoryPerson
import app.mindcircle.android.core.jsonBody
import app.mindcircle.android.ui.components.Chip
import app.mindcircle.android.ui.components.EmptyState
import app.mindcircle.android.ui.components.ErrorBanner
import app.mindcircle.android.ui.components.HeroCard
import app.mindcircle.android.ui.components.McCard
import app.mindcircle.android.ui.components.SkeletonRow
import app.mindcircle.android.ui.theme.Palette
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Discover — the searchable member directory (`GET /api/profiles`), with the
 * same connect / pending / message affordances as the web.
 */
@Composable
fun DiscoverScreen(
    onOpenProfile: (String) -> Unit,
    onOpenDm: (String) -> Unit = {},
) {
    val scope = rememberCoroutineScope()
    var query by remember { mutableStateOf("") }
    var people by remember { mutableStateOf<List<DirectoryPerson>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var pending by remember { mutableStateOf<Set<String>>(emptySet()) }
    var notice by remember { mutableStateOf<String?>(null) }

    // Debounced search, exactly like the web's type-ahead.
    LaunchedEffect(query) {
        if (query.isNotBlank()) delay(350)
        people = null
        runCatching {
            ApiClient.get<DataList<DirectoryPerson>>(
                "/api/profiles?limit=24" + if (query.isBlank()) "" else "&q=${java.net.URLEncoder.encode(query, "UTF-8")}",
            ).data
        }.onSuccess {
            people = it
            error = null
        }.onFailure {
            people = emptyList()
            error = it.message ?: "Could not load people."
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        HeroCard(
            title = "Discover people",
            subtitle = "Different stories. Same journey. 💜  Aliases are generated — real names are never shown.",
            imageRes = app.mindcircle.android.R.drawable.connect_hero,
            imageWidth = 0.52f,
            background = listOf(Palette.White, Palette.Lavender.copy(alpha = 0.5f)),
        )

        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            placeholder = { Text("Search by alias, name or interest", color = Palette.WarmGray) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Palette.Plum,
                unfocusedBorderColor = Palette.Border,
                focusedContainerColor = Palette.White,
                unfocusedContainerColor = Palette.White,
                cursorColor = Palette.Plum,
            ),
        )

        notice?.let {
            Text(it, style = MaterialTheme.typography.bodySmall, color = Palette.SageDark)
        }
        error?.let { ErrorBanner(it) }

        val list = people
        when {
            list == null -> repeat(4) { SkeletonRow() }
            list.isEmpty() -> EmptyState(
                icon = "👋",
                title = if (query.isBlank()) "No one here yet" else "No matches found",
                description = if (query.isBlank()) "When people join, they will show up here."
                else "Try a different alias, or search by an interest like Music or Tech.",
            )
            else -> list.forEach { person ->
                PersonCard(
                    person = person,
                    busy = pending.contains(person.id),
                    onConnect = {
                        scope.launch {
                            pending = pending + person.id
                            runCatching {
                                ApiClient.postIgnoring("/api/connections", jsonBody("user_id" to person.id))
                            }.onSuccess {
                                pending = pending - person.id
                                notice = "Request sent to @${person.alias}."
                                people = people?.map {
                                    if (it.id == person.id) it.copy(connection = "outgoing") else it
                                }
                            }.onFailure {
                                pending = pending - person.id
                                error = it.message ?: "Could not send the request."
                            }
                        }
                    },
                    onOpen = { onOpenProfile(person.id) },
                    onOpenDm = { onOpenDm(person.id) },
                    onCancel = {
                        scope.launch {
                            pending = pending + person.id
                            runCatching {
                                ApiClient.deleteIgnoring(
                                    "/api/connections",
                                    jsonBody("connection_id" to person.connectionId),
                                )
                            }.onSuccess {
                                pending = pending - person.id
                                notice = "Request to @${person.alias} withdrawn."
                                people = people?.map {
                                    if (it.id == person.id) it.copy(connection = "none") else it
                                }
                            }.onFailure {
                                pending = pending - person.id
                                error = it.message ?: "Could not withdraw the request."
                            }
                        }
                    },
                )
            }
        }

        Spacer(Modifier.height(8.dp))
    }
}

@Composable
private fun PersonCard(
    person: DirectoryPerson,
    busy: Boolean,
    onConnect: () -> Unit,
    onCancel: () -> Unit,
    onOpenDm: () -> Unit,
    onOpen: () -> Unit,
) {
    // The card is tappable to open a profile, so it must not be the clickable
    // parent: a parent clickable here swallows the button taps underneath it.
    // Making only the header row tappable keeps both working.
    McCard(color = Palette.White) {
        Column {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onOpen),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                app.mindcircle.android.ui.components.EmojiAvatar(emoji = person.avatarEmoji, size = 52)
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        "@${person.alias}",
                        style = MaterialTheme.typography.titleSmall,
                        color = Palette.InkHero,
                    )
                    val meta = listOfNotNull(
                        person.location?.takeIf { it.isNotBlank() },
                        person.pronouns?.takeIf { it.isNotBlank() },
                    ).joinToString("  ·  ")
                    if (meta.isNotBlank()) {
                        Text(meta, style = MaterialTheme.typography.bodySmall, color = Palette.WarmGray)
                    }
                }
            }
            person.bio?.takeIf { it.isNotBlank() }?.let {
                Spacer(Modifier.height(10.dp))
                Text(it, style = MaterialTheme.typography.bodyMedium, color = Palette.Charcoal, maxLines = 2)
            }
            if (person.interests.isNotEmpty()) {
                Spacer(Modifier.height(10.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    person.interests.take(3).forEach { interest ->
                        Chip(text = interest, background = Palette.CreamDark, textColor = Palette.Plum)
                    }
                }
            }
            Spacer(Modifier.height(12.dp))
            when (person.connection) {
                "accepted" -> Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Chip(text = "✓  Connected", background = Palette.Mint, textColor = Palette.SageDark)
                    ConnectButton(text = "Message", enabled = true, onClick = onOpenDm)
                }
                "outgoing" -> Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    // Tapping withdraws. A sent request you can never take back
                    // is a one-way door, so the state has to be reversible.
                    ConnectButton(
                        text = if (busy) "Withdrawing…" else "Request sent  ✕",
                        enabled = !busy,
                        onClick = onCancel,
                        background = Palette.CreamDark,
                        textColor = Palette.Plum,
                    )
                }
                // enabled is !busy, not busy: a button you can actually press
                // is the one that is NOT mid-request. Passing busy straight
                // through inverted it and left every button permanently dead.
                "incoming" -> ConnectButton("Accept", !busy, onConnect)
                else -> ConnectButton(if (busy) "Sending…" else "Connect", !busy, onConnect)
            }
        }
    }
}

@Composable
private fun ConnectButton(
    text: String,
    enabled: Boolean,
    onClick: () -> Unit,
    background: Color = Palette.Plum,
    textColor: Color = Palette.Cream,
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(999.dp))
            .background(background)
            .clickable(enabled = enabled, onClick = onClick)
            .padding(horizontal = 18.dp, vertical = 9.dp),
    ) {
        Text(text, style = MaterialTheme.typography.labelMedium, color = textColor)
    }
}
