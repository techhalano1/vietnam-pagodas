"""Generate app icon / splash / adaptive-icon assets: a lotus on Buddha-gold.

Run: python3 scripts/gen-assets.py   (requires Pillow)
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent.parent / "assets"
GOLD = (212, 160, 23)
GOLD_DARK = (184, 134, 11)
GOLD_LIGHT = (252, 211, 77)
CREAM = (255, 253, 247)
BROWN = (43, 29, 14)
LOTUS = (194, 65, 12)


def gradient(size: int, top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        t = y / max(size - 1, 1)
        c = tuple(round(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        for x in range(size):
            px[x, y] = c
    return img


def petal(draw: ImageDraw.ImageDraw, cx: float, cy: float, length: float, width: float,
          angle_deg: float, fill, scale: int, outline=None, outline_w: int = 0) -> None:
    """Draw a lotus petal (rounded base, pointed tip) from (cx, cy) along angle."""
    a = math.radians(angle_deg)
    steps = 60

    def half_width(t: float) -> float:
        # widest at ~40% of the length, tapering to a fine point
        return width * 2.2 * (t ** 0.55) * ((1 - t) ** 0.85)

    pts = [(t / steps * length, half_width(t / steps)) for t in range(steps + 1)]
    pts += [(t / steps * length, -half_width(t / steps)) for t in range(steps, -1, -1)]
    poly = []
    for x, y in pts:
        rx = cx + (x * math.cos(a) - y * math.sin(a))
        ry = cy + (x * math.sin(a) + y * math.cos(a))
        poly.append((rx * scale, ry * scale))
    draw.polygon(poly, fill=fill, outline=outline, width=outline_w)


def lotus(size: int, fg, fg_inner, base_y: float = 0.62, span: float = 0.36,
          gap=(0, 0, 0, 0)) -> Image.Image:
    """Lotus flower silhouette as RGBA layer of `size`.

    `gap` is the colour drawn as a thin outline between petals (use the background
    colour, or transparent to punch a gap).
    """
    s = 4  # supersample
    layer = Image.new("RGBA", (size * s, size * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy = size / 2, size * base_y
    L = size * span
    ow = max(1, int(size * 0.006 * s))
    # outer petals (drawn back to front)
    for ang, k in ((-160, 0.62), (-20, 0.62), (-138, 0.80), (-42, 0.80)):
        petal(d, cx, cy, L * k, L * 0.22, ang, fg, s, gap, ow)
    # inner petals
    for ang, k in ((-115, 0.92), (-65, 0.92)):
        petal(d, cx, cy, L * k, L * 0.24, ang, fg_inner, s, gap, ow)
    petal(d, cx, cy, L * 1.0, L * 0.25, -90, fg_inner, s, gap, ow)
    # base leaf: shallow arc under the flower
    bw, bh = L * 0.62, L * 0.16
    d.chord(
        [(cx - bw) * s, (cy - bh * 0.25) * s, (cx + bw) * s, (cy + bh * 1.4) * s],
        start=0, end=180, fill=fg, outline=gap, width=ow,
    )
    return layer.resize((size, size), Image.LANCZOS)


def with_shadow(base: Image.Image, layer: Image.Image, offset: int, blur: int, alpha: int) -> Image.Image:
    shadow = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    a = layer.split()[3].point(lambda v: v * alpha // 255)
    shadow.putalpha(a)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    out = base.convert("RGBA")
    out.alpha_composite(shadow, (0, offset))
    out.alpha_composite(layer)
    return out


def icon(size: int = 1024) -> Image.Image:
    bg = gradient(size, GOLD_LIGHT, GOLD_DARK)
    # soft radial highlight
    glow = Image.new("L", (size, size), 0)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([size * 0.15, size * 0.05, size * 0.85, size * 0.75], fill=90)
    glow = glow.filter(ImageFilter.GaussianBlur(size // 8))
    bg = Image.composite(Image.new("RGB", (size, size), CREAM), bg, glow)
    flower = lotus(size, (255, 246, 214), (255, 255, 255), gap=(0, 0, 0, 0))
    return with_shadow(bg, flower, size // 40, size // 30, 110).convert("RGB")


def adaptive_foreground(size: int = 1024) -> Image.Image:
    # Safe zone: central 66%; keep artwork within ~60%.
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    flower = lotus(size, (255, 246, 214), (255, 255, 255), base_y=0.60, span=0.26)
    return with_shadow(layer, flower, size // 50, size // 40, 100)


def adaptive_background(size: int = 1024) -> Image.Image:
    return gradient(size, GOLD_LIGHT, GOLD_DARK)


def monochrome(size: int = 1024) -> Image.Image:
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    flower = lotus(size, (255, 255, 255), (255, 255, 255), base_y=0.60, span=0.26)
    layer.alpha_composite(flower)
    return layer


def splash_icon(size: int = 1024, fg=BROWN, inner=LOTUS) -> Image.Image:
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    flower = lotus(size, fg, inner, base_y=0.62, span=0.40, gap=(0, 0, 0, 0))
    layer.alpha_composite(flower)
    return layer


def favicon(size: int = 64) -> Image.Image:
    return icon(256).resize((size, size), Image.LANCZOS)


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    icon().save(OUT / "icon.png")
    adaptive_foreground().save(OUT / "android-icon-foreground.png")
    adaptive_background().save(OUT / "android-icon-background.png")
    monochrome().save(OUT / "android-icon-monochrome.png")
    splash_icon().save(OUT / "splash-icon.png")
    splash_icon(fg=GOLD_LIGHT, inner=CREAM).save(OUT / "splash-icon-dark.png")
    favicon().save(OUT / "favicon.png")
    print("assets written to", OUT)
