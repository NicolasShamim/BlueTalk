# The character

Design spec and prompt pack. Nothing here has been rendered yet — image generation
needs credits this account does not have. When it does, this is one command.

---

## 1. Do not copy the reference's character

The figure in @santeluca's videos is a white-haired man with goggles pushed up on
his forehead, sharp features, red top. That reads as a **Devil May Cry** character —
the resemblance to Dante is close enough that the model was plausibly ripped, modded
or commissioned from that design.

Whatever they are doing, **we should not**. A commercial clothing brand fronted by a
recognisable game character is a rights problem attached to the thing that makes you
money. The channel is the shop. If the face has to come down, the shop comes down
with it.

An original character costs the same to generate and is an asset you own. There is
no upside to the other route.

## 2. Who he is

**The Last Customer.** The only remaining patron of things that have ended. He
speaks in the present tense about places that closed. Full character and scripts in
`CHANNEL.md`; this file is only how he looks.

## 3. The design

Stylized 3D game-cinematic. **Not photoreal** — that is where AI faces break, and it
is the wrong register anyway. Clean sub-surface skin, defined planes, slight
idealisation. Think a cutscene from an expensive game, not a render of a person.

| | |
|---|---|
| **Age** | Late thirties. Unlined but not young |
| **Build** | Lean, upright, still. He does not fidget |
| **Hair** | Black, heavy, severely side-parted and combed back. **One white temple**, left side |
| **Face** | Long, high cheekbones, narrow jaw. Deep-set dark eyes. Naturally serious in repose |
| **Signature** | **Small oval tinted glasses**, amber lenses, usually pushed up into the hair rather than worn |
| **Skin** | Cool, pale, slightly waxy under warm light |
| **Wardrobe** | Whichever piece is being sold, in bone / ash / charcoal. The only red in frame is the print |

### Why these choices

- **The white temple** gives a silhouette marker that survives at thumbnail size and
  at any angle — the job the reference's white hair does, without the white hair.
- **The glasses pushed up** occupy the forehead the way the goggles do. It is the
  same compositional trick, a different object, and it gives him something to do with
  his hands on a beat.
- **Serious in repose** matters because the whole face is built for one expression.

## 4. The grin — this is the logo

His default is severe. **The grin is an event.** Closed mouth, one corner up, eyes
narrowing slightly. Pleased with himself and slightly unpleasant. Never teeth, never
warm, never a laugh.

That single expression is:

- the beat before the last line in most videos
- the profile picture on both platforms

**The mark stays the stamp.** His face goes inside the rotated stamp box that is
already the brand device, cropped tight — brow to chin, no shoulders. So the icon is
a face *and* a stamp, which no other clothing channel is doing, and it means the
avatar and the artwork share one language.

Rendered in bone and charcoal, not full colour, so it holds at 48px.

## 5. The character sheet to generate first

One session, one seed, one set. Everything afterwards references these.

1. **Front, neutral** — chest up, straight to lens, flat even light
2. **Front, grinning** — identical framing and light. *This is the logo plate*
3. **Three-quarter left, neutral** — the default video angle
4. **Profile, neutral** — for consistency checking
5. **Three-quarter, glasses down** — worn rather than pushed up
6. **Full body, standing** — establishes proportion and the garment on him

### Base prompt

> Stylized 3D character render, game cinematic quality, not photorealistic. A lean
> man in his late thirties, pale cool skin, long face with high cheekbones and a
> narrow jaw, deep-set dark eyes, black hair severely side-parted and combed back
> with a single white streak at the left temple. Small oval amber-tinted glasses
> pushed up onto his forehead. Wearing a plain heavyweight bone-coloured long sleeve
> shirt. Neutral serious expression. Chest-up framing, straight to camera, soft even
> key light from the front left, deep falloff to near-black background. Muted palette
> of bone, ash and charcoal. Fine film grain, slight softness, 4:3 framing.

**For plate 2**, replace the expression sentence with:

> Closed-mouth half-smile, only the left corner of the mouth raised, eyes slightly
> narrowed, quietly pleased with himself and faintly unpleasant.

**Keep everything else identical between plates.** Same seed, same light, same
wording. Change one clause at a time. That is the whole discipline of character
consistency — every extra word that varies is a chance for the face to drift.

## 6. Why not Blender

Modelling and rigging an appealing stylized human is weeks of skilled work, and
scripting one through a headless Python API without a viewport is not a real
approach — that pipeline is for procedural geometry, not faces.

The route that actually produces this look:

```
character sheet (image generation, locked seed)
   → the plates become the reference for every shot
   → image-to-video, 3-5 second clips
   → assembled in the edit
```

Consistency comes from the reference images, not from a 3D model. It is faster, it
is cheaper, and it is what the format was designed around.

3D becomes worth it only if he ever needs to move in ways image-to-video cannot
fake. That is a long way off, and by then there is revenue to pay someone.

## 7. Blocked on

Image generation credits. Higgsfield is connected to this session but on the free
plan with 0.4 credits, which is not enough for one image. Any generator would do —
Higgsfield is simply the one already wired in, and it also does image-to-video and
posts to TikTok, so it covers the whole pipeline rather than one step of it.
