(async()=>{
 const input=document.getElementById('projectName'),list=document.getElementById('condoProjects'),status=document.getElementById('projectDirectoryStatus');
 let projects=[],shown=[],active=-1,loaded=false;
 const norm=s=>s.toLowerCase().replace(/@/g,' at ').replace(/&/g,' and ').replace(/[‘’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
 const close=()=>{list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1};
 function choose(project){input.value=project.name;input.dispatchEvent(new Event('input',{bubbles:true}));close();input.focus()}
 function activate(index){active=index;[...list.querySelectorAll('[role="option"]')].forEach((el,i)=>{el.setAttribute('aria-selected',i===active?'true':'false');if(i===active){input.setAttribute('aria-activedescendant',el.id);el.scrollIntoView({block:'nearest'})}})}
 function render(){
  const q=norm(input.value),tokens=q.split(' ').filter(Boolean),compact=q.replace(/ /g,'');
  shown=projects.map(p=>{const n=norm(p.name),words=n.split(' ');const rank=!q?3:n.startsWith(q)?0:tokens.every(t=>words.some(w=>w.startsWith(t)))?1:compact.length>2&&n.replace(/ /g,'').includes(compact)?2:-1;return {p,rank}}).filter(x=>x.rank>=0).sort((a,b)=>a.rank-b.rank||a.p.name.localeCompare(b.p.name)).slice(0,12).map(x=>x.p);
  list.replaceChildren();active=-1;input.removeAttribute('aria-activedescendant');
  const header=document.createElement('div');header.className='dropdown-caption';header.textContent=q?'MATCHING PROJECTS':'EXPLORE CONDO PROJECTS';list.append(header);
  if(!loaded||!shown.length){const empty=document.createElement('p');empty.className='dropdown-empty';empty.textContent=!loaded?'Loading projects…':'No matching project. You can use the name you typed.';list.append(empty)}
  shown.forEach((p,i)=>{const option=document.createElement('div');option.className='project-option';option.id='project-option-'+i;option.setAttribute('role','option');option.setAttribute('aria-selected','false');option.style.setProperty('--option-index',i);const name=document.createElement('strong');name.textContent=p.name;const detail=document.createElement('small');detail.textContent=p.detail;option.append(name,detail);option.addEventListener('pointerdown',e=>{e.preventDefault();choose(p)});option.addEventListener('pointermove',()=>activate(i));list.append(option)});
  list.hidden=false;input.setAttribute('aria-expanded','true');
 }
 input.addEventListener('focus',render);input.addEventListener('input',render);
 input.addEventListener('blur',close);
 input.addEventListener('keydown',e=>{if(e.key==='Escape'){close();return}if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(list.hidden)render();if(shown.length)activate(active===-1?(e.key==='ArrowDown'?0:shown.length-1):(active+(e.key==='ArrowDown'?1:-1)+shown.length)%shown.length)}else if(e.key==='Enter'&&!list.hidden&&active>=0){e.preventDefault();choose(shown[active])}else if(e.key==='Tab')close()});
 try{const response=await fetch('assets/condo-projects.json');if(!response.ok)throw Error();const data=await response.json();projects=data.projects;try{const launches=await window.anhAGLS.ready;const seen=new Set(projects.map(p=>norm(p.name)));for(const p of launches.projects.filter(p=>!['Industrial','Commercial / industrial'].includes(p.status))){if(!seen.has(norm(p.name))){projects.push({name:p.name,detail:'Uploaded launch database · '+p.status});seen.add(norm(p.name))}}}catch{}loaded=true;status.append(document.createTextNode(`${projects.length.toLocaleString()} project suggestions · `));const link=document.createElement('a');link.href=data.source;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Stacked directory';status.append(link);if(document.activeElement===input)render()}catch{status.textContent='Project suggestions are unavailable. You can still enter a project name.';close()}
})();
