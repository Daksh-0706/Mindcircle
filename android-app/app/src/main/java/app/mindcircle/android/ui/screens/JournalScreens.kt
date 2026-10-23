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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.core.ApiClient
import app.mindcircle.android.core.DataList
import app.mindcircle.android.core.DataWrapper
import app.mindcircle.android.core.JournalEntry
import app.mindcircle.android.core.jsonBody
import app.mindcircle.android.data.Reference
import app.mindcircle.android.ui.components.Chip
import app.mindcircle.android.ui.components.EmptyState
import app.mindcircle.android.ui.components.ErrorBanner
import app.mindcircle.android.ui.components.GradientButton
import app.mindcircle.android.ui.components.HeroCard
import app.mindcircle.android.ui.components.McCard
import app.mindcircle.android.ui.components.PurpleButton
import app.mindcircle.android.ui.components.Shimmer
import app.mindcircle.android.ui.theme.Palette
import app.mindcircle.android.ui.theme.Shapes
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** Journal list — the web's `/app/journal`. */
@Composable
fun JournalScreen(onWrite: () -> Unit, onOpen: (String) -> Unit) {
    val scope = rememberCoroutineScope()
    var entries by remember { mutableStateOf<List<JournalEntry>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var pendingDelete by remember { mutableStateOf<JournalEntry?>(null) }

    fun load() {
        scope.launch {
            runCatching { ApiClient.get<DataList<JournalEntry>>("/api/journal").data }
                .onSuccess { entries = it }
                .onFailure {
                    entries = emptyList()
                    error = it.message ?: "Could not load your journal."
                }
        }
    }

    androidx.compose.runtime.LaunchedEffect(Unit) { load() }

    Box(Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            HeroCard(
                title = "Private",
                gradientTitle = "Journal",
                subtitle = "A quiet place to unpack thoughts, safely and anonymously.",
                // The book illustration the web fades in behind this header.
                imageRes = app.mindcircle.android.R.drawable.journal_book,
                imageWidth = 0.5f,
                background = listOf(Palette.CreamDark, Palette.Cream, Palette.White),
            )
            Box(
                modifier = Modifier
                    .clip(Shapes.Chip)
                    .background(Palette.Mint)
                    .padding(horizontal = 12.dp, vertical = 6.dp),
            ) {
                Text("🔒  Only you can see this", style = MaterialTheme.typography.labelMedium, color = Palette.SageDark)
            }

            val current = entries
            when {
                current == null -> repeat(3) { Shimmer(Modifier.fillMaxWidth().height(84.dp)) }
                error != null -> ErrorBanner(error!!)
                current.isEmpty() -> EmptyState(
                    icon = "📓",
                    title = "No entries yet",
                    description = "Your first one is waiting. Write whatever is on your mind.",
                    actionText = "Write an entry",
                    onAction = onWrite,
                )
                else -> current.forEach { entry ->
                    JournalRow(entry = entry, onClick = { onOpen(entry.id) }, onDelete = { pendingDelete = entry })
                }
            }

            Spacer(Modifier.height(90.dp))
        }

        FloatingActionButton(
            onClick = onWrite,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(20.dp),
            containerColor = Palette.GradientStart,
            contentColor = Palette.Cream,
            shape = RoundedCornerShape(28.dp),
        ) {
            Icon(Icons.Filled.Add, contentDescription = "New entry")
        }
    }

    pendingDelete?.let { entry ->
        AlertDialog(
            onDismissRequest = { pendingDelete = null },
            containerColor = Palette.White,
            title = { Text("Delete this entry?", style = MaterialTheme.typography.titleMedium) },
            text = {
                Text(
                    "It will be removed from your journal permanently. This cannot be undone.",
                    style = MaterialTheme.typography.bodyMedium,
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    pendingDelete = null
                    scope.launch {
                        runCatching {
                            ApiClient.deleteIgnoring("/api/journal?id=${entry.id}")
                        }.onSuccess { load() }
                    }
                }) { Text("Delete", color = Palette.Danger) }
            },
            dismissButton = {
                TextButton(onClick = { pendingDelete = null }) { Text("Keep it", color = Palette.Plum) }
            },
        )
    }
}

@Composable
private fun JournalRow(entry: JournalEntry, onClick: () -> Unit, onDelete: () -> Unit) {
    val lines = entry.content.lines().filter { it.isNotBlank() }
    val title = lines.firstOrNull().orEmpty().ifBlank { "Untitled entry" }
    val excerpt = lines.drop(1).joinToString(" ").ifBlank { entry.content }
    val day = entry.createdAt?.let { formatDay(it) } ?: ""

    McCard(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        color = Palette.White,
    ) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(day.uppercase(), style = MaterialTheme.typography.labelSmall, color = Palette.WarmGray)
                Spacer(Modifier.weight(1f))
                if (!entry.moodTag.isNullOrBlank()) {
                    Text(entry.moodTag, fontSize = 18.sp)
                    Spacer(Modifier.width(8.dp))
                }
                Text(
                    "🗑",
                    fontSize = 15.sp,
                    modifier = Modifier.clickable(onClick = onDelete).padding(4.dp),
                )
            }
            Spacer(Modifier.height(6.dp))
            Text(
                title,
                style = MaterialTheme.typography.titleMedium,
                color = Palette.Plum,
                maxLines = 1,
            )
            Spacer(Modifier.height(4.dp))
            Text(
                excerpt,
                style = MaterialTheme.typography.bodyMedium,
                color = Palette.WarmGray,
                maxLines = 2,
            )
        }
    }
}

/** Compose a new entry — the API stores `content` (and an optional mood tag). */
@Composable
fun JournalWriteScreen(onDone: () -> Unit) {
    val scope = rememberCoroutineScope()
    var title by remember { mutableStateOf("") }
    var content by remember { mutableStateOf("") }
    var moodTag by remember { mutableStateOf<String?>(null) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text("What's on your mind?", style = MaterialTheme.typography.headlineLarge, color = Palette.InkDeep)

        McCard {
            Column {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it.take(120) },
                    placeholder = { Text("Give it a title (optional)", color = Palette.WarmGray) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = warmTextFieldColors(),
                    textStyle = MaterialTheme.typography.titleMedium,
                    singleLine = true,
                )
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = content,
                    onValueChange = { content = it.take(20000) },
                    placeholder = {
                        Text(
                            "Start anywhere. This is only for you.",
                            color = Palette.WarmGray,
                            style = MaterialTheme.typography.bodyLarge,
                        )
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(240.dp),
                    colors = warmTextFieldColors(),
                    textStyle = MaterialTheme.typography.bodyLarge,
                )
                Spacer(Modifier.height(14.dp))
                Text("Mood check", style = MaterialTheme.typography.titleSmall, color = Palette.Charcoal)
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Reference.moods.take(6).forEach { mood ->
                        Box(
                            modifier = Modifier
                                .clip(Shapes.Chip)
                                .background(if (moodTag == mood.emoji) Palette.Plum.copy(alpha = 0.12f) else Palette.CreamDark)
                                .clickable { moodTag = if (moodTag == mood.emoji) null else mood.emoji }
                                .padding(horizontal = 10.dp, vertical = 7.dp),
                        ) {
                            Text(mood.emoji, fontSize = 17.sp)
                        }
                    }
                }
                Spacer(Modifier.height(6.dp))
                Text(
                    "${content.length} / 20,000",
                    style = MaterialTheme.typography.bodySmall,
                    color = Palette.WarmGray,
                )
            }
        }

        error?.let { ErrorBanner(it) }

        GradientButton(
            text = "Publish to private journal",
            loading = saving,
            enabled = content.isNotBlank() && !saving,
            onClick = {
                saving = true
                error = null
                val body = listOfNotNull(
                    "content" to listOfNotNull(title.trim().ifBlank { null }, content.trim()).joinToString("\n\n"),
                    "mood_tag" to moodTag,
                ).toTypedArray()
                scope.launch {
                    runCatching { ApiClient.post<DataWrapper<List<JournalEntry>>>("/api/journal", jsonBody(*body)) }
                        .onSuccess { onDone() }
                        .onFailure {
                            error = it.message ?: "Could not save your entry."
                            saving = false
                        }
                }
            },
        )
    }
}

/** One entry, read-only. */
@Composable
fun JournalDetailScreen(entryId: String, onBack: () -> Unit, onWrite: () -> Unit) {
    val entry by produceState<JournalEntry?>(initialValue = null, entryId) {
        value = runCatching {
            ApiClient.get<DataWrapper<JournalEntry>>("/api/journal/$entryId").data
        }.getOrNull()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        when (val current = entry) {
            null -> {
                Shimmer(Modifier.fillMaxWidth().height(40.dp))
                Shimmer(Modifier.fillMaxWidth().height(240.dp))
            }
            else -> {
                McCard {
                    Column {
                        Text(
                            formatDay(current.createdAt.orEmpty()),
                            style = MaterialTheme.typography.labelSmall,
                            color = Palette.WarmGray,
                        )
                        Spacer(Modifier.height(8.dp))
                        current.content.lines().filter { it.isNotBlank() }.forEachIndexed { index, line ->
                            Text(
                                line,
                                style = if (index == 0) MaterialTheme.typography.headlineSmall
                                else MaterialTheme.typography.bodyLarge,
                                color = if (index == 0) Palette.Charcoal else Palette.Charcoal,
                            )
                            if (index == 0) Spacer(Modifier.height(12.dp))
                        }
                        if (!current.moodTag.isNullOrBlank()) {
                            Spacer(Modifier.height(16.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(current.moodTag, fontSize = 22.sp)
                                Spacer(Modifier.width(8.dp))
                                Text("Mood when you wrote this", style = MaterialTheme.typography.bodySmall, color = Palette.WarmGray)
                            }
                        }
                    }
                }
                PurpleButton(text = "Write a new entry", onClick = onWrite)
            }
        }
    }
}

@Composable
private fun warmTextFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = Palette.Plum,
    unfocusedBorderColor = Palette.Border,
    focusedContainerColor = Palette.White,
    unfocusedContainerColor = Palette.CreamDark,
    cursorColor = Palette.Plum,
    focusedTextColor = Palette.Charcoal,
    unfocusedTextColor = Palette.Charcoal,
)

private fun formatDay(iso: String): String {
    val parsed = runCatching {
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
            .parse(iso.take(19))
    }.getOrNull() ?: return iso.take(10)
    return SimpleDateFormat("EEEE, d MMMM yyyy", Locale.getDefault()).format(parsed)
}
