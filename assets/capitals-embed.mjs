const launch = document.querySelector('[data-launch-capitals]');
const mount = document.querySelector('.demo-mount');
let iframe;
launch?.addEventListener('click', () => {
  if (iframe) return;
  iframe = document.createElement('iframe');
  iframe.title = 'World Capitals interactive badge atlas and quiz';
  iframe.src = new URL('../demos/capitals/?embed=1', import.meta.url).href;
  mount.append(iframe);
  mount.hidden = false;
  launch.closest('.demo-section').classList.add('demo-active');
  document.querySelector('.demo-embed-top').hidden = false;
  mount.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
});
window.addEventListener('message', event => {
  if (!iframe || event.source !== iframe.contentWindow || event.origin !== location.origin || event.data?.type !== 'capitals-demo-height') return;
  const height = Number(event.data.height);
  if (Number.isFinite(height) && height >= 400 && height <= 5500) iframe.style.height = `${Math.ceil(height)}px`;
});
