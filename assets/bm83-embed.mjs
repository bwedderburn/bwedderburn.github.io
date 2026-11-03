const launch = document.querySelector('[data-launch-bm83]');
const mount = document.querySelector('.demo-mount');
let iframe;
launch?.addEventListener('click', () => {
  if (iframe) return;
  iframe = document.createElement('iframe');
  iframe.title = 'BM83 badge remote interactive demo — simulated playback';
  iframe.src = new URL('../demos/bm83/?embed=1', import.meta.url).href;
  mount.append(iframe);
  mount.hidden = false;
  launch.closest('.demo-section').classList.add('demo-active');
  document.querySelector('.demo-embed-top').hidden = false;
  mount.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
});
window.addEventListener('message', (event) => {
  if (!iframe || event.source !== iframe.contentWindow || event.origin !== location.origin || event.data?.type !== 'bm83-demo-height') return;
  const height = Number(event.data.height);
  if (Number.isFinite(height) && height >= 400 && height <= 4500) iframe.style.height = `${Math.ceil(height)}px`;
});
