// Fictional catalog and browser-local demo behavior. This module plays no audio
// and never communicates with a BM83 controller or another device.
const artwork = (name) => new URL(`./artwork/${name}.png`, import.meta.url).href;

export const TRACKS = Object.freeze([
  Object.freeze({
    id: 'universe-after-hours',
    title: 'Universe After Hours',
    artist: 'BM83 Demo',
    album: 'Conference Sessions',
    duration: 238,
    artwork: artwork('universe-after-hours'),
    description: 'An orbital engineering workshop overlooking the night side of Earth.',
  }),
  Object.freeze({
    id: 'control-loop',
    title: 'Control Loop',
    artist: 'BM83 Demo',
    album: 'Conference Sessions',
    duration: 195,
    artwork: artwork('control-loop'),
    description: 'A luminous feedback ring and an original instrument robot in a cosmic workshop.',
  }),
  Object.freeze({
    id: 'midnight-on-the-bus',
    title: 'Midnight on the Bus',
    artist: 'BM83 Demo',
    album: 'Studio Signals',
    duration: 264,
    artwork: artwork('midnight-on-the-bus'),
    description: 'A winding, luminous data route across a midnight circuit-board landscape.',
  }),
  Object.freeze({
    id: 'setpoint-after-dark',
    title: 'Setpoint After Dark',
    artist: 'BM83 Demo',
    album: 'Orbital Workshop',
    duration: 212,
    artwork: artwork('setpoint-after-dark'),
    description: 'A moonlit instrument console and a steady beacon among the stars.',
  }),
  Object.freeze({
    id: 'phase-margin',
    title: 'Phase Margin',
    artist: 'BM83 Demo',
    album: 'Orbital Workshop',
    duration: 226,
    artwork: artwork('phase-margin'),
    description: 'Intersecting teal and copper phase-wave rings suspended in space.',
  }),
]);

const EQUALIZERS = Object.freeze(['FLAT', 'ROCK', 'POP', 'JAZZ', 'CLASSICAL']);
const VOLUME_ACTIONS = new Set(['volume-up', 'volume-down']);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const initial = () => ({
  trackIndex: 1,
  playing: false,
  volume: 55,
  muted: false,
  powered: true,
  settingsOpen: false,
  eq: 'FLAT',
  position: 71,
  heldAction: null,
});

export function createDemoState() {
  let state;
  let snapshot;
  let heldElapsed = 0;
  let nextRepeat = 0.3;
  const listeners = new Set();

  const makeSnapshot = () => Object.freeze({ ...state, track: TRACKS[state.trackIndex] });
  const publish = (next) => {
    if (state && Object.keys(next).every((key) => next[key] === state[key])) return snapshot;
    state = next;
    snapshot = makeSnapshot();
    const current = snapshot;
    // Copy before notification so unsubscription during a callback is safe.
    for (const listener of [...listeners]) {
      if (listeners.has(listener)) listener(current);
    }
    return snapshot;
  };
  const clearRepeat = () => {
    heldElapsed = 0;
    nextRepeat = 0.3;
  };
  const moveTrack = (next, direction) => {
    next.trackIndex = (next.trackIndex + direction + TRACKS.length) % TRACKS.length;
    next.position = 0;
  };
  const volumeStep = (next, actionName, count = 1) => {
    const direction = actionName === 'volume-up' ? 1 : -1;
    next.volume = clamp(next.volume + direction * count, 0, 100);
  };

  publish(initial());

  const getSnapshot = () => snapshot;
  const subscribe = (callback) => {
    if (typeof callback !== 'function') throw new TypeError('A subscriber must be a function.');
    listeners.add(callback);
    return () => listeners.delete(callback);
  };
  const releaseAll = () => {
    clearRepeat();
    return publish({ ...state, heldAction: null });
  };
  const action = (name, phase = 'press') => {
    if (phase === 'release') {
      return name === state.heldAction ? releaseAll() : snapshot;
    }
    if (phase !== 'press') return snapshot;

    const next = { ...state };
    if (name === 'power') {
      next.powered = !next.powered;
      if (!next.powered) {
        next.playing = false;
        next.settingsOpen = false;
        next.heldAction = null;
        clearRepeat();
      }
      return publish(next);
    }
    if (name === 'home') {
      next.settingsOpen = false;
      return publish(next);
    }
    if (!state.powered) return snapshot;

    if (VOLUME_ACTIONS.has(name)) {
      if (state.heldAction === name) return snapshot;
      clearRepeat();
      next.heldAction = name;
      volumeStep(next, name);
      return publish(next);
    }
    switch (name) {
      case 'previous': moveTrack(next, -1); break;
      case 'next': moveTrack(next, 1); break;
      case 'play': next.playing = !next.playing; break;
      case 'mute': next.muted = !next.muted; break;
      case 'settings': next.settingsOpen = !next.settingsOpen; break;
      case 'eq': next.eq = EQUALIZERS[(EQUALIZERS.indexOf(next.eq) + 1) % EQUALIZERS.length]; break;
      default: return snapshot;
    }
    return publish(next);
  };
  const selectTrack = (id) => {
    const trackIndex = TRACKS.findIndex((track) => track.id === id);
    if (trackIndex === -1) return snapshot;
    return publish({ ...state, trackIndex, position: 0, playing: state.powered && state.playing });
  };
  const setVolume = (value) => {
    if (!Number.isFinite(value)) return snapshot;
    return publish({ ...state, volume: clamp(Math.round(value), 0, 100) });
  };
  const seek = (seconds) => {
    if (!Number.isFinite(seconds)) return snapshot;
    return publish({ ...state, position: clamp(seconds, 0, TRACKS[state.trackIndex].duration) });
  };
  const setSetting = (key, value) => {
    if (key !== 'eq' || !EQUALIZERS.includes(value)) return snapshot;
    return publish({ ...state, eq: value });
  };
  const tick = (deltaSeconds) => {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return snapshot;
    // Resuming a background tab must not simulate all of the missed time.
    const delta = Math.min(deltaSeconds, 0.25);
    const next = { ...state };
    if (state.powered && state.playing) {
      next.position += delta;
      while (next.position >= TRACKS[next.trackIndex].duration) {
        next.position -= TRACKS[next.trackIndex].duration;
        next.trackIndex = (next.trackIndex + 1) % TRACKS.length;
      }
    }
    if (state.powered && state.heldAction) {
      heldElapsed += delta;
      let repeats = 0;
      while (heldElapsed + 1e-9 >= nextRepeat) {
        repeats += 1;
        nextRepeat += 0.14;
      }
      if (repeats) volumeStep(next, state.heldAction, repeats);
    }
    return publish(next);
  };
  const reset = () => {
    clearRepeat();
    return publish(initial());
  };

  return Object.freeze({
    getSnapshot, subscribe, action, selectTrack, setVolume, seek, tick,
    setSetting, reset, releaseAll,
  });
}
