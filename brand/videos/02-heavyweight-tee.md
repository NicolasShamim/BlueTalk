# Video 02 — Heavyweight Tee · *Made for a place that closed*

**Copy-paste prompts. Nothing here needs editing or assembling.**

---

## How this works

Kling takes **one prompt per generation**. There is no way to hand it a document.
This video is **18 generations**:

1. **Nine stills.** Kling's image tool. Attach `character/neutral.png` (and
   `grin.png`) in the character/subject **reference** slot — not in the prompt text —
   so his face survives across shots. Paste **block A** for the shot.
2. **Nine animations.** Kling's image-to-video tool. Upload the still you just made,
   paste **block B**, set the length to **5 seconds**.
3. Download each as `01.mp4` … `09.mp4` into `video/clips/`, push.

Shot 09 needs no generation at all — the build makes it.

Feature names move between Kling versions; look for the reference-image / subject
slot in the image tool, whatever it is called this month.

**When a shot comes out wrong, re-roll it. Do not argue with it in the prompt.**
Same prompt, generate again. Three attempts, then change one thing and try once more.

**Accept a shot only if:** it's the same man, the room is *empty*, nothing is
photoreal, and nothing warps in the motion — hands and faces first.

Do shot **02** first, not 01. It is the one that proves the character holds. If his
face is wrong there, nothing after it is worth generating.

---

## 01 · the lounge · 4s · no caption

**A — image**
```
Wide establishing shot of an empty airport lounge at dusk. Immaculate: rows of low
leather seating, a lit bar along one wall, floor-to-ceiling glass running the length
of the room. Beyond the glass, an empty apron — no aircraft, no vehicles, no people
anywhere. A single man in his late thirties, severe and immaculate, sits alone in the
middle of the seating wearing a plain black heavyweight t-shirt. He is small in frame.
Stylised 3D render, game cinematic, hard edges, not photoreal; muted desaturated
palette, one warm practical light source, deep shadows falling to near-black; shallow
depth of field; 4:3 framing; fine film grain.
```
**B — video**
```
Locked-off camera, no camera movement whatsoever. The only motion is a slow drift of
reflection across the glass. The man remains completely still.
```

## 02 · him · 4s · `The chef would not write anything down`

**A — image**
```
Medium shot, chest up, three-quarter left. A man in his late thirties, severe and
immaculate, wearing a plain black heavyweight t-shirt with a small print at the chest,
glasses pushed up into his hair. An airport lounge behind him, thrown far out of focus.
Stylised 3D render, game cinematic, hard edges, not photoreal; muted desaturated
palette, one warm practical light source, deep shadows falling to near-black; shallow
depth of field; 4:3 framing; fine film grain.
```
**B — video**
```
He breathes. One slow blink. Nothing else moves. The camera does not move.
```

## 03 · the counter · 4s · `You told him what you liked in September`

**A — image**
```
Close insert on a long buffet counter, lit from above, polished steel, completely bare
— no food, no plates, no staff, no people. Warm light pooling on empty metal. An
airport lounge falling to darkness behind it.
Stylised 3D render, game cinematic, hard edges, not photoreal; muted desaturated
palette, one warm practical light source, deep shadows falling to near-black; shallow
depth of field; 4:3 framing; fine film grain.
```
**B — video**
```
Very slow camera drift to the left. Nothing in the scene moves. No cut.
```

## 04 · he sits · 4s · `and he remembered it in March`

**A — image**
```
Wide-ish shot from the side of a man in his late thirties, severe and immaculate,
wearing a plain black heavyweight t-shirt, lowering himself into a lounge chair in an
empty airport lounge and crossing his legs. Entirely unhurried. The t-shirt reads
clearly at this distance. No other people anywhere.
Stylised 3D render, game cinematic, hard edges, not photoreal; muted desaturated
palette, one warm practical light source, deep shadows falling to near-black; shallow
depth of field; 4:3 framing; fine film grain.
```
**B — video**
```
He sits down and crosses his legs in one unhurried movement, then goes completely
still. The camera does not move.
```

## 05 · the shirt · 4s · no caption · **the product shot**

**A — image**
```
Close insert on a man's chest and one hand, smoothing the front of a plain black
heavyweight t-shirt once. The garment fills two thirds of the frame. The small chest
print is legible but off-centre. No face in frame.
Stylised 3D render, game cinematic, hard edges, not photoreal; muted desaturated
palette, one warm practical light source, deep shadows falling to near-black; shallow
depth of field; 4:3 framing; fine film grain.
```
**B — video**
```
The hand only. One small precise adjustment to the fabric, then stillness. No camera
movement.
```

## 06 · fourteen years · 4s · `Fourteen years. He never once asked my name`

**A — image**
```
Medium shot, chest up, slightly closer than a standard medium. A man in his late
thirties, severe and immaculate, in a plain black heavyweight t-shirt, glasses pushed
up into his hair, looking slightly off-lens. Empty airport lounge behind him, out of
focus. Same light as before.
Stylised 3D render, game cinematic, hard edges, not photoreal; muted desaturated
palette, one warm practical light source, deep shadows falling to near-black; shallow
depth of field; 4:3 framing; fine film grain.
```
**B — video**
```
Very slow push in toward his face. He looks slightly off-lens and does not move.
```

## 07 · service · 3s · `That is service`

**A — image**
```
Medium shot, chest up, of a man in his late thirties in a plain black heavyweight
t-shirt, the faintest satisfaction crossing his face — not a smile, no teeth, no
warmth. Total confidence. Empty airport lounge out of focus behind him.
Stylised 3D render, game cinematic, hard edges, not photoreal; muted desaturated
palette, one warm practical light source, deep shadows falling to near-black; shallow
depth of field; 4:3 framing; fine film grain.
```
**B — video**
```
Almost no motion. A held look, one small change of expression, nothing more. Static
camera.
```

## 08 · to lens · 4s · `Made for a place that closed`

**Spend your re-rolls here. This is the frame people remember.**

**A — image**
```
Medium shot of a man in his late thirties, severe and immaculate, in a plain black
heavyweight t-shirt, turned to face the camera dead on. Total confidence, no irony, no
smile. Empty airport lounge out of focus behind him.
Stylised 3D render, game cinematic, hard edges, not photoreal; muted desaturated
palette, one warm practical light source, deep shadows falling to near-black; shallow
depth of field; 4:3 framing; fine film grain.
```
**B — video**
```
He turns his head to face the lens directly, then holds. He does not blink at the end.
Static camera.
```

## 09 · card · 3s · `soldanyway.com`

No generation. The build makes this frame. Skip it.

---

## Then

```
bash tools/build-video.sh video/02-heavyweight-tee.json
```

Push whatever you have — missing shots become black holds carrying their caption, so
a part-finished build still reads.
