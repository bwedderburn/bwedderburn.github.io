// A dedicated browser host for the unchanged Capitals MicroPython application.
const STORAGE_KEY='bwedderburn.capitals.demo.v1';
const BITS=Object.freeze({left:16,right:8,select:4,up:2,down:1,back:8192,menu:16384,home:32});
const MIN_PRESS=90;
const STARTUP_TIMEOUT=35000;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const deepFreeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))deepFreeze(child);Object.freeze(value);}return value;};

export function createCapitalsRuntime({canvas,onStatus=()=>{},onSnapshot=()=>{},onFrame=()=>{},reloadAssets=false}={}){
  if(!(canvas instanceof HTMLCanvasElement))throw new TypeError('A screen canvas is required.');
  const context=canvas.getContext('2d',{alpha:false});
  if(!context)throw new Error('The badge display canvas is unavailable.');
  const abort=new AbortController();
  let worker=null,disposed=false,manualPaused=false,snapshot=null,status='loading',frames=0,generation=0;
  let prepared=null,readyPromise,resolveReady,rejectReady,activated=false,startupTimer;
  let backend='asyncify';
  const fetchOptions={signal:abort.signal,cache:reloadAssets?'reload':'default'};
  const held=new Map();const releaseTimers=new Map();const waiters=new Set();
  let persistenceAvailable=true;
  const report=(state,message)=>{status=state;onStatus({state,message,persistenceAvailable});};
  const publish=value=>{
    snapshot=deepFreeze(value);onSnapshot(snapshot);
    for(const check of [...waiters])check();
    if(!activated){clearTimeout(startupTimer);activated=true;resolveReady(snapshot);report(manualPaused||document.hidden?'paused':'running','World Capitals is running in MicroPython.');}
  };
  const mask=()=>[...held.keys()].reduce((value,action)=>value|BITS[action],0);
  const sendButtons=()=>worker?.postMessage({buttons:mask()});
  function releaseAll(){for(const timer of releaseTimers.values())clearTimeout(timer);releaseTimers.clear();held.clear();sendButtons();}
  function press(action){
    if(disposed||!BITS[action]||manualPaused||document.hidden)return;
    clearTimeout(releaseTimers.get(action));releaseTimers.delete(action);
    if(!held.has(action)){held.set(action,performance.now());sendButtons();}
  }
  function release(action){
    if(!held.has(action))return;
    const remaining=MIN_PRESS-(performance.now()-held.get(action));
    clearTimeout(releaseTimers.get(action));
    if(remaining>0){releaseTimers.set(action,setTimeout(()=>{releaseTimers.delete(action);held.delete(action);sendButtons();},remaining));}
    else {held.delete(action);sendButtons();}
  }
  function updatePause(){
    const paused=manualPaused||document.hidden;
    if(paused)releaseAll();
    worker?.postMessage({pause:paused});
    if(activated)report(paused?'paused':'running',paused?'Paused while the demo is not active.':'World Capitals is running in MicroPython.');
  }
  function storedProgress(){
    try{const value=localStorage.getItem(STORAGE_KEY);if(value&&value.length<65536&&JSON.parse(value)&&typeof JSON.parse(value)==='object')return value;}
    catch{persistenceAvailable=false;}
    return null;
  }
  async function prepare(){
    if(prepared)return prepared;
    const manifestResponse=await fetch(new URL('./SOURCE-MANIFEST.json',import.meta.url),fetchOptions);
    if(!manifestResponse.ok)throw new Error(`The atlas manifest could not load (HTTP ${manifestResponse.status}).`);
    const manifest=await manifestResponse.json();
    const expected=new Map(manifest.files.filter(file=>file.kind==='canonical-capitals').map(file=>[file.path,file]));
    const files=await Promise.all(manifest.appFiles.map(async name=>{
      if(name.startsWith('/')||name.split('/').some(part=>!part||part==='..'))throw new Error('Invalid bundled app path.');
      const response=await fetch(new URL('./app/'+name,import.meta.url),fetchOptions);
      if(!response.ok)throw new Error(`Atlas file ${name} could not load (HTTP ${response.status}).`);
      const bytes=await response.arrayBuffer();const record=expected.get('app/'+name);
      if(!record||bytes.byteLength!==record.bytes)throw new Error('The Capitals source manifest does not match '+name);
      const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
      if(digest!==record.sha256)throw new Error('The Capitals source hash does not match '+name);
      return {name,bytes};
    }));
    return prepared={manifest,files};
  }
  function fail(error,current){
    if(disposed||current!==generation)return;
    generation++;clearTimeout(startupTimer);activated=false;
    abort.abort();worker?.terminate();worker=null;releaseAll();
    const failure=error instanceof Error?error:new Error(String(error));
    report('error',failure.message);rejectReady(failure);
  }
  function start(fresh=false){
    const current=++generation;activated=false;snapshot=null;frames=0;
    readyPromise=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject;});
    // Consumers can await ready; this handler also prevents an abandoned page
    // from leaving an unhandled rejection while its pending fetch is cancelled.
    readyPromise.catch(()=>{});
    report('loading','Loading the bundled badge runtime and atlas…');
    backend='asyncify';
    let stage='Loading and verifying atlas files';
    function launchWorker(files) {
      stage='Starting the MicroPython worker';
      const url=new URL('./worker.mjs?v=startup-retry',import.meta.url);
      url.searchParams.set('backend',backend);
      const next=new Worker(url,{type:'module'});worker=next;
      function handleError(message) {
        if(disposed||current!==generation||next!==worker)return;
        // A small WebKit stack can overflow while Asyncify rewinds native frames.
        // The upstream JSPI build uses the browser's Promise integration instead.
        if(!activated&&backend==='asyncify'&&/maximum call stack size exceeded/i.test(message)
            &&typeof WebAssembly.Suspending==='function'&&typeof WebAssembly.promising==='function'){
          next.terminate();worker=null;backend='jspi';
          clearTimeout(startupTimer);
          startupTimer=setTimeout(()=>fail(new Error(`${stage} exceeded 35 seconds.`),current),STARTUP_TIMEOUT);
          try{launchWorker(files);}catch(error){fail(error,current);}
          return;
        }
        fail(new Error(`${stage} (${backend}): ${message}`),current);
      }
      next.onerror=event=>{event.preventDefault();handleError(event.message||'The browser did not provide worker error details.');};
      next.onmessage=({data})=>{
        if(disposed||current!==generation||next!==worker)return;
        if(data.ready){stage='Opening World Capitals in MicroPython';next.postMessage({start:true,files,progress:fresh?null:storedProgress()});sendButtons();}
        if(data.running){next.postMessage({pause:manualPaused||document.hidden});}
        if(data.error){handleError(data.error);return;}
        if(data.frame){const {width,height,buffer}=data.frame;if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}context.putImageData(new ImageData(new Uint8ClampedArray(buffer),width,height),0,0);frames++;onFrame();}
        if(data.snapshot){publish(data.snapshot);stage='Running World Capitals';}
        if(data.persist){try{if(data.persist.length<65536)localStorage.setItem(STORAGE_KEY,data.persist);}catch{persistenceAvailable=false;}}
        if(data.stdout&&/Traceback|Error:/.test(data.stdout))console.warn('Capitals runtime:',data.stdout);
      };
    }
    startupTimer=setTimeout(()=>fail(new Error(`${stage} exceeded 35 seconds.`),current),STARTUP_TIMEOUT);
    Promise.resolve().then(()=>{
      if(typeof Worker!=='function'||typeof WebAssembly!=='object')throw new Error('This browser does not provide the Web Worker and WebAssembly support needed by the badge app.');
      if(!globalThis.crypto?.subtle)throw new Error('This browser cannot verify the atlas files. Open this HTTPS page in a browser with Web Crypto support.');
      return prepare();
    }).then(({files})=>{
      if(!disposed&&current===generation)launchWorker(files);
    }).catch(error=>fail(error,current));
    return readyPromise;
  }
  function waitFor(predicate,timeout=3000){
    if(predicate(snapshot))return Promise.resolve(snapshot);
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{waiters.delete(check);reject(new Error('The badge did not reach the expected screen.'));},timeout);
      function check(){if(predicate(snapshot)){clearTimeout(timer);waiters.delete(check);resolve(snapshot);}}
      waiters.add(check);
    });
  }
  async function tap(action){press(action);await delay(MIN_PRESS+20);release(action);await delay(100);}
  let activating=false;
  async function activateOption(index){
    if(activating||!snapshot||!Number.isInteger(index)||index<0||index>=(snapshot.options?.length??0))return;
    if(snapshot.mode==='question'&&snapshot.feedback)return;
    activating=true;
    const mode=snapshot.mode;
    try{
      releaseAll();
      await delay(MIN_PRESS);
      if(snapshot?.mode!==mode||index>=(snapshot.options?.length??0))return;
      if(snapshot.mode==='question'&&snapshot.feedback)return;
      for(let turns=0;turns<16&&snapshot.selectedIndex!==index;turns++){
        if(snapshot.mode!==mode)throw new Error('The badge screen changed before selection.');
        const before=snapshot.selectedIndex;await tap(index>before?'down':'up');
        await waitFor(value=>value?.mode!==mode||value?.selectedIndex!==before);
      }
      if(snapshot.mode===mode&&snapshot.selectedIndex===index)await tap('select');
    }finally{activating=false;}
  }
  async function restart(){
    if(!activated)await readyPromise;
    releaseAll();
    await delay(MIN_PRESS);
    if(snapshot?.mode!=='launcher'){await tap('home');await waitFor(value=>value?.mode==='launcher');}
    await tap('select');await waitFor(value=>value?.mode==='menu');
  }
  function resetProgress(){
    releaseAll();worker?.terminate();worker=null;manualPaused=false;
    try{localStorage.removeItem(STORAGE_KEY);}catch{persistenceAvailable=false;}
    return start(true);
  }
  function dispose(){
    if(disposed)return;releaseAll();disposed=true;generation++;clearTimeout(startupTimer);abort.abort();worker?.terminate();worker=null;
    document.removeEventListener('visibilitychange',updatePause);window.removeEventListener('blur',releaseAll);waiters.clear();
  }
  document.addEventListener('visibilitychange',updatePause);window.addEventListener('blur',releaseAll);
  start();
  return {get ready(){return readyPromise;},press,release,releaseAll,tap,activateOption,restart,resetProgress,
    pause(){manualPaused=true;updatePause();},resume(){manualPaused=false;updatePause();},dispose,
    getSnapshot:()=>snapshot,getStatus:()=>({state:status,frames,running:activated&&!manualPaused&&!document.hidden,persistenceAvailable,held:[...held.keys()],runtime:'MicroPython WASM',backend,requestedHeapBytes:7*1024*1024})};
}
