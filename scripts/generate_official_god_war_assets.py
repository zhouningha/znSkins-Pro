"""
Generate Skins Pro God of War theme assets from official game artwork crops.

Place source images in skins-pro/god_war_wall/:
  - source-kratos-wallpaper.jpg  (required, GOW III key art / wallpaper)

Optional extra sources (used when present):
  - source-poster.jpg
  - source-screenshot-*.jpg
"""

from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

OUT = Path(__file__).resolve().parent / "skins-pro" / "god_war_wall"
PRIMARY = OUT / "source-kratos-wallpaper.jpg"

ROOM_SIZE = (1400, 820)
ICON_SIZE = 512
DECOR_SIZE = 900
AVATAR_SIZE = 512
BG_SIZE = (2560, 1440)

# Crop boxes on the 1920x1080 primary wallpaper (left, top, right, bottom)
ROOM_CROPS = {
    "room-living.jpg": (40, 160, 1180, 1020),      # Titan hand + temple
    "room-bedroom.jpg": (1480, 180, 1920, 980),    # Dark cliff / smoke
    "room-kitchen.jpg": (1180, 420, 1920, 1020),   # Kratos + flaming blade
    "room-garden.jpg": (0, 0, 1080, 520),          # Helios chariot sky
    "room-dining.jpg": (260, 420, 1180, 1020),    # Greek rooftops
    "room-garage.jpg": (80, 60, 820, 720),         # Titan fingers close-up
    "room-office.jpg": (1020, 100, 1920, 900),     # Kratos back + blade
}

ICON_CROPS = {
    "icon-light.png": (1540, 480, 1780, 720),
    "icon-switch.png": (360, 280, 600, 520),
    "icon-button.png": (900, 520, 1140, 760),
    "icon-ac.png": (0, 0, 240, 240),
    "icon-water_heater.png": (300, 200, 540, 440),
    "icon-humidifier.png": (60, 300, 300, 540),
    "icon-fan.png": (200, 0, 440, 240),
    "icon-speaker.png": (1540, 480, 1780, 720),
    "icon-media_player.png": (1300, 380, 1540, 620),
    "icon-remote.png": (1180, 300, 1420, 540),
    "icon-lock.png": (500, 120, 740, 360),
    "icon-camera.png": (0, 80, 240, 320),
    "icon-cover.png": (700, 500, 940, 740),
    "icon-valve.png": (420, 360, 660, 600),
    "icon-automation.png": (180, 80, 420, 320),
    "icon-sensor.png": (1000, 0, 1240, 240),
    "icon-binary_sensor.png": (320, 100, 560, 340),
    "icon-update.png": (760, 60, 1000, 300),
    "icon-device_tracker.png": (1080, 180, 1320, 420),
    "icon-person.png": (1280, 100, 1720, 620),
    "icon-vacuum.png": (860, 600, 1100, 840),
}


def load_primary() -> Image.Image:
    if not PRIMARY.exists():
        raise FileNotFoundError(f"Missing required source: {PRIMARY}")
    return Image.open(PRIMARY).convert("RGB")


def cover_crop(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(img, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def darken(img: Image.Image, amount: float = 0.28) -> Image.Image:
    overlay = Image.new("RGBA", img.size, (0, 0, 0, int(255 * amount)))
    base = img.convert("RGBA")
    return Image.alpha_composite(base, overlay).convert("RGB")


def warm_grade(img: Image.Image) -> Image.Image:
    img = ImageEnhance.Contrast(img).enhance(1.06)
    img = ImageEnhance.Color(img).enhance(1.08)
    return img


def vignette(img: Image.Image, strength: float = 0.35) -> Image.Image:
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    px = mask.load()
    cx, cy = w / 2, h / 2
    max_r = (cx * cx + cy * cy) ** 0.5
    for y in range(h):
        for x in range(w):
            dx, dy = x - cx, y - cy
            dist = (dx * dx + dy * dy) ** 0.5 / max_r
            px[x, y] = int(max(0, min(255, dist * strength * 255)))
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    overlay.putalpha(mask.filter(ImageFilter.GaussianBlur(18)))
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def make_background(src: Image.Image) -> Image.Image:
    bg = cover_crop(src, BG_SIZE)
    bg = warm_grade(bg)
    return darken(bg, 0.36)


def make_base_texture(src: Image.Image) -> Image.Image:
    tex = cover_crop(src, (1600, 1600))
    tex = tex.filter(ImageFilter.GaussianBlur(28))
    tex = ImageEnhance.Brightness(tex).enhance(0.45)
    return tex


def make_decoration(src: Image.Image) -> Image.Image:
    crop = src.crop((980, 120, 1880, 1020))
    crop = crop.resize((DECOR_SIZE, DECOR_SIZE), Image.Resampling.LANCZOS)
    crop = warm_grade(crop)
    return vignette(crop, 0.42)


def make_avatar(src: Image.Image) -> Image.Image:
    crop = src.crop((1280, 100, 1720, 620))
    side = min(crop.size)
    left = (crop.width - side) // 2
    top = (crop.height - side) // 2
    crop = crop.crop((left, top, left + side, top + side))
    crop = crop.resize((AVATAR_SIZE, AVATAR_SIZE), Image.Resampling.LANCZOS)
    crop = warm_grade(crop)
    return darken(crop, 0.12)


def make_room(src: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    crop = src.crop(box)
    crop = cover_crop(crop, ROOM_SIZE)
    crop = warm_grade(crop)
    crop = darken(crop, 0.18)
    return vignette(crop, 0.28)


def make_icon(src: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    crop = src.crop(box)
    crop = ImageOps.fit(crop, (ICON_SIZE, ICON_SIZE), method=Image.Resampling.LANCZOS)
    crop = warm_grade(crop)

    mask = Image.new("L", (ICON_SIZE, ICON_SIZE), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((36, 36, ICON_SIZE - 36, ICON_SIZE - 36), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(2))

    framed = Image.new("RGBA", (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    framed.paste(crop, (0, 0), mask)

    border = Image.new("RGBA", (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    bd = ImageDraw.Draw(border)
    bd.ellipse((30, 30, ICON_SIZE - 30, ICON_SIZE - 30), outline=(198, 129, 54, 210), width=6)
    bd.ellipse((42, 42, ICON_SIZE - 42, ICON_SIZE - 42), outline=(255, 255, 255, 42), width=2)

    return Image.alpha_composite(framed, border)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    src = load_primary()

    make_background(src).save(OUT / "background.jpg", quality=93)
    make_base_texture(src).save(OUT / "base-texture.jpg", quality=90)
    make_decoration(src).save(OUT / "decoration.png")
    make_avatar(src).save(OUT / "avatar.png")

    for filename, box in ROOM_CROPS.items():
        make_room(src, box).save(OUT / filename, quality=92)

    for filename, box in ICON_CROPS.items():
        make_icon(src, box).save(OUT / filename)

    # Keep reference crops for manual comparison
    make_decoration(src).save(OUT / "decoration-kratos-tight.png")
    src.crop((760, 0, 1920, 1080)).resize((900, 900), Image.Resampling.LANCZOS).save(
        OUT / "decoration-kratos-scene.png"
    )

    print(f"Official assets generated in {OUT}")


if __name__ == "__main__":
    main()
