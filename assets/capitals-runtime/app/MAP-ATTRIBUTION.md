# Offline map sources and reproduction

The 31 map pages are generated from **Natural Earth 1:50m** country outlines
and first-level administrative boundaries. Natural Earth data are in the
[public domain](https://www.naturalearthdata.com/about/terms-of-use/).
Attribution is retained to make the educational maps auditable.

Sources, retrieved October 29, 2026, are pinned to Natural Earth's maintained
vector repository at commit
[`ca96624a56bd078437bca8184e78163e5039ad19`](https://github.com/nvkelso/natural-earth-vector/tree/ca96624a56bd078437bca8184e78163e5039ad19):

- [Countries GeoJSON](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_50m_admin_0_countries.geojson),
  SHA-256 `3e458fc036ad0a66411f2c1e6cac49c5d7bfb81cb1123bc513b22511a2b7fdeb`.
- [States/provinces GeoJSON](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_50m_admin_1_states_provinces.geojson),
  SHA-256 `69a0e06e640b2d505858ae1cb63034e4677f3000b35a98e16312932b98c426b9`.
- [Natural Earth cultural data description](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/).

Natural Earth's default outlines show de facto boundaries. They are a
cartographic background, not a statement about sovereignty or the quiz's
country coverage. The catalog's explicit membership policy controls quiz
inclusion. Tiny countries, enclaves and islands may occupy less than one
pixel; every catalog entry remains available through its text list and a
capital-location marker. Maps contain no city-name labels, so they do not
reveal quiz answers.

Each page is a **320 by 150 pixel paletted PNG**. Projection is equidistant
cylindrical: longitude is scaled by the cosine of the page's central
latitude, then fitted inside a four-pixel margin. Fixed factors in `atlas.py`
are shared by the generator and the badge's locator; this makes their pixels
agree. Pacific/Alaska pages unwrap longitude across the international date
line. Antarctica is an explanatory map page with no capital questions.

Host preprocessing clips polygons to each page, draws country boundaries and
U.S. state boundaries, omits small interior holes, supersamples at twice the
target resolution, and quantizes to 32 colours. The default projection is
not equal-area: relative area must not be inferred from these small maps.
Graticules provide orientation; map headings, selected names, capital cards,
selection markers and page numbers are rendered by the app.

The PNGs total about **154 KiB**. Load only the current page on the badge; a
decoded 320 by 150 page contains 48,000 indexed pixels (the firmware decoder
may use a larger internal pixel format). No GeoJSON, Pillow, GIS library,
network service, API key, or font download is needed at runtime.

From the repository root, build with Python 3.11 or newer in a local environment:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-map-build.txt
.venv/bin/python scripts/build-capitals-maps.py
.venv/bin/python scripts/build-capitals-maps.py --check
```

The builder downloads only the two pinned sources and checks their SHA-256
before using them. By default it caches them in the host's temporary
`capitals-map-sources` directory; `--cache-dir` selects another host folder.
`--check` rebuilds in a temporary directory and compares all assets byte for
byte. `requirements-map-build.txt` pins [Pillow 13.0.0](https://pypi.org/project/Pillow/13.0.0/),
which includes the project's [security fixes](https://pillow.readthedocs.io/en/stable/releasenotes/13.0.0.html#security).
It reproduces all 31 committed PNGs byte for byte from the original Pillow 12.0.0
build; use the current pin for reproducible PNG encoding.
`assets/maps/MAPS-SOURCES.json` records source URLs/hashes, generator and atlas
hashes, encoder version, dimensions and all output hashes. Keep these
host-side source datasets off the badge; install only the app's small assets.

Host tests check the PNG dimensions/palettes and manifest, known land/ocean
locations, antimeridian projection, geometry clipping and entry-to-map
reachability. These checks do not prove physical badge rendering or input.
