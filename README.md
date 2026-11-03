# Brian's engineering portfolio

Live site: https://bwedderburn.github.io/

An informational portfolio covering controls, embedded software and instrument
automation, featuring BM83 and Amp Bench Kit.

The interactive BM83 demo retains the GitHub Universe 2026 badge's existing
appearance, five physical buttons and eight touch controls. Five original
AI-generated covers accompany a fictional catalog; playback is simulated.

## Run locally

This is a static site with no package installation or build step:

```text
python -m http.server 8768 --bind 127.0.0.1
```

Open http://127.0.0.1:8768/. The public demo loads its model from the official
badge simulator's asset host and requires an internet connection for that
3D asset. Its screen view remains available if the model or WebGL cannot load.
The GLB is not included in this repository. The renderer and Three.js are
bundled locally; using the demo makes no AI requests.

## Sources and licensing

See [sources and credits](credits/index.html), [third-party notices](THIRD_PARTY_NOTICES.txt),
the [portfolio software license](LICENSE.txt), and the retained full dependency notices.
The existing badge artwork identifies the hardware in this independent project;
this portfolio does not claim GitHub or Pimoroni sponsorship. The separate model
and artwork are not relicensed under the portfolio's MIT grant.

## Publication

GitHub Pages serves the root of `main`; `.nojekyll` preserves the static files.
Source preparation checkpoint: `62dfac8192369060f8f7e5b35744b870b51c076d` in the workshop checkout.
The BM83 firmware release candidate remains a separate local preparation and is
not published or installed by this site.
