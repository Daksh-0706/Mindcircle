package app.mindcircle.android.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * Brand palette — every value is lifted from `src/app/globals.css` on the web
 * app so the two clients look like the same product.
 */
object Palette {
    val Cream = Color(0xFFFFF8F0)
    val CreamDark = Color(0xFFF5EDE3)
    val Plum = Color(0xFF4A2C5E)
    val PlumLight = Color(0xFF6B4A80)
    val PlumDark = Color(0xFF3A1F4A)
    val Terracotta = Color(0xFFC45D3E)
    val TerracottaLight = Color(0xFFD4785C)
    val Sage = Color(0xFF7B9E6B)
    val SageDark = Color(0xFF5C7A4F)
    val Charcoal = Color(0xFF2A2A2A)
    val WarmGray = Color(0xFF8A8A8A)
    val WarmGrayLight = Color(0xFFB0B0B0)
    val Border = Color(0xFFE8E0D8)
    val Danger = Color(0xFFD64545)
    val White = Color(0xFFFFFFFF)

    // Supporting tints used across cards and chips on the website.
    val Lavender = Color(0xFFEFEAFB)
    val Peach = Color(0xFFFBEEDC)
    val Rose = Color(0xFFFBE7EC)
    val Mint = Color(0xFFEAF3EA)
    val UnreadRed = Color(0xFFE8506E)
    val InkDeep = Color(0xFF2A1B3D)
    val InkHero = Color(0xFF3D2A52)
    val Gold = Color(0xFFF5C98A)

    // The primary CTA gradient on the web (`.btn-gradient`).
    val GradientStart = Plum
    val GradientEnd = Terracotta

    // The secondary purple pill used by journal/chats/connect CTAs.
    val PurpleStart = Color(0xFF5B4B9E)
    val PurpleEnd = Color(0xFF7C5FA8)
}
