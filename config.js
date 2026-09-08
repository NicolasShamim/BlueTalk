/* ============================================================
   IRREGULAR — shop configuration

   This is the only file you edit to switch the shop on.
   Everything else reads from here.
   ============================================================ */

const CONFIG = {

  /* ----------------------------------------------------------
     1. FOURTHWALL

     Fourthwall dashboard → Settings → For Developers → Headless.
     Copy the Storefront API token (it starts with "ptkn_").

       storefrontToken  the ptkn_… token
       collectionSlug   slug of the collection holding the pieces
       shopDomain       the domain Fourthwall hosts checkout on,
                        e.g. "irregular-shop.fourthwall.com", or your
                        own domain once it is connected there
       currency         ISO code the cart is priced in

     Leave storefrontToken empty and the site stays in preview
     (see 3), so nothing here needs to exist yet.
     ---------------------------------------------------------- */
  storefrontToken: '',
  collectionSlug:  '',
  shopDomain:      '',
  currency:        'EUR',

  /* ----------------------------------------------------------
     2. WAITLIST

     Any URL that accepts a JSON POST of { email }.
     Empty means the form tells people it is not open yet
     instead of pretending to save the address.
     ---------------------------------------------------------- */
  waitlistEndpoint: '',

  /* ----------------------------------------------------------
     3. PREVIEW MODE

     true  — the shop renders from the pieces below so the whole
             flow (sizes, cart, checkout button) can be clicked
             through before a Fourthwall account exists. Checkout
             refuses and says why. Nothing can be charged.
     false — live. Products, prices and stock come from Fourthwall
             and checkout goes to their hosted page.

     >>> SET THIS TO false BEFORE THE SITE IS PUBLIC. <<<
     Preview shows placeholder prices, which is fine while nobody
     can reach the site and misleading the moment they can.
     ---------------------------------------------------------- */
  previewMode: false,

  /* ----------------------------------------------------------
     4. THE PIECES

     Used for preview, and for the line + running order once live
     (Fourthwall knows about price and stock; it does not know
     which line belongs to which piece).

     Match `name` to the product name in Fourthwall so the two
     line up when previewMode goes false.

     Every piece here exists in the Fourthwall catalog — see
     brand/PRODUCT-LINE.md. The jacket, vest and utility trouser
     that were here before do not, and cannot be made on demand.
     ---------------------------------------------------------- */
  pieces: [
    { name: 'Long Sleeve',  line: 'They built me for a colder year',  price: 6500, sizes: ['S','M','L','XL','XXL'] },
    { name: 'Heavyweight Tee', line: 'I am the last one in this colour', price: 5500, sizes: ['S','M','L','XL','XXL'] },
    { name: 'Hoodie',       line: 'Made for a place that closed',     price: 8500, sizes: ['S','M','L','XL','XXL'] },
    { name: 'Crewneck',     line: 'I was somebody’s winter',          price: 7500, sizes: ['S','M','L','XL','XXL'] },
    { name: 'Joggers',      line: 'This was cut for someone taller',  price: 7000, sizes: ['S','M','L','XL'] },
    { name: 'Beanie',       line: 'I remember the sun being closer',  price: 3000, sizes: ['One size'] }
  ]
};
