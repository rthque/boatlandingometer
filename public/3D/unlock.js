import {linkApplication} from './runtime-linker.js';
const $=id=>document.getElementById(id),form=$('unlock'),error=$('error'),enter=$('enter'),password=$('password');
const languageButton=$('language'),passwordLabel=$('password-label'),rememberLabel=$('remember-label'),rememberBox=$('remember');
const memory={urls:[],styles:[]};let vault=null,busy=false,lang=navigator.language.toLowerCase().startsWith('fr')?'fr':'en';
try{const saved=localStorage.getItem('blo-language');if(saved==='fr'||saved==='en')lang=saved;}catch{}
const t=(fr,en)=>lang==='fr'?fr:en;
function labels(){document.documentElement.lang=lang;languageButton.textContent=lang.toUpperCase()+' / '+(lang==='fr'?'EN':'FR');passwordLabel.textContent=t('Mot de passe','Password');rememberLabel.textContent=t('Se souvenir sur cet appareil','Remember on this device');enter.textContent=busy?t('Ouverture…','Opening…'):t('Entrer','Enter');}
languageButton.onclick=()=>{lang=lang==='fr'?'en':'fr';try{localStorage.setItem('blo-language',lang);}catch{}labels();};labels();
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),aad=(id,p)=>new TextEncoder().encode('boatlandingometer-v1:'+id+':'+p);
async function remember(mode,key){return new Promise((resolve,reject)=>{const q=indexedDB.open('boatlandingometer-access',1);q.onupgradeneeded=()=>q.result.createObjectStore('keys');q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,tx=db.transaction('keys',mode==='get'?'readonly':'readwrite'),s=tx.objectStore('keys'),r=mode==='get'?s.get(vault.id):mode==='put'?s.put(key,vault.id):s.delete(vault.id);let value;r.onsuccess=()=>{value=r.result;};tx.oncomplete=()=>{db.close();resolve(value);};tx.onerror=()=>{db.close();reject(tx.error);};};});}
async function get(url){const r=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('network');return r;}
function clean(){for(const u of memory.urls)URL.revokeObjectURL(u);for(const s of memory.styles)s.remove();memory.urls=[];memory.styles=[];delete globalThis.__BLO_UNLOCK__;}
async function start(key){
 const checked=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(vault.check.iv),additionalData:aad(vault.id,'check')},key,b64(vault.check.data));
 if(new TextDecoder().decode(checked)!=='Boatlandingometer team access v1')throw Error('password');
 const r=vault.runtime;if(!r||!/^assets\/[a-f0-9]+\.bin$/.test(r.file))throw Error('manifest');
 const packed=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(r.iv),additionalData:aad(vault.id,'/runtime/application')},key,await(await get(new URL('protected/'+r.file,location.href))).arrayBuffer());
 if(packed.byteLength!==r.size)throw Error('size');
 const app=JSON.parse(await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
 if(app.version!==1||!Array.isArray(app.modules)||app.vault.id!==vault.id)throw Error('manifest');
 const linked=linkApplication(app,new URL('.',location.href),source=>URL.createObjectURL(new Blob([source],{type:'text/javascript'})));memory.urls.push(...linked.urls);
 for(const css of app.styles){const s=document.createElement('style');s.textContent=css.source;document.head.append(s);memory.styles.push(s);}
 const u=linked.entry;
 globalThis.__BLO_UNLOCK__={key,vault:app.vault};
 await new Promise((resolve,reject)=>{const s=document.createElement('script'),timer=setTimeout(()=>{s.remove();reject(Error('timeout'));},25000);s.src=u;s.onload=()=>{clearTimeout(timer);resolve();};s.onerror=()=>{clearTimeout(timer);reject(Error('script'));};document.body.append(s);});
}
function state(on){busy=on;enter.disabled=on||!vault;password.disabled=on;labels();}
form.onsubmit=async e=>{e.preventDefault();if(busy||!vault)return;state(true);const keep=rememberBox.checked;error.textContent='';try{
 const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password.value),'PBKDF2',false,['deriveKey']);password.value='';
 const key=await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:b64(vault.salt),iterations:vault.iterations},material,{name:'AES-GCM',length:256},false,['decrypt']);
 await start(key);if(keep)await remember('put',key).catch(()=>{});else await remember('delete').catch(()=>{});
 }catch{clean();error.textContent=t('Mot de passe incorrect ou chargement indisponible. Réessayez.','Incorrect password or loading unavailable. Please retry.');}finally{state(false);}};
get(new URL('protected/vault.json',location.href)).then(r=>r.json()).then(async v=>{if(v.version!==1||v.iterations<200000||v.iterations>2000000||b64(v.salt).length!==32)throw Error('manifest');vault=v;state(false);try{const k=await remember('get');if(k){state(true);await start(k);}}catch{clean();await remember('delete').catch(()=>{});}finally{state(false);}}).catch(()=>{error.textContent=t('Chargement indisponible. Rechargez pour réessayer.','Loading unavailable. Reload to retry.');});
