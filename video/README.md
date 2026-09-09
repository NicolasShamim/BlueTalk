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

Out comes `video/out/01-long-sleeve-4x3.mp4` (master) and `-9x16.mp4` (upload).

## What it does

- **One grade on every shot** — crushed blacks, cooled shadows, warm highlights,
  grain, a soft vignette. Identical across every video, which is most of what makes
  a profile grid look like one thing.
- **Captions burned in**, rendered in the browser rather than by ffmpeg, so they use
  a real face and match on both platforms.
- **Audio laid underneath** — voice at full, room tone at −26dB, music at −21dB.
  Change `roomDb` / `musicDb` in the spec.
- **9:16 without cropping** — the 4:3 frame is centred on black. Nothing of the
  composition is lost, and the letterboxing reads as deliberate.

Missing clips become black holds of the right length, so a half-finished video still
assembles and you can see the shape before every shot exists.

## Adding a video

Copy `01-long-sleeve.json`, change `id`, `shots` and captions. Scripts for the next
nine are in `brand/CHANNEL.md`.
