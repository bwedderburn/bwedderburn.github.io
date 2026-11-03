import { TRACKS, createDemoState } from './bm83-state.mjs';

const element = (id) => document.getElementById(id);
const state = createDemoState();
const screen = document.createElement('canvas');
screen.width = 320;
screen.height = 240;
const context = screen.getContext('2d');
const flatScreen = element('flat-screen');
const flatContext = flatScreen.getContext('2d');
const images = new Map();
const heldKeys = new Map();
const actionButtons = [...document.querySelectorAll('[data-action]')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let model;
let flat = false;
let modelFailed = false;
let inverted = false;
let motion = false;
let motionTime = 0;
let pose = { pitch: -8, roll: -5, yaw: -16 };
let timer;
let lastTime = 0;
let appVisible = true;
let previous;
let previousPosition = -1;

if (new URLSearchParams(location.search).get('embed') === '1') {
  document.body.classList.add('demo-is-embedded');
}
element('demo-app').tabIndex = 0;
const timeLabel = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const announce = (message) => { element('demo-announcement').textContent = message; };
const drawText = (text, x, y, maxWidth, font, maxLines = 2) => {
  context.font = font;
  const words = text.split(' ');
  let line = '';
  const lines = [];
  for (const word of words) {
    if (line && context.measureText(`${line} ${word}`).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((value, index) => context.fillText(value, x, y + index * 20, maxWidth));
};

function drawScreen(snapshot) {
  context.fillStyle = '#102532';
  context.fillRect(0, 0, 320, 240);
  context.textAlign = 'left';
  context.textBaseline = 'alphabetic';
  if (!snapshot.powered) {
    context.fillStyle = '#adcbd5';
    context.font = '600 20px "Segoe UI", sans-serif';
    context.fillText('Studio remote', 84, 110);
    context.font = '13px "Segoe UI", sans-serif';
    context.fillText('Demo power off', 105, 136);
  } else if (snapshot.settingsOpen) {
    context.fillStyle = '#f3b77c';
    context.font = '600 22px "Segoe UI", sans-serif';
    context.fillText('Settings', 18, 39);
    context.fillStyle = '#eff8fa';
    context.font = '16px "Segoe UI", sans-serif';
    context.fillText(`Equalizer: ${snapshot.eq}`, 18, 85);
    context.fillText(`Volume: ${snapshot.volume}%`, 18, 120);
    context.fillStyle = '#aac8d3';
    context.font = '12px "Segoe UI", sans-serif';
    context.fillText('Press Select to cycle EQ', 18, 174);
    context.fillText('Home returns to playback', 18, 196);
    context.fillText('Simulated playback', 18, 220);
  } else {
    context.fillStyle = '#24495b';
    context.fillRect(0, 0, 320, 29);
    context.font = '600 12px "Segoe UI", sans-serif';
    context.fillStyle = '#edf7fa';
    context.fillText('BM83', 12, 19);
    context.fillStyle = '#f3b77c';
    context.fillText(snapshot.playing ? 'PLAYING' : 'PAUSED', 246, 19);
    const image = images.get(snapshot.track.id);
    if (image) context.drawImage(image, 12, 42, 110, 110);
    else {
      context.fillStyle = '#28566a';
      context.fillRect(12, 42, 110, 110);
      context.strokeStyle = '#f3b77c';
      context.lineWidth = 2;
      context.beginPath(); context.ellipse(67, 97, 39, 26, -.5, 0, Math.PI * 2); context.stroke();
    }
    context.fillStyle = '#eff8fa';
    drawText(snapshot.track.title, 136, 61, 172, '600 17px "Segoe UI", sans-serif', 3);
    context.fillStyle = '#aac8d3';
    context.font = '12px "Segoe UI", sans-serif';
    context.fillText(snapshot.track.artist, 136, 126);
    context.font = '10px "Segoe UI", sans-serif';
    context.fillText(snapshot.track.album, 136, 144, 172);
    context.fillStyle = snapshot.muted ? '#f3b77c' : '#aac8d3';
    context.font = '12px "Segoe UI", sans-serif';
    context.fillText(snapshot.muted ? 'Muted' : `Volume ${snapshot.volume}%`, 12, 175);
    context.fillText(`EQ ${snapshot.eq}`, 235, 175);
    context.fillStyle = '#426779'; context.fillRect(12, 187, 296, 4);
    context.fillStyle = '#f3b77c'; context.fillRect(12, 187, 296 * snapshot.position / snapshot.track.duration, 4);
    context.fillStyle = '#dcecf2';
    context.font = '11px "Segoe UI", sans-serif';
    context.fillText(timeLabel(snapshot.position), 12, 209);
    context.fillText(timeLabel(snapshot.track.duration), 280, 209);
    context.fillStyle = '#aac8d3';
    context.font = '11px "Segoe UI", sans-serif';
    context.fillText('Previous', 12, 231);
    context.fillText(snapshot.playing ? 'Pause' : 'Play', 144, 231);
    context.fillText('Next', 284, 231);
  }
  flatContext.drawImage(screen, 0, 0, flatScreen.width, flatScreen.height);
}

const trackButtons = TRACKS.map((track) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'track-option';
  button.dataset.track = track.id;
  button.setAttribute('aria-label', `Select ${track.title}`);
  const image = document.createElement('img');
  image.src = track.artwork;
  image.alt = '';
  image.width = 1254;
  image.height = 1254;
  const title = document.createElement('strong'); title.textContent = track.title;
  const album = document.createElement('small'); album.textContent = `${track.album} / ${timeLabel(track.duration)}`;
  button.append(image, title, album);
  button.addEventListener('click', () => state.selectTrack(track.id));
  element('track-list').append(button);
  return button;
});

function update(snapshot) {
  drawScreen(snapshot);
  const changedTrack = previous?.track.id !== snapshot.track.id;
  if (changedTrack) {
    element('track-artwork').src = snapshot.track.artwork;
    element('track-artwork').alt = snapshot.track.description;
    element('track-title').textContent = snapshot.track.title;
    element('track-album').textContent = snapshot.track.album;
    element('track-artist').textContent = snapshot.track.artist;
    element('position').max = snapshot.track.duration;
    for (const button of trackButtons) button.setAttribute('aria-pressed', String(button.dataset.track === snapshot.track.id));
    announce(`${snapshot.track.title} selected. ${snapshot.playing ? 'Playing' : 'Paused'} in the demo.`);
  } else if (previous?.playing !== snapshot.playing) {
    announce(`${snapshot.track.title}: ${snapshot.playing ? 'playing' : 'paused'} in the demo.`);
  } else if (previous?.powered !== snapshot.powered) announce(snapshot.powered ? 'Demo power on.' : 'Demo power off.');
  else if (previous?.muted !== snapshot.muted) announce(snapshot.muted ? 'Demo muted.' : 'Demo unmuted.');
  else if (previous?.settingsOpen !== snapshot.settingsOpen) announce(snapshot.settingsOpen ? 'Settings open.' : 'Playback screen.');
  element('play-button').textContent = snapshot.playing ? 'Pause' : 'Play';
  element('mute-button').textContent = snapshot.muted ? 'Unmute' : 'Mute';
  element('mute-button').setAttribute('aria-pressed', String(snapshot.muted));
  element('power-button').textContent = snapshot.powered ? 'Power off' : 'Power on';
  element('power-button').setAttribute('aria-pressed', String(snapshot.powered));
  element('settings-button').setAttribute('aria-expanded', String(snapshot.settingsOpen));
  element('demo-settings').hidden = !snapshot.settingsOpen;
  element('equalizer').value = snapshot.eq;
  element('volume').value = snapshot.volume;
  element('volume-value').textContent = `${snapshot.volume}%`;
  const position = Math.floor(snapshot.position);
  if (changedTrack || position !== previousPosition) {
    element('position').value = position;
    element('position-label').textContent = `${timeLabel(position)} / ${timeLabel(snapshot.track.duration)}`;
    previousPosition = position;
  }
  element('position').disabled = !snapshot.powered;
  element('volume').disabled = !snapshot.powered;
  element('equalizer').disabled = !snapshot.powered;
  for (const button of actionButtons) button.disabled = !snapshot.powered && !['power', 'home'].includes(button.dataset.action);
  previous = snapshot;
}

function dispatch(action, phase = 'press') {
  state.action(action, phase);
  model?.setButtonPressed(action, phase === 'press');
}
function releaseAll() {
  for (const action of heldKeys.values()) model?.setButtonPressed(action, false);
  for (const action of ['volume-up', 'volume-down']) model?.setButtonPressed(action, false);
  heldKeys.clear();
  state.releaseAll();
}
for (const button of actionButtons) {
  const action = button.dataset.action;
  if (action.startsWith('volume-')) {
    button.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      button.setPointerCapture(event.pointerId);
      dispatch(action);
    });
    for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      button.addEventListener(eventName, () => dispatch(action, 'release'));
    }
    button.addEventListener('keydown', (event) => {
      if (![' ', 'Enter'].includes(event.key)) return;
      event.preventDefault();
      if (!event.repeat) dispatch(action);
    });
    button.addEventListener('keyup', (event) => {
      if ([' ', 'Enter'].includes(event.key)) { event.preventDefault(); dispatch(action, 'release'); }
    });
    button.addEventListener('blur', () => dispatch(action, 'release'));
    button.addEventListener('click', (event) => {
      if (event.detail === 0) { dispatch(action); dispatch(action, 'release'); }
    });
  } else button.addEventListener('click', () => { dispatch(action); dispatch(action, 'release'); });
}
element('volume').addEventListener('input', (event) => state.setVolume(Number(event.target.value)));
element('position').addEventListener('input', (event) => state.seek(Number(event.target.value)));
element('equalizer').addEventListener('change', (event) => state.setSetting('eq', event.target.value));
const keyActions = { ' ': 'play', ArrowLeft: 'previous', ArrowRight: 'next', ArrowUp: 'volume-up', ArrowDown: 'volume-down', m: 'mute', s: 'settings', Escape: 'home' };
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input, select, textarea, button, a, summary, [contenteditable="true"]')) return;
  const action = keyActions[event.key] ?? keyActions[event.key.toLowerCase()];
  if (!action) return;
  event.preventDefault();
  if (!event.repeat) { heldKeys.set(event.code, action); dispatch(action); }
});
document.addEventListener('keyup', (event) => {
  const action = heldKeys.get(event.code);
  if (action) { heldKeys.delete(event.code); dispatch(action, 'release'); }
});
window.addEventListener('blur', releaseAll);

function syncPose(next) {
  pose = { ...pose, ...next };
  for (const axis of ['roll', 'yaw']) pose[axis] = ((pose[axis] + 180) % 360 + 360) % 360 - 180;
  for (const axis of ['pitch', 'roll', 'yaw']) {
    element(axis).value = Math.round(pose[axis]);
    element(`${axis}-value`).textContent = `${Math.round(pose[axis])}°`;
  }
}
function stopMotion() {
  motion = false;
  element('motion-toggle').setAttribute('aria-pressed', 'false');
  element('motion-toggle').textContent = reducedMotion.matches ? 'Motion off (reduced motion)' : 'Start motion';
}
function applyPose(next) {
  syncPose(next);
  model?.setPose(pose);
}
for (const axis of ['pitch', 'roll', 'yaw']) element(axis).addEventListener('input', (event) => {
  stopMotion();
  applyPose({ [axis]: Number(event.target.value) });
});
element('zoom').addEventListener('input', (event) => {
  const zoom = Number(event.target.value);
  element('zoom-value').textContent = `${zoom}%`;
  model?.setZoom(zoom / 100);
});
element('front-view').addEventListener('click', () => { stopMotion(); applyPose({ pitch: -8, roll: 0, yaw: 0 }); });
element('rear-view').addEventListener('click', () => { stopMotion(); applyPose({ pitch: -8, roll: 0, yaw: 180 }); });
element('flip-view').addEventListener('click', () => {
  stopMotion(); applyPose({ pitch: -8, yaw: 0, roll: inverted ? 0 : 180 });
});
element('reset-view').addEventListener('click', () => {
  stopMotion(); model?.resetView(); syncPose({ pitch: -8, roll: -5, yaw: -16 });
  element('zoom').value = 100; element('zoom-value').textContent = '100%';
});
element('motion-toggle').addEventListener('click', () => {
  if (motion) stopMotion();
  else {
    motion = true; motionTime = 0;
    element('motion-toggle').setAttribute('aria-pressed', 'true');
    element('motion-toggle').textContent = 'Stop motion';
  }
});
element('reset-demo').addEventListener('click', () => { releaseAll(); stopMotion(); state.reset(); model?.resetView(); element('zoom').value = 100; element('zoom-value').textContent = '100%'; });

function showFlat(force) {
  flat = force;
  flatScreen.hidden = !flat;
  element('model-host').hidden = flat;
  element('flat-toggle').textContent = flat ? '3D view' : 'Screen view';
  element('flat-toggle').setAttribute('aria-pressed', String(flat));
  element('view-status').textContent = flat ? 'Screen view' : inverted ? '3D view / screen flipped' : '3D view';
  if (!flat) model?.resize();
}
element('flat-toggle').addEventListener('click', () => showFlat(!flat));
element('capture-screen').addEventListener('click', () => {
  screen.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `bm83-${state.getSnapshot().track.id}.png`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce('Screen image saved.');
  }, 'image/png');
});

const unsubscribe = state.subscribe(update);
update(state.getSnapshot());
syncPose(pose);
const imageLoads = TRACKS.map(async (track) => {
  const image = new Image();
  image.src = track.artwork;
  try { await image.decode(); images.set(track.id, image); drawScreen(state.getSnapshot()); }
  catch { announce(`Artwork for ${track.title} could not load. The demo controls remain available.`); }
});

try {
  const { createBadgeModel } = await import('./bm83-model.mjs');
  model = await createBadgeModel({
    container: element('model-host'), screenCanvas: screen,
    onAction: (action, phase) => dispatch(state.getSnapshot().settingsOpen && action === 'play' ? 'eq' : action, phase),
    onPoseChange: (next) => { stopMotion(); syncPose(next); },
    onZoomChange: (value) => {
      const percent = Math.round(value * 100);
      element('zoom').value = percent;
      element('zoom-value').textContent = `${percent}%`;
    },
    onOrientationChange: (value) => {
      inverted = value;
      if (!flat) element('view-status').textContent = value ? '3D view / screen flipped' : '3D view';
    },
  });
  element('model-loading').hidden = true;
  element('view-status').textContent = '3D view';
} catch {
  modelFailed = true;
  element('model-loading').hidden = true;
  showFlat(true);
  element('flat-toggle').disabled = true;
  for (const id of ['front-view', 'rear-view', 'flip-view', 'motion-toggle', 'reset-view', 'pitch', 'roll', 'yaw', 'zoom']) element(id).disabled = true;
  announce('3D is unavailable in this browser. The screen view and all playback controls remain available.');
}
function applyMotionPreference() {
  if (reducedMotion.matches) stopMotion();
  if (!modelFailed) element('motion-toggle').disabled = reducedMotion.matches;
  if (!motion) element('motion-toggle').textContent = reducedMotion.matches ? 'Motion off (reduced motion)' : 'Start motion';
}
applyMotionPreference();
reducedMotion.addEventListener('change', applyMotionPreference);
const visibilityObserver = new IntersectionObserver(([entry]) => {
  appVisible = entry.isIntersecting;
  if (!appVisible) releaseAll();
});
visibilityObserver.observe(element('demo-app'));
function tick() {
  const time = performance.now();
  const elapsed = Math.min((time - (lastTime || time)) / 1000, .25);
  lastTime = time;
  if (!document.hidden && appVisible) {
    state.tick(elapsed);
    if (motion && model) {
      motionTime += elapsed;
      applyPose({ pitch: -8 + Math.sin(motionTime * .8) * 24, roll: Math.sin(motionTime * .55) * 180, yaw: Math.sin(motionTime * .45) * 65 });
    }
  }
}
// Playback and held controls use their own clock, independent of GPU frame rate.
timer = setInterval(tick, 40);
document.addEventListener('visibilitychange', () => { if (document.hidden) { releaseAll(); stopMotion(); } lastTime = 0; });
const sendHeight = () => {
  if (window.parent !== window) window.parent.postMessage({ type: 'bm83-demo-height', height: Math.ceil(element('main').getBoundingClientRect().height) + 8 }, location.origin);
};
const heightObserver = new ResizeObserver(sendHeight);
heightObserver.observe(element('main'));
await Promise.allSettled(imageLoads);
sendHeight();
// Read-only inspection supports acceptance checks without a hardware or control API.
window.__bm83Demo = Object.freeze({
  getSnapshot: state.getSnapshot,
  getModelState: () => model?.getDebugState() ?? null,
  getStatus: () => ({ modelReady: Boolean(model), modelFailed, artworkCount: images.size, flat, motion, inverted }),
});
window.addEventListener('pagehide', (event) => {
  releaseAll(); stopMotion();
  if (!event.persisted) { clearInterval(timer); unsubscribe(); model?.dispose(); visibilityObserver.disconnect(); heightObserver.disconnect(); }
});
