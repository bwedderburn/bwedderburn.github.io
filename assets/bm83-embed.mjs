const launch = document.querySelector('[data-launch-bm83]');
const section = launch?.closest('.demo-section');
const mount = section?.querySelector('.demo-mount');
const header = section?.querySelector('.demo-embed-top');
const heading = header?.querySelector('h2');
const status = section?.querySelector('[data-demo-status]');
let iframe;
launch?.addEventListener('click', () => {
  if (iframe || !mount || !header || !heading) return;
  iframe = document.createElement('iframe');
  iframe.title = 'BM83 badge remote interactive demo — simulated playback';
  iframe.src = new URL('../demos/bm83/?embed=1', import.meta.url).href;
  mount.append(iframe);
  mount.hidden = false;
  header.hidden = false;
  section.classList.add('demo-active');
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  if (status) status.textContent = 'BM83 badge remote opened below. Interactive controls are loading; playback is simulated.';
  header.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
});
window.addEventListener('message', (event) => {
  if (!iframe || event.source !== iframe.contentWindow || event.origin !== location.origin || event.data?.type !== 'bm83-demo-height') return;
  const height = Number(event.data.height);
  if (Number.isFinite(height) && height >= 400 && height <= 4500) iframe.style.height = `${Math.ceil(height)}px`;
});
