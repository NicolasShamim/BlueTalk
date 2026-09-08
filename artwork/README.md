# Print artwork

One file per piece, per ink. Ready to upload to Fourthwall as the front print.

| File | Line |
|---|---|
| `long-sleeve` | They built me for a colder year |
| `heavyweight-tee` | I am the last one in this colour |
| `hoodie` | Made for a place that closed |
| `crewneck` | I was somebody's winter |
| `joggers` | This was cut for someone taller |
| `beanie` | I remember the sun being closer |

**`--bone`** (`#E7E3D9`) for dark and mid-tone garments.
**`--ink`** (`#17181B`) for light ones.

## Specification

- 3600 × 1800px — 12 × 6 inches at 300dpi, inside a standard DTG chest area
- Transparent background (PNG), so the garment colour shows through
- Cormorant Garamond italic, 300px, centred on two lines

## Why this typeface

The line has to read as a confession rather than a slogan, so it is set the way a
line of poetry is set: a high-contrast serif, italic, generous leading, no caps and
no ornament. It carries the same engraved feel as the reference brand's shirt
without borrowing its look.

Set large. On the reference product the text spans most of the chest — that is what
makes it read as a statement instead of a pocket print. Do not shrink it to a
tasteful little block.

## Re-rendering

The lines live in `config.js`; these files are rendered from the same wording. If a
line changes, the artwork has to be re-rendered to match — nothing generates them
automatically at build time.
