import glob
import os
from PIL import Image, ImageDraw

cards_dir = 'public/images/cards'
files = sorted(glob.glob(os.path.join(cards_dir, '*')))

print(f"Processing {len(files)} card images for clean card-only cropping & transparent corners...")

for f in files:
    filename = os.path.basename(f)
    base, ext = os.path.splitext(filename)
    
    im = Image.open(f)
    w, h = im.size

    # If it is already a standalone card around 500x317
    if w < 600 and h < 400:
        print(f"  [ALREADY CARD] {filename} ({w}x{h}) - adding smooth rounded mask if needed")
        card_im = im.convert('RGBA')
    else:
        # Standard CardInsider template size ~844x565 or 855x564
        # Calculate proportional crop
        left = int(w * (170 / 844.0))
        top = int(h * (115 / 565.0))
        right = int(w * (678 / 844.0))
        bottom = int(h * (435 / 565.0))
        card_im = im.crop((left, top, right, bottom)).convert('RGBA')

    cw, ch = card_im.size

    # Create smooth antialiased rounded corner mask
    # 4x supersampled mask for ultra-smooth corners
    scale = 4
    mask = Image.new('L', (cw * scale, ch * scale), 0)
    draw = ImageDraw.Draw(mask)
    corner_radius = int(22 * scale)
    draw.rounded_rectangle((0, 0, cw * scale - 1, ch * scale - 1), radius=corner_radius, fill=255)
    mask = mask.resize((cw, ch), Image.Resampling.LANCZOS)

    card_im.putalpha(mask)

    # Save as high-quality WebP with alpha transparency
    out_name = f"{base}.webp"
    out_path = os.path.join(cards_dir, out_name)
    
    # If old file was .jpg or .png and different from out_name, remove old
    if f != out_path and os.path.exists(f):
        os.remove(f)

    card_im.save(out_path, 'WEBP', quality=95)
    print(f"  [SAVED] {out_name}: {cw}x{ch} px")

print("All card images processed successfully!")
