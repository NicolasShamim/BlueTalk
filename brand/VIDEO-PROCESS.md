# Making a video

The assembly is automated. The generating is not, and should not be — every clip is
judged by eye and re-rolled until it is right. That part is yours. Everything after
it is mine.

---

## 1. The Kling API question — short answer, don't bother

The subscription you bought is a **consumer** plan. It does not include API access.
The API is a separate prepaid package on the developer console (`kling.ai/dev`);
web credits and API credits do not cross over, so buying one does not give you the
other.

If you ever did buy it, this is what it takes: an **AccessKey** and a **SecretKey**,
from which you sign a short-lived **HS256 JWT** for every request — `iss` = the
access key, `exp` = now + 1800s — and send it as `Authorization: Bearer <jwt>`.
Base URL `https://api-singapore.klingai.com`, `POST /v1/videos/image2video` to start
a job, then poll the same path with the task id until it returns a URL.

**It is not worth it here.** The API would save the clicking, not the judging — and
the judging is the whole job. You will re-roll half of these. Doing that through an
API is slower than doing it in the tab where you can see the result.

Second reason: a developer package needs a card, and yours doesn't work on these
platforms. Do the whole thing inside the subscription you already pay for.

## 2. The loop

```
  I write the shot list          →  brand/videos/NN-<piece>.md
  you generate stills in Kling   →  one per shot, character locked
  you animate each still         →  image-to-video, 5s, no long takes
  you drop the clips in the repo →  video/clips/01.mp4 … 09.mp4
  you drop the audio in          →  video/audio/{voice,bed,room-tone}.wav
  I assemble and check it        →  bash tools/build-video.sh video/NN-<piece>.json
  you post it                    →  AI-disclosure toggle ON, both platforms
```

Missing clips become black holds of the right length, so push what you have and the
video still assembles — that is the fastest way to see whether the shape works
before you spend credits on the rest.

### Stills first, then motion

Kling generates images as well as video, and its character tools (Character ID /
subject reference, multi-reference) are what keep his face the same across shots.
Use `character/neutral.png` and `character/grin.png` as the reference on **every**
still. Do not generate a shot from text alone — that is where he drifts.

Then animate each still separately. Never ask for a long take: three to five seconds
is where image-to-video holds together, and everything past about eight falls apart.

### The style block

Paste this at the end of **every** image prompt, unchanged. It is most of what makes
the grid look like one channel:

> stylised 3D render, game cinematic, hard edges, not photoreal; muted desaturated
> palette, one warm practical light source, deep shadows falling to near-black;
> shallow depth of field; 4:3 framing; fine film grain

## 3. Sound, without paying for it

Half the result, and the part the reference channel is actually winning on.

- **Voice — record it yourself.** A phone in a room with soft furnishings is enough.
  Close, level, unhurried, no performance. A real voice under an obviously rendered
  face is a better contrast than a synthetic one, and it costs nothing. Save as
  `video/audio/voice.wav`.
- **Music.** The YouTube Audio Library and Pixabay both carry tracks cleared for
  commercial use — check the individual track's licence, they differ. Look for
  something slow, synthetic and unresolved; no drums, no drop. `bed.wav`.
- **Room tone.** freesound.org. One continuous take of an empty interior, laid
  under the whole video. `room-tone.wav`. This is the cheapest thing on the list
  and it does more than the music.

The build mixes voice at full, room tone at −26dB, music at −21dB. Change `roomDb`
and `musicDb` in the spec if it sits wrong.

## 4. Which video first

**Video one is the Heavyweight Tee**, because it is the only thing anyone can
actually buy. Its line is *Made for a place that closed*, so the script to shoot is
**number 3** in `CHANNEL.md` — the airport lounge — not the one headed "Hoodie".
The headings drifted; the table at the top of section 5 is correct.

### Start before the sample arrives

The spec says every video ends on a real photograph of the garment on a real person.
That is right, and the sample lands at the end of the month. Do not wait for it.

Post the first two or three **without the product ending** — the character carries
them, the line lands, the URL card closes it. That is what the reference channel
does; the shop lives in the bio, not in every video. When the sample arrives, the
ending upgrades to the real garment and every video after it has it.

Three videos of the character, posted, beats one perfect video three weeks from now.

## 5. Video one — the prompts

Nine shots, ~34 seconds. **Kling takes one prompt per generation** — there is no way
to hand it a document, so this is eighteen generations: nine stills, then nine
animations of those stills.

Every prompt, pre-assembled with the style block and ready to paste, is in
**`brand/videos/02-heavyweight-tee.md`**. Work down that file.

Start with shot **02**, not 01 — it is the one that proves the character holds. If
his face is wrong there, nothing after it is worth generating.

## 6. Posting

Detail is in `CHANNEL-SETUP.md`. The three that matter:

- **Turn the AI-disclosure toggle on.** TikTok requires it; a stylised channel loses
  nothing by it.
- **Never upload the TikTok-watermarked file to YouTube.** Export from the build,
  post the same file to both.
- **No link in the caption.** The handle is the address. `@kasparvale` in bio,
  `soldanyway.com` in the bio link, and the last frame of the video.
