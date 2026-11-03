# Canonical Capitals in the browser

`runtime.mjs` runs the actual `badge/apps/capitals` Python app in the reviewed
MicroPython WASM runtime. It does not reimplement the quiz or atlas in JavaScript.
All app source and map bytes are copied by `scripts/prepare-capitals-runtime.mjs`;
`SOURCE-MANIFEST.json` records their SHA-256 values. The browser verifies every
loaded app file before starting it.

The dedicated worker hosts only this app. It has no device, radio, serial,
microphone, credential or server-control connection. A small launcher adapter
handles HOME and root BACK; SELECT reopens Capitals. The canonical MENU input
has no app behavior and is not assigned invented functionality here.

Logical controls are left/right/up/down/select/back/menu/home. The shared 3D
adapter handles orientation and physical button mapping; the Python screen stays
upright and is applied to the badge texture once. UI snapshots expose the actual
app state, with capital answers and notes withheld during unanswered questions.

Saved state uses the isolated browser key `bwedderburn.capitals.demo.v1` and
contains only this demo's Capitals settings, scores and pass progress. Storage
failure leaves the current session usable in memory. `resetProgress()` clears
only that browser key and starts the local runtime again. It does not access or
erase any physical badge state. The app's own Reset quiz passes command retains
its best-score and completed-round fields, as in the canonical app.

Runtime sources come from the existing reviewed standalone simulator's
`public/simulator/asyncify` and allowlisted firmware support files. The original
runtime `LICENSE`, `THIRD_PARTY.md` and full compiled-dependency notices are
retained. No 3D model is copied in this package. Catalog/map sources and terms
are retained in `app/DATA-SOURCES.md` and `app/MAP-ATTRIBUTION.md`.

These are browser/runtime checks, not physical badge validation. The canonical
data snapshot is dated 2026-10-29; no live geography service is queried.

`memoryAtLaunch` reports the browser interpreter's measured GC allocation/free
bytes and WebAssembly linear memory, plus the requested MicroPython heap setting.
The reviewed WASM build can reserve more memory than that request; it is not a
physical badge RAM limit or evidence that the app fits the physical device.
