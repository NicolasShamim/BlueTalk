# SOLD ANYWAY

Character-led clothing label for a TikTok / YouTube Shorts channel, plus the site
that sells the pieces.

**`SOLD ANYWAY` is a working name.** Domains and the handle have not been checked.
Renaming touches the wordmark only.

## What's here

| Path | What it is |
|---|---|
| `brand/THE-LINE.md` | Why the reference brand's slogan works, the line chosen for this one, alternates, and the rule that every piece carries its own line |
| `brand/CHARACTER-BIBLE.md` | World, character, wardrobe, look/sound spec, video formats and hooks. **Written before the reference channel was analysed — see the note at the top of this README's last section.** |
| `config.js` | **The only file you edit to switch the shop on** |
| `shop.js` | Catalog, cart and checkout against the Fourthwall Storefront API |
| `script.js` | Page and cart UI |
| `index.html` `styles.css` | The site. No build step, no dependencies |

## Switching payments on

The shop is fully built and currently in preview: you can pick sizes, add to the
cart, change quantities and press Checkout, and checkout will refuse and say why.
Nothing can be charged. Four steps make it real.

**1. Create the products in Fourthwall.** Six pieces, one collection. Note the
collection's **slug**, and give each product the same `name` as in `config.js` —
that's how the site knows which line belongs to which piece. (Fourthwall holds
price and stock; it does not hold the lines.)

**2. Get the Storefront API token.** Fourthwall dashboard →
**Settings → For Developers → Headless** → copy the token. It starts with `ptkn_`.

**3. Fill in `config.js`:**

```js
storefrontToken: 'ptkn_…',
collectionSlug:  'pieces',
shopDomain:      'irregular-shop.fourthwall.com',
currency:        'EUR',
previewMode:     false,      // ← the important one
```

**4. Add the waitlist endpoint** in the same file — any URL that accepts a JSON
`POST` of `{ email }`.

### How checkout actually works

The site never touches a payment. On Checkout it creates a cart through the
Storefront API, fills it with the chosen variants, and sends the customer to
Fourthwall's hosted checkout page. Card details are entered there. Fourthwall is
merchant of record, so they calculate and remit EU VAT per country — which is the
main reason to use them rather than taking card payments here.

```
site → POST /v1/carts            → cart id
     → POST /v1/carts/{id}/add   → variants + quantities
     → redirect to {shopDomain}/checkout/?cartId=…
```

### Two things that will bite

- **`previewMode: true` shows placeholder prices.** Harmless while the site is
  unreachable, misleading the moment it isn't. Set it to `false` before going
  public, even if the rest is configured.
- **The `storefrontToken` is public.** It ships in the page source, which is how a
  static storefront is meant to work — it is read-only and scoped to your public
  catalog. Never put a Platform API key (`Settings → For Developers → API`) in
  `config.js`; that one can write to your shop.

### If Fourthwall changes shape

`sizeOf()` in `shop.js` reads the size off a variant. Fourthwall's variant option
key has moved before, so it searches for a size-ish key and falls back to the
variant name rather than rendering blank. If sizes come through wrong, that
function is the only place to fix.

If the API call fails for any reason the catalog falls back to preview instead of
leaving a blank page, and the console says why.

## Putting the site online

A deploy workflow is in place (`.github/workflows/pages.yml`) and runs on every
push to this branch. **It needs Pages switched on once, by hand:**

> **Settings → Pages → Build and deployment → Source: `GitHub Actions`**

That is the whole setup. The workflow asks GitHub to create the Pages site
itself, but the Actions token is refused — creating a Pages site needs repo-admin
rights that no automation token here holds. Until that dropdown is set, every run
fails at the `configure-pages` step with *"Create Pages site failed. Resource not
accessible by integration"*, which is the expected symptom rather than a broken
workflow.

Once set, the site is at:

```
https://nicolasshamim.github.io/BlueTalk/
```

The repository name is in that URL, so it reads `/BlueTalk/` rather than anything
to do with the brand. Two ways to fix it: rename the repository, or connect a
domain — add a `CNAME` file containing the domain and point the DNS at GitHub
Pages. The workflow already copies `CNAME` into the deploy if it exists.

### Local preview

```
python3 -m http.server 8000
```

## Note on the character bible

`brand/CHARACTER-BIBLE.md` was written before the reference channel (@santeluca,
selling childrenofkhan.com) had actually been watched. The reference turned out to
be absurdist comedy with a stylized 3D character, where the slogan on the shirt is
the punchline of every video — not the austere craft-drama that document describes.

`brand/THE-LINE.md` is the corrected thinking and supersedes it. The bible is still
useful for the wardrobe, the shot discipline and the production pipeline; ignore
its tone.
