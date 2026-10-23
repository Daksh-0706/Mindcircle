package app.mindcircle.android.ui.screens

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.R
import app.mindcircle.android.data.ACTIVITIES
import app.mindcircle.android.data.Activity
import app.mindcircle.android.ui.components.GradientButton
import app.mindcircle.android.ui.components.fadeEdges
import app.mindcircle.android.ui.theme.Palette
import app.mindcircle.android.ui.theme.Shapes

/**
 * Activities — the guided wellbeing catalogue from the web's `/app/activities`.
 *
 * Every card carries the artwork the web ships in `public/activities`, so the
 * screen does not degrade into a plain text list.
 */
@Composable
fun ActivitiesScreen(
    onOpenActivity: (Activity) -> Unit,
    onTakeAssessment: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        // ── Hero ────────────────────────────────────────────────
        Column(modifier = Modifier.padding(top = 4.dp, bottom = 2.dp)) {
            Text(
                "Activities",
                style = MaterialTheme.typography.displaySmall.copy(
                    fontWeight = FontWeight.Bold,
                    brush = Brush.linearGradient(listOf(Color(0xFF3D2A52), Color(0xFF3D2A52))),
                ),
                color = Color(0xFF3D2A52),
            )
            Text(
                "for You",
                style = MaterialTheme.typography.displaySmall.copy(
                    fontWeight = FontWeight.Bold,
                    // The web's headline runs #8B7BD8 → #E88A8A across "for You".
                    brush = Brush.horizontalGradient(
                        listOf(Color(0xFF8B7BD8), Color(0xFFE88A8A)),
                    ),
                ),
                color = Color(0xFF8B7BD8),
            )
            Spacer(Modifier.height(8.dp))
            Text(
                "Personalized suggestions to support your wellbeing",
                style = MaterialTheme.typography.bodyMedium,
                color = Palette.Charcoal.copy(alpha = 0.8f),
            )
        }

        // ── Find what works ─────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(
                    Brush.linearGradient(
                        listOf(Color(0xFFF6F1FB), Color(0xFFFBF2F6), Color(0xFFF1EDFB)),
                    ),
                )
                .border(1.dp, Color.White.copy(alpha = 0.7f), RoundedCornerShape(24.dp)),
        ) {
            // The web blends this one in with mix-blend-multiply and a radial
            // mask; the right-hand slice plus an edge fade reads the same here.
            Image(
                painter = painterResource(R.drawable.activity_creative),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .fillMaxHeight()
                    .fillMaxWidth(0.38f)
                    .fadeEdges(
                        horizontal = listOf(
                            0f to Color.Transparent,
                            0.32f to Color.Black,
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
            // Washes the artwork out behind the copy. Without it the
            // illustration's bright middle sat right behind the paragraph.
            Box(
                Modifier
                    .matchParentSize()
                    .background(
                        Brush.horizontalGradient(
                            listOf(
                                Color(0xFFF6F1FB).copy(alpha = 0.95f),
                                Color(0xFFF6F1FB).copy(alpha = 0.80f),
                                Color(0xFFF6F1FB).copy(alpha = 0.25f),
                            ),
                        ),
                    ),
            )
            Row(
                modifier = Modifier
                    .fillMaxWidth(0.72f)
                    .padding(20.dp),
                verticalAlignment = Alignment.Top,
            ) {
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFEFEAFB)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        painter = painterResource(R.drawable.ic_activities),
                        contentDescription = null,
                        tint = Color(0xFF8B7BD8),
                        modifier = Modifier.size(26.dp),
                    )
                }
                Spacer(Modifier.width(16.dp))
                Column {
                    Text(
                        "Find what works for you",
                        style = MaterialTheme.typography.headlineSmall.copy(
                            fontWeight = FontWeight.Bold,
                        ),
                        color = Color(0xFF3D2A52),
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "Explore guided activities designed to support your mental wellbeing. " +
                            "Each activity is evidence-based and can be done anywhere, anytime. " +
                            "Start with just a few minutes a day.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Palette.Charcoal.copy(alpha = 0.75f),
                    )
                }
            }
        }

        // ── Grid ────────────────────────────────────────────────
        ACTIVITIES.chunked(2).forEach { pair ->
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                pair.forEach { activity ->
                    ActivityCard(
                        activity = activity,
                        modifier = Modifier.weight(1f),
                        onClick = { onOpenActivity(activity) },
                    )
                }
                // Keeps a lone card on the last row from stretching full width.
                if (pair.size == 1) Spacer(Modifier.weight(1f))
            }
        }

        // ── CTA ─────────────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(28.dp)),
        ) {
            Image(
                painter = painterResource(R.drawable.activities_cta_bg),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxWidth(),
            )
            Column(
                modifier = Modifier.padding(horizontal = 22.dp, vertical = 30.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    "Want more personalized suggestions?",
                    style = MaterialTheme.typography.headlineSmall.copy(
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Color(0xFF3D2A52),
                )
                Spacer(Modifier.height(10.dp))
                Text(
                    "Take a quick wellness assessment to get activities tailored to your " +
                        "current mood and goals.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Palette.Charcoal.copy(alpha = 0.75f),
                )
                Spacer(Modifier.height(18.dp))
                GradientButton(text = "Take Assessment", onClick = onTakeAssessment)
            }
        }

        Spacer(Modifier.height(8.dp))
    }
}

@Composable
private fun ActivityCard(
    activity: Activity,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(22.dp))
            .background(Color.White)
            .border(1.dp, Palette.Border, RoundedCornerShape(22.dp))
            // Unavailable cards stay visible but inert — a dead tap that does
            // nothing is worse than an obviously disabled one.
            .clickable(enabled = activity.available, onClick = onClick)
            .padding(10.dp),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(110.dp)
                .clip(RoundedCornerShape(16.dp)),
        ) {
            Image(
                painter = painterResource(activity.imageRes),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
            )
            // The four activities without a designed session are shown greyed
            // out behind a badge rather than hidden, matching the web's cards.
            if (!activity.available) {
                Box(
                    Modifier
                        .fillMaxSize()
                        .background(Color.White.copy(alpha = 0.55f)),
                )
                Box(
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(top = 8.dp)
                        .clip(Shapes.Pill)
                        .background(Color.White)
                        .padding(horizontal = 10.dp, vertical = 4.dp),
                ) {
                    Text(
                        "NOT AVAILABLE",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.8.sp,
                        ),
                        color = Palette.Charcoal,
                    )
                }
            }
        }
        Spacer(Modifier.height(10.dp))
        Text(
            activity.title,
            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
            color = if (activity.available) Palette.Charcoal else Palette.WarmGray,
            maxLines = 2,
            minLines = 2,
        )
        Spacer(Modifier.height(6.dp))
        // Level and duration move above the title for the unavailable cards,
        // which is how the reference lays them out.
        Row(horizontalArrangement = Arrangement.spacedBy(5.dp)) {
            Box(
                modifier = Modifier
                    .clip(Shapes.Pill)
                    .background(activity.tint.copy(alpha = 0.16f))
                    .padding(horizontal = 8.dp, vertical = 3.dp),
            ) {
                Text(
                    activity.level,
                    style = MaterialTheme.typography.labelSmall,
                    color = activity.tint,
                )
            }
            Box(
                modifier = Modifier
                    .clip(Shapes.Pill)
                    .background(activity.tint.copy(alpha = 0.10f))
                    .padding(horizontal = 8.dp, vertical = 3.dp),
            ) {
                Text(
                    activity.duration,
                    style = MaterialTheme.typography.labelSmall,
                    color = activity.tint,
                )
            }
        }
        Spacer(Modifier.height(8.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(Shapes.Pill)
                .background(if (activity.available) Palette.Lavender.copy(alpha = 0.5f) else Palette.CreamDark)
                .padding(vertical = 8.dp),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                if (activity.available) "Start activity" else "Not available",
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                color = if (activity.available) Palette.Plum else Palette.WarmGray,
            )
        }
    }
}