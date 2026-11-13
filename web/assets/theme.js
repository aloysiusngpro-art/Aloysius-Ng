(()=>{'use strict';
const key='anh-dark-mode-v1',root=document.documentElement;let enabled=false;
try{enabled=localStorage.getItem(key)==='dark'}catch{}
function set(value){enabled=!!value;root.dataset.anhTheme=enabled?'dark':'light';root.style.colorScheme=enabled?'dark':'light';const button=document.getElementById('anhThemeToggle');if(button){button.setAttribute('aria-checked',String(enabled));button.title=enabled?'Switch to light mode · 切换浅色模式':'Switch to dark mode · 切换深色模式';}try{localStorage.setItem(key,enabled?'dark':'light')}catch{}}
set(enabled);
function mount(){if(document.getElementById('anhThemeToggle'))return;const host=document.querySelector('.header-preferences')||document.querySelector('.font-toolbar');if(!host)return;const b=document.createElement('button');b.id='anhThemeToggle';b.type='button';b.className='anh-theme-toggle';b.setAttribute('role','switch');b.setAttribute('aria-label','Dark mode · 深色模式');b.innerHTML='<span class="theme-moon" aria-hidden="true">☾</span><span>Dark mode</span><span class="theme-switch-track" aria-hidden="true"><i></i></span>';b.addEventListener('click',()=>set(!enabled));host.append(b);set(enabled);}
window.ANHTheme={set,get enabled(){return enabled}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
window.addEventListener('storage',e=>{if(e.key===key)set(e.newValue==='dark')});
})();
