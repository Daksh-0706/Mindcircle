package app.mindcircle.android.data

import androidx.compose.ui.graphics.Color
import app.mindcircle.android.R

/**
 * Reference data copied verbatim from the web app's src/lib TypeScript files, so both
 * clients offer the same choices, colours and copy.
 */

/** The six check-in moods. `score` is what is stored in `mood_score` (1–10). */
data class MoodOption(
    val emoji: String,
    val label: String,
    val color: Color,
    val pill: Color,
    val score: Int,
    val imageRes: Int,
)

object Reference {
    val moods = listOf(
        MoodOption("😊", "Happy", Color(0xFFF4C542), Color(0xFFE4EDE1), 10, R.drawable.mood_happy),
        MoodOption("😌", "Peaceful", Color(0xFF7B9E6B), Color(0xFFEFEBF5), 8, R.drawable.mood_peaceful),
        MoodOption("😐", "Neutral", Color(0xFF8A8A8A), Color(0xFFFAECE3), 6, R.drawable.mood_neutral),
        MoodOption("😤", "Frustrated", Color(0xFFC45D3E), Color(0xFFFBE8E8), 4, R.drawable.mood_frustrated),
        MoodOption("😰", "Anxious", Color(0xFF9B6B9E), Color(0xFFE3EDF7), 4, R.drawable.mood_anxious),
        MoodOption("😔", "Sad", Color(0xFF6B8CBA), Color(0xFFEDEAF7), 2, R.drawable.mood_sad),
    )

    fun moodFor(score: Int): MoodOption? = when {
        score >= 9 -> moods[0]
        score >= 7 -> moods[1]
        score >= 5 -> moods[2]
        score >= 4 -> moods[3]
        score >= 3 -> moods[4]
        else -> moods[5]
    }

    fun moodForEmoji(emoji: String?): MoodOption? = moods.firstOrNull { it.emoji == emoji }

    /** `good >= 7`, `neutral >= 5`, `heavy < 5` — the same bands as Insights. */
    fun bandFor(score: Int): Band = when {
        score >= 7 -> Band.GOOD
        score >= 5 -> Band.NEUTRAL
        else -> Band.HEAVY
    }

    enum class Band(val label: String, val color: Color) {
        GOOD("Good", Color(0xFF7B9E6B)),
        NEUTRAL("Okay", Color(0xFF6B4A80)),
        HEAVY("Heavy", Color(0xFFC45D3E)),
    }

    /** `PATCH /api/me` only accepts this closed set. */
    val pronouns = listOf("He/Him", "She/Her", "They/Them", "He/They", "She/They", "Prefer not to say")

    /** The 25 values the API accepts for `avatar_emoji`. */
    val avatars = listOf(
        "🌱", "☀️", "☁️", "💜", "🎮", "📚", "☕", "🌙", "🐱",
        "😊", "😌", "😐", "😤", "😰", "😔",
        "⭐", "🍀", "🦋", "🌸",
        "🙂", "😉", "🥰", "😴", "🌿", "🔥",
    )

    /** Interests are stored and sent as labels. */
    data class Interest(val label: String, val emoji: String, val disc: Color)

    val interests = listOf(
        Interest("Mental Health", "🧠", Color(0xFFFBE7EC)),
        Interest("Music", "🎧", Color(0xFFEFEAFB)),
        Interest("Tech", "💻", Color(0xFFE8EFFA)),
        Interest("Gaming", "🎮", Color(0xFFF2EAFB)),
        Interest("Reading", "📚", Color(0xFFE7F3E4)),
        Interest("Personal Growth", "🌱", Color(0xFFE7F3E4)),
        Interest("Movies & TV", "🎬", Color(0xFFFBF1DC)),
        Interest("Art & Design", "🎨", Color(0xFFFBE7EC)),
        Interest("Fitness", "💪", Color(0xFFE8EFFA)),
        Interest("Travel", "✈️", Color(0xFFEFEAFB)),
        Interest("Cooking", "🍳", Color(0xFFFBF1DC)),
        Interest("Photography", "📷", Color(0xFFE8EFFA)),
        Interest("Spirituality", "🧘", Color(0xFFE7F3E4)),
        Interest("Fashion", "👗", Color(0xFFFBE7EC)),
        Interest("Sports", "⚽", Color(0xFFE7F3E4)),
        Interest("Volunteering", "🤝", Color(0xFFF2EAFB)),
    )

    /** Goals are stored and sent as ids, not titles. */
    data class Goal(val id: String, val title: String, val description: String, val emoji: String)

    val goals = listOf(
        Goal("mental-health", "Take care of my mental health", "Feel better, manage stress and anxiety.", "🧠"),
        Goal("like-minded", "Meet like-minded people", "Find a supportive community.", "👥"),
        Goal("habits", "Build better habits", "Stay consistent and feel more productive.", "🎯"),
        Goal("self", "Understand myself better", "Explore my thoughts, patterns and emotions.", "🌱"),
        Goal("emotional", "Find emotional support", "Talk, share and feel less alone.", "❤️"),
        Goal("guidance", "Get guidance from professionals", "Access expert advice when needed.", "🎓"),
        Goal("positive", "Feel more positive", "Build a happier, healthier mindset.", "☀️"),
        Goal("community", "Be part of a safe community", "Connect in a respectful, judgment-free space.", "👥"),
        Goal("explore", "Just explore", "I'm here to see what it's about.", "♾️"),
    )

    val preselectedGoals = listOf("mental-health", "self", "community")

    /** Crisis helplines — identical numbers and colours to /app/crisis. */
    data class Helpline(
        val name: String,
        val number: String,
        val dial: String,
        val description: String,
        val color: Color,
        val cardColors: List<Color>,
    )

    val helplines = listOf(
        Helpline(
            name = "iCall",
            number = "9152987821",
            dial = "9152987821",
            description = "Counselling and mental health support, run by TISS.",
            color = Color(0xFF7B9E6B),
            cardColors = listOf(Color(0xFFE5F0DC), Color(0xFFEDF4E6), Color(0xFFF6FAF2)),
        ),
        Helpline(
            name = "Vandrevala Foundation",
            number = "1860-2662-345",
            dial = "18602662345",
            description = "Free 24/7 mental health helpline across India.",
            color = Color(0xFF4A2C5E),
            cardColors = listOf(Color(0xFFEDE7F7), Color(0xFFF2ECFA), Color(0xFFF9F6FD)),
        ),
        Helpline(
            name = "AASRA",
            number = "9820466726",
            dial = "+919820466726",
            description = "Suicide prevention and emotional support, 24/7.",
            color = Color(0xFFC45D3E),
            cardColors = listOf(Color(0xFFFBE7DB), Color(0xFFFDEFE5), Color(0xFFFDF7F2)),
        ),
    )

    /** Bottom navigation — the same five items as NAV_ITEMS on the web. */
    val bottomNav = listOf("Home", "Journal", "Connect", "Discover", "Chats")
}
