# The character plates

Drop the generated portraits here, exactly these two filenames:

```
character/neutral.png    severe, in repose — used on the print artwork
character/grin.png       closed-mouth half-smile — becomes the logo
```

Then run:

```
node tools/build-artwork.js
```

which writes all five print files into `artwork/print/` and the avatar into
`channel/avatar.png`.

Generated with the prompt pack in `brand/CHARACTER-DESIGN.md`. Keep the seed and
change one clause at a time — every extra word that varies is a chance for the face
to drift.

Full-resolution originals belong here too. Everything downstream is derived from
them, so if a plate is ever regenerated, rerun the build rather than editing an
output by hand.
