package app.mindcircle.android.ui.screens

import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.CompositingStrategy
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.R
import app.mindcircle.android.core.ApiClient
import app.mindcircle.android.core.ChatRoom
import app.mindcircle.android.core.DataList
import app.mindcircle.android.core.DataWrapper
import app.mindcircle.android.core.Match
import app.mindcircle.android.core.MediaUploader
import app.mindcircle.android.core.Story
import app.mindcircle.android.core.Supabase
import app.mindcircle.android.core.jsonBody
import app.mindcircle.android.ui.components.CameraCaptureScreen
import app.mindcircle.android.ui.components.Chip
import app.mindcircle.android.ui.components.EmptyState
import app.mindcircle.android.ui.components.ErrorBanner
import app.mindcircle.android.ui.components.McCard
import app.mindcircle.android.ui.components.SkeletonRow
import app.mindcircle.android.ui.components.fadeEdges
import app.mindcircle.android.ui.theme.Palette
import app.mindcircle.android.ui.theme.Shapes
import coil3.compose.AsyncImage
import io.github.jan.supabase.auth.auth
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * Connect â€” Peer Circles.
 *
 * A native port of the web's `/app/connect`: a hero, three tabs (active rooms,
 * 24-hour stories, people you may relate with) and a story composer. The rooms
 * themselves open the same chat thread the Chats tab uses, so a room behaves
 * identically from either entry point.
 */
@Composable
fun ConnectScreen(
    onOpenRoom: (String) -> Unit,
    onOpenDm: (String) -> Unit,
    myId: String?,
) {
    val scope = rememberCoroutineScope()

    val tabs = listOf("All rooms active", "Stories", "People")
    var activeTab by remember { mutableStateOf(tabs.first()) }

    var rooms by remember { mutableStateOf<List<ChatRoom>?>(null) }
    var stories by remember { mutableStateOf<List<Story>?>(null) }
    var matches by remember { mutableStateOf<List<Match>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var composerOpen by remember { mutableStateOf(false) }

    // Story creation is a choice on the web: write something, or snap a photo.
    // The app only ever had the first, so "+ New story" never offered a camera.
    var chooserOpen by remember { mutableStateOf(false) }
    var storyPhoto by rememberSaveable { mutableStateOf<Uri?>(null) }
    var postingPhoto by remember { mutableStateOf(false) }
    var photoError by remember { mutableStateOf<String?>(null) }

    // The viewfinder is our own composable now, so this is just a flag â€” no
    // ActivityResult round trip to lose the photo in.
    var cameraOpen by rememberSaveable { mutableStateOf(false) }

    val context = LocalContext.current

    /**
     * Uploads the captured photo, then files the story.
     *
     * The upload only happens on Share, not on capture: a retake would
     * otherwise leave a file behind in the public bucket on every attempt.
     */
    fun sharePhotoStory(uri: Uri) {
        if (postingPhoto) return
        postingPhoto = true
        photoError = null
        scope.launch {
            val uid = myId ?: Supabase.auth.currentUserOrNull()?.id
            if (uid == null) {
                postingPhoto = false
                photoError = "Your session has expired. Please sign in again."
                return@launch
            }
            runCatching {
                val url = MediaUploader.uploadStoryPhoto(context, uri, uid)
                ApiClient.post<DataWrapper<Story>>(
                    "/api/stories",
                    jsonBody(
                        // Same placeholder the web uses for an instant photo
                        // story, and a mood so the API's mood check passes.
                        "content" to "ðŸ“· A moment from my day",
                        "media_url" to url,
                        "mood_emoji" to "ðŸ“·",
                    ),
                )
            }.onSuccess {
                stories = (stories ?: emptyList()) + it.data
                activeTab = "Stories"
                storyPhoto = null
                chooserOpen = false
            }.onFailure {
                photoError = it.message ?: "Could not share that story."
            }
            postingPhoto = false
        }
    }

    // One fetch per tab, the way the web loads lazily too.
    suspend fun loadRooms() {
        rooms = runCatching { ApiClient.get<DataList<ChatRoom>>("/api/chat").data }
            .onFailure { error = it.message ?: "Could not load rooms." }
            .getOrDefault(emptyList())
    }

    suspend fun loadStories() {
        stories = runCatching { ApiClient.get<DataList<Story>>("/api/stories").data }
            .onFailure { error = it.message ?: "Could not load stories." }
            .getOrDefault(emptyList())
    }

    suspend fun loadMatches() {
        matches = runCatching { ApiClient.get<DataList<Match>>("/api/matches").data }
            .onFailure { error = it.message ?: "Could not load people." }
            .getOrDefault(emptyList())
    }

    // The rooms tab is already selected on first composition, so nothing ever
    // fires the tab's onClick â€” without this the skeleton rows sat there
    // forever and no request was ever made.
    LaunchedEffect(Unit) { loadRooms() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        ConnectHero()

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                tabs.forEach { tab ->
                    CircleTab(
                        label = tab,
                        active = activeTab == tab,
                        onClick = {
                            activeTab = tab
                            scope.launch {
                                when (tab) {
                                    "Stories" -> if (stories == null) loadStories()
                                    "People" -> if (matches == null) loadMatches()
                                    else -> if (rooms == null) loadRooms()
                                }
                            }
                        },
                    )
                }
            }
            NewStoryPill(onClick = { chooserOpen = true })
        }

        error?.let { ErrorBanner(it) }

        when (activeTab) {
            "Stories" -> StoriesTab(
                stories = stories,
                onToggleLike = { story ->
                    scope.launch {
                        val target = if (story.likedByMe) -1 else 1
                        stories = stories?.map {
                            if (it.id == story.id) {
                                it.copy(
                                    likedByMe = target == 1,
                                    likeCount = (it.likeCount + target).coerceAtLeast(0),
                                )
                            } else it
                        }
                        runCatching {
                            ApiClient.post<Unit>("/api/stories/${story.id}/like")
                        }.onFailure {
                            // Put the optimistic update back.
                            stories = stories?.map {
                                if (it.id == story.id) {
                                    it.copy(
                                        likedByMe = story.likedByMe,
                                        likeCount = story.likeCount,
                                    )
                                } else it
                            }
                        }
                    }
                },
                onDelete = { story ->
                    scope.launch {
                        runCatching { ApiClient.delete<Unit>("/api/stories/${story.id}") }
                            .onSuccess { stories = stories?.filterNot { it.id == story.id } }
                            .onFailure { error = it.message ?: "Could not delete that story." }
                    }
                },
            )

            "People" -> PeopleTab(
                matches = matches,
                myId = myId,
                onSayHello = onOpenDm,
            )

            else -> RoomsTab(
                rooms = rooms,
                onOpenRoom = onOpenRoom,
            )
        }

        Spacer(Modifier.height(24.dp))
    }

    if (chooserOpen) {
        StoryChooserSheet(
            onDismiss = { chooserOpen = false },
            onWrite = {
                chooserOpen = false
                composerOpen = true
            },
            onCamera = {
                chooserOpen = false
                cameraOpen = true
            },
        )
    }

    storyPhoto?.let { uri ->
        PhotoStorySheet(
            photo = uri,
            sharing = postingPhoto,
            error = photoError,
            onShare = { sharePhotoStory(uri) },
            onRetake = {
                storyPhoto = null
                photoError = null
                cameraOpen = true
            },
            onDismiss = {
                storyPhoto = null
                photoError = null
            },
        )
    }

    if (cameraOpen) {
        CameraCaptureScreen(
            onClose = { cameraOpen = false },
            onCaptured = { uri ->
                cameraOpen = false
                photoError = null
                storyPhoto = uri
            },
        )
    }

    if (composerOpen) {
        StoryComposer(
            onDismiss = { composerOpen = false },
            onCreate = { content, emoji ->
                composerOpen = false
                scope.launch {
                    runCatching {
                        ApiClient.post<DataWrapper<Story>>(
                            "/api/stories",
                            jsonBody("content" to content, "mood_emoji" to emoji),
                        )
                    }.onSuccess {
                        stories = (stories ?: emptyList()) + it.data
                        activeTab = "Stories"
                    }.onFailure {
                        error = it.message ?: "Could not share that story."
                    }
                }
            },
        )
    }
}

/** Gradient hero with the people illustration bleeding in from the right. */
@Composable
private fun ConnectHero() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(
                Brush.horizontalGradient(
                    listOf(
                        Color(0xFFFDF4EC),
                        Color(0xFFFBEFE6),
                        Color(0xFFF3ECFA),
                    ),
                ),
            )
            .border(1.dp, Palette.Border, RoundedCornerShape(24.dp))
            .padding(horizontal = 22.dp, vertical = 24.dp),
    ) {
        Image(
            painter = painterResource(R.drawable.connect_hero),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            // Sits in the right-hand slice and fades out on every edge, so it
            // reads as artwork drifting into the hero rather than a pasted box.
            modifier = Modifier
                .align(Alignment.CenterEnd)
                .fillMaxHeight()
                .fillMaxWidth(0.62f)
                .fadeEdges(
                    horizontal = listOf(
                        0f to Color.Transparent,
                        0.28f to Color.Black,
                        0.9f to Color.Black,
                        1f to Color.Transparent,
                    ),
                    vertical = listOf(
                        0f to Color.Transparent,
                        0.18f to Color.Black,
                        0.82f to Color.Black,
                        1f to Color.Transparent,
                    ),
                ),
        )
        Column(modifier = Modifier.fillMaxWidth(0.6f)) {
            Text(
                text = "Peer Circles",
                style = MaterialTheme.typography.displaySmall.copy(
                    fontWeight = FontWeight.Bold,
                    lineHeight = 38.sp,
                    brush = Brush.horizontalGradient(
                        listOf(Color(0xFFE88A8A), Color(0xFFC98BB8), Color(0xFF8B7BD8)),
                    ),
                ),
                color = Color(0xFF3D2A52),
            )
            Spacer(Modifier.height(8.dp))
            Text(
                "Anonymous, small campus discussion rooms moderated for safety.",
                style = MaterialTheme.typography.bodyMedium,
                color = Palette.Charcoal.copy(alpha = 0.8f),
            )
        }
    }
}

@Composable
private fun CircleTab(label: String, active: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clip(Shapes.Pill)
            .background(
                if (active) Brush.horizontalGradient(listOf(Color(0xFF5B4B9E), Color(0xFF7C5FA8)))
                else Brush.horizontalGradient(listOf(Color.White, Color.White))
            )
            .then(
                if (active) Modifier
                else Modifier.border(1.dp, Palette.Border, Shapes.Pill)
            )
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 9.dp),
    ) {
        Text(
            label,
            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
            color = if (active) Color.White else Palette.Plum,
        )
    }
}

@Composable
private fun NewStoryPill(onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clip(Shapes.Pill)
            .background(Brush.horizontalGradient(listOf(Color(0xFF5B4B9E), Color(0xFF7C5FA8))))
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 9.dp),
    ) {
        Text(
            "+ New story",
            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
            color = Color.White,
        )
    }
}

/** Per-axis falloff shared by the room cards, mirroring the web's masks. */
private val FADE_X = listOf(
    0f to Color.Transparent,
    0.34f to Color.Black,
    0.88f to Color.Black,
    1f to Color.Transparent,
)
private val FADE_Y = listOf(
    0f to Color.Transparent,
    0.26f to Color.Black,
    0.74f to Color.Black,
    1f to Color.Transparent,
)

/** Themed room cards. The artwork bleeds off the right edge and fades on both
 * axes so there is no hard seam against the card tint. */
private data class RoomArt(val image: Int, val tint: Color)

private val ROOM_ART = listOf(
    RoomArt(R.drawable.connect_card_purple, Color(0xFFEFEAFB)),
    RoomArt(R.drawable.connect_card_pink, Color(0xFFFBE7EC)),
    RoomArt(R.drawable.connect_card_blue, Color(0xFFEAF2FB)),
    RoomArt(R.drawable.connect_card_green, Color(0xFFEAF3EA)),
)

@Composable
private fun RoomsTab(rooms: List<ChatRoom>?, onOpenRoom: (String) -> Unit) {
    when {
        rooms == null -> Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            repeat(3) { SkeletonRow() }
        }
        rooms.isEmpty() -> EmptyState(
            icon = "âœ¨",
            title = "No rooms yet",
            description = "Support circles will appear here once they are created.",
        )
        else -> Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            rooms.forEachIndexed { index, room ->
                RoomCard(room, ROOM_ART[index % ROOM_ART.size], onOpenRoom)
            }
        }
    }
}

@Composable
private fun RoomCard(room: ChatRoom, art: RoomArt, onOpenRoom: (String) -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(art.tint)
            .border(1.dp, Palette.Border.copy(alpha = 0.6f), RoundedCornerShape(20.dp))
            .clickable { onOpenRoom(room.id) },
    ) {
        Image(
            painter = painterResource(art.image),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            // Confined to the right-hand slice of the card, then faded on every
            // edge so no rectangle edge is ever visible.
            modifier = Modifier
                .align(Alignment.CenterEnd)
                .fillMaxHeight()
                .fillMaxWidth(0.44f)
                .fadeEdges(FADE_X, FADE_Y),
        )
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
                .padding(end = 72.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    roomEmoji(room.name),
                    fontSize = 18.sp,
                )
                Spacer(Modifier.width(6.dp))
                Text(
                    room.name,
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = Color(0xFF3D2A52),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            Spacer(Modifier.height(4.dp))
            Text(
                roomDescription(room.name),
                style = MaterialTheme.typography.bodySmall,
                color = Palette.Charcoal.copy(alpha = 0.7f),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Spacer(Modifier.height(10.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    Modifier
                        .size(6.dp)
                        .clip(Shapes.Chip)
                        .background(Palette.Sage),
                )
                Spacer(Modifier.width(6.dp))
                Text(
                    if (room.memberCount == 1) "1 member" else "${room.memberCount} members",
                    style = MaterialTheme.typography.labelMedium,
                    color = Color(0xFF80698A),
                )
                Spacer(Modifier.weight(1f))
                Box(
                    modifier = Modifier
                        .clip(Shapes.Pill)
                        .background(Color.White.copy(alpha = 0.92f))
                        .clickable { onOpenRoom(room.id) }
                        .padding(horizontal = 14.dp, vertical = 6.dp),
                ) {
                    Text(
                        if (room.isMember) "Open room  â€º" else "Join quietly  â€º",
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                        color = Palette.Plum,
                    )
                }
            }
        }
    }
}

@Composable
private fun StoriesTab(
    stories: List<Story>?,
    onToggleLike: (Story) -> Unit,
    onDelete: (Story) -> Unit,
) {
    when {
        stories == null -> Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            repeat(2) { SkeletonRow() }
        }
        stories.isEmpty() -> EmptyState(
            icon = "âœ¨",
            title = "No stories yet",
            description = "Be the first to share something â€” your words might be exactly what " +
                "someone needs today.",
        )
        else -> Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            stories.forEach { story ->
                McCard(modifier = Modifier.fillMaxWidth()) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(story.moodEmoji ?: "ðŸ’œ", fontSize = 22.sp)
                            Spacer(Modifier.width(10.dp))
                            Text(
                                if (story.isMine) "You" else "Anonymous",
                                style = MaterialTheme.typography.titleSmall,
                                color = Palette.Charcoal,
                            )
                            Spacer(Modifier.weight(1f))
                            story.expiresAt?.let {
                                Text(
                                    timeLeft(it),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Palette.WarmGray,
                                )
                            }
                        }
                        Spacer(Modifier.height(10.dp))
                        story.mediaUrl?.takeIf { it.isNotBlank() }?.let { url ->
                            AsyncImage(
                                model = url,
                                contentDescription = "Story photo",
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(190.dp)
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(Palette.CreamDark),
                            )
                            Spacer(Modifier.height(10.dp))
                        }
                        Text(
                            story.content,
                            style = MaterialTheme.typography.bodyMedium,
                            color = Palette.Charcoal,
                        )
                        Spacer(Modifier.height(12.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .clip(Shapes.Pill)
                                    .background(
                                        if (story.likedByMe) Palette.Plum else Palette.CreamDark
                                    )
                                    .clickable { onToggleLike(story) }
                                    .padding(horizontal = 14.dp, vertical = 6.dp),
                            ) {
                                Text(
                                    if (story.likedByMe) "â™¥  ${story.likeCount}" else "â™¡  ${story.likeCount}",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = if (story.likedByMe) Color.White else Palette.Plum,
                                )
                            }
                            if (story.isMine) {
                                Spacer(Modifier.width(10.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(Shapes.Pill)
                                        .background(Palette.CreamDark)
                                        .clickable { onDelete(story) }
                                        .padding(horizontal = 14.dp, vertical = 6.dp),
                                ) {
                                    Text(
                                        "Delete",
                                        style = MaterialTheme.typography.labelMedium,
                                        color = Palette.Danger,
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PeopleTab(matches: List<Match>?, myId: String?, onSayHello: (String) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(
                "People you may relate with",
                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                color = Palette.Plum,
            )
            Text(
                "Aliases are generated and are never real names.",
                style = MaterialTheme.typography.labelMedium,
                color = Color(0xFF80698A),
            )
        }
        when {
            matches == null -> repeat(2) { SkeletonRow() }
            matches.isEmpty() -> EmptyState(
                icon = "ðŸ‘¥",
                title = "No matches yet",
                description = "When another member with a similar journey joins, you'll see them here.",
            )
            else -> Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                matches.forEach { match ->
                    val otherId =
                        if (match.user1Id == myId) match.user2Id else match.user1Id
                    McCard(modifier = Modifier.fillMaxWidth()) {
                        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .clip(RoundedCornerShape(20.dp))
                                        .background(Palette.Plum),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    Text(
                                        "A",
                                        style = MaterialTheme.typography.titleSmall,
                                        color = Color.White,
                                    )
                                }
                                Spacer(Modifier.width(12.dp))
                                Text(
                                    "Anonymous",
                                    style = MaterialTheme.typography.titleSmall,
                                    color = Palette.Charcoal,
                                )
                            }
                            match.matchReason?.takeIf { it.isNotBlank() }?.let {
                                Chip(
                                    text = it,
                                    background = Palette.CreamDark,
                                    textColor = Palette.Plum,
                                )
                            }
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(Shapes.Pill)
                                    .border(1.dp, Palette.Plum, Shapes.Pill)
                                    .clickable { onSayHello(otherId) }
                                    .padding(vertical = 10.dp),
                                contentAlignment = Alignment.Center,
                            ) {
                                Text(
                                    "Say hello",
                                    style = MaterialTheme.typography.labelMedium.copy(
                                        fontWeight = FontWeight.Bold
                                    ),
                                    color = Palette.Plum,
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * The two ways to create a story, matching the web's "Share a moment" sheet.
 *
 * Text-only used to be the whole thing in the app: the photo path existed on
 * the web but had no equivalent here, so "Click a story" was simply never
 * offered.
 */
@Composable
private fun StoryChooserSheet(
    onDismiss: () -> Unit,
    onWrite: () -> Unit,
    onCamera: () -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.45f))
            .clickable(onClick = onDismiss),
        contentAlignment = Alignment.BottomCenter,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp))
                .background(Palette.White)
                .clickable(enabled = false) {}
                .padding(bottom = 20.dp),
        ) {
            // Gradient header, same copy as the web so the two read as one app.
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp))
                    .background(
                        Brush.linearGradient(
                            listOf(Color(0xFF4A2C5E), Color(0xFFC45D3E))
                        )
                    )
                    .padding(horizontal = 22.dp, vertical = 20.dp),
            ) {
                Column {
                    Text(
                        "YOUR STORY",
                        style = MaterialTheme.typography.labelSmall.copy(
                            letterSpacing = 1.8.sp,
                            fontWeight = FontWeight.Bold,
                        ),
                        color = Palette.Cream.copy(alpha = 0.7f),
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        "Share a moment",
                        style = MaterialTheme.typography.headlineSmall.copy(
                            fontWeight = FontWeight.Bold,
                        ),
                        color = Palette.Cream,
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "Anonymous, kind, and gone in 24 hours.",
                        style = MaterialTheme.typography.bodySmall,
                        color = Palette.Cream.copy(alpha = 0.85f),
                    )
                }
            }

            Column(modifier = Modifier.padding(horizontal = 18.dp, vertical = 16.dp)) {
                StoryChoiceRow(
                    icon = R.drawable.ic_pencil,
                    iconTint = Palette.Plum,
                    iconBg = Color(0xFFEFEAFB),
                    title = "Write a story",
                    body = "Put your thoughts into words â€” with a mood and a photo if you like.",
                    onClick = onWrite,
                )
                Spacer(Modifier.height(12.dp))
                StoryChoiceRow(
                    icon = R.drawable.ic_camera,
                    iconTint = Color(0xFFC45D3E),
                    iconBg = Color(0xFFFBE7EC),
                    title = "Click a story",
                    body = "Snap a moment â€” one more tap and it's live. Nothing to write.",
                    onClick = onCamera,
                )
            }
        }
    }
}

@Composable
private fun StoryChoiceRow(
    icon: Int,
    iconTint: Color,
    iconBg: Color,
    title: String,
    body: String,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .border(1.dp, Palette.Border, RoundedCornerShape(18.dp))
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(iconBg),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                painter = painterResource(icon),
                contentDescription = null,
                tint = iconTint,
                modifier = Modifier.size(22.dp),
            )
        }
        Spacer(Modifier.width(14.dp))
        Column(Modifier.weight(1f)) {
            Text(
                title,
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                color = Palette.Charcoal,
            )
            Spacer(Modifier.height(3.dp))
            Text(
                body,
                style = MaterialTheme.typography.bodySmall.copy(lineHeight = 18.sp),
                color = Palette.WarmGray,
            )
        }
    }
}

/**
 * Preview of a captured story photo before it goes live.
 *
 * Uploading starts on Share, never on capture, so a retake cannot leave an
 * orphan behind in the public bucket.
 */
@Composable
private fun PhotoStorySheet(
    photo: Uri,
    sharing: Boolean,
    error: String?,
    onShare: () -> Unit,
    onRetake: () -> Unit,
    onDismiss: () -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.55f))
            .clickable(onClick = onDismiss),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 18.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(Palette.White)
                .clickable(enabled = false) {}
                .padding(16.dp),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(320.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(Palette.CreamDark),
            ) {
                AsyncImage(
                    model = photo,
                    contentDescription = "Your story photo",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                )
            }

            error?.let {
                Spacer(Modifier.height(10.dp))
                Text(
                    it,
                    style = MaterialTheme.typography.bodySmall,
                    color = Palette.Danger,
                )
            }

            Spacer(Modifier.height(14.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .clip(Shapes.Pill)
                        .background(Palette.CreamDark)
                        .clickable(enabled = !sharing, onClick = onRetake)
                        .padding(horizontal = 18.dp, vertical = 11.dp),
                ) {
                    Text(
                        "Retake",
                        style = MaterialTheme.typography.labelLarge,
                        color = Palette.Charcoal,
                    )
                }
                Spacer(Modifier.width(10.dp))
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(Shapes.Pill)
                        .background(Palette.Plum)
                        .clickable(enabled = !sharing, onClick = onShare)
                        .padding(vertical = 11.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    if (sharing) {
                        CircularProgressIndicator(
                            strokeWidth = 2.dp,
                            color = Palette.White,
                            modifier = Modifier.size(18.dp),
                        )
                    } else {
                        Text(
                            "Share anonymously",
                            style = MaterialTheme.typography.labelLarge.copy(
                                fontWeight = FontWeight.Bold,
                            ),
                            color = Palette.White,
                        )
                    }
                }
            }
        }
    }
}

/**
 * Story composer. Text plus a mood emoji â€” the media picker lands with the
 * Storage work, so the picker is deliberately absent rather than a button that
 * does nothing.
 */
@Composable
private fun StoryComposer(onDismiss: () -> Unit, onCreate: (String, String) -> Unit) {
    var content by remember { mutableStateOf("") }
    var emoji by remember { mutableStateOf("ðŸ’œ") }
    val options = listOf("ðŸ’œ", "ðŸŒ¿", "ðŸŒ™", "â˜€ï¸", "ðŸ•Šï¸", "ðŸŒŠ", "ðŸ”¥", "ðŸŒ¸")

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Share a moment", style = MaterialTheme.typography.titleLarge) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = content,
                    onValueChange = { content = it },
                    placeholder = { Text("Say what is on your mindâ€¦", color = Palette.WarmGray) },
                    minLines = 3,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Palette.Plum,
                        unfocusedBorderColor = Palette.Border,
                        focusedContainerColor = Palette.White,
                        unfocusedContainerColor = Palette.White,
                    ),
                )
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    options.forEach { option ->
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(18.dp))
                                .background(
                                    if (option == emoji) Palette.Plum.copy(alpha = 0.15f)
                                    else Palette.CreamDark
                                )
                                .clickable { emoji = option },
                            contentAlignment = Alignment.Center,
                        ) {
                            Text(option, fontSize = 17.sp)
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = { onCreate(content.trim(), emoji) }, enabled = content.isNotBlank()) {
                Text("Share", color = Palette.Plum)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = Palette.WarmGray)
            }
        },
        containerColor = Palette.White,
        shape = RoundedCornerShape(24.dp),
    )
}

/** "23h left" / "12m left", matching the web's `timeLeft`. */
private fun timeLeft(iso: String): String {
    val expiry = parseIso(iso) ?: return ""
    val mins = (expiry - System.currentTimeMillis()) / 60_000
    return when {
        mins <= 0 -> "expired"
        mins < 60 -> "${mins}m left"
        else -> "${mins / 60}h left"
    }
}

/** Parses an ISO-8601 timestamp from the API. Shared because several screens
 *  need "time ago" and each re-deriving this subtly differently is how dates
 *  end up a day off. */
internal fun parseIso(iso: String): Long? = runCatching {
    val formats = listOf(
        "yyyy-MM-dd'T'HH:mm:ss.SSSSSSXXX",
        "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
        "yyyy-MM-dd'T'HH:mm:ssXXX",
    )
    formats.firstNotNullOfOrNull { pattern ->
        SimpleDateFormat(pattern, Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }
            .parse(iso.replace("Z", "+0000"))?.time
    }
}.getOrNull() ?: runCatching {
    SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US)
        .parse(iso.substringBefore('.').substringBefore('Z'))?.time
}.getOrNull()

/** Room emoji, mirroring `roomEmoji` in the web's src/lib/alias.ts. */
internal fun roomEmoji(name: String): String = when (name.lowercase()) {
    "quiet mornings" -> "â˜•"
    "exam overwhelm" -> "ðŸ“š"
    "anonymous support" -> "ðŸ¤"
    "late-night listeners" -> "ðŸŽ§"
    "creative corner" -> "ðŸŽ¨"
    "study buddies" -> "âœï¸"
    else -> "ðŸ’¬"
}

/** Room blurb, mirroring `roomDescription` in the web's src/lib/alias.ts. */
internal fun roomDescription(name: String): String = when (name.lowercase()) {
    "quiet mornings" -> "Start your day with simple positive intentions before lectures hit."
    "exam overwhelm" -> "A place to decompress and share heavy test anxieties together."
    "anonymous support" -> "Safe, heavily moderated room for deeply personal venting."
    "late-night listeners" -> "Hostel life is quiet at night but minds can wander. Sit and listen."
    "creative corner" -> "Express thoughts through non-pressure doodling, music, or poetry."
    "study buddies" -> "Quiet workspace rooms where you can co-work without expectation."
    else -> "A safe, anonymous space to share and listen."
}
