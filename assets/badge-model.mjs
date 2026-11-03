import { initBadgeModel } from './hyb26-model/renderer.mjs';
// Shared actual HYB26 model adapter. Model/artwork rights are separate from MIT code.
const DEFAULT_POSE = { pitch: -8, roll: -5, yaw: -16 };
const OPPOSITE = new Map([[16,8],[8,16],[2,1],[1,2],[256,512],[512,256],[2048,4096],[4096,2048]]);
const RAD = Math.PI / 180;

function addControlSymbols(host) {
  const holder = document.createElement('div');
  holder.hidden = true;
  holder.setAttribute('aria-hidden', 'true');
  // Original geometric control marks, not a character/icon asset pack.
  const symbols = [[16,'Left',['M15 6L9 12L15 18']],[8,'Right',['M9 6L15 12L9 18']],[4,'Select',['M5 12H18V5','M10 7L5 12L10 17']],[2,'Up',['M6 15L12 9L18 15']],[1,'Down',['M6 9L12 15L18 9']],[32,'Home',['M3 11L12 3L21 11','M6 9V21H18V9','M10 21V15H14V21']]];
  for (const [bit,name,paths] of symbols) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    for (const [key,value] of Object.entries({ width:'24',height:'24',viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':'2','stroke-linecap':'round','stroke-linejoin':'round' })) svg.setAttribute(key,value);
    svg.dataset.badgeSymbol = String(bit);
    svg.dataset.badgeSymbolName = name;
    for (const data of paths) {
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',data); svg.append(path);
    }
    holder.append(svg);
  }
  host.append(holder);
  return holder;
}

// Physical presses become logical actions here, including inversion. Consumers
// should deliver these logical actions without swapping them again.
export async function createBadgeModel({container,screenCanvas,onAction=()=>{},onPoseChange=()=>{},onOrientationChange=()=>{},onZoomChange=()=>{}}, profile) {
  if (!(container instanceof HTMLElement) || !(screenCanvas instanceof HTMLCanvasElement)) throw new TypeError('A model container and screen canvas are required.');
  const PHYSICAL = profile.physical;
  const ACTIONS = new Map(profile.actions);
  const abort = new AbortController();
  const symbols = addControlSymbols(container);
  const screenControl = document.createElement('button');
  screenControl.setAttribute('aria-pressed','false');
  const fullControl = document.createElement('button');
  const status = document.createElement('p');
  let pose = {...DEFAULT_POSE};
  let inverted = false;
  let disposed = false;
  let forwardingPhysical = false;
  let view;
  let lastFrame = 0;
  let visible = true;
  const physicalHeld = new Map();
  const externalHeld = new Set();
  const logicalBit = bit => inverted ? OPPOSITE.get(bit) ?? bit : bit;
  const bitForAction = action => logicalBit(PHYSICAL[action]);
  function paintButtons() {
    let mask = 0;
    for (const bit of physicalHeld.keys()) mask |= bit;
    for (const action of externalHeld) for (const [bit,name] of ACTIONS) if (name === action) mask |= logicalBit(bit);
    view?.setButtons(mask);
  }
  function physicalInput(bit,pressed) {
    if (pressed) {
      const action = ACTIONS.get(logicalBit(bit));
      if (!action) return;
      const held = physicalHeld.get(bit);
      physicalHeld.set(bit,{action:held?.action ?? action,count:(held?.count ?? 0)+1});
      if (held) return;
    } else {
      const held = physicalHeld.get(bit);
      if (!held) return;
      if (held.count>1) { held.count-=1; return; }
    }
    const action = physicalHeld.get(bit).action;
    if (!pressed) physicalHeld.delete(bit);
    paintButtons();
    forwardingPhysical = true;
    try { onAction(action,pressed?'press':'release'); }
    finally { forwardingPhysical = false; }
  }
  function releaseAll() {
    const actions = [...new Set([...physicalHeld.values()].map(value=>value.action))];
    physicalHeld.clear(); externalHeld.clear(); paintButtons();
    forwardingPhysical = true;
    try { for (const action of actions) onAction(action,'release'); }
    finally { forwardingPhysical = false; }
  }
  function setPose(next={}) {
    if (disposed) return;
    for (const axis of ['pitch','roll','yaw']) if (Number.isFinite(next[axis])) pose[axis]=Math.max(-360,Math.min(360,next[axis]));
    view?.setPose(pose.pitch,pose.roll,pose.yaw);
    // Local gravity uses the source renderer's intrinsic XYZ rotation order.
    const gy=-Math.cos(pose.pitch*RAD)*Math.cos(pose.roll*RAD)+Math.sin(pose.pitch*RAD)*Math.sin(pose.yaw*RAD)*Math.sin(pose.roll*RAD);
    const nextInverted=gy>.25?true:gy<-.25?false:inverted;
    if (nextInverted!==inverted) {
      inverted=nextInverted;
      // App pixels are upright: apply one correction in the model texture.
      view?.setDisplayRotated(inverted); paintButtons(); onOrientationChange(inverted);
    }
  }
  const originalTouchAction=container.style.touchAction;
  container.style.touchAction='none';
  try {
    view=initBadgeModel(container,screenCanvas,physicalInput,abort.signal,()=>{}, {
      screen:screenControl,full:fullControl,status,displayFit:'contain',idleRotation:false,capture:false,
      modelURL:document.documentElement.dataset.badgeModelSrc,
      canvasLabel:profile.canvasLabel ?? 'Actual GitHub Universe 2026 badge model. Drag to orbit, scroll to zoom, and press its physical buttons or touch pads.',
      onOrbitStart:()=>onPoseChange({...pose}),onZoomChange,
    });
    await view.ready; setPose(DEFAULT_POSE);
  } catch(error) {
    abort.abort(); view?.dispose(); symbols.remove(); container.style.touchAction=originalTouchAction; throw error;
  }
  const observer=new IntersectionObserver(([entry])=>{ visible=entry.isIntersecting; if(!visible)releaseAll(); else view.updateFrame(); });
  observer.observe(container);
  const timer=setInterval(()=>{ if(!disposed&&visible&&!document.hidden&&performance.now()-lastFrame>=1000/30){lastFrame=performance.now();view.updateFrame();} },34);
  window.addEventListener('blur',releaseAll);
  const visibility=()=>{if(document.hidden)releaseAll();};
  document.addEventListener('visibilitychange',visibility);
  return {
    setPose,
    setZoom(value){view.setZoom(value);},
    setButtonPressed(action,pressed){
      if(forwardingPhysical||!PHYSICAL[action])return;
      if(pressed)externalHeld.add(action);else externalHeld.delete(action);paintButtons();
    },
    updateFrame(){view.updateFrame();},
    resize(){view.resize();},
    resetView(){releaseAll();setPose(DEFAULT_POSE);view.resetView();view.setZoom(1);onPoseChange({...pose});},
    getDebugState(){
      const state=view.getDebugState();const buttons={};const touchPads={};
      for(const action of Object.keys(PHYSICAL)){const bit=bitForAction(action);const point=state.bits[bit]??state.pads[bit];if(point)buttons[action]=point;}
      for(const[bit,point]of Object.entries(state.pads)){const action=ACTIONS.get(logicalBit(Number(bit)));if(action)touchPads[action]=point;}
      return{pose:{...pose},inverted,zoom:state.zoom,renders:state.renders,visible,coordinateSpace:'viewport',buttons,touchPads,bitPositions:{...state.bits,...state.pads},actualModel:true,modelUrl:state.modelUrl};
    },
    dispose(){
      if(disposed)return;releaseAll();disposed=true;clearInterval(timer);observer.disconnect();
      window.removeEventListener('blur',releaseAll);document.removeEventListener('visibilitychange',visibility);
      abort.abort();view.dispose();symbols.remove();container.style.touchAction=originalTouchAction;
    },
  };
}
