package app.mindcircle.android.data

/**
 * Everything the profile-setup wizard (and Discover's filters) picks from.
 *
 * Mirrors src/lib/profile-options.ts. Keeping the exact same strings matters:
 * interests and goals are stored verbatim on the profile row, so a renamed
 * label here would silently orphan a member's existing picks.
 */

data class AvatarOption(val emoji: String, val disc: String)

val ONBOARDING_AVATARS = listOf(
    AvatarOption("🌱", "#E7F3E4"),
    AvatarOption("☀️", "#FBF1DC"),
    AvatarOption("☁️", "#E8EFFA"),
    AvatarOption("💜", "#F2EAFB"),
    AvatarOption("🎮", "#EFEAFB"),
    AvatarOption("📚", "#E7F3E4"),
    AvatarOption("☕", "#F7EDE6"),
    AvatarOption("🌙", "#EDEAFB"),
    AvatarOption("🐱", "#FBF1DC"),
)

/** The closed set the UI offers; the column itself is free text. */
val PRONOUNS = listOf(
    "He/Him",
    "She/Her",
    "They/Them",
    "He/They",
    "She/They",
    "Prefer not to say",
)

data class Interest(val label: String, val emoji: String, val disc: String)

val INTERESTS = listOf(
    Interest("Mental Health", "🧠", "#FBE7EC"),
    Interest("Music", "🎧", "#EFEAFB"),
    Interest("Tech", "💻", "#E8EFFA"),
    Interest("Gaming", "🎮", "#F2EAFB"),
    Interest("Reading", "📚", "#E7F3E4"),
    Interest("Personal Growth", "🌱", "#E7F3E4"),
    Interest("Movies & TV", "🎬", "#FBF1DC"),
    Interest("Art & Design", "🎨", "#FBE7EC"),
    Interest("Fitness", "💪", "#E8EFFA"),
    Interest("Travel", "✈️", "#EFEAFB"),
    Interest("Cooking", "🍳", "#FBF1DC"),
    Interest("Photography", "📷", "#E8EFFA"),
    Interest("Spirituality", "🧘", "#E7F3E4"),
    Interest("Fashion", "👗", "#FBE7EC"),
    Interest("Sports", "⚽", "#E7F3E4"),
    Interest("Volunteering", "🤝", "#F2EAFB"),
)

data class Goal(
    val id: String,
    val title: String,
    val description: String,
    val emoji: String,
    val disc: String,
)

val GOALS = listOf(
    Goal("mental-health", "Take care of my mental health", "Feel better, manage stress and anxiety.", "🧠", "#FBE7EC"),
    Goal("like-minded", "Meet like-minded people", "Find a supportive community.", "👥", "#E8EFFA"),
    Goal("habits", "Build better habits", "Stay consistent and feel more productive.", "🎯", "#FDECE4"),
    Goal("self", "Understand myself better", "Explore my thoughts, patterns and emotions.", "🌱", "#E7F3E4"),
    Goal("emotional", "Find emotional support", "Talk, share and feel less alone.", "❤️", "#FBE7EC"),
    Goal("guidance", "Get guidance from professionals", "Access expert advice when needed.", "🎓", "#EFEAFB"),
    Goal("positive", "Feel more positive", "Build a happier, healthier mindset.", "☀️", "#FBF1DC"),
    Goal("community", "Be part of a safe community", "Connect in a respectful and judgment-free space.", "👥", "#EFEAFB"),
    Goal("explore", "Just explore", "I'm here to see what it's about.", "♾️", "#FDF4EC"),
)

/** Matches the web's starting selection so the wizard opens looking lived-in. */
val PRESELECTED_GOALS = listOf("mental-health", "self", "community")

/** Falls back to a neutral chip for anything stored that we no longer list. */
fun interestLabel(label: String): Interest =
    INTERESTS.firstOrNull { it.label == label }
        ?: Interest(label, "✨", "#EFEAFB")