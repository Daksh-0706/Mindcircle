package app.mindcircle.android.data

import androidx.compose.ui.graphics.Color
import app.mindcircle.android.R

/**
 * The guided-activity catalogue.
 *
 * The contents mirror `activities` in the web's ActivitiesClient, and the three
 * entries marked [suggestion] are the ones its home page shows under "Try
 * something that helps". Both lists come from one place here so they cannot
 * drift apart the way two hard-coded copies would.
 */
data class Activity(
    val id: String,
    val title: String,
    val description: String,
    val imageRes: Int,
    val duration: String,
    val level: String,
    val tint: Color,
    /** Where tapping should go. */
    val destination: Destination,
    /**
     * Whether the guided session exists yet.
     *
     * The web ships a real session for meditation and gratitude only; the rest
     * are listed but not built, and its own cards say so. Mirrored here rather
     * than inventing screens the web does not have.
     */
    val available: Boolean = true,
) {
    enum class Destination { ACTIVITIES, JOURNAL, SELF }

    /** Long blurb used on the detail screen. */
    val detailDescription: String get() = description

    /** What the detail page calls it — "5 minutes", not "5 min". */
    val durationLong: String get() = duration.replace(" min", " minutes")

    /** One of the guided steps shown as numbered cards. */
    val steps: List<String> get() = when (id) {
        "meditation" -> listOf(
            "Find a comfortable position.",
            "Notice three slow breaths.",
            "Let thoughts come and go without following them.",
        )
        "gratitude" -> listOf(
            "Name one thing that felt good today.",
            "Write why it mattered to you.",
            "Notice how your body feels as you remember it.",
        )
        "breathing" -> listOf("Breathe in for 4 counts.", "Hold gently for 7 counts.", "Exhale slowly for 8 counts.")
        "nature" -> listOf("Look for five things you can see.", "Notice four things you can feel.", "Take one unhurried step at a time.")
        "creative" -> listOf("Choose a colour that matches your mood.", "Draw or write continuously for five minutes.", "Keep what feels meaningful and let go of the rest.")
        else -> listOf("Put your phone on silent.", "Choose one offline activity.", "Return when you feel more settled.")
    }

    /** Seconds, for the meditation countdown. */
    val durationSeconds: Int get() = duration.filter { it.isDigit() }.toIntOrNull()?.times(60) ?: 300
}

/** The "Try something that helps" strip on Home. */
data class ActivitySuggestion(
    val imageRes: Int,
    val title: String,
    val detail: String,
    val background: Color,
    val destination: Activity.Destination,
)

/** Everything shown on the Activities screen. */
val ACTIVITIES: List<Activity> = listOf(
    Activity(
        id = "meditation",
        title = "5-Minute Meditation",
        description = "A quick guided meditation to center your mind and reduce stress.",
        imageRes = R.drawable.activity_meditation,
        duration = "5 min",
        level = "Beginner",
        tint = Color(0xFF4A2C5E),
        destination = Activity.Destination.ACTIVITIES,
    ),
    Activity(
        id = "gratitude",
        title = "Gratitude Journaling",
        description = "Reflect on three things you're grateful for to shift your perspective.",
        imageRes = R.drawable.activity_journaling,
        duration = "10 min",
        level = "Beginner",
        tint = Color(0xFF7B9E6B),
        destination = Activity.Destination.JOURNAL,
    ),
    Activity(
        id = "breathing",
        title = "Breathing Exercise",
        description = "Practice 4-7-8 breathing technique to calm your nervous system.",
        imageRes = R.drawable.activity_breathing,
        duration = "3 min",
        level = "Beginner",
        tint = Color(0xFFC45D3E),
        destination = Activity.Destination.ACTIVITIES,
        available = false,
    ),
    Activity(
        id = "nature",
        title = "Nature Walk",
        description = "Mindful walking practice to connect with your surroundings.",
        imageRes = R.drawable.activity_nature_walk,
        duration = "15 min",
        level = "All levels",
        tint = Color(0xFF5C7A4F),
        destination = Activity.Destination.ACTIVITIES,
        available = false,
    ),
    Activity(
        id = "creative",
        title = "Creative Expression",
        description = "Free-form drawing or writing to process emotions creatively.",
        imageRes = R.drawable.activity_creative,
        duration = "20 min",
        level = "All levels",
        tint = Color(0xFF6B4A80),
        destination = Activity.Destination.ACTIVITIES,
        available = false,
    ),
    Activity(
        id = "detox",
        title = "Digital Detox",
        description = "Guided session to unplug and reconnect with yourself.",
        imageRes = R.drawable.activity_detox,
        duration = "30 min",
        level = "Intermediate",
        tint = Color(0xFF8A8A8A),
        destination = Activity.Destination.ACTIVITIES,
        available = false,
    ),
)

/**
 * Home's suggestions, copied from the web's home page verbatim — note the
 * durations there (4/10/6 mins) differ from the catalogue above on purpose, so
 * the two lists are kept separate instead of being "fixed" to match.
 */
val HOME_SUGGESTIONS: List<ActivitySuggestion> = listOf(
    ActivitySuggestion(
        imageRes = R.drawable.activity_breathing,
        title = "Box breathing exercise",
        detail = "Duration: 4 mins • Anxiety release",
        background = Color(0x147B9E6B),
        destination = Activity.Destination.ACTIVITIES,
    ),
    ActivitySuggestion(
        imageRes = R.drawable.activity_journaling,
        title = "Write placement worries",
        detail = "Duration: 10 mins • Grounding therapy",
        background = Color(0x1A4A2C5E),
        destination = Activity.Destination.JOURNAL,
    ),
    ActivitySuggestion(
        imageRes = R.drawable.activity_anxiety_relief,
        title = "Anxiety release audio",
        detail = "Duration: 6 mins • Calm guidance",
        background = Color(0x1AC45D3E),
        destination = Activity.Destination.ACTIVITIES,
    ),
)

// `category` is only used to build suggestionDetail above; naming it here keeps
// the data class free of a second source of truth.
private val Activity.category: String
    get() = level