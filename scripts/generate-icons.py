"""Generate the PNG icon set + OG image for MindCircle from the brand mark.

Run: python scripts/generate-icons.py
Requires Pillow. Output is committed; the script exists so the assets can be
regenerated at a different size without hand-editing binary files.
"""

import math
import os

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public")

# Windows ships Arial/Georgia; fall back to DejaVu on Linux CI.
FONT_CANDIDATES = {
    "bold": [
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/segoeuib.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ],
    "regular": [
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ],
}


def load_font(kind, size):
    from PIL import ImageFont

    for path in FONT_CANDIDATES[kind]:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

CREAM = (255, 248, 240)
PLUM = (74, 44, 94)
TERRACOTTA = (196, 93, 62)


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
    d.polygon(
        [
            (cx1 - r, cy),
            (cx2 + r, cy),
            (s * 0.5, s * 0.5 + r * 1.62),
        ],
        fill=255,
    )
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


def make_og(width=1200, height=630):
    img = Image.new("RGB", (width, height), CREAM)
    d = ImageDraw.Draw(img)

    # Soft corner blobs in brand colours, so the card is not flat cream.
    for cx, cy, rad, color, alpha in [
        (width * 0.92, height * 0.10, 300, PLUM, 26),
        (width * 0.06, height * 0.95, 340, TERRACOTTA, 22),
        (width * 0.55, height * 1.02, 260, (123, 158, 107), 18),
    ]:
        layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        ImageDraw.Draw(layer).ellipse(
            [cx - rad, cy - rad, cx + rad, cy + rad], fill=color + (alpha,)
        )
        img = Image.alpha_composite(img.convert("RGBA"), layer.filter(ImageFilter.GaussianBlur(40))).convert("RGB")
    d = ImageDraw.Draw(img)

    logo = make_icon(180, rounded=True)
    img.paste(logo, (96, 96), logo)

    wordmark = load_font("bold", 84)
    tagline = load_font("regular", 40)
    headline = load_font("bold", 52)
    meta = load_font("regular", 28)

    d.text((320, 132), "MindCircle", fill=PLUM, font=wordmark)
    d.text((320, 232), "Your Safe Space", fill=TERRACOTTA, font=tagline)
    d.text((96, 372), "A privacy-first mental health", fill=(58, 31, 74), font=headline)
    d.text((96, 438), "platform for students.", fill=(58, 31, 74), font=headline)
    d.text((96, 528), "Journal  ·  Mood tracking  ·  Peer support  ·  Counsellors", fill=(138, 138, 138), font=meta)
    return img


if __name__ == "__main__":
    make_icon(512).save(os.path.join(OUT, "icon-512.png"))
    make_icon(192).save(os.path.join(OUT, "icon-192.png"))
    make_icon(180, rounded=True).save(os.path.join(OUT, "apple-icon.png"))
    make_og().save(os.path.join(OUT, "og-image.png"))
    print("wrote icon-512.png icon-192.png apple-icon.png og-image.png")
