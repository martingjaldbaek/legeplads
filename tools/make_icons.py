"""Generate the app icons (icons/icon-180/192/512.png) with numpy only. Run: python3 tools/make_icons.py"""
import os, zlib, struct, numpy as np

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'icons')

def hex2rgb(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255

def render(size, ss=4):
    n = size * ss
    y, x = np.mgrid[0:n, 0:n].astype(np.float32) / n
    # warm vertical gradient background
    t = y[..., None]
    img = hex2rgb('#ffe9a8') * (1 - t) + hex2rgb('#ff9ec4') * t
    # bubbles: (cx, cy, r, colour)
    for cx, cy, r, col in [(.36, .60, .25, '#3a86ff'), (.68, .36, .18, '#06d6a0'), (.70, .74, .12, '#ff3b6b')]:
        d = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        inside = (d < r)[..., None]
        shade = np.clip(1 - 0.35 * (d / r) ** 2, 0, 1)[..., None]
        img = np.where(inside, hex2rgb(col) * (0.75 + 0.25 * shade), img)
        hd = np.sqrt(((x - (cx - r * .38)) / 1.6) ** 2 + (y - (cy - r * .42)) ** 2)
        img = np.where((inside & (hd < r * .16)[..., None]), np.ones(3, np.float32), img)
    img = img.reshape(size, ss, size, ss, 3).mean((1, 3))
    return (np.clip(img, 0, 1) * 255).astype(np.uint8)

def write_png(path, rgb):
    h, w, _ = rgb.shape
    raw = b''.join(b'\x00' + rgb[i].tobytes() for i in range(h))
    def chunk(tag, data): return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
                + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))

os.makedirs(OUT, exist_ok=True)
for s in (180, 192, 512):
    write_png(os.path.join(OUT, f'icon-{s}.png'), render(s))
print('icons written to', os.path.normpath(OUT))
