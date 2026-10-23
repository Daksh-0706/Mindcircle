package app.mindcircle.android.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.ExperimentalTextApi
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.mindcircle.android.R

/** Montserrat — body and UI headings, exactly as the website loads it. */
@OptIn(ExperimentalTextApi::class)
private val Montserrat = FontFamily(
    Font(R.font.montserrat_family, FontWeight.W400, variationSettings = FontVariation.Settings(FontVariation.weight(400))),
    Font(R.font.montserrat_family, FontWeight.W500, variationSettings = FontVariation.Settings(FontVariation.weight(500))),
    Font(R.font.montserrat_family, FontWeight.W600, variationSettings = FontVariation.Settings(FontVariation.weight(600))),
    Font(R.font.montserrat_family, FontWeight.W700, variationSettings = FontVariation.Settings(FontVariation.weight(700))),
)

/** Playfair Display — big page heroes only. */
@OptIn(ExperimentalTextApi::class)
private val Playfair = FontFamily(
    Font(R.font.playfair_family, FontWeight.W600, variationSettings = FontVariation.Settings(FontVariation.weight(600))),
    Font(R.font.playfair_family, FontWeight.W700, variationSettings = FontVariation.Settings(FontVariation.weight(700))),
)

/** Shape tokens. 24dp is the dominant card radius on the web; 28dp is dialogs + the nav pill. */
object Shapes {
    val Card = RoundedCornerShape(24.dp)
    val Bubble = RoundedCornerShape(18.dp)
    val Row = RoundedCornerShape(20.dp)
    val Dialog = RoundedCornerShape(28.dp)
    val Sheet = RoundedCornerShape(28.dp)
    val Chip = RoundedCornerShape(999.dp)
    val Input = RoundedCornerShape(16.dp)
    val Pill = RoundedCornerShape(999.dp)
}

/** Typography scaled from the web's 4dp grid. */
private val AppTypography = Typography(
    displayLarge = TextStyle(fontFamily = Playfair, fontWeight = FontWeight.Bold, fontSize = 40.sp, lineHeight = 44.sp),
    displayMedium = TextStyle(fontFamily = Playfair, fontWeight = FontWeight.Bold, fontSize = 32.sp, lineHeight = 36.sp),
    displaySmall = TextStyle(fontFamily = Playfair, fontWeight = FontWeight.Bold, fontSize = 28.sp, lineHeight = 32.sp),
    headlineLarge = TextStyle(fontFamily = Montserrat, fontWeight = FontWeight.Bold, fontSize = 26.sp, lineHeight = 32.sp),
    headlineMedium = TextStyle(fontFamily = Montserrat, fontWeight = FontWeight.Bold, fontSize = 22.sp, lineHeight = 28.sp),
    headlineSmall = TextStyle(fontFamily = Montserrat, fontWeight = FontWeight.Bold, fontSize = 18.sp, lineHeight = 24.sp),
    titleLarge = TextStyle(fontFamily = Montserrat, fontWeight = FontWeight.Bold, fontSize = 20.sp, lineHeight = 26.sp),
    titleMedium = TextStyle(fontFamily = Montserrat, fontWeight = FontWeight.SemiBold, fontSize = 17.sp, lineHeight = 22.sp),
    titleSmall = TextStyle(fontFamily = Montserrat, fontWeight = FontWeight.SemiBold, fontSize = 15.sp, lineHeight = 20.sp),
    bodyLarge = TextStyle(fontFamily = Montserrat, fontWeight = FontWeight.Normal, fontSize = 16.sp, lineHeight = 26.sp),
    bodyMedium = TextStyle(fontFamily = Montserrat, fontWeight = FontWeight.Normal, fontSize = 14.sp, lineHeight = 22.sp),
    bodySmall = TextStyle(fontFamily = Montserrat, fontWeight = FontWeight.Normal, fontSize = 12.sp, lineHeight = 16.sp),
    labelLarge = TextStyle(fontFamily = Montserrat, fontWeight = FontWeight.Bold, fontSize = 14.sp, lineHeight = 18.sp),
    labelMedium = TextStyle(fontFamily = Montserrat, fontWeight = FontWeight.SemiBold, fontSize = 11.sp, lineHeight = 14.sp),
    labelSmall = TextStyle(fontFamily = Montserrat, fontWeight = FontWeight.Bold, fontSize = 10.sp, lineHeight = 13.sp),
)

/** Extra design-system values that Material does not model. */
object AppExtras {
    val BodyFont: FontFamily get() = Montserrat
    val DisplayFont: FontFamily get() = Playfair
}

private val LightColors = lightColorScheme(
    primary = Palette.Plum,
    onPrimary = Palette.Cream,
    primaryContainer = Palette.Lavender,
    onPrimaryContainer = Palette.Plum,
    secondary = Palette.Terracotta,
    onSecondary = Palette.Cream,
    secondaryContainer = Palette.Peach,
    onSecondaryContainer = Palette.Terracotta,
    tertiary = Palette.Sage,
    onTertiary = Palette.Cream,
    tertiaryContainer = Palette.Mint,
    onTertiaryContainer = Palette.SageDark,
    background = Palette.Cream,
    onBackground = Palette.Charcoal,
    surface = Palette.White,
    onSurface = Palette.Charcoal,
    surfaceVariant = Palette.CreamDark,
    onSurfaceVariant = Palette.WarmGray,
    outline = Palette.Border,
    error = Palette.Danger,
    onError = Palette.White,
    errorContainer = Palette.Rose,
    onErrorContainer = Palette.Danger,
)

@Composable
fun MindCircleTheme(
    // The web app is light-only — its Dark Mode toggle is explicitly labelled
    // "Visual only" — so the Android app is too, and this stays unused.
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    CompositionLocalProvider(LocalAppShapes provides Shapes) {
        MaterialTheme(
            colorScheme = LightColors,
            typography = AppTypography,
            content = content,
        )
    }
}

/** Shape tokens are also reachable directly as `Shapes.Card`, no provider needed. */
val LocalAppShapes = staticCompositionLocalOf { Shapes }
