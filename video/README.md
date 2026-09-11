# Video assembly

You generate the shots. This assembles them.

```
video/clips/01.mp4 … 08.mp4      the generated clips, named by shot number
video/audio/voice.wav            the voiceover
video/audio/room-tone.wav        room tone / atmosphere
video/audio/bed.wav              the music bed
video/01-long-sleeve.json        the spec: durations and captions
```

Then:

```
bash tools/build-video.sh video/01-long-sleeve.json
```

Out comes `video/out/01-long-sleeve-master.mp4` (the spec's own canvas) and
`-9x16.mp4` (upload copy).

## Canvas size

A spec can set `"width"` / `"height"` (default 1440x1080, the old 4:3). Shorts
and TikTok scripts should use `"width": 1080, "height": 1920` — shoot the
source stills as portrait crops to begin with (see `03-wilfred.json`) rather
than relying on the 9:16 step to invent height that was never in the shot.

## What it does

- **One grade on every shot** — crushed blacks, cooled shadows, warm highlights,
  grain, a soft vignette. Identical across every video, which is most of what makes
  a profile grid look like one thing.
- **Captions burned in**, rendered in the browser rather than by ffmpeg, so they use
  a real face and match on both platforms. Sized to the spec's own canvas.
- **Audio laid underneath** — voice at full, room tone at −26dB, music at −21dB.
  Change `roomDb` / `musicDb` in the spec.
- **9:16 upload copy** — if the master is already vertical, this is just a clean
  pad to 1080x1920, nothing cropped or invented. If the master is 4:3 (the older
  specs), it's centred on black at 1080x1920 instead, same as before.

Missing clips become black holds of the right length, so a half-finished video still
assembles and you can see the shape before every shot exists.

## Adding a video

Copy `03-wilfred.json` (or `01-long-sleeve.json` for a 4:3 one), change `id`,
`shots` and captions. The current script format is `brand/SELL-ANYWAY.md`.
