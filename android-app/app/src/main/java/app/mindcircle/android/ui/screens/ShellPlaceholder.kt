package app.mindcircle.android.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import app.mindcircle.android.ui.components.EmptyState
import app.mindcircle.android.ui.components.GradientButton

/**
 * Honest placeholder for the parts of the app that are not in this build yet.
 * It says what is missing and offers the nearest working thing instead of
 * pretending the feature exists.
 */
@Composable
fun ShellPlaceholder(
    title: String,
    body: String,
    onOpenChats: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
    ) {
        EmptyState(
            icon = "✨",
            title = title,
            description = body,
        )
        GradientButton(
            text = "Open Chats",
            onClick = onOpenChats,
            modifier = Modifier.padding(horizontal = 40.dp),
        )
    }
}
