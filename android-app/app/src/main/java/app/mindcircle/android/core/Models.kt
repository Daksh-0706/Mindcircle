package app.mindcircle.android.core

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

/**
 * Response models for the Next.js API. Field names mirror the server JSON
 * exactly (see docs/ANDROID.md), and every field that the server may omit is
 * nullable so an older backend never crashes a newer app.
 */
object Api {
    val json = kotlinx.serialization.json.Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
        isLenient = true
        encodeDefaults = true
    }
}

// ---------- /api/me ----------

@Serializable
data class MeResponse(
    val user: MeUser,
    val displayName: String? = null,
    val profile: Profile? = null,
)

@Serializable
data class MeUser(
    val id: String,
    val email: String? = null,
    val createdAt: String? = null,
    val fullName: String? = null,
)

@Serializable
data class Profile(
    val id: String? = null,
    val email: String? = null,
    @SerialName("anonymous_id") val anonymousId: String? = null,
    @SerialName("avatar_emoji") val avatarEmoji: String? = null,
    val settings: JsonElement? = null,
    @SerialName("display_name") val displayName: String? = null,
    val alias: String? = null,
    val pronouns: String? = null,
    val location: String? = null,
    val bio: String? = null,
    val interests: List<String> = emptyList(),
    val goals: List<String> = emptyList(),
    @SerialName("is_public") val isPublic: Boolean = false,
    @SerialName("share_moods") val shareMoods: Boolean = false,
    @SerialName("onboarded_at") val onboardedAt: String? = null,
)

// ---------- /api/journal ----------

@Serializable
data class JournalEntry(
    val id: String,
    @SerialName("user_id") val userId: String? = null,
    val content: String = "",
    @SerialName("media_urls") val mediaUrls: List<String> = emptyList(),
    @SerialName("mood_tag") val moodTag: String? = null,
    @SerialName("is_anonymous") val isAnonymous: Boolean = true,
    @SerialName("is_private") val isPrivate: Boolean = true,
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("updated_at") val updatedAt: String? = null,
)

// ---------- /api/mood ----------

@Serializable
data class MoodLog(
    val id: String,
    @SerialName("user_id") val userId: String? = null,
    @SerialName("mood_score") val moodScore: Int = 0,
    @SerialName("mood_emoji") val moodEmoji: String? = null,
    val note: String? = null,
    @SerialName("created_at") val createdAt: String? = null,
)

// ---------- /api/chat ----------

@Serializable
data class ChatRoom(
    val id: String,
    val name: String = "",
    val topic: String? = null,
    val description: String? = null,
    val icon: String? = null,
    @SerialName("member_count") val memberCount: Int = 0,
    @SerialName("is_active") val isActive: Boolean = true,
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("is_member") val isMember: Boolean = false,
    @SerialName("last_message") val lastMessage: LastMessage? = null,
)

@Serializable
data class LastMessage(val content: String? = null, @SerialName("created_at") val createdAt: String? = null)

@Serializable
data class ChatMessage(
    val id: String,
    @SerialName("room_id") val roomId: String? = null,
    @SerialName("sender_id") val senderId: String? = null,
    val content: String = "",
    @SerialName("message_type") val messageType: String = "text",
    @SerialName("is_anonymous") val isAnonymous: Boolean = true,
    @SerialName("is_deleted") val isDeleted: Boolean = false,
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("image_urls") val imageUrls: List<String> = emptyList(),
    // Storage paths as stored. `image_urls` is what the API hands back after
    // signing; these are what an outgoing message carries.
    @SerialName("media_paths") val mediaPaths: List<String> = emptyList(),
)

@Serializable
data class DmThread(
    @SerialName("participant_id") val participantId: String = "",
    @SerialName("last_message") val lastMessage: String? = null,
    @SerialName("last_at") val lastAt: String? = null,
    @SerialName("from_peer") val fromPeer: Boolean = false,
    val unread: Int = 0,
    val name: String? = null,
    val alias: String? = null,
    @SerialName("avatar_emoji") val avatarEmoji: String? = null,
)

@Serializable
data class DmMessage(
    val id: String,
    @SerialName("sender_id") val senderId: String? = null,
    @SerialName("receiver_id") val receiverId: String? = null,
    val content: String = "",
    @SerialName("is_read") val isRead: Boolean = false,
    @SerialName("is_deleted") val isDeleted: Boolean = false,
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("image_urls") val imageUrls: List<String> = emptyList(),
    @SerialName("media_paths") val mediaPaths: List<String> = emptyList(),
)

// ---------- /api/profiles, /api/connections ----------

@Serializable
data class DirectoryPerson(
    val id: String,
    val alias: String = "",
    val name: String? = null,
    @SerialName("avatar_emoji") val avatarEmoji: String? = null,
    val location: String? = null,
    val pronouns: String? = null,
    val bio: String? = null,
    val interests: List<String> = emptyList(),
    val connection: String = "none",
    @SerialName("connection_id") val connectionId: String? = null,
    @SerialName("is_public") val isPublic: Boolean = true,
)

@Serializable
data class ConnectionRow(
    val id: String,
    @SerialName("connection_id") val connectionId: String? = null,
    val status: String = "pending",
    val direction: String = "outgoing",
    @SerialName("created_at") val createdAt: String? = null,
    val person: ConnectionPerson? = null,
)

@Serializable
data class ConnectionPerson(
    val id: String? = null,
    val alias: String? = null,
    val name: String? = null,
    @SerialName("avatar_emoji") val avatarEmoji: String? = null,
    val location: String? = null,
    val bio: String? = null,
    val interests: List<String> = emptyList(),
)

// ---------- Wrappers: POST/insert routes return an array, single rows an object ----------

@Serializable data class DataWrapper<T>(val data: T)
@Serializable data class OkWrapper(val ok: Boolean = true)
@Serializable data class MessageWrapper(val message: String? = null)
@Serializable data class CreatedWrapper<T>(val data: T, val created: Boolean = false)
@Serializable data class DataList<T>(val data: List<T> = emptyList())
@Serializable data class ProfileWrapper<T>(val profile: T)
@Serializable data class ThreadResponse<T>(val data: List<T> = emptyList(), val peerExists: Boolean = true, val peer: JsonElement? = null)
@Serializable data class AliasCheck(val alias: String, val available: Boolean, val valid: Boolean)
@Serializable data class StoryLike(val liked: Boolean, val likes: Int)

// ---------- /api/stories, /api/matches ----------

/** A 24-hour story. Mirrors the columns `GET /api/stories` returns. */
@Serializable
data class Story(
    val id: String,
    val content: String = "",
    @SerialName("mood_emoji") val moodEmoji: String? = null,
    @SerialName("media_url") val mediaUrl: String? = null,
    @SerialName("like_count") val likeCount: Int = 0,
    @SerialName("liked_by_me") val likedByMe: Boolean = false,
    @SerialName("is_mine") val isMine: Boolean = false,
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("expires_at") val expiresAt: String? = null,
)

@Serializable
data class Match(
    val id: String,
    @SerialName("user1_id") val user1Id: String = "",
    @SerialName("user2_id") val user2Id: String = "",
    @SerialName("similarity_score") val similarityScore: Double = 0.0,
    @SerialName("match_reason") val matchReason: String? = null,
)

/** `POST /api/stories/:id/like` → `{ liked, likes }`. */
@Serializable data class ChatReaction(val reaction: String? = null)
