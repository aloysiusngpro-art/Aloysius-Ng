(()=>{'use strict';let applying=false;const pending=new Map(),dirty=new Set();
async function api(name,options={}){const res=await fetch('/api/preferences/'+name,{credentials:'same-origin',...options,headers:{'Content-Type':'application/json'}});if(!res.ok)throw Error('Cloud sync unavailable');return res.json();}
function apply(name,value){applying=true;try{if(name==='font')window.ANHFont?.set(value);else window.ANHLanguage?.set(value)}finally{applying=false}}
async function push(name,value){try{await api(name,{method:'PUT',body:JSON.stringify({value})});if(pending.get(name)===value)pending.delete(name)}catch{/* Retain pending changes and retry when connected. */}}
function changed(name,value){if(applying)return;dirty.add(name);pending.set(name,value);push(name,value)}
window.addEventListener('anh-font-changed',e=>changed('font',e.detail.stage));window.addEventListener('anh-language-changed',e=>changed('chinese',e.detail.chinese));
let refreshing=false;async function refresh(){if(refreshing||document.visibilityState==='hidden')return;refreshing=true;try{await Promise.allSettled(['font','chinese'].map(async name=>{if(pending.has(name)){await push(name,pending.get(name));return}const initial=!dirty.has(name);const result=await api(name);if(pending.has(name)||initial&&dirty.has(name))return;if(document.activeElement?.matches('input:not([type=checkbox]):not([type=range]),select,textarea'))return;if(result.value!==null){const current=name==='font'?window.ANHFont?.stage:window.ANHLanguage?.enabled;if(current!==result.value)apply(name,result.value)}}));}catch{}finally{refreshing=false}}
window.addEventListener('focus',refresh);window.addEventListener('online',refresh);document.addEventListener('visibilitychange',refresh);setInterval(refresh,10000);refresh();
})();
