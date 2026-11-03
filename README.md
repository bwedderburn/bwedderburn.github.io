# Brian's engineering portfolio

Live site: https://bwedderburn.github.io/

An informational portfolio covering controls, embedded software and instrument
automation, featuring BM83, Amp Bench Kit and World Capitals.

The two interactive demos retain the actual GitHub Universe badge model,
including its existing artwork, five physical buttons and eight touch pads.
BM83 is a scripted audio-control showcase with five original AI-generated
album covers and fictional track metadata. Playback is simulated; no audio
recordings or hardware controls are connected.

World Capitals runs the existing badge Python app in MicroPython WebAssembly.
It includes 195 World entries, 56 U.S. entries, 31 maps, Explore and Quiz,
role-aware capital notes, scoring and browser progress. The JavaScript side
panel mirrors the actual Python app; it does not recreate the quiz rules.

## Run locally

This is a static site with no package installation or build step:

```text
python -m http.server 8768 --bind 127.0.0.1
```

Open http://127.0.0.1:8768/. The public demos load the 3D model from its
original asset host and require a connection for that asset. Functional screen
view remains available when the model or WebGL cannot load. The GLB is not
included in this repository. Runtime, renderer, Three.js, maps and fonts are
bundled locally; using the demos makes no AI requests.

## Capitals controls and progress

Use the badge buttons/touch pads, visible controls, or arrow keys and Enter.
Escape goes back; H opens the single-app launcher. Select reopens Capitals.
Rotate, zoom, start motion or turn the model upside down; screen orientation
and directional input follow it. The Menu pad retains the canonical no-op.
Progress is isolated to `bwedderburn.capitals.demo.v1` on the current origin.
Localhost progress does not migrate to the live site. Resetting browser
progress does not affect the physical badge or the BM83 demo.

## Sources and licensing

See [sources and credits](credits/index.html), [third-party notices](THIRD_PARTY_NOTICES.txt),
the [portfolio software license](LICENSE.txt), and retained full dependency notices.
Capitals source hashes are in
[SOURCE-MANIFEST.json](assets/capitals-runtime/SOURCE-MANIFEST.json);
[runtime notes](assets/capitals-runtime/README.md), geography and map
attribution accompany the source package. Preserve the nested `.gitattributes`
so source hashes remain valid across Windows and POSIX checkouts.

The existing badge artwork identifies the hardware in this independent project;
this portfolio does not claim GitHub or Pimoroni sponsorship. The separate model
and artwork are not relicensed under the portfolio's MIT grant.

## Publication

GitHub Pages serves the root of `main`; `.nojekyll` preserves underscore paths
such as the Python app's `__init__.py`. Source preparation checkpoint:
`530004c90e557a75e57acb02ef5541b72c773749` in the workshop checkout. The social preview image is a screenshot
of this portfolio homepage, not a hardware photograph.

The BM83 firmware release candidate remains separate and is not published or
installed by this website. Browser validation is not physical badge acceptance.
