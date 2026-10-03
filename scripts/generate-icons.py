"""Generate the PNG icon set + OG image for MindCircle.

Run: python scripts/generate-icons.py
Requires Pillow. Output is committed; the script exists so the assets can be
regenerated at a different size without hand-editing binary files.

The OG card is built from the real brand mark (`public/logo.png`, two reaching
hands inside a gradient ring) and the two fonts the site actually uses:
Playfair Display for the headline, Montserrat for everything else. Both are
variable fonts, fetched once into `.brandfonts/` so the card matches the UI
instead of approximating it with Arial.
"""

import os
import urllib.request

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public")
FONTS = os.path.join(ROOT, ".brandfonts")

# Google Fonts' variable originals — same files the site loads from the CDN.
FONT_SOURCES = {
    "Montserrat": "https://github.com/google/fonts/raw/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf",
    "PlayfairDisplay": "https://github.com/google/fonts/raw/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf",
}

# Windows ships Arial/Georgia; fall back to DejaVu on Linux CI.
FALLBACKS = {
    "Montserrat": [
        "C:/Windows/Fonts/segoeuib.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ],
    "PlayfairDisplay": [
        "C:/Windows/Fonts/georgiab.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
    ],
}


def font_path(family):
    """Local variable font, downloading it on first run. None if unavailable."""
    path = os.path.join(FONTS, f"{family}.ttf")
    if os.path.exists(path):
        return path
    os.makedirs(FONTS, exist_ok=True)
    try:
        urllib.request.urlretrieve(FONT_SOURCES[family], path)
    except Exception as exc:  # offline, or GitHub unreachable
        print(f"  ! could not fetch {family} ({exc}); using a system fallback")
        return None
    return path


def load_font(family, size, weight):
    """A variable-font instance at `weight`, or the closest system fallback."""
    path = font_path(family)
    if path:
        f = ImageFont.truetype(path, size)
        try:
            f.set_variation_by_axes([weight])
        except Exception:
            pass
        return f
    for alt in FALLBACKS[family]:
        if os.path.exists(alt):
            return ImageFont.truetype(alt, size)
    return ImageFont.load_default()


CREAM = (255, 248, 240)
PLUM = (74, 44, 94)
PLUM_DEEP = (58, 31, 74)
TERRACOTTA = (196, 93, 62)
SAGE = (123, 158, 107)
WARM_GRAY = (138, 138, 138)


def lerp(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def gradient(size, top_left, bottom_right):
    """Diagonal two-stop gradient."""
    img = Image.new("RGB", (size, size))
    px = img.load()
    denom = max(1, (size - 1) * 2)
    for y in range(size):
        for x in range(size):
            px[x, y] = lerp(top_left, bottom_right, (x + y) / denom)
    return img


def heart_mask(size, scale=0.56, y_offset=0.0):
    """White heart, supersampled 4x for clean antialiased edges."""
    s = size * 4
    m = Image.new("L", (s, s), 0)
    d = ImageDraw.Draw(m)

    r = s * 0.19 * (scale / 0.56)
    cx1 = s * 0.5 - r * 0.92
    cx2 = s * 0.5 + r * 0.92
    cy = s * 0.5 - r * 0.52 + s * y_offset
    d.ellipse([cx1 - r, cy - r, cx1 + r, cy + r], fill=255)
    d.ellipse([cx2 - r, cy - r, cx2 + r, cy + r], fill=255)
    d.polygon([(cx1 - r, cy), (cx2 + r, cy), (s * 0.5, s * 0.5 + r * 1.62)], fill=255)
    return m.resize((size, size), Image.LANCZOS)


def circle_mask(size):
    s = size * 4
    m = Image.new("L", (s, s), 0)
    ImageDraw.Draw(m).ellipse([0, 0, s - 1, s - 1], fill=255)
    return m.resize((size, size), Image.LANCZOS)


def make_icon(size, rounded=False):
    base = gradient(size, PLUM, TERRACOTTA)
    mask = heart_mask(size)
    base.paste(Image.new("RGB", (size, size), CREAM), (0, 0), mask)
    if not rounded:
        return base
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(base, (0, 0), circle_mask(size))
    return out


def text_width(d, s, font, tracking=0):
    w = d.textlength(s, font=font)
    return w + tracking * max(0, len(s) - 1)


def draw_tracked(d, xy, s, font, fill, tracking=0, anchor_center=None):
    """Draw text with letter-spacing; optionally centre it on anchor_center x."""
    x, y = xy
    if anchor_center is not None:
        x = anchor_center - text_width(d, s, font, tracking) / 2
    for ch in s:
        d.text((x, y), ch, fill=fill, font=font)
        x += d.textlength(ch, font=font) + tracking
    return x


def draw_centered(d, width, y, s, font, fill, tracking=0):
    draw_tracked(d, (0, y), s, font, fill, tracking, anchor_center=width / 2)


def make_og(width=1200, height=630):
    img = Image.new("RGB", (width, height), CREAM)

    # Soft corner blobs in brand colours, so the card is not flat cream.
    for cx, cy, rad, color, alpha in [
        (width * 0.94, height * 0.08, 300, PLUM, 26),
        (width * 0.05, height * 0.96, 340, TERRACOTTA, 22),
        (width * 0.58, height * 1.04, 280, SAGE, 20),
    ]:
        layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        ImageDraw.Draw(layer).ellipse(
            [cx - rad, cy - rad, cx + rad, cy + rad], fill=color + (alpha,)
        )
        img = Image.alpha_composite(
            img.convert("RGBA"), layer.filter(ImageFilter.GaussianBlur(40))
        ).convert("RGB")

    d = ImageDraw.Draw(img)

    # The real brand mark, centred and sized by width so its 1.8:1 proportions
    # are preserved exactly as they appear in the nav.
    mark_w = 380
    mark = Image.open(os.path.join(OUT, "logo.png")).convert("RGBA")
    mark_h = round(mark.height * mark_w / mark.width)
    mark = mark.resize((mark_w, mark_h), Image.LANCZOS)
    img.paste(mark, ((width - mark_w) // 2, 58), mark)

    # Wordmark + tagline, locked together as one optical unit under the mark.
    draw_centered(d, width, 274, "MindCircle", load_font("Montserrat", 76, 700), PLUM, tracking=1)
    draw_centered(
        d, width, 368, "YOUR SAFE SPACE", load_font("Montserrat", 28, 600), TERRACOTTA, tracking=7
    )

    # Headline in the site's display serif.
    draw_centered(
        d,
        width,
        424,
        "A privacy-first mental health platform",
        load_font("PlayfairDisplay", 46, 600),
        PLUM_DEEP,
    )
    draw_centered(
        d,
        width,
        482,
        "for students and young professionals.",
        load_font("PlayfairDisplay", 46, 600),
        PLUM_DEEP,
    )

    d.line([(300, 566), (900, 566)], fill=(232, 224, 216), width=2)
    draw_centered(
        d,
        width,
        584,
        "Anonymous alias  ·  Private journal  ·  Mood tracking  ·  Peer support  ·  Counselling",
        load_font("Montserrat", 24, 400),
        WARM_GRAY,
    )
    return img


if __name__ == "__main__":
    make_icon(512).save(os.path.join(OUT, "icon-512.png"))
    make_icon(192).save(os.path.join(OUT, "icon-192.png"))
    make_icon(180, rounded=True).save(os.path.join(OUT, "apple-icon.png"))
    make_og().save(os.path.join(OUT, "og-image.png"))
    print("wrote icon-512.png icon-192.png apple-icon.png og-image.png")