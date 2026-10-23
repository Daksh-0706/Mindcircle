package app.mindcircle.android.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.CompositingStrategy
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.R
import app.mindcircle.android.data.MoodOption
import app.mindcircle.android.ui.theme.Palette
import app.mindcircle.android.ui.theme.Shapes

/** The website's `.btn-gradient` — the primary call to action everywhere. */
@Composable
fun GradientButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    loading: Boolean = false,
) {
    val background = if (enabled) {
        Brush.linearGradient(listOf(Palette.GradientStart, Palette.GradientEnd))
    } else {
        Brush.horizontalGradient(listOf(Palette.Border, Palette.Border))
    }
    Box(
        modifier = modifier
            .shadow(if (enabled) 8.dp else 0.dp, Shapes.Pill)
            .clip(Shapes.Pill)
            .background(background)
            .clickable(enabled = enabled && !loading, onClick = onClick)
            .padding(horizontal = 24.dp, vertical = 14.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = if (loading) "Please wait…" else text,
            color = if (enabled) Palette.Cream else Palette.WarmGray,
            style = MaterialTheme.typography.labelLarge,
        )
    }
}

/** The purple pill used for journal / chats / connect CTAs on the web. */
@Composable
fun PurpleButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true) {
    Box(
        modifier = modifier
            .clip(Shapes.Pill)
            .background(Brush.linearGradient(listOf(Palette.PurpleStart, Palette.PurpleEnd)))
            .clickable(enabled = enabled, onClick = onClick)
            .padding(horizontal = 22.dp, vertical = 12.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(text = text, color = Palette.White, style = MaterialTheme.typography.labelLarge)
    }
}

/** Cream fill + hairline border: the web's `secondary` button. */
@Composable
fun SecondaryButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .clip(Shapes.Pill)
            .background(Palette.CreamDark)
            .border(1.5.dp, Palette.Border, Shapes.Pill)
            .clickable(onClick = onClick)
            .padding(horizontal = 20.dp, vertical = 12.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(text = text, color = Palette.Plum, style = MaterialTheme.typography.labelLarge)
    }
}

/** A white, 24dp-radius section card — the dominant container on the web. */
@Composable
fun McCard(
    modifier: Modifier = Modifier,
    color: Color = Palette.White.copy(alpha = 0.92f),
    borderColor: Color = Palette.Border.copy(alpha = 0.7f),
    padding: Int = 20,
    content: @Composable () -> Unit,
) {
    Box(
        modifier = modifier
            .shadow(4.dp, Shapes.Card, spotColor = Palette.Plum.copy(alpha = 0.08f))
            .clip(Shapes.Card)
            .background(color)
            .border(1.dp, borderColor, Shapes.Card)
            .padding(padding.dp),
    ) {
        content()
    }
}

/** A tinted card (used for stat tiles, crisis cards, empty states). */
@Composable
fun TintedCard(
    colors: List<Color>,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    Box(
        modifier = modifier
            .clip(Shapes.Card)
            .background(Brush.verticalGradient(colors))
            .padding(20.dp),
    ) {
        content()
    }
}

/** Uppercase micro label — the web's eyebrow style. */
@Composable
fun Eyebrow(text: String, color: Color = Palette.WarmGray, modifier: Modifier = Modifier) {
    Text(
        text = text.uppercase(),
        color = color,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.6.sp,
        modifier = modifier,
    )
}

/** Pill chip used for tags, ranges, moods and counts. */
@Composable
fun Chip(
    text: String,
    modifier: Modifier = Modifier,
    background: Color = Palette.Lavender,
    textColor: Color = Palette.Plum,
    selected: Boolean = false,
    onClick: (() -> Unit)? = null,
) {
    val bg by animateColorAsState(if (selected) Palette.Plum else background, label = "chip")
    Box(
        modifier = modifier
            .clip(Shapes.Chip)
            .background(bg)
            .let { if (onClick != null) it.clickable(onClick = onClick) else it }
            .padding(horizontal = 14.dp, vertical = 7.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = text,
            color = if (selected) Palette.Cream else textColor,
            style = MaterialTheme.typography.labelMedium,
        )
    }
}

/** Centred empty state, matching the web's `EmptyState`. */
@Composable
fun EmptyState(
    icon: String,
    title: String,
    description: String,
    modifier: Modifier = Modifier,
    actionText: String? = null,
    onAction: (() -> Unit)? = null,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 40.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(Palette.Plum.copy(alpha = 0.10f)),
            contentAlignment = Alignment.Center,
        ) {
            Text(text = icon, fontSize = 26.sp)
        }
        Spacer(Modifier.height(14.dp))
        Text(title, style = MaterialTheme.typography.titleMedium, color = Palette.Charcoal)
        Spacer(Modifier.height(4.dp))
        Text(
            description,
            style = MaterialTheme.typography.bodyMedium,
            color = Palette.WarmGray,
            textAlign = TextAlign.Center,
        )
        if (actionText != null && onAction != null) {
            Spacer(Modifier.height(16.dp))
            GradientButton(text = actionText, onClick = onAction)
        }
    }
}

/** Inline error banner — the web has no toast system, and neither do we. */
@Composable
fun ErrorBanner(message: String, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Palette.Danger.copy(alpha = 0.10f))
            .padding(horizontal = 14.dp, vertical = 12.dp),
    ) {
        Text(message, color = Palette.Danger, style = MaterialTheme.typography.bodyMedium)
    }
}

/** Shimmer placeholder block used while a screen loads. */
@Composable
fun Shimmer(modifier: Modifier = Modifier, cornerRadius: Int = 16) {
    val transition = rememberInfiniteTransition(label = "shimmer")
    val alpha by transition.animateFloat(
        initialValue = 0.35f,
        targetValue = 0.9f,
        animationSpec = infiniteRepeatable(tween(900), RepeatMode.Reverse),
        label = "shimmerAlpha",
    )
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(cornerRadius.dp))
            .background(Palette.CreamDark.copy(alpha = alpha)),
    )
}

/** The web's mark on its own, without a wordmark. */
@Composable
fun BrandMark(heightDp: Int, modifier: Modifier = Modifier) {
    Image(
        painter = painterResource(R.drawable.logo),
        contentDescription = null,
        contentScale = ContentScale.Fit,
        modifier = modifier.size(heightDp.dp),
    )
}

/** Round emoji avatar on the lavender disc used across the web. */
@Composable
fun EmojiAvatar(
    emoji: String?,
    modifier: Modifier = Modifier,
    background: Color = Palette.Lavender,
    size: Int = 48,
) {
    Box(
        modifier = modifier
            .size(size.dp)
            .clip(CircleShape)
            .background(background),
        contentAlignment = Alignment.Center,
    ) {
        Text(text = emoji ?: "🙂", fontSize = (size * 0.5f).sp)
    }
}

/**
 * The dashboard's 3-column mood grid: 68dp emoji, pastel label pill, and the
 * selected state's halo — the signature mood picker of the web app.
 */
@Composable
fun MoodGrid(
    selected: MoodOption?,
    onSelect: (MoodOption) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(18.dp)) {
        ReferenceMoods.chunked(3).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                row.forEach { mood ->
                    val isSelected = selected?.emoji == mood.emoji
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(20.dp))
                            .clickable { onSelect(mood) }
                            .padding(vertical = 6.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Box(
                            modifier = Modifier
                                .size(if (isSelected) 72.dp else 68.dp)
                                .clip(CircleShape)
                                .background(
                                    if (isSelected) mood.color.copy(alpha = 0.13f)
                                    else Color.Transparent,
                                ),
                            contentAlignment = Alignment.Center,
                        ) {
                            Image(
                                painter = painterResource(mood.imageRes),
                                contentDescription = mood.label,
                                modifier = Modifier.size(48.dp),
                                contentScale = ContentScale.Fit,
                            )
                        }
                        Spacer(Modifier.height(8.dp))
                        Box(
                            modifier = Modifier
                                .clip(Shapes.Chip)
                                .background(mood.pill)
                                .let {
                                    if (isSelected) {
                                        it.border(2.dp, mood.color.copy(alpha = 0.40f), Shapes.Chip)
                                    } else it
                                }
                                .padding(horizontal = 12.dp, vertical = 8.dp),
                        ) {
                            Text(
                                text = mood.label,
                                color = if (isSelected) Palette.Charcoal else Palette.WarmGray,
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                            )
                        }
                    }
                }
            }
        }
    }
}

/** Big page hero: optional artwork, Playfair headline, optional gradient word. */
/**
 * Fades the decorated content's edges so artwork melts into the surface behind
 * it, the way the web's stacked `mask-image` layers do.
 *
 * The offscreen compositing strategy is what makes this work. Without an
 * isolated alpha layer, `DstIn` erases toward opaque black and paints a solid
 * box instead of clearing.
 */
internal fun Modifier.fadeEdges(
    horizontal: List<Pair<Float, Color>>,
    vertical: List<Pair<Float, Color>>,
): Modifier = this
    .graphicsLayer { compositingStrategy = CompositingStrategy.Offscreen }
    .drawWithContent {
        drawContent()
        // Transparent at the very edge erases it; opaque black keeps the rest.
        drawRect(
            brush = Brush.horizontalGradient(*horizontal.toTypedArray()),
            blendMode = BlendMode.DstIn,
        )
        drawRect(
            brush = Brush.verticalGradient(*vertical.toTypedArray()),
            blendMode = BlendMode.DstIn,
        )
    }

@Composable
fun HeroCard(
    title: String,
    subtitle: String,
    modifier: Modifier = Modifier,
    gradientTitle: String? = null,
    imageRes: Int? = null,
    /** How much of the card the artwork occupies, as a fraction of its width. */
    imageWidth: Float = 0.46f,
    background: List<Color> = listOf(Palette.CreamDark, Palette.White),
    content: @Composable (() -> Unit)? = null,
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(Shapes.Card)
            .background(Brush.verticalGradient(background)),
    ) {
        if (imageRes != null) {
            // Confined to a right-hand slice and faded on every edge, so the
            // illustration reads as part of the card rather than a pasted panel.
            Image(
                painter = painterResource(imageRes),
                contentDescription = null,
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .fillMaxHeight()
                    .fillMaxWidth(imageWidth)
                    .fadeEdges(
                        horizontal = listOf(
                            0f to Color.Transparent,
                            0.30f to Color.Black,
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
                contentScale = ContentScale.Fit,
            )
        }
        Column(
            Modifier
                .fillMaxWidth(0.78f)
                .padding(22.dp),
        ) {
            Text(text = title, style = MaterialTheme.typography.displaySmall, color = Palette.InkDeep)
            if (gradientTitle != null) {
                Text(
                    text = gradientTitle,
                    style = MaterialTheme.typography.displaySmall,
                    color = Palette.Terracotta,
                )
            }
            Spacer(Modifier.height(6.dp))
            Text(text = subtitle, style = MaterialTheme.typography.bodyMedium, color = Palette.WarmGray)
            if (content != null) {
                Spacer(Modifier.height(16.dp))
                content()
            }
        }
    }
}

/** Simple loading row used by list screens. */
@Composable
fun SkeletonRow(modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Shimmer(Modifier.size(52.dp), cornerRadius = 26)
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Shimmer(Modifier.fillMaxWidth(0.45f).height(14.dp))
            Spacer(Modifier.height(8.dp))
            Shimmer(Modifier.fillMaxWidth(0.7f).height(12.dp))
        }
    }
}

/** Shared surface so screens never fight the cream background. */
@Composable
fun ScreenSurface(content: @Composable () -> Unit) {
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Palette.Cream,
        content = content,
    )
}

private val ReferenceMoods: List<MoodOption>
    get() = app.mindcircle.android.data.Reference.moods
