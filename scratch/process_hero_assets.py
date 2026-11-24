import os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

UPLOAD_DIR = r"C:/Users/ekans/.gemini/antigravity/brain/0e818db3-6fde-445a-a773-a27ca82aee92/.user_uploaded"
OUT_DIR = r"c:/Users/ekans/new-portfolio/assets/shared"
os.makedirs(OUT_DIR, exist_ok=True)

FILES = {
    "sky": os.path.join(UPLOAD_DIR, "media_1795541360249_20998917.jpg"),
    "distant": os.path.join(UPLOAD_DIR, "media_1795541409080_b7f81b58.jpg"),
    "dominant": os.path.join(UPLOAD_DIR, "media_1795541443058_ab39f814.jpg"),
    "closest": os.path.join(UPLOAD_DIR, "media_1795541516150_0e09d36a.jpg"),
    "portrait": os.path.join(UPLOAD_DIR, "media_1795541902486_d3ff9a0f.jpg"),
}

for k, p in FILES.items():
    im = Image.open(p)
    print(k, im.size, im.mode)


def grade_cool_monochrome(rgb_arr, contrast=1.0, brightness=0.0, tint=(0.94, 0.96, 0.99)):
    """Convert RGB float [0..1] to unified cool slate/graphite/snow monochrome."""
    lum = 0.299 * rgb_arr[..., 0] + 0.587 * rgb_arr[..., 1] + 0.114 * rgb_arr[..., 2]
    # Apply contrast around 0.5
    lum = (lum - 0.5) * contrast + 0.5 + brightness
    lum = np.clip(lum, 0.0, 1.0)
    out = np.stack([lum * tint[0], lum * tint[1], lum * tint[2]], axis=-1)
    return np.clip(out, 0.0, 1.0)


def remove_corner_watermark(arr, box_h=90, box_w=90):
    """Replace bottom-right watermark region with smooth vertical/horizontal neighbor blend."""
    h, w, _ = arr.shape
    y0 = max(0, h - box_h)
    x0 = max(0, w - box_w)
    patch = arr[y0 - 20:y0, x0:w].mean(axis=0, keepdims=True)
    arr[y0:h, x0:w] = patch
    return arr


def flood_sky_mask(rgb_arr, sky_threshold=0.78, color_diff_tol=0.09):
    """
    Create alpha mask where connected sky from top edge is transparent (0)
    and mountain is opaque (1), with smooth edge feathering.
    """
    h, w, _ = rgb_arr.shape
    lum = 0.299 * rgb_arr[..., 0] + 0.587 * rgb_arr[..., 1] + 0.114 * rgb_arr[..., 2]
    # Sample sky color from top 10 rows
    sky_sample = rgb_arr[:10, :, :].mean(axis=(0, 1))
    dist = np.linalg.norm(rgb_arr - sky_sample, axis=-1)

    is_sky_candidate = (lum > sky_threshold) | (dist < color_diff_tol)

    # Seed from top row + upper left/right margins
    seed = np.zeros((h, w), dtype=bool)
    seed[0, :] = is_sky_candidate[0, :]
    seed[:int(h * 0.35), 0] = is_sky_candidate[:int(h * 0.35), 0]
    seed[:int(h * 0.35), -1] = is_sky_candidate[:int(h * 0.35), -1]

    # Connected component propagation inside candidate mask
    sky = ndimage.binary_propagation(seed, mask=is_sky_candidate)
    # Close tiny pinholes in sky
    sky = ndimage.binary_closing(sky, iterations=1)

    alpha = (~sky).astype(np.float32)

    # Soften alpha edge slightly (1.5px gaussian) to eliminate jagged cutout
    alpha_img = Image.fromarray((alpha * 255).astype(np.uint8), mode="L").filter(ImageFilter.GaussianBlur(1.2))
    alpha = np.asarray(alpha_img, dtype=np.float32) / 255.0
    # Slight shrink/tighten on outer halo
    alpha = np.clip((alpha - 0.12) / 0.88, 0.0, 1.0)
    return alpha


def save_webp(rgba_arr, name, max_w=1920, quality=84):
    im = Image.fromarray((np.clip(rgba_arr, 0, 1) * 255).astype(np.uint8), mode="RGBA")
    if im.width > max_w:
        nh = int(im.height * (max_w / im.width))
        im = im.resize((max_w, nh), Image.Resampling.LANCZOS)
    out_path = os.path.join(OUT_DIR, f"{name}.webp")
    im.save(out_path, "WEBP", quality=quality, method=6)
    print(f"Saved {out_path} ({im.size}, {os.path.getsize(out_path)//1024} KB)")


# 1. Sky (deep moody slate overcast)
sky_im = Image.open(FILES["sky"]).convert("RGB")
sky_arr = np.asarray(sky_im, dtype=np.float32) / 255.0
sky_arr = remove_corner_watermark(sky_arr, 110, 110)
sky_graded = grade_cool_monochrome(sky_arr, contrast=1.15, brightness=-0.56, tint=(0.82, 0.88, 0.94))
sky_rgba = np.dstack([sky_graded, np.ones(sky_graded.shape[:2], dtype=np.float32)])
save_webp(sky_rgba, "sky", max_w=1920, quality=82)

# 2. Distant ridge (dark atmospheric slate)
dist_im = Image.open(FILES["distant"]).convert("RGB")
dist_arr = np.asarray(dist_im, dtype=np.float32) / 255.0
dist_arr = remove_corner_watermark(dist_arr, 110, 110)
dist_alpha = flood_sky_mask(dist_arr, sky_threshold=0.84, color_diff_tol=0.055)
h, w = dist_alpha.shape
# Distant ridge is entirely below 48% height on the outer edges; clear upper sky
dist_alpha[:int(h * 0.48), :] = 0.0
dist_alpha[:int(h * 0.62), :int(w * 0.12)] = 0.0
fade_b = np.linspace(1.0, 0.0, int(h * 0.12))[:, None]
dist_alpha[h - fade_b.shape[0]:, :] *= fade_b
dist_graded = grade_cool_monochrome(dist_arr, contrast=0.95, brightness=-0.36, tint=(0.84, 0.90, 0.96))
save_webp(np.dstack([dist_graded, dist_alpha]), "distant", max_w=1920, quality=84)

# 3. Dominant peak (darker moody graphite & snow)
dom_im = Image.open(FILES["dominant"]).convert("RGB")
dom_arr = np.asarray(dom_im, dtype=np.float32) / 255.0
dom_alpha = flood_sky_mask(dom_arr, sky_threshold=0.86, color_diff_tol=0.065)
h, w = dom_alpha.shape
fade_b = np.linspace(1.0, 0.0, int(h * 0.14))[:, None]
dom_alpha[h - fade_b.shape[0]:, :] *= fade_b
dom_graded = grade_cool_monochrome(dom_arr, contrast=1.18, brightness=-0.28, tint=(0.88, 0.92, 0.97))
save_webp(np.dstack([dom_graded, dom_alpha]), "dominant", max_w=1920, quality=85)

# 4. Closest rocky ridge (deep charcoal & crisp snow)
cls_im = Image.open(FILES["closest"]).convert("RGB")
cls_arr = np.asarray(cls_im, dtype=np.float32) / 255.0
cls_alpha = flood_sky_mask(cls_arr, sky_threshold=0.84, color_diff_tol=0.07)
cls_graded = grade_cool_monochrome(cls_arr, contrast=1.22, brightness=-0.22, tint=(0.88, 0.91, 0.95))
save_webp(np.dstack([cls_graded, cls_alpha]), "closest", max_w=1920, quality=85)

# 5. Procedural soft mist layer (cool slate mist)
rng = np.random.default_rng(42)
mw, mh = 1600, 600
noise = rng.normal(0.5, 0.35, (mh // 16, mw // 16)).astype(np.float32)
noise_im = Image.fromarray(np.clip(noise * 255, 0, 255).astype(np.uint8), mode="L").resize((mw, mh), Image.Resampling.BICUBIC)
noise_im = noise_im.filter(ImageFilter.GaussianBlur(42))
m_alpha = np.asarray(noise_im, dtype=np.float32) / 255.0
# Vertical envelope: fade to 0 at top and bottom
vy = np.sin(np.linspace(0, np.pi, mh))[:, None] ** 1.4
vx = np.sin(np.linspace(0, np.pi, mw))[None, :] ** 0.5
m_alpha = np.clip((m_alpha - 0.25) * 1.35, 0.0, 0.58) * vy * vx
mist_rgb = np.ones((mh, mw, 3), dtype=np.float32)
mist_rgb[..., 0] = 0.68
mist_rgb[..., 1] = 0.74
mist_rgb[..., 2] = 0.78
save_webp(np.dstack([mist_rgb, m_alpha]), "mist", max_w=1600, quality=80)
