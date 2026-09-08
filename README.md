# IRREGULAR — Room 12

Character-led clothing brand for a TikTok / YouTube Shorts channel, plus the
front-of-house site.

**`IRREGULAR` is a working name.** Domains and the TikTok handle have not been
checked yet. Renaming touches the wordmark only — the world, the character and
the mark all survive it.

## What's here

| Path | What it is |
|---|---|
| `brand/CHARACTER-BIBLE.md` | The world, the character, the mark, the six-piece wardrobe, look/sound rules, five recurring formats, twenty video hooks (ten fully scripted), and the production pipeline |
| `index.html` `styles.css` `script.js` | Static site. No build step, no dependencies |

## The site

Plain HTML/CSS/JS, same shape as `borreltje.cc` — push the branch, point GitHub
Pages at it, add a `CNAME` when there's a domain.

No commerce. Waitlist only, by design — the store decision is parked until the
channel has an audience.

There is **no photography yet**, so the site is built to stand on typography
alone. Product plates render as Bureau "PENDING ISSUE" records rather than empty
grey boxes. Once garment samples are shot, those plates take real images and
nothing else has to change.

### Before it goes live

1. **Set `FORM_ENDPOINT` at the top of `script.js`.** While it is empty the
   waitlist form validates the address and then honestly says nothing was
   recorded. It never fakes a success — people would think they were on a list
   that doesn't exist. Any endpoint accepting a JSON `POST` works.
2. Add `CNAME` once a domain is registered.
3. Add an OG image and favicon.

### Local preview

```
python3 -m http.server 8000
```

## The one rule that decides whether this sells

**The clothes on screen must be the clothes in the box.**

Design the garment, order one sample, photograph it, and use those photographs
as the reference the character wears. Doing it in the other order — inventing a
beautiful jacket on screen and sourcing it afterwards — is how a channel gets
views and refunds.

The wardrobe stays locked at six pieces for the same reason: consistency on
screen is cheap when the reference set is small and expensive when it isn't.
