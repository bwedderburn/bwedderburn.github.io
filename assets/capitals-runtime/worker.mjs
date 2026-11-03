// Minimal dedicated host for the reviewed MicroPython WASM runtime.
// The geography and quiz are executed from the unchanged canonical Python files.
WorkerGlobalScope.worker=self;
self.running=false;self.paused=true;self.input=0;self.debug=false;
self.machine={caselights:[0,0,0,0]};
self.sim_buttons=()=>self.input;
self.sim_motion=()=>[0,-16384,0,0,0,0];
self.sim_display_rotation=()=>{}; // Input and texture inversion belong to the 3D adapter.
self.backlight=value=>self.postMessage({backlight:value});
self.update_caselights=()=>{};
self.sim_capitals_snapshot=json=>self.postMessage({snapshot:JSON.parse(String(json))});
self.sim_capitals_persist=json=>self.postMessage({persist:String(json)});
self.sim_capitals_wasm_bytes=()=>globalThis.Module?.HEAPU8?.byteLength??0;
let mp;
function directory(path){let current='';for(const part of path.split('/').filter(Boolean)){current+='/'+part;try{mp.FS.mkdir(current);}catch{}}}
function dataFile(name,bytes){directory(name.slice(0,name.lastIndexOf('/')));try{mp.FS.unlink(name);}catch{}mp.FS.createDataFile(null,name,bytes,true,true);}
function lazyFile(name,url,size){
  directory(name.slice(0,name.lastIndexOf('/')));
  const node=mp.FS.createLazyFile('',name,url,true,false);const contents=node.contents;
  if(contents?.setDataGetter&&'lengthKnown'in contents){
    contents._length=size;contents._chunkSize=size||1;contents.chunks=[];contents.lengthKnown=true;
    contents.setDataGetter(()=>{if(!contents.chunks[0]){const request=new XMLHttpRequest();request.open('GET',url,false);request.responseType='arraybuffer';request.send();if(request.status!==200)throw new Error('Missing bundled runtime file');contents.chunks[0]=new Uint8Array(request.response);}return contents.chunks[0];});
  }
}
const boot=(async()=>{
  const {loadMicroPython}=await import('./asyncify/micropython.mjs');
  mp=await loadMicroPython({heapsize:7*1024*1024,linebuffer:true,stdout:line=>self.postMessage({stdout:String(line)}),stderr:line=>self.postMessage({stdout:String(line)})});
  self.blitrgba=(pointer,width,height)=>{const pixels=globalThis.Module.HEAPU8.slice(pointer,pointer+width*height*4);self.postMessage({frame:{width,height,buffer:pixels.buffer}},[pixels.buffer]);};
  const response=await fetch(new URL('./filesystem.json',import.meta.url));if(!response.ok)throw new Error('Bundled firmware manifest unavailable');
  const {files}=await response.json();for(const [name,size]of Object.entries(files))lazyFile(name,new URL('./filesystem'+name,import.meta.url).href,size);
  directory('/state');self.postMessage({ready:true});
})();
boot.catch(error=>self.postMessage({error:String(error.message??error)}));
self.onmessage=async({data})=>{
  if(data.buttons!==undefined){self.input=data.buttons;return;}
  if(data.pause!==undefined){self.paused=Boolean(data.pause);return;}
  if(data.start){
    try{
      await boot;
      for(const file of data.files)dataFile('/system/apps/capitals/'+file.name,new Uint8Array(file.bytes));
      if(data.progress)dataFile('/state/capitals.json',new TextEncoder().encode(data.progress));
      const response=await fetch(new URL('./launcher.py',import.meta.url));if(!response.ok)throw new Error('Local launcher unavailable');
      self.running=true;self.paused=false;self.postMessage({running:true});
      await mp.runPython(await response.text());
      self.running=false;self.postMessage({completed:true});
    }catch(error){self.running=false;self.postMessage({error:String(error.message??error)});}
  }
};
