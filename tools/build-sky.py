import numpy as np
from PIL import Image, ImageFilter

W,H = 2560,1600
rng = np.random.default_rng(9)

def octave(w,h,cells):
    """Value noise: random lattice, smoothly upscaled."""
    g = rng.random((cells+2, int(cells*w/h)+2)).astype(np.float32)
    im = Image.fromarray((g*255).astype(np.uint8)).resize((w,h), Image.BICUBIC)
    return np.asarray(im, dtype=np.float32)/255.0

def fbm(w,h,base=4,oct_n=6):
    out = np.zeros((h,w), np.float32); amp=1.0; tot=0.0; c=base
    for _ in range(oct_n):
        out += amp*octave(w,h,c); tot += amp; amp*=0.52; c=int(c*2.1)
    return out/tot

yy,xx = np.mgrid[0:H,0:W].astype(np.float32)
X, Y = xx/W, yy/H

n1 = fbm(W,H,4,6)          # big cloud structure
n2 = fbm(W,H,11,5)         # finer wisps
cloud = np.clip(n1*0.72 + n2*0.38, 0, 1)
cloud = (cloud - cloud.min())/(cloud.max()-cloud.min())

def blob(cx,cy,rx,ry,power=1.0):
    d = ((X-cx)/rx)**2 + ((Y-cy)/ry)**2
    return np.clip(1.0-d, 0, 1)**power

# The reference read as regions, in the order they carry the frame.
REGIONS = [
  # cx,   cy,   rx,   ry,   colour            gain
  (0.14, 0.20, 0.34, 0.34, (196, 30, 42),     1.30),   # crimson, upper left
  (0.30, 0.26, 0.24, 0.24, (232, 69, 47),     1.05),
  (0.50, 0.22, 0.22, 0.22, (255,140, 34),     1.35),   # amber core
  (0.545,0.215,0.085,0.085,(255,226,150),     1.55),   # the hot centre
  (0.76, 0.19, 0.27, 0.27, ( 30,198,198),     1.20),   # cyan, upper right
  (0.93, 0.42, 0.24, 0.30, ( 32,124,214),     1.10),   # blue, right edge
  (0.70, 0.74, 0.26, 0.26, (154, 46,184),     0.80),   # magenta, lower right
  (0.20, 0.72, 0.28, 0.28, ( 98, 42,154),     0.72),   # violet, lower left
  (0.45, 0.55, 0.26, 0.20, (226, 72, 58),     0.42),   # ember through the middle
  (0.88, 0.80, 0.20, 0.20, ( 40,170,190),     0.55),   # teal, lower right corner
]

rgb = np.zeros((H,W,3), np.float32)
# The ground is never pure black in the reference — it is deep navy.
rgb += np.array([7,6,26], np.float32)

for cx,cy,rx,ry,col,gain in REGIONS:
    m = blob(cx,cy,rx,ry,1.5) * cloud * gain
    rgb += m[...,None] * np.array(col, np.float32)

# Cloud density itself lifts the ground slightly, so nothing reads as a hole.
rgb += (cloud**2.4)[...,None] * np.array([26,20,54], np.float32)

rgb = np.clip(rgb, 0, 255)
# Lift saturation — the reference is vivid, not tinted.
lum = rgb.mean(axis=2, keepdims=True)
rgb = np.clip(lum + (rgb-lum)*1.30, 0, 255)

im = Image.fromarray(rgb.astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
im.save('nebula.jpg', quality=88, optimize=True, progressive=True)
print('nebula.jpg', im.size)
import os; print(os.path.getsize('nebula.jpg')//1024, 'KB')
