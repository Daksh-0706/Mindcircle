"""Turn the pasted MindCircle logo into a transparent, tightly-cropped asset.

The source is a flat cream-background screenshot of the mark (two reaching
hands inside a gradient ring). The UI needs a clean transparent PNG it can
drop on cream, white and dark-plum surfaces, so this:

  1. finds the mark's bounding box, using a low threshold so the faded arm tips
     are not clipped;
  2. converts the flat background to alpha with a soft ramp, so antialiased
     edges keep a feather instead of a hard stair-step;
  3. writes the cropped mark at the sizes the UI needs.

Run once; the outputs are committed.
"""

import os

from PIL import Image

SRC = os.path.join(
    'C:/Users/daksh/AppData/Local/Temp/freebuff-desktop-pastes',
    'paste-1790964009679-18000.png',
)
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public')

# Fully-opaque once a pixel is this far from the background; below the soft
# start it is transparent. The band in between is the antialiased fringe.
SOFT_START = 6
FULL_ALPHA = 34


def main():
    im = Image.open(SRC).convert('RGB')
    w, h = im.size

    # The backdrop is flat, so sample it from the corners rather than guessing.
    bg = im.getpixel((2, 2))
    print(f'source {w}x{h}, backdrop {bg}')

    px = im.load()
    dist = [[0] * w for _ in range(h)]
    minx, miny, maxx, maxy = w, h, 0, 0

    for y in range(h):
        row = dist[y]
        for x in range(w):
            r, g, b = px[x, y]
            d = abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2])
            row[x] = d
            if d > SOFT_START:
                if x < minx:
                    minx = x
                if x > maxx:
                    maxx = x
                if y < miny:
                    miny = y
                if y > maxy:
                    maxy = y

    print(f'mark bounds: {minx},{miny} -> {maxx},{maxy}')

    # Small margin so the fade-out at the arm tips is not shaved off.
    pad = 8
    minx, miny = max(0, minx - pad), max(0, miny - pad)
    maxx, maxy = min(w - 1, maxx + pad), min(h - 1, maxy + pad)

    out = Image.new('RGBA', (maxx - minx + 1, maxy - miny + 1))
    op = out.load()
    span = max(1, FULL_ALPHA - SOFT_START)

    for y in range(miny, maxy + 1):
        for x in range(minx, maxx + 1):
            d = dist[y][x]
            if d <= SOFT_START:
                a = 0
            elif d >= FULL_ALPHA:
                a = 255
            else:
                a = int(255 * (d - SOFT_START) / span)
            # Un-premultiply toward the mark's own colour so a light fringe
            # does not read as a cream halo on dark surfaces.
            r, g, b = px[x, y]
            op[x - minx, y - miny] = (r, g, b, a)

    # Tight crop is the primary asset: the mark is much wider than tall, so a
    # square canvas would waste most of its box and make height-based sizing in
    # the nav and footer unpredictable.
    full = out.resize((1024, int(1024 * out.height / out.width)), Image.LANCZOS)
    full.save(os.path.join(OUT, 'logo.png'))

    # A centred square version, for favicons and app icons where the container
    # really is square.
    side = max(out.size)
    square = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    square.paste(out, ((side - out.width) // 2, (side - out.height) // 2))
    square.resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, 'logo-square.png'))

    for size in (64, 128, 256):
        square.resize((size, size), Image.LANCZOS).save(
            os.path.join(OUT, f'logo-{size}.png')
        )

    print(
        f'tight {full.size}, square {side}x{side}; '
        'wrote logo.png, logo-square.png, logo-64/128/256'
    )


if __name__ == '__main__':
    main()
