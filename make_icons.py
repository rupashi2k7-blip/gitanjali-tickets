import os
from PIL import Image, ImageDraw, ImageFont

SIZES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
BASE = 192
SS = 4  # supersample

W = BASE * SS
img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# rounded-square background with vertical maroon gradient
grad = Image.new("RGB", (1, W))
for y in range(W):
    t = y / (W - 1)
    r = int(0x8e + (0x4a - 0x8e) * t)
    g = int(0x1b + (0x0d - 0x1b) * t)
    b = int(0x2b + (0x16 - 0x2b) * t)
    grad.putpixel((0, y), (r, g, b))
grad = grad.resize((W, W))

mask = Image.new("L", (W, W), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, W - 1, W - 1], radius=int(W * 0.22), fill=255)
img.paste(grad, (0, 0), mask)

d = ImageDraw.Draw(img)

# film strip perforations along top and bottom
perf_h = int(W * 0.085)
for i in range(7):
    x0 = int(W * 0.055) + i * int(W * 0.135)
    w = int(W * 0.075)
    for y0 in (int(W * 0.045), W - int(W * 0.045) - perf_h):
        d.rounded_rectangle([x0, y0, x0 + w, y0 + perf_h], radius=int(perf_h * 0.3),
                            fill=(232, 180, 74, 210))

# centre "G" glyph
font = None
for path in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
             "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
    if os.path.exists(path):
        font = ImageFont.truetype(path, int(W * 0.52))
        break
if font is None:
    font = ImageFont.load_default()

txt = "G"
bbox = d.textbbox((0, 0), txt, font=font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
d.text(((W - tw) / 2 - bbox[0], (W - th) / 2 - bbox[1] + int(W * 0.005)),
       txt, font=font, fill=(244, 238, 242, 255))

out_root = "/scratch/work/app/res"
for dens, px in SIZES.items():
    folder = os.path.join(out_root, "mipmap-" + dens)
    os.makedirs(folder, exist_ok=True)
    img.resize((px, px), Image.LANCZOS).save(os.path.join(folder, "ic_launcher.png"))
    print("wrote", folder)
