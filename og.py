#!/usr/bin/env python3
"""── og.py ──────────────────────────────────────────────────────────────────
The card the index unfurls as when someone links it. Not a build step: run it
by hand when the catalogue changes and commit the PNG next to it.

    python3 og.py

It reads `records.js` so the stations and the count on the card cannot drift
from the ones on the page, and it draws in the same medium the page does —
tube palette, scanlines, vignette, corner ticks, and white spent only on the
wordmark. Requires Pillow; nothing here ships to the browser.
"""

import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).parent
W, H = 1200, 630
MARGIN = 76

# The tube, straight out of crt.css. Light emitted on black.
VOID = (10, 10, 11)
LINE = (38, 38, 43)
LAND = (76, 76, 85)
DIM = (138, 138, 148)
TEXT = (200, 200, 204)
STRIKE = (255, 255, 255)


def font(weight, size):
    return ImageFont.truetype(str(ROOT / f"fonts/ibm-plex-mono-{weight}-latin.woff2"), size)


def records():
    """The catalogue, read out of the JS rather than restated here."""
    src = (ROOT / "records.js").read_text(encoding="utf-8")
    body = src[src.index("export const RECORDS"):]
    entries = []
    for block in re.findall(r"\{(.*?)\n  \}", body, re.S):
        if re.search(r"vacant:\s*true", block):
            entries.append(None)
            continue
        field = lambda k: (re.search(rf"{k}: '(.*?)',", block, re.S) or [None, ""])[1]
        entries.append({"name": field("name"), "stack": field("stack"), "status": field("status")})
    return entries


def tracked(draw, xy, text, fnt, fill, tracking=0.0, anchor_right=False):
    """Letter-spacing, which the page has everywhere and PIL has nowhere."""
    extra = fnt.size * tracking
    width = sum(fnt.getlength(c) + extra for c in text) - extra
    x, y = xy
    if anchor_right:
        x -= width
    for char in text:
        draw.text((x, y), char, font=fnt, fill=fill)
        x += fnt.getlength(char) + extra
    return width


def ticks(draw, box, arm=26, color=LAND, w=2):
    """The HUD frame: corners instead of borders, so the edges stay open."""
    left, top, right, bottom = box
    for x, dx in ((left, 1), (right, -1)):
        for y, dy in ((top, 1), (bottom, -1)):
            draw.line([(x, y), (x + dx * arm, y)], fill=color, width=w)
            draw.line([(x, y), (x, y + dy * arm)], fill=color, width=w)


def glass(card):
    """Scanlines and vignette, applied last so they sit over everything."""
    scan = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(scan)
    for y in range(0, H, 3):
        sd.line([(0, y), (W, y)], fill=(255, 255, 255, 13))
    card.alpha_composite(scan)

    # Radial falloff, built once as a small mask and stretched — a per-pixel
    # loop at this size is slower than the blur it would replace.
    small = Image.new("L", (W // 8, H // 8), 255)
    ImageDraw.Draw(small).ellipse(
        (-W // 16, -H // 22, W // 8 + W // 16, H // 8 + H // 22), fill=0
    )
    mask = small.filter(ImageFilter.GaussianBlur(14)).resize((W, H), Image.BICUBIC)
    card.paste(Image.new("RGBA", (W, H), (0, 0, 0, 158)), (0, 0), mask)


def build():
    card = Image.new("RGBA", (W, H), VOID)
    draw = ImageDraw.Draw(card)

    mark = font(600, 92)
    label = font(500, 19)
    name = font(600, 30)
    meta = font(400, 19)

    # ── Wordmark. The only white on the card, and it blooms. ────────────────
    bloom = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    tracked(ImageDraw.Draw(bloom), (MARGIN + 34, 118), "OIKOS", mark, (255, 255, 255, 90), 0.22)
    card.alpha_composite(bloom.filter(ImageFilter.GaussianBlur(18)))
    width = tracked(draw, (MARGIN + 34, 118), "OIKOS", mark, STRIKE, 0.22)
    tracked(draw, (MARGIN + 34 + width + 26, 176), "// INDEX", label, DIM, 0.14)

    draw.line([(MARGIN + 34, 250), (W - MARGIN - 34, 250)], fill=LINE, width=1)

    # ── Stations ────────────────────────────────────────────────────────────
    # The band between the rules is fixed, so the catalogue sets the pitch
    # rather than the other way round: rows tighten as stations are added, and
    # past four the card stops listing and lets the tally speak for the rest.
    entries = records()
    top, bottom = 262, H - 168
    shown = entries[:4]
    pitch = min(84, (bottom - top) // max(len(shown), 1))
    y = top + ((bottom - top) - pitch * len(shown)) // 2 + 6

    # A row carrying its stack line stands 76px tall. Once the pitch drops
    # under that the rows would print through each other, so the card gives up
    # the stacks rather than the legibility and lists names alone.
    stacks = pitch >= 76

    for i, station in enumerate(shown):
        tag = f"{i + 1:02d}"
        if station is None:
            tracked(draw, (MARGIN + 34, y + 6), tag, label, LINE, 0.14)
            tracked(draw, (MARGIN + 108, y + 6), "UNASSIGNED", label, LINE, 0.14)
            y += pitch
            continue

        tracked(draw, (MARGIN + 34, y + 8), tag, label, LAND, 0.14)
        tracked(draw, (MARGIN + 108, y), station["name"], name, TEXT, 0.22)
        if stacks:
            tracked(draw, (MARGIN + 108, y + 44), station["stack"], meta, DIM, 0.02)

        # The indicator says what kind of thing this is: filled for on air,
        # hollow for on the way, square for what runs on your own machine.
        cx, cy, r = W - MARGIN - 40, y + 15, 6
        dot = (cx - r, cy - r, cx + r, cy + r)
        if station["status"] == "live":
            draw.ellipse(dot, fill=TEXT)
        elif station["status"] == "building":
            draw.ellipse(dot, outline=LAND, width=2)
        else:
            draw.rectangle(dot, fill=LAND)
        tracked(draw, (cx - 22, y + 6), station["status"].upper(), label, DIM, 0.14, anchor_right=True)
        y += pitch

    # ── Foot ────────────────────────────────────────────────────────────────
    live = sum(1 for s in entries if s and s["status"] == "live")
    total = len(entries)
    draw.line([(MARGIN + 34, H - 152), (W - MARGIN - 34, H - 152)], fill=LINE, width=1)
    tracked(draw, (MARGIN + 34, H - 128), "CORVARDT.COM", label, TEXT, 0.14)
    tally = f"{total} {'CHANNEL' if total == 1 else 'CHANNELS'} · {live} LIVE"
    tracked(draw, (W - MARGIN - 34, H - 128), tally, label, DIM, 0.14, anchor_right=True)

    ticks(draw, (MARGIN, MARGIN, W - MARGIN, H - MARGIN))
    glass(card)

    out = ROOT / "og.png"
    card.convert("RGB").save(out, optimize=True)
    print(f"{out.name} — {total} channels, {live} live, {out.stat().st_size // 1024}KB")


if __name__ == "__main__":
    build()
