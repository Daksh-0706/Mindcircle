package app.mindcircle.android.ui.screens

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import android.graphics.BitmapFactory
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.R
import app.mindcircle.android.core.ApiClient
import app.mindcircle.android.core.ChatMessage
import app.mindcircle.android.core.ChatRoom
import app.mindcircle.android.core.DataList
import app.mindcircle.android.core.DmMessage
import app.mindcircle.android.core.DmThread
import app.mindcircle.android.core.e2ee.E2eeManager
import app.mindcircle.android.core.MediaUploader
import app.mindcircle.android.core.Supabase
import io.github.jan.supabase.auth.auth
import app.mindcircle.android.core.jsonBody
import app.mindcircle.android.ui.components.CameraCaptureScreen
import app.mindcircle.android.ui.components.EmptyState
import app.mindcircle.android.ui.components.ErrorBanner
import app.mindcircle.android.ui.components.GradientButton
import app.mindcircle.android.ui.components.HeroCard
import app.mindcircle.android.ui.components.McCard
import app.mindcircle.android.ui.components.SkeletonRow
import app.mindcircle.android.ui.theme.Palette
import app.mindcircle.android.ui.theme.Shapes
import io.github.jan.supabase.postgrest.query.filter.FilterOperator
import io.github.jan.supabase.realtime.PostgresAction
import io.github.jan.supabase.realtime.RealtimeChannel
import io.github.jan.supabase.realtime.channel
import io.github.jan.supabase.realtime.postgresChangeFlow
import io.github.jan.supabase.realtime.realtime
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Chats â€” anonymous rooms plus the direct-message inbox.
 *
 * Rooms open immediately (`GET /api/chat/messages` auto-joins the room, so
 * there is no separate join step to break).
 */
/**
 * Chats â€” your private one-on-one conversations.
 *
 * Rooms deliberately do not live here. On the web they sit under Connect /
 * Peer Circles, and duplicating them made this screen a long scroll of
 * "Join" rows that mostly belonged somewhere else.
 */
@Composable
fun ChatsScreen(
    onOpenDm: (String) -> Unit,
    onNewChat: () -> Unit,
    onOpenDiscover: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var threads by remember { mutableStateOf<List<DmThread>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var peerNames by remember { mutableStateOf<Map<String, String>>(emptyMap()) }

    fun load() {
        scope.launch {
            runCatching { ApiClient.get<DataList<DmThread>>("/api/chat/dm").data }
                .onSuccess { fetched ->
                    // Previews arrive sealed; open them here (locked vaults
                    // show the placeholder) exactly like the thread does.
                    threads = fetched.map { t ->
                        if (t.lastMessage == null) t
                        else t.copy(lastMessage = E2eeManager.decryptDmText(t.participantId, t.lastMessage))
                    }
                    peerNames = fetched.associate { t -> t.participantId to (t.name ?: t.alias ?: "Member") }
                }
                .onFailure { threads = emptyList() }
        }
    }

    LaunchedEffect(Unit) { load() }

    Box(modifier = Modifier.fillMaxSize()) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        state = rememberLazyListState(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            HeroCard(
                title = "Your",
                gradientTitle = "Conversations",
                subtitle = "Quiet one-on-ones, all in one place.",
                imageRes = app.mindcircle.android.R.drawable.art_chats,
                background = listOf(Palette.White, Palette.Lavender.copy(alpha = 0.4f)),
            )
        }

        error?.let { item { ErrorBanner(it) } }

        item {
            Spacer(Modifier.height(6.dp))
            Text("Direct messages", style = MaterialTheme.typography.headlineSmall, color = Palette.Charcoal)
        }

        val threadList = threads
        if (threadList.isNullOrEmpty()) {
            // An empty list with no way forward reads as broken, so the no-
            // messages state offers both routes out instead of a dead end.
            item {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Spacer(Modifier.height(20.dp))
                    app.mindcircle.android.ui.components.EmptyState(
                        icon = "ðŸ’¬",
                        title = "No conversations yet",
                        description = "Start a quiet one-on-one with someone you have " +
                            "connected with.",
                    )
                    Spacer(Modifier.height(4.dp))
                    GradientButton(text = "+  New message", onClick = onNewChat)
                    Spacer(Modifier.height(10.dp))
                    SecondaryLink("Find people in Discover", onOpenDiscover)
                }
            }
        } else {
            items(threadList, key = { it.participantId }) { thread ->
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
                            size = 44,
                        )
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(
                                "@${thread.alias ?: thread.name ?: "member"}",
                                style = MaterialTheme.typography.titleSmall,
                                color = Palette.InkHero,
                            )
                            Text(
                                thread.lastMessage ?: "Say something kind",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Palette.WarmGray,
                                maxLines = 1,
                            )
                        }
                        if (thread.unread > 0) {
                            Box(
                                modifier = Modifier
                                    .clip(Shapes.Chip)
                                    .background(Palette.UnreadRed)
                                    .padding(horizontal = 8.dp, vertical = 3.dp),
                            ) {
                                Text(
                                    thread.unread.toString(),
                                    style = MaterialTheme.typography.labelMedium,
                                    color = Palette.White,
                                )
                            }
                        }
                    }
                }
            }
        }

        item { Spacer(Modifier.height(8.dp)) }
    }

    // Floating "+" pinned to the bottom-right, the way the web keeps New chat
    // reachable no matter how long the list gets. Anchored to the whole screen
    // rather than to the list so it stays put while the list scrolls.
    Box(
        modifier = Modifier
            .fillMaxSize()
            .wrapContentSize(Alignment.BottomEnd),
        contentAlignment = Alignment.BottomEnd,
    ) {
        Box(
            modifier = Modifier
                .padding(end = 22.dp, bottom = 22.dp)
                .size(58.dp)
                .shadow(10.dp, CircleShape)
                .clip(CircleShape)
                .background(
                    Brush.horizontalGradient(
                        listOf(Palette.GradientStart, Palette.GradientEnd),
                    ),
                )
                .clickable(onClick = onNewChat),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                "+",
                fontSize = 30.sp,
                color = Color.White,
                style = MaterialTheme.typography.headlineMedium,
            )
        }
    }
    }
}

/**
 * A room thread. Loads history once, then listens on the realtime channel for
 * new rows â€” with a slow poll underneath so a dropped socket never freezes the
 * conversation.
 */
@Composable
fun RoomScreen(roomId: String, onBack: () -> Unit, peerId: String? = null) {
    val scope = rememberCoroutineScope()
    val isDm = peerId != null
    var messages by remember { mutableStateOf<List<Any>?>(null) }
    var draft by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    var sending by remember { mutableStateOf(false) }
    val listState = rememberLazyListState()
    var myUserId by remember { mutableStateOf<String?>(null) }
    // Chosen-but-unsent photos, as content uris. Upload happens on send so a
    // message never goes out pointing at bytes that failed to store.
    var attachments by remember { mutableStateOf<List<Uri>>(emptyList()) }
    var uploading by remember { mutableStateOf(false) }
    // Long-pressed message waiting on an action, and the photo opened full-screen.
    var actionTarget by remember { mutableStateOf<Any?>(null) }
    var viewerImage by remember { mutableStateOf<String?>(null) }

    val context = LocalContext.current
    // Photos are taken in the app's own viewfinder now; the OS camera intent
    // sent people into another app's UI (and sometimes came back cancelled).
    var cameraOpen by remember { mutableStateOf(false) }
    val galleryLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.GetContent(),
    ) { uri -> if (uri != null) attachments = attachments + uri }

    /** Uploads everything queued, returning the storage paths to attach.
     *
     *  DM photos are sealed with the pair key first (`MediaUploader` marks
     *  them `.enc`); when there is no key — peer not enrolled or the vault is
     *  locked — the sealer returns null and the photo goes up the legacy way,
     *  which is the same fallback the web applies. */
    suspend fun uploadPending(): List<String> {
        if (attachments.isEmpty()) return emptyList()
        uploading = true
        val uid = myUserId ?: Supabase.auth.currentUserOrNull()?.id
            ?: throw IllegalStateException("Your session has expired.")
        val sealer: (suspend (ByteArray) -> ByteArray?)? = if (isDm) {
            { data -> E2eeManager.encryptDmMedia(peerId!!, data) }
        } else {
            null
        }
        return try {
            attachments.map { uri ->
                runCatching { MediaUploader.upload(context, uri, uid, sealer) }
                    .getOrElse { throw it }
            }
        } finally {
            uploading = false
        }
    }

    fun load() {
        scope.launch {
            myUserId = runCatching {
                ApiClient.get<app.mindcircle.android.core.MeResponse>("/api/me").user.id
            }.getOrNull()
            val result = runCatching {
                if (isDm) {
                    ApiClient.get<app.mindcircle.android.core.ThreadResponse<DmMessage>>(
                        "/api/chat/dm?receiver_id=$peerId",
                    ).data
                } else {
                    ApiClient.get<DataList<ChatMessage>>("/api/chat/messages?room_id=$roomId").data
                }
            }
            result.onSuccess { fetched ->
                // Sealed DM bodies open here; rows this device cannot open
                // (locked vault, peer re-enrolled) show the placeholder
                // instead of ciphertext. Rooms stay plaintext in this phase.
                messages = if (isDm) {
                    @Suppress("UNCHECKED_CAST")
                    (fetched as List<DmMessage>).map { m ->
                        if (m.isDeleted) m
                        else m.copy(content = E2eeManager.decryptDmText(peerId!!, m.content))
                    }
                } else {
                    @Suppress("UNCHECKED_CAST")
                    fetched as List<ChatMessage>
                }
            }.onFailure {
                messages = emptyList()
                error = it.message ?: "Could not load this conversation."
            }
        }
    }

    LaunchedEffect(roomId, peerId) { load() }

    // The peer's enrollment state drives the header hint. Cached after first
    // fetch inside the manager, so polling does not re-request it.
    val peerEnrolled = remember(peerId) { mutableStateOf<Boolean?>(null) }
    LaunchedEffect(peerId) {
        if (peerId == null) return@LaunchedEffect
        peerEnrolled.value = E2eeManager.peerPublicKey(peerId) != null
    }

    // Polling floor: keeps working even if the realtime socket drops.
    LaunchedEffect(roomId, peerId) {
        while (true) {
            delay(12_000)
            load()
        }
    }

    // Live updates straight from Postgres, filtered to this room.
    DisposableEffect(roomId, peerId) {
        var channel: RealtimeChannel? = null
        val job = scope.launch {
            runCatching {
                val table = if (isDm) "direct_messages" else "messages"
                val ch = Supabase.client.channel(if (isDm) "dm:$peerId" else "room:$roomId")
                val changes = ch.postgresChangeFlow<PostgresAction.Insert>(schema = "public") {
                    this.table = table
                    if (!isDm) filter("room_id", FilterOperator.EQ, roomId)
                }
                channel = ch
                ch.subscribe()
                changes.collectLatest { load() }
            }
        }
        onDispose {
            job.cancel()
            // removeChannel is suspend, so it needs its own coroutine.
            channel?.let { ch -> scope.launch { runCatching { Supabase.client.realtime.removeChannel(ch) } } }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            // imePadding pushes the composer above the keyboard. Without it the
            // whole Column was laid out behind the IME, and the first frame
            // after the keyboard opened showed a strip of the wrong screen.
            .imePadding()
            .consumeWindowInsets(WindowInsets.ime),
    ) {
        LazyColumn(
            state = listState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            item {
                Box(
                    modifier = Modifier
                        .clip(Shapes.Chip)
                        .background(Palette.CreamDark)
                        .clickable(onClick = onBack)
                        .padding(horizontal = 14.dp, vertical = 7.dp),
                ) {
                    Text("â€¹  Back", style = MaterialTheme.typography.labelMedium, color = Palette.Plum)
                }
            }
            if (isDm && peerEnrolled.value != null) {
                // One honest line under the back chip: what is protected and
                // what is not, instead of a lock icon carrying all the nuance.
                item {
                    Text(
                        text = when {
                            peerEnrolled.value == true && E2eeManager.state == E2eeManager.State.UNLOCKED ->
                                "🔒 End-to-end encrypted"
                            peerEnrolled.value == true ->
                                "🔒 Encrypted — unlock encryption in Settings › Privacy to read and reply sealed"
                            else ->
                                "Not encrypted — they haven't turned on encryption yet"
                        },
                        style = MaterialTheme.typography.labelSmall,
                        color = Palette.WarmGray,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 2.dp),
                    )
                }
            }
            error?.let { item { ErrorBanner(it) } }
            val list = messages
            if (list == null) {
                items(3) { SkeletonRow() }
            } else if (list.isEmpty()) {
                item {
                    EmptyState(
                        icon = "ðŸŒ±",
                        title = "No messages yet",
                        description = "Write something kind. Someone will read it.",
                    )
                }
            } else {
                items(list.size) { index ->
                    val item = list[index]
                    // Rooms are anonymous by design, so only DMs show a "mine" side.
                    val mine = (item as? DmMessage)?.senderId == myUserId
                    Bubble(
                        message = item,
                        mine = mine,
                        // Sealed photos open with the pair key; rooms pass null
                        // and render the legacy way.
                        mediaDecrypt = if (isDm) {
                            { bytes -> E2eeManager.decryptDmMedia(peerId!!, bytes) }
                        } else {
                            null
                        },
                        onLongPress = { target ->
                            // Only your own messages can be withdrawn; the API
                            // scopes the delete to the sender, so offering the
                            // action on someone else's row would just fail.
                            val canDelete = when (target) {
                                is ChatMessage -> target.senderId == myUserId
                                is DmMessage -> target.senderId == myUserId
                                else -> false
                            }
                            if (canDelete) {
                                actionTarget = target
                            }
                        },
                        onOpenImage = { url -> viewerImage = url },
                    )
                }
            }
            item { Spacer(Modifier.height(8.dp)) }
        }

        // Pending attachments, above the composer.
        if (attachments.isNotEmpty()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp)
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                attachments.forEachIndexed { index, item ->
                    PendingThumb(
                        uri = item,
                        uploading = uploading,
                        onRemove = {
                            if (!uploading) attachments = attachments.filterIndexed { i, _ -> i != index }
                        },
                    )
                }
            }
        }

        // Composer
        Row(
            verticalAlignment = Alignment.Bottom,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp),
        ) {
            // Camera and gallery get their own buttons. A long-press-only camera is
            // invisible until someone discovers the gesture, and "where is
            // the camera" was the exact complaint.
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .clickable(enabled = !sending && !uploading) {
                        cameraOpen = true
                    },
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    painter = painterResource(R.drawable.ic_camera),
                    contentDescription = "Take a photo",
                    tint = Palette.Plum,
                    modifier = Modifier.size(23.dp),
                )
            }

            Spacer(Modifier.width(2.dp))

            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .clickable(enabled = !sending && !uploading) {
                        galleryLauncher.launch("image/*")
                    },
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    painter = painterResource(R.drawable.ic_image),
                    contentDescription = "Attach from gallery",
                    tint = Palette.Plum,
                    modifier = Modifier.size(21.dp),
                )
            }

            Spacer(Modifier.width(4.dp))

            OutlinedTextField(
                value = draft,
                onValueChange = { draft = it.take(10000) },
                placeholder = { Text("Messageâ€¦", color = Palette.WarmGray) },
                modifier = Modifier.weight(1f),
                maxLines = 4,
                // Without these the field grows the row and the whole composer
                // drifts upward as lines are added.
                shape = RoundedCornerShape(22.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Palette.Plum,
                    unfocusedBorderColor = Palette.Border,
                    focusedContainerColor = Palette.White,
                    unfocusedContainerColor = Palette.White,
                    cursorColor = Palette.Plum,
                ),
            )
            Spacer(Modifier.width(6.dp))
            IconButton(
                onClick = {
                    val text = draft.trim()
                    // A photo on its own is a valid message, so an empty text
                    // field only blocks the send when there is nothing at all.
                    if ((text.isBlank() && attachments.isEmpty()) || sending || uploading) {
                        return@IconButton
                    }
                    sending = true
                    scope.launch {
                        runCatching {
                            val paths = uploadPending()
                            // DMs are sealed with the pair key before they
                            // leave; a peer who has not enrolled sends
                            // plaintext (the hint in the header says so).
                            val wire = if (isDm) {
                                E2eeManager.encryptDmText(peerId!!, text) ?: text
                            } else {
                                text
                            }
                            val body = buildJsonObject {
                                put("content", JsonPrimitive(wire))
                                put(
                                    "media_paths",
                                    JsonArray(paths.map { JsonPrimitive(it) }),
                                )
                                if (isDm) put("receiver_id", JsonPrimitive(peerId))
                                else put("room_id", JsonPrimitive(roomId))
                            }
                            ApiClient.postIgnoring(
                                if (isDm) "/api/chat/dm" else "/api/chat/messages",
                                body,
                            )
                        }.onSuccess {
                            draft = ""
                            attachments = emptyList()
                            sending = false
                            load()
                        }.onFailure {
                            error = it.message ?: "Could not send."
                            sending = false
                        }
                    }
                },
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(999.dp))
                    .background(Palette.Plum),
            ) {
                if (sending) {
                    CircularProgressIndicator(
                        strokeWidth = 2.dp,
                        color = Palette.White,
                        modifier = Modifier.size(18.dp),
                    )
                } else {
                    Icon(Icons.Filled.Send, contentDescription = "Send", tint = Palette.White)
                }
            }
        }
    }

    // Long-press actions, then the full-screen photo viewer on top of those.
    actionTarget?.let { target ->
        MessageActionsSheet(
            message = target,
            onDismiss = { actionTarget = null },
            onDelete = {
                val id = idOf(target)
                actionTarget = null
                if (id == null) {
                    error = "That message could not be removed."
                } else {
                    scope.launch {
                        runCatching {
                            ApiClient.deleteIgnoring(
                                "/api/chat/dm?id=$id",
                            )
                        }.onSuccess {
                            load()
                        }.onFailure {
                            error = it.message ?: "Could not delete that message."
                        }
                    }
                }
            },
        )
    }

    viewerImage?.let { url ->
        ImageViewer(
            url = url,
            mediaDecrypt = if (isDm) {
                { data -> E2eeManager.decryptDmMedia(peerId!!, data) }
            } else {
                null
            },
            onDismiss = { viewerImage = null },
        )
    }

    if (cameraOpen) {
        CameraCaptureScreen(
            onClose = { cameraOpen = false },
            onCaptured = { uri ->
                cameraOpen = false
                attachments = attachments + uri
            },
        )
    }
}

private fun idOf(message: Any): String? = when (message) {
    is ChatMessage -> message.id
    is DmMessage -> message.id
    else -> null
}

private fun createdAtOf(message: Any): String? = when (message) {
    is ChatMessage -> message.createdAt
    is DmMessage -> message.createdAt
    else -> null
}?.let { iso ->
    parseIso(iso)?.let { millis ->
        SimpleDateFormat("d MMM yyyy 'at' HH:mm", Locale.getDefault()).format(Date(millis))
    }
}

@Composable
private fun Bubble(
    message: Any,
    mine: Boolean,
    mediaDecrypt: (suspend (ByteArray) -> ByteArray?)?,
    onLongPress: (Any) -> Unit,
    onOpenImage: (String) -> Unit,
) {
    // describe() substitutes a "photo" placeholder for blank text, which is right
    // in a list preview but wrong inside the bubble -- the image is right there.
    val text = rawContent(message)
    val images = (message as? ChatMessage)?.imageUrls ?: (message as? DmMessage)?.imageUrls
    val hasBody = text.isNotBlank()
    val hasImages = !images.isNullOrEmpty()

    if (!hasBody && !hasImages) return

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (mine) Arrangement.End else Arrangement.Start,
    ) {
        Column(
            modifier = Modifier
                .widthIn(max = 280.dp)
                .clip(RoundedCornerShape(18.dp))
                .background(if (mine) Palette.Plum else Palette.White)
                // Hold opens the row's actions, a tap opens the photo. Only the
                // bubble itself takes input -- putting a second clickable on
                // the image made the hold land there instead.
                .combinedClickable(
                    onClick = {
                        val first = images?.firstOrNull()
                        if (first != null) onOpenImage(first) else onLongPress(message)
                    },
                    onLongClick = { onLongPress(message) },
                )
                .padding(8.dp),
            horizontalAlignment = if (mine) Alignment.End else Alignment.Start,
        ) {
            // Photos first, then the caption underneath -- the same order the
            // web renders them in.
            if (hasImages) {
                CoilImageList(images, onOpenImage, mediaDecrypt)
            }
            if (hasBody) {
                Text(
                    text = text,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 6.dp),
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (mine) Palette.Cream else Palette.Charcoal,
                )
            }
        }
    }
}

/**
 * Long-press actions for one message.
 *
 * Mirrors the web's thread menu: details and delete, with delete limited to
 * your own rows because the API scopes the removal to the sender.
 */
@Composable
private fun MessageActionsSheet(
    message: Any,
    onDismiss: () -> Unit,
    onDelete: () -> Unit,
) {
    val text = rawContent(message)
    val stamp = createdAtOf(message)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.35f))
            .clickable(onClick = onDismiss),
        contentAlignment = Alignment.BottomCenter,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
                .background(Palette.White)
                .clickable(enabled = false) {}
                .padding(vertical = 10.dp),
        ) {
            Box(
                Modifier
                    .align(Alignment.CenterHorizontally)
                    .padding(bottom = 8.dp)
                    .width(38.dp)
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(Palette.Border),
            )

            SheetRow(
                icon = R.drawable.ic_info,
                label = "Details",
                tint = Palette.Charcoal,
                onClick = onDismiss,
            )
            SheetRow(
                icon = R.drawable.ic_trash,
                label = "Delete message",
                tint = Palette.Danger,
                onClick = onDelete,
            )

            Spacer(Modifier.height(6.dp))
            Text(
                text = when {
                    text.isNotBlank() -> "\"$text\""
                    else -> "Photo message"
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 22.dp, vertical = 8.dp),
                style = MaterialTheme.typography.bodySmall,
                color = Palette.WarmGray,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            if (stamp != null) {
                Text(
                    stamp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 22.dp),
                    style = MaterialTheme.typography.labelSmall,
                    color = Palette.WarmGrayLight,
                )
            }
            Spacer(Modifier.height(6.dp))
        }
    }
}

@Composable
private fun SheetRow(icon: Int, label: String, tint: Color, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 22.dp, vertical = 15.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            painter = painterResource(icon),
            contentDescription = null,
            tint = tint,
            modifier = Modifier.size(21.dp),
        )
        Spacer(Modifier.width(16.dp))
        Text(
            label,
            style = MaterialTheme.typography.bodyLarge,
            color = tint,
        )
    }
}

/** Full-screen photo view, so a tapped attachment is actually readable. */
@Composable
private fun ImageViewer(
    url: String,
    mediaDecrypt: (suspend (ByteArray) -> ByteArray?)?,
    onDismiss: () -> Unit,
) {
    var bytes by remember(url) { mutableStateOf<ByteArray?>(null) }
    var failed by remember(url) { mutableStateOf(false) }
    val sealed = url.substringBefore('?').endsWith(".enc")

    LaunchedEffect(url) {
        bytes = runCatching {
            withContext(Dispatchers.IO) { URL(url).openStream().use { it.readBytes() } }
        }.getOrNull()
            ?.let { data -> if (sealed && mediaDecrypt != null) mediaDecrypt(data) else data }
        failed = bytes == null
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.94f))
            .clickable(onClick = onDismiss),
        contentAlignment = Alignment.Center,
    ) {
        val data = bytes
        if (data != null) {
            val bitmap = remember(data) {
                BitmapFactory.decodeByteArray(data, 0, data.size)
            }
            if (bitmap != null) {
                Image(
                    bitmap = bitmap.asImageBitmap(),
                    contentDescription = "Photo",
                    contentScale = ContentScale.Fit,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                )
            }
        } else {
            Text(
                if (failed) "Photo unavailable" else "Loadingâ€¦",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.White.copy(alpha = 0.7f),
            )
        }

        // Tap anywhere to dismiss; the X is just a visible affordance.
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(18.dp)
                .size(40.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.14f))
                .clickable(onClick = onDismiss),
            contentAlignment = Alignment.Center,
        ) {
            Text("âœ•", fontSize = 18.sp, color = Color.White)
        }
    }
}

/**
 * Chat attachments.
 *
 * The API already hands back short-lived signed URLs in `image_urls`, so this
 * is a plain fetch: no token juggling here, and nothing is cached past its
 * expiry. Failures show a small "photo unavailable" note rather than an
 * infinite spinner, because the links expire.
 *
 * `.enc` paths are sealed media (docs/E2EE.md): the bytes are `iv ‖ ct`, so
 * [mediaDecrypt] opens them before the decode. A locked vault shows a lock
 * note instead of failing to decode random ciphertext.
 */
@Composable
private fun CoilImageList(
    urls: List<String>,
    onOpenImage: (String) -> Unit,
    mediaDecrypt: (suspend (ByteArray) -> ByteArray?)?,
) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        urls.forEach { url ->
            val sealed = url.substringBefore('?').endsWith(".enc")
            var state by remember(url) { mutableStateOf(LoadState.Loading) }
            var bytes by remember(url) { mutableStateOf<ByteArray?>(null) }

            LaunchedEffect(url) {
                state = LoadState.Loading
                bytes = runCatching {
                    withContext(Dispatchers.IO) {
                        URL(url).openStream().use { it.readBytes() }
                    }
                }.getOrNull()
                    ?.let { data ->
                        if (sealed && mediaDecrypt != null) mediaDecrypt(data) else data
                    }
                state = when {
                    bytes != null -> LoadState.Ready
                    sealed && mediaDecrypt == null -> LoadState.Locked
                    else -> LoadState.Failed
                }
            }

            Box(
                modifier = Modifier
                    .size(width = 240.dp, height = 180.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Palette.CreamDark),
                contentAlignment = Alignment.Center,
            ) {
                when (state) {
                    LoadState.Loading -> CircularProgressIndicator(
                        strokeWidth = 2.dp,
                        color = Palette.Plum,
                        modifier = Modifier.size(24.dp),
                    )

                    LoadState.Failed -> Text(
                        "Photo unavailable",
                        style = MaterialTheme.typography.labelSmall,
                        color = Palette.WarmGray,
                    )

                    LoadState.Locked -> Text(
                        "🔒 Encrypted — unlock to view",
                        style = MaterialTheme.typography.labelSmall,
                        color = Palette.WarmGray,
                    )

                    LoadState.Ready -> bytes?.let { data ->
                        val bitmap = remember(data) {
                            BitmapFactory.decodeByteArray(data, 0, data.size)
                        }
                        if (bitmap != null) {
                            Image(
                                bitmap = bitmap.asImageBitmap(),
                                contentDescription = "Attached photo",
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize(),
                            )
                        } else {
                            Text(
                                "Photo unavailable",
                                style = MaterialTheme.typography.labelSmall,
                                color = Palette.WarmGray,
                            )
                        }
                    }
                }
            }
        }
    }
}

private enum class LoadState { Loading, Ready, Failed, Locked }

/** A queued attachment, with an X so it can be taken back before sending. */
@Composable
private fun PendingThumb(uri: Uri, uploading: Boolean, onRemove: () -> Unit) {
    val context = LocalContext.current
    val bitmap = remember(uri) {
        runCatching {
            context.contentResolver.openInputStream(uri)?.use {
                BitmapFactory.decodeStream(it, null, BitmapFactory.Options().apply { inSampleSize = 4 })
            }
        }.getOrNull()
    }

    Box(
        modifier = Modifier
            .size(76.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(Palette.CreamDark),
    ) {
        if (bitmap != null) {
            Image(
                bitmap = bitmap.asImageBitmap(),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
            )
        } else {
            Text(
                "Photo",
                modifier = Modifier.align(Alignment.Center),
                style = MaterialTheme.typography.labelSmall,
                color = Palette.WarmGray,
            )
        }

        if (uploading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.35f)),
                contentAlignment = Alignment.Center,
            ) {
                CircularProgressIndicator(
                    strokeWidth = 2.dp,
                    color = Color.White,
                    modifier = Modifier.size(18.dp),
                )
            }
        } else {
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(3.dp)
                    .size(20.dp)
                    .clip(CircleShape)
                    .background(Color.Black.copy(alpha = 0.55f))
                    .clickable(onClick = onRemove),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    "âœ•",
                    fontSize = 11.sp,
                    color = Color.White,
                )
            }
        }
    }
}

/** Just the caption, with no placeholder for an attachment-only message. */
private fun rawContent(message: Any): String = when (message) {
    is ChatMessage -> if (message.isDeleted) "Message deleted" else message.content
    is DmMessage -> if (message.isDeleted) "Message deleted" else message.content
    else -> ""
}

private fun describe(message: Any): String = when (message) {
    is ChatMessage ->
        if (message.isDeleted) "Message deleted"
        else message.content.ifBlank {
            message.imageUrls.firstOrNull()?.let { "ðŸ“· Photo" } ?: ""
        }
    is DmMessage ->
        if (message.isDeleted) "Message deleted"
        else message.content.ifBlank { message.imageUrls.firstOrNull()?.let { "ðŸ“· Photo" } ?: "" }
    else -> ""
}
