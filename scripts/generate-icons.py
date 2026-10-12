"""Export the approved botanical H artwork. Requires Python and Pillow."""

from math import ceil, hypot
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "design/app-icon/source.png"
PUBLIC = ROOT / "public"
REGULAR_MARK_RATIO = 0.72
# Leave clearance inside the manifest's guaranteed 40% radius safe circle.
MASKABLE_RADIUS_RATIO = 0.38
BACKGROUND = (20, 32, 25)


def mark_mask(image):
    # The approved light green mark is distinct from its dark forest background.
    mask = Image.new("L", image.size)
    pixels = image.load()
    mask_pixels = mask.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, _ = pixels[x, y]
            if red > 65 and green > 85 and green > red * 1.14:
                mask_pixels[x, y] = 255
    return mask


def framed(image, center, edge):
    # Retain the approved artwork; change only its scale and surrounding space.
    canvas = Image.new("RGB", (edge, edge), BACKGROUND)
    offset = (round(edge / 2 - center[0]), round(edge / 2 - center[1]))
    canvas.paste(image, offset)
    return canvas


def export_png(image, name, size):
    target = image.resize((size, size), Image.Resampling.LANCZOS)
    target.save(PUBLIC / name, optimize=True)


def main():
    with Image.open(SOURCE) as source:
        image = source.convert("RGB")
    if image.width != image.height:
        raise ValueError("The approved source must be square.")
    # Make added padding seamless with the generated source's subtly varying
    # dark background. Preserve the mark and its visible antialiased edges.
    colors = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, _ = colors[x, y]
            if red < 45 and green <= 40:
                colors[x, y] = BACKGROUND
    mask = mark_mask(image)
    bounds = mask.getbbox()
    if bounds is None:
        raise ValueError("No light green mark found in the source.")
    left, top, right, bottom = bounds
    center = ((left + right) / 2, (top + bottom) / 2)
    mark_size = max(right - left, bottom - top)
    pixels = mask.load()
    radius = max(
        hypot(x + 0.5 - center[0], y + 0.5 - center[1])
        for y in range(top, bottom)
        for x in range(left, right)
        if pixels[x, y]
    )
    regular = framed(image, center, ceil(mark_size / REGULAR_MARK_RATIO))
    maskable = framed(image, center, ceil(radius / MASKABLE_RADIUS_RATIO))
    PUBLIC.mkdir(exist_ok=True)
    for size in (192, 512):
        export_png(regular, f"pwa-{size}x{size}.png", size)
        export_png(maskable, f"pwa-maskable-{size}x{size}.png", size)
    export_png(regular, "apple-touch-icon.png", 180)
    for size in (16, 32):
        export_png(regular, f"favicon-{size}x{size}.png", size)
    regular.resize((48, 48), Image.Resampling.LANCZOS).save(
        PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)]
    )
    print(f"Regular/iOS mark: {mark_size / regular.width:.1%} of canvas")
    print(f"Maskable mark radius: {radius / maskable.width:.1%} of canvas")


if __name__ == "__main__":
    main()
