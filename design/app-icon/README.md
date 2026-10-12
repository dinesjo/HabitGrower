# HabitGrower app icon

`source.png` is the approved botanical H in the light green / dark forest palette, generated with the built-in imagegen tool. The production exports preserve the mark and adjust its framing and resolution. The dark background is normalized to `#142019` so added maskable padding is seamless.

The regular PWA, Apple touch, and favicon exports put the mark at 72% of the canvas height, up from about 56% in the source draft. They have opaque square backgrounds; the operating system applies its launcher shape. The dedicated Apple touch icon is 180 × 180 and is linked explicitly from `index.html`.

The separate maskable exports keep the complete mark inside a circle with radius 38% of the canvas, leaving clearance inside the manifest specification's guaranteed 40% radius safe area. They are declared only for `maskable`; the larger regular exports are declared for `any`.

To regenerate all PNG and ICO exports, use Python with Pillow installed:

```sh
python3 scripts/generate-icons.py
```

The ICO contains 16, 32, and 48 pixel representations. All outputs are saved in `public/`; the source is outside the deployed assets.

With the development server running, open `/design/app-icon/preview.html` to compare the source and actual exports at home-screen and favicon sizes. `sizing-preview.jpg` records this browser preview, including the minimum safe-area mask. This is a shape and size check, not a test on an installed iPhone app.

Sizing references: [Apple's web clip icon guidance](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html) and [the Web Application Manifest safe area](https://www.w3.org/TR/appmanifest/#icon-masks).
