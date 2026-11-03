import { createBadgeModel } from './capitals-model.mjs';
import { createCapitalsRuntime } from './capitals-runtime/runtime.mjs';

const byId = id => document.getElementById(id);
const canvas = byId('capitals-screen');
const controls = [...document.querySelectorAll('[data-control]')];
const viewControls = ['front-view', 'rear-view', 'flip-view', 'motion-toggle', 'reset-view', 'pitch', 'roll', 'yaw', 'zoom'];
const statusElement = byId('runtime-status');
const held = new Map();
const releaseTimers = new Set();
const pose = {pitch:-8, roll:-5, yaw:-16};
let runtime;
let model;
let running = false;
let modelFailed = false;
let flat = false;
let motion = false;
let inverted = false;
let motionFrame;
let disposed = false;
let lastMirror = '';
let snapshot;
let activation = false;

function enableControls(enabled) {
  for (const button of controls) button.disabled = !enabled;
  byId('reopen-app').disabled = !enabled;
  byId('reset-progress').disabled = !enabled;
  for (const button of byId('screen-options').querySelectorAll('button')) button.disabled = !enabled || activation || Boolean(snapshot?.feedback);
  if(model)for(const id of viewControls)byId(id).disabled=activation||(id==='motion-toggle'&&matchMedia('(prefers-reduced-motion: reduce)').matches);
}
function reportStatus(value) {
  const status = typeof value === 'string' ? {state:'loading',message:value} : value;
  const messages={running:status.persistenceAvailable===false?'World Capitals is ready. Progress is kept for this visit.':'World Capitals is ready. Progress is saved in this browser.',paused:'Paused while the demo is not visible.',loading:'Opening World Capitals and its offline atlas…',error:'The badge app could not start. Reload this page to try again.'};
  statusElement.textContent = messages[status.state] || status.message || 'Opening World Capitals…';
  statusElement.dataset.state = status.state;
  byId('runtime-error').hidden=status.state!=='error';
  byId('runtime-error-text').textContent=status.state==='error'?(status.message||'No additional details are available.'):'';
  running = status.state === 'running';
  enableControls(running);
  if(status.state==='error')byId('reopen-app').disabled=!runtime;
}
function renderSnapshot(value) {
  if (!value) return;
  snapshot = value;
  const signature = JSON.stringify(value);
  if (signature === lastMirror) return;
  lastMirror = signature;
  byId('screen-title').textContent = value.title || 'World Capitals';
  byId('screen-context').textContent = value.mode === 'launcher' ? 'Badge launcher' : value.scope === 'us' ? 'United States' : value.mode === 'menu' ? 'Atlas and quiz' : 'World';
  byId('screen-summary').textContent = value.summary || (value.mode === 'launcher' ? 'Select World Capitals to open the app.' : value.question ? (typeof value.question === 'string' ? value.question : value.question.text || value.question.prompt || '') : value.progress ? `${value.progress.filterLabel || 'All places'} · ${value.progress.order || 'Random'}` : 'Explore the atlas or practice with a short quiz.');
  const lines = byId('screen-lines');
  lines.replaceChildren();
  const readableLines=[...(value.lines||[])];
  if (value.mode?.startsWith('explore') || value.mode==='detail') {
    if(value.record&&!readableLines.some(Boolean)){readableLines.push(value.record.name);if(value.record.capital)readableLines.push(`${value.record.question} ${value.record.capital}`);if(value.record.note)readableLines.push(value.record.note);}
    if(value.map&&!String(value.summary||'').includes(value.map.title))readableLines.push(`Map: ${value.map.title||value.map.id.replaceAll('_',' ')} · ${value.map.index+1} of ${value.map.count}`);
    if(value.page&&!value.summary)readableLines.push(`List page ${value.page.index+1} of ${value.page.count}`);
  }
  if(value.score)readableLines.push(`Round score: ${value.score.correct} correct · ${value.score.answered} checked · ${value.score.total} questions`);
  if(value.mode==='results')for(const missed of value.missed||[])readableLines.push(`${missed.record.name}: you chose ${missed.chosen}. ${missed.record.question} ${missed.record.capital}`);
  for (const line of readableLines) {
    if (!line) continue;
    const paragraph = document.createElement('p');
    paragraph.textContent = typeof line === 'string' ? line : line.text || '';
    lines.append(paragraph);
  }
  const options = byId('screen-options');
  const nextOptions = value.options || [];
  while (options.children.length > nextOptions.length) options.lastChild.remove();
  nextOptions.forEach((option, index) => {
    let button = options.children[index];
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.dataset.option = String(index);
      button.addEventListener('click', () => activateOption(index));
      options.append(button);
    }
    const label = typeof option === 'string' ? option : option.label;
    const detail = typeof option === 'object' ? option.value : null;
    const text = `${label || ''}${detail ? `: ${detail}` : ''}`;
    if (button.textContent !== text) button.textContent = text;
    button.setAttribute('aria-pressed', String(Boolean(option.selected ?? index === value.selectedIndex)));
    button.disabled = !running || activation || Boolean(value.feedback);
  });
  const feedback = byId('screen-feedback');
  const feedbackText = typeof value.feedback === 'string' ? value.feedback : value.feedback ? `${value.feedback.correct?'Correct.':'Incorrect.'} ${value.feedback.correct?'':`You chose ${value.feedback.chosen}. `}${value.record?.question||'Answer:'} ${value.feedback.answer}. ${value.feedback.note||''}` : '';
  feedback.hidden = !feedbackText;
  feedback.textContent = feedbackText;
  if (typeof value.feedback?.correct === 'boolean') feedback.dataset.correct = String(value.feedback.correct);
  else delete feedback.dataset.correct;
  byId('screen-hint').textContent = value.hint || 'Use Up and Down to choose, then Select. Back returns to the previous view.';
  model?.updateFrame();
  reportHeight();
}
async function activateOption(index) {
  if (!running || activation || !runtime?.activateOption) return;
  releaseAll();
  activation = true;
  enableControls(false);
  try { await runtime.activateOption(index); }
  catch (error) { reportStatus({state:'error',message:`That selection could not finish. Reopen the app to continue. ${error.message || ''}`}); }
  finally { activation = false; enableControls(running);if(running)document.querySelector('[data-control="select"]').focus({preventScroll:true}); }
}
function press(action, source) {
  if (!running || disposed || activation || held.has(source)) return;
  const alreadyHeld = [...held.values()].some(item => item.action === action);
  held.set(source,{action,since:performance.now()});
  if (!alreadyHeld) runtime.press(action);
  model?.setButtonPressed(action,true);
  for (const button of controls) if (button.dataset.control === action) button.dataset.held = 'true';
}
function release(source, immediate = false) {
  const item = held.get(source);
  if (!item) return;
  held.delete(source);
  const finish = () => {
    if ([...held.values()].some(value => value.action === item.action)) return;
    runtime?.release(item.action);
    model?.setButtonPressed(item.action,false);
    for (const button of controls) if (button.dataset.control === item.action) delete button.dataset.held;
  };
  const delay = immediate ? 0 : Math.max(0,90-(performance.now()-item.since));
  if (!delay) finish();
  else { const timer=setTimeout(()=>{releaseTimers.delete(timer);finish();},delay); releaseTimers.add(timer); }
}
function releaseAll() {
  held.clear();
  for (const timer of releaseTimers) clearTimeout(timer);
  releaseTimers.clear();
  runtime?.releaseAll();
  for (const action of ['up','down','left','right','select','back','home','menu']) model?.setButtonPressed(action,false);
  for (const button of controls) delete button.dataset.held;
}
function tap(action) { const source=Symbol(action);press(action,source);release(source); }
for (const button of controls) {
  button.addEventListener('pointerdown',event=>{
    if (event.button!==0) return;
    event.preventDefault(); button.focus();button.setPointerCapture(event.pointerId);
    press(button.dataset.control,`pointer:${event.pointerId}`);
  });
  for (const eventName of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(eventName,event=>release(`pointer:${event.pointerId}`));
  button.addEventListener('click',event=>{if(event.detail===0)tap(button.dataset.control);});
}
const keys = new Map([['ArrowUp','up'],['ArrowDown','down'],['ArrowLeft','left'],['ArrowRight','right'],['Enter','select'],[' ','select'],['Escape','back'],['Backspace','back'],['h','home'],['H','home'],['m','menu'],['M','menu'],['w','up'],['a','left'],['s','down'],['d','right']]);
function keyDown(event) {
  if(event.ctrlKey||event.metaKey||event.altKey)return;
  if (!byId('main').contains(event.target) || event.target.closest('input,select,textarea,summary,a')) return;
  if (event.target.closest('button') && (event.key===' ' || event.key==='Enter')) return;
  const action=keys.get(event.key);
  if (!action) return;
  event.preventDefault();if(!event.repeat)press(action,`key:${event.code}`);
}
function keyUp(event) { if(held.has(`key:${event.code}`)){event.preventDefault();release(`key:${event.code}`);} }
window.addEventListener('keydown',keyDown);
window.addEventListener('keyup',keyUp);
window.addEventListener('blur',releaseAll);

function setFlat(next) {
  flat=Boolean(next)||modelFailed;
  byId('model-stage').classList.toggle('screen-only',flat);
  canvas.hidden=!flat;
  byId('model-host').hidden=flat;
  byId('flat-toggle').setAttribute('aria-pressed',String(flat));
  byId('flat-toggle').textContent=flat&&!modelFailed?'3D view':'Screen view';
  byId('view-status').textContent=modelFailed?'Screen view · 3D unavailable':flat?'Screen view':'3D view';
  if(!flat)requestAnimationFrame(()=>model?.resize());
  reportHeight();
}
function setPose(next) {
  for(const axis of ['pitch','roll','yaw']) if(Number.isFinite(next[axis]))pose[axis]=next[axis];
  model?.setPose(pose);
  for(const axis of ['pitch','roll','yaw']) { byId(axis).value=String(Math.round(pose[axis]));byId(`${axis}-value`).textContent=`${Math.round(pose[axis])}°`; }
}
function stopMotion() { motion=false;cancelAnimationFrame(motionFrame);byId('motion-toggle').setAttribute('aria-pressed','false');byId('motion-toggle').textContent='Start motion'; }
function startMotion() {
  if(!model||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  motion=true;byId('motion-toggle').setAttribute('aria-pressed','true');byId('motion-toggle').textContent='Stop motion';
  const started=performance.now();
  const step=now=>{if(!motion||disposed)return;setPose({pitch:-8+Math.sin((now-started)/1400)*12,yaw:((now-started)/50-16)%360,roll:Math.sin((now-started)/2000)*14});motionFrame=requestAnimationFrame(step);};
  motionFrame=requestAnimationFrame(step);
}
byId('flat-toggle').addEventListener('click',()=>setFlat(!flat));
byId('reset-view').addEventListener('click',()=>{stopMotion();model?.resetView();setPose({pitch:-8,roll:-5,yaw:-16});byId('zoom').value='100';byId('zoom-value').textContent='100%';});
byId('front-view').addEventListener('click',()=>{stopMotion();setPose({pitch:0,roll:0,yaw:0});setFlat(false);});
byId('rear-view').addEventListener('click',()=>{stopMotion();setPose({pitch:0,roll:0,yaw:180});setFlat(false);});
byId('flip-view').addEventListener('click',()=>{stopMotion();releaseAll();setPose({roll:inverted?0:180});});
byId('motion-toggle').addEventListener('click',()=>motion?stopMotion():startMotion());
for(const axis of ['pitch','roll','yaw'])byId(axis).addEventListener('input',()=>{stopMotion();setPose({[axis]:Number(byId(axis).value)});});
byId('zoom').addEventListener('input',()=>{model?.setZoom(Number(byId('zoom').value)/100);byId('zoom-value').textContent=`${byId('zoom').value}%`;});
byId('reopen-app').addEventListener('click',async()=>{
  if(activation||!runtime)return;
  releaseAll();activation=true;enableControls(false);
  try{await runtime.restart();}
  catch(error){reportStatus({state:'error',message:error.message});}
  finally{activation=false;enableControls(running);}
});
byId('reset-progress').addEventListener('click',()=>{
  if(!confirm('Reset World Capitals settings and scores in this browser? This does not change the physical badge.'))return;
  releaseAll();runtime?.resetProgress();
});
function reportHeight() { if(window.parent!==window)window.parent.postMessage({type:'capitals-demo-height',height:Math.ceil(byId('main').getBoundingClientRect().height)+8},location.origin); }
let inView=true;
const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;updateVisibility();});
observer.observe(byId('capitals-app'));
function updateVisibility(){if(!runtime)return;if(document.hidden||!inView){releaseAll();stopMotion();runtime.pause();}else runtime.resume();}
document.addEventListener('visibilitychange',updateVisibility);
const heightObserver=new ResizeObserver(reportHeight);heightObserver.observe(byId('main'));

async function boot() {
  for(const id of viewControls)byId(id).disabled=true;
  const runtimeTask=(async()=>{
    runtime=await createCapitalsRuntime({canvas,onStatus:reportStatus,onSnapshot:renderSnapshot});
    await runtime.ready;
    renderSnapshot(runtime.getSnapshot());
    updateVisibility();
  })();
  const modelTask=(async()=>{
    try {
      model=await createBadgeModel({container:byId('model-host'),screenCanvas:canvas,
        onAction:(action,phase)=>phase==='press'?press(action,`model:${action}`):release(`model:${action}`),
        onPoseChange:next=>{stopMotion();setPose(next);},
        onOrientationChange:value=>{releaseAll();inverted=value;},
        onZoomChange:value=>{byId('zoom').value=String(Math.round(value*100));byId('zoom-value').textContent=`${Math.round(value*100)}%`;}
      });
      for(const id of viewControls)byId(id).disabled=false;
      if(matchMedia('(prefers-reduced-motion: reduce)').matches)byId('motion-toggle').disabled=true;
      setFlat(flat);
    } catch(error) { modelFailed=true;byId('flat-toggle').disabled=true;setFlat(true); }
    finally {byId('model-loading').hidden=true;}
  })();
  try {await runtimeTask;}
  catch(error) {reportStatus({state:'error',message:`The app could not start. Reload this page to try again. ${error.message||''}`});}
  await modelTask;
}
window.__capitalsDemo=Object.freeze({getSnapshot:()=>runtime?.getSnapshot()??snapshot??null,getModelState:()=>model?.getDebugState()??null,getRuntimeStatus:()=>runtime?.getStatus()??null,getStatus:()=>({running,modelReady:Boolean(model),modelFailed,flat,motion,inverted}),getCoverage:()=>snapshot?.counts??null});
window.addEventListener('pagehide',event=>{releaseAll();stopMotion();if(event.persisted){runtime?.pause();return;}disposed=true;observer.disconnect();heightObserver.disconnect();runtime?.dispose();model?.dispose();});
window.addEventListener('pageshow',event=>{if(event.persisted)updateVisibility();});
boot();
