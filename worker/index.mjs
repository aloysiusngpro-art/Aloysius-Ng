const assets=__ASSET_MAP__;
const enc=new TextEncoder();const attempts=new Map();
const loginPage=(message='')=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Login | ALOYSIUS NG HOMES</title><link rel="icon" href="/assets/propnex-logo.png"><style>@font-face{font-family:Signature;src:url('/signature.ttf')}@font-face{font-family:AuditUI;src:url('/ui-font.ttf');font-weight:200 800}*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0;background:#0A1128;color:#fff;font:21.6px/1.6 AuditUI,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}body>.font-toolbar{position:relative;top:auto;left:auto}body{padding-top:0}.card{margin:24px;width:calc(100% - 48px);max-width:480px;padding:38px;border:1px solid #C5A05966;border-radius:22px;background:#1C2541;box-shadow:0 24px 70px #0003;text-align:center}img{display:block;width:240px;max-width:100%;height:auto;object-fit:contain;margin:0 auto;border-radius:0}h1{font:800 30px/1.3 AuditUI,Arial,sans-serif;letter-spacing:.055em;margin:18px 0 8px;-webkit-text-stroke:0;font-synthesis:none}p{color:#e0cb9f;margin:6px 0 26px;font-size:19.2px}label{display:block;text-align:left;font-weight:500;margin-bottom:8px}input{width:100%;padding:15px;border:1px solid #66718a;border-radius:10px;background:#fff;color:#0B132B;font:inherit}input:focus{outline:3px solid #C5A059;outline-offset:2px}button{width:100%;margin-top:20px;padding:15px;border:0;border-radius:10px;background:#C5A059;color:#0B132B;font:600 21.6px inherit;cursor:pointer}.error{color:#ffd9d5;background:#ffffff0d;padding:12px;border-radius:8px;text-align:left;font-size:19.2px}.note{font-size:16.8px;color:#bdc4d3;margin:20px 0 0}.contact{font-size:18px;color:#e0cb9f;margin-top:20px;line-height:1.8}.contact a{color:#e0cb9f;text-decoration:none}@media(max-width:480px){.card{padding:28px 22px}h1{font-size:26px}}</style><link rel="stylesheet" href="/assets/account-ui.css"><link rel="stylesheet" href="/assets/brand-header.css"><link rel="stylesheet" href="/assets/language.css"><link rel="stylesheet" href="/assets/dark-mode.css"><script src="/assets/theme.js"></script></head><body><script src="/assets/font-size.js"></script><main class="card"><div class="login-partner"><span class="partner-wordmark" aria-label="PropNex, ALOYSIUS NG & Associates"><img src="/assets/propnex-logo.png" alt="PropNex &amp; Associates"><img class="partner-white-lettering" src="/assets/propnex-logo.png" alt="" aria-hidden="true"></span></div><h1>ALOYSIUS NG HOMES</h1><p>Sell Strong, Buy Smart</p>${message?`<p class="error" role="alert">${message}</p>`:''}<form action="/login" method="post"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus maxlength="256"><button type="submit">Log in</button></form><p class="note">Enter the website password to continue.</p><div class="contact">Registration No. R069068Z<br><a href="tel:+6593832114">HP: 9383 2114</a></div></main><p class="site-disclaimer" style="font-style:italic;opacity:.72;max-width:640px;text-align:center;padding:0 24px;font-size:15px">Disclaimer: This worksheet is for illustration purposes only. Actual figures may vary.</p><script src="/assets/language.js"></script><script src="/assets/site-navigation.js"></script></body></html>`;
function headers(extra={}){return {'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com https://*.chatgpt.com; base-uri 'self'",...extra}}
const html=(s,status=200,extra={})=>new Response(s,{status,headers:headers({'Content-Type':'text/html; charset=utf-8',...extra})});
const redirect=(path,extra={})=>new Response(null,{status:303,headers:headers({Location:path,...extra})});
function base64(bytes){let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function unbase64(s){return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))}
async function hmacKey(secret){return crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}
async function token(secret,uid=null){const payload=base64(enc.encode(JSON.stringify({uid,exp:Date.now()+8*3600000,nonce:crypto.randomUUID()})));const sig=base64(new Uint8Array(await crypto.subtle.sign('HMAC',await hmacKey(secret),enc.encode(payload))));return payload+'.'+sig}
async function authenticated(request,secret){try{const cookie=request.headers.get('cookie')||'',match=cookie.match(/(?:^|;\s*)__Host-anh_session=([^;]+)/);if(!match)return false;const [payload,sig,...rest]=match[1].split('.');if(rest.length||!payload||!sig)return false;if(!await crypto.subtle.verify('HMAC',await hmacKey(secret),unbase64(sig),enc.encode(payload)))return false;const data=JSON.parse(new TextDecoder().decode(unbase64(payload)));return Number.isFinite(data.exp)&&data.exp>Date.now()&&data.exp<=Date.now()+8*3600000?data:null}catch{return false}}
async function validPassword(password,env){const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);const bits=new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(env.ANH_PASSWORD_SALT),iterations:100000,hash:'SHA-256'},key,256));const expected=env.ANH_PASSWORD_HASH;const value=[...bits].map(x=>x.toString(16).padStart(2,'0')).join('');if(value.length!==expected.length)return false;let delta=0;for(let i=0;i<value.length;i++)delta|=value.charCodeAt(i)^expected.charCodeAt(i);return delta===0}
const decodedAssets=new Map();
function asset(path,method){const item=assets[path];if(!item)return new Response('Not found',{status:404,headers:headers()});if(method==='HEAD')return new Response(null,{headers:headers({'Content-Type':item.type})});if(!decodedAssets.has(path))decodedAssets.set(path,Uint8Array.from(atob(item.data),c=>c.charCodeAt(0)));return new Response(decodedAssets.get(path),{headers:headers({'Content-Type':item.type})})}

const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:headers({'Content-Type':'application/json'})});
const sessionCookie=value=>`__Host-anh_session=${value}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=28800`;
async function attachmentsAPI(request,env){
 if(!env.BUCKET)return json({error:'Attachment storage is unavailable'},503);
 const path=new URL(request.url).pathname,id=path.slice('/api/attachments/'.length);
 if(request.method==='GET'&&/^\w[\w-]{0,99}$/.test(id)){const obj=await env.BUCKET.get('report-attachments/'+id);if(!obj)return json({error:'Attachment not found'},404);return new Response(obj.body,{headers:headers({'Content-Type':obj.httpMetadata?.contentType||'application/octet-stream','Content-Disposition':'inline; filename="attachment"','Cache-Control':'private, max-age=300'})})}
 if(path!=='/api/attachments'||request.method!=='POST')return json({error:'Method not allowed'},405);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Request not allowed'},403);
 if(Number(request.headers.get('content-length')||0)>11*1024*1024)return json({error:'Maximum file size is 10 MB'},413);
 try{const form=await request.formData(),file=form.get('file');if(!file||typeof file.arrayBuffer!=='function'||file.size>10*1024*1024||file.size===0)return json({error:'Choose a PDF or picture up to 10 MB'},400);const bytes=new Uint8Array(await file.arrayBuffer()),ascii=(start,end)=>String.fromCharCode(...bytes.slice(start,end));let mime;if(ascii(0,5)==='%PDF-')mime='application/pdf';else if(bytes[0]===137&&ascii(1,4)==='PNG')mime='image/png';else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)mime='image/jpeg';else if(ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP')mime='image/webp';else return json({error:'Supported formats: PDF, JPG, PNG and WebP'},415);const id=crypto.randomUUID();await env.BUCKET.put('report-attachments/'+id,bytes,{httpMetadata:{contentType:mime}});return json({id,name:String(file.name||'Attachment').slice(0,180),mime,size:bytes.length});}catch{return json({error:'The attachment could not upload. Please retry.'},400)}
}
async function reportsAPI(request,env,userId,kind='reports'){
 if(!env.BUCKET)return json({error:'Account report storage is temporarily unavailable'},503);
 const url=new URL(request.url),path=url.pathname;
 const owner=base64(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(userId)))),prefix='account-'+kind+'/'+owner+'/';
 try{
  if(path==='/api/'+kind&&request.method==='GET'){
   const listing=await env.BUCKET.list({prefix,limit:50,cursor:url.searchParams.get('cursor')||undefined});const reports=[];
   for(let i=0;i<listing.objects.length;i+=8){const batch=await Promise.all(listing.objects.slice(i,i+8).map(async item=>{const obj=await env.BUCKET.get(item.key);return obj?obj.json():null}));for(const record of batch)if(record&&!record.deleted)reports.push(record)}reports.sort((a,b)=>String(b.savedAt||'').localeCompare(String(a.savedAt||'')));return json({[kind]:reports,cursor:listing.truncated?listing.cursor:null});
  }
  const id=path.slice(('/api/'+kind+'/').length);if(!/^[a-zA-Z0-9_-]{1,100}$/.test(id))return json({error:'Invalid report ID'},400);
  const key=prefix+id+'.json';
  if(request.method==='GET'){const obj=await env.BUCKET.get(key);if(!obj)return json({error:'Record not found'},404);const record=await obj.json();return record.deleted?json({error:'Record not found'},404):json(record)}
  if(request.headers.get('origin')!==url.origin)return json({error:'Request not allowed'},403);
  if(request.method==='DELETE'){await env.BUCKET.put(key,JSON.stringify({id,deleted:true,savedAt:new Date().toISOString()}));return json({ok:true})}
  if(request.method==='PUT'){
   if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required'},415);
   if(Number(request.headers.get('content-length')||0)>131072)return json({error:'Report too large'},413);
   const body=await request.text();if(enc.encode(body).length>131072)return json({error:'Report too large'},413);let report;try{report=JSON.parse(body)}catch{return json({error:'Invalid report'},400)}
   if(report?.id!==id)return json({error:'Invalid record'},400);
   if(kind==='profiles'){
    if(typeof report.client!=='string'||report.client.length>500||!Array.isArray(report.fields)||report.fields.length>1500||!Number.isInteger(report.plans)||report.plans<1||report.plans>20||report.fields.some(f=>!f||typeof f.value!=='string'||f.value.length>20000||typeof f.id!=='string'||f.id.length>150||typeof f.name!=='string'||f.name.length>150)||typeof report.adviserSummary!=='string'||typeof report.adviserActions!=='string')return json({error:'Invalid profile'},400);
   }else if(kind==='property-searches'){
    let link;try{link=new URL(report.url)}catch{return json({error:'Invalid search link'},400)}
    if(typeof report.title!=='string'||!report.title.trim()||report.title.length>120||typeof report.notes!=='string'||report.notes.length>1500||typeof report.url!=='string'||report.url.length>8000||link.protocol!=='https:'||!['propertyguru.com.sg','www.propertyguru.com.sg'].includes(link.hostname)||link.username||link.password||link.port||!(/-for-(sale|rent)(\/|$)/.test(link.pathname)||link.pathname==='/property-search'))return json({error:'Invalid property search'},400);
    report={id:report.id,title:report.title.trim(),url:report.url,notes:report.notes};
   }else if(typeof report.projectName!=='string'||report.projectName.length>100||!report.answers||typeof report.answers!=='object'||Array.isArray(report.answers))return json({error:'Invalid report'},400);
   if(request.headers.get('x-anh-import')==='true'&&await env.BUCKET.get(key))return json({ok:true,skipped:true});
   report.savedAt=request.headers.get('x-anh-import')==='true'&&Number.isFinite(Date.parse(report.savedAt))?report.savedAt:new Date().toISOString();
   await env.BUCKET.put(key,JSON.stringify(report),{httpMetadata:{contentType:'application/json'}});return json({ok:true});
  }
  return json({error:'Method not allowed'},405);
 }catch{return json({error:'Unable to sync account reports. Please retry.'},503)}
}
const lifestyleInflight=new Map(),jsonAssets=new Map();
const locationNorm=s=>String(s||'').toLowerCase().replace(/@/g,' at ').replace(/&/g,' and ').replace(/[^a-z0-9]/g,'');
function embeddedJSON(path){if(!jsonAssets.has(path))jsonAssets.set(path,JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(assets[path].data),c=>c.charCodeAt(0)))));return jsonAssets.get(path)}
function lifestyleProject(name){const key=locationNorm(name),directory=embeddedJSON('/assets/condo-projects.json'),project=directory.projects.find(p=>locationNorm(p.name)===key);if(!project)return null;const address=project.detail.split('·').slice(1).join('·').trim(),rows=embeddedJSON('/assets/property-addresses.json').properties.filter(r=>locationNorm(r[0])===key),house=address.match(/^\d+[A-Za-z]?/)?.[0],row=rows.find(r=>r[1]===house)||rows[0];return {projectName:project.name,projectKey:key,address,addressSource:directory.source,postal:row&&row[1]===house?row[3]:null}}
function distanceMetres(a,b){const rad=Math.PI/180,p=(b.lat-a.lat)*rad,q=(b.lon-a.lon)*rad,x=Math.sin(p/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(q/2)**2;return Math.round(6371000*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)))}
async function overpass(query){const response=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'ANHPropertyScorecard/1.0 (+https://aloysius-ng-homes.ansh199939.chatgpt.site)'},body:new URLSearchParams({data:query}),signal:AbortSignal.timeout(23000)});if(!response.ok)throw Error('Map service unavailable');const data=await response.json();if(data.remark)throw Error('Map query incomplete');return data.elements||[]}
function lifestyleCategory(t){if(t.railway==='station'||t.railway==='halt'||t.highway==='bus_stop'||t.amenity==='bus_station')return 'transport';if(['supermarket','convenience','greengrocer'].includes(t.shop)||t.amenity==='marketplace')return 'essentials';if(['restaurant','cafe','food_court','fast_food'].includes(t.amenity))return 'dining';if(t.shop==='mall')return 'retail';if(['clinic','hospital','doctors','pharmacy'].includes(t.amenity)||t.healthcare)return 'healthcare';if(['park','sports_centre','fitness_centre'].includes(t.leisure)||t.amenity==='community_centre')return 'recreation';if(['school','kindergarten','college'].includes(t.amenity))return 'education';return null}
async function retrieveLifestyle(project){
 const escaped=project.projectName.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),name=JSON.stringify('^'+escaped+'$'),postal=project.postal?`nwr["addr:postcode"=${JSON.stringify(project.postal)}](1.15,103.55,1.49,104.12);`:'';
 const found=await overpass(`[out:json][timeout:18];(nwr["name"~${name},i](1.15,103.55,1.49,104.12);${postal});out body center 30;`);
 const valid=found.map(e=>({...e,...(e.center||{})})).filter(e=>Number.isFinite(e.lat)&&Number.isFinite(e.lon)&&e.lat>1.15&&e.lat<1.49&&e.lon>103.55&&e.lon<104.12).sort((a,b)=>Number(locationNorm(b.tags?.name)===project.projectKey)-Number(locationNorm(a.tags?.name)===project.projectKey));
 const origin=valid.find(e=>locationNorm(e.tags?.name)===project.projectKey)||valid.find(e=>e.tags?.['addr:postcode']===project.postal&&e.tags?.['addr:housenumber']===project.address.match(/^\d+[A-Za-z]?/)?.[0]);
 if(!origin)return {...project,status:'unmatched',checkedAt:new Date().toISOString(),items:[],note:'The directory address could not be matched confidently on the map. Nearby amenities have not been inferred.'};
 const bbox=[origin.lat-.014,origin.lon-.014,origin.lat+.014,origin.lon+.014].join(',');
 const nearby=await overpass(`[out:json][timeout:18];(nwr["name"]["amenity"~"^(bus_station|marketplace|restaurant|cafe|food_court|fast_food|clinic|hospital|doctors|pharmacy|community_centre|school|kindergarten|college)$"](${bbox});nwr["name"]["shop"~"^(supermarket|convenience|greengrocer|mall)$"](${bbox});nwr["name"]["railway"~"^(station|halt)$"](${bbox});nwr["name"]["highway"="bus_stop"](${bbox});nwr["name"]["leisure"~"^(park|sports_centre|fitness_centre)$"](${bbox}););out body center 500;`);
 const counts={},seen=new Set(),items=nearby.map(e=>{const t=e.tags||{},point=e.center||e,category=lifestyleCategory(t);if(!category||!t.name||!Number.isFinite(point.lat)||!Number.isFinite(point.lon)||t.disused==='yes'||t.abandoned==='yes'||t.access==='private')return null;const distance=distanceMetres(origin,point);if(distance>1500)return null;const address=t['addr:full']||[t['addr:housenumber'],t['addr:street']].filter(Boolean).join(' ');return {name:t.name,category,address:t['addr:street']||t['addr:full']?address:null,postal:t['addr:postcode']||null,distanceMetres:distance,distanceType:'straight-line',lat:point.lat,lon:point.lon,line:t.network||t.line||null,sourceUrl:'https://www.openstreetmap.org/'+e.type+'/'+e.id};}).filter(Boolean).sort((a,b)=>a.distanceMetres-b.distanceMetres).filter(e=>{const key=locationNorm(e.name)+e.category;if(seen.has(key)||(counts[e.category]||0)>=2)return false;seen.add(key);counts[e.category]=(counts[e.category]||0)+1;return true});
 return {...project,status:'mapped',checkedAt:new Date().toISOString(),origin:{lat:origin.lat,lon:origin.lon,sourceUrl:'https://www.openstreetmap.org/'+origin.type+'/'+origin.id},items,source:'OpenStreetMap contributors',sourceUrl:'https://www.openstreetmap.org/copyright',note:'Approximate straight-line distances from the mapped project location, not walking routes. Map listings do not confirm current operating status. School admission eligibility requires official verification.'};
}
async function lifestyleAPI(request,env){if(request.method!=='GET')return json({error:'Method not allowed'},405);const name=new URL(request.url).searchParams.get('project')||'';if(name.length<2||name.length>100)return json({error:'Enter a project name'},400);const project=lifestyleProject(name);if(!project)return json({projectName:name,projectKey:locationNorm(name),status:'unknown',items:[],note:'No exact project address was found in the directory. Location verification is required.'});const key='project-lifestyle-v1/'+project.projectKey+'.json';try{const cached=await env.BUCKET?.get(key);if(cached){const data=await cached.json();if(Date.now()-Date.parse(data.checkedAt)<7*86400000)return json(data)}if(!lifestyleInflight.has(key)){const job=retrieveLifestyle(project).then(async data=>{await env.BUCKET?.put(key,JSON.stringify(data));return data}).finally(()=>lifestyleInflight.delete(key));lifestyleInflight.set(key,job)}return json(await lifestyleInflight.get(key));}catch{return json({...project,status:'unavailable',items:[],note:'The map lookup is temporarily unavailable. No nearby amenities or walking times have been guessed.'})}}
async function preferencesAPI(request,env){
 const url=new URL(request.url),name=url.pathname.slice('/api/preferences/'.length);
 if(!['font','chinese'].includes(name))return json({error:'Invalid preference'},400);
 if(!env.BUCKET)return json({error:'Cloud storage unavailable'},503);
 const key='shared-preferences/'+name+'.json';
 try{
  if(request.method==='GET'){const obj=await env.BUCKET.get(key);return json(obj?await obj.json():{value:null})}
  if(request.method!=='PUT')return json({error:'Method not allowed'},405);
  if(request.headers.get('origin')!==url.origin)return json({error:'Request not allowed'},403);
  const body=await request.text();if(body.length>100)return json({error:'Request too large'},413);
  let value;try{value=JSON.parse(body).value}catch{return json({error:'Invalid preference'},400)}
  if(name==='font'?(!Number.isInteger(value)||value<1||value>5):typeof value!=='boolean')return json({error:'Invalid preference'},400);
  await env.BUCKET.put(key,JSON.stringify({value}));return json({value});
 }catch{return json({error:'Unable to sync preferences'},503)}
}
export default{async fetch(request,env){
 const url=new URL(request.url),path=url.pathname;
 if(['/assets/font-size.js','/assets/account-ui.css','/assets/brand-header.css','/assets/propnex-logo.png','/assets/language.css','/assets/language.js','/assets/site-navigation.js'].includes(path))return asset(path,request.method,request);
 if(path==='/ui-font.ttf')return asset('/assets/ui-sans.ttf',request.method,request);
 if(path==='/signature.ttf')return asset('/assets/anh-flowing-signature.ttf',request.method,request);
 if(!env.ANH_PASSWORD_HASH||!env.ANH_PASSWORD_SALT||!env.ANH_SESSION_SECRET)return html(loginPage('Website login is temporarily unavailable.'),503);
 if(request.method==='POST'&&(path==='/login'||path==='/logout')){
  if(request.headers.get('origin')!==url.origin)return new Response('Request not allowed',{status:403,headers:headers()});
  if(path==='/logout')return redirect('/login',{'Set-Cookie':'__Host-anh_session=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0'});
  if(Number(request.headers.get('content-length')||0)>4096)return new Response('Request too large',{status:413,headers:headers()});
  const ip=request.headers.get('cf-connecting-ip')||'unknown',now=Date.now();let rate=attempts.get(ip);if(!rate||rate.until<now){rate={count:0,until:now+60000};attempts.set(ip,rate)}if(attempts.size>5000)for(const [key,val] of attempts)if(val.until<now)attempts.delete(key);if(++rate.count>10)return html(loginPage('Too many attempts. Please wait a minute and try again.'),429,{'Retry-After':'60'});
  let password='';try{const body=await request.text();if(body.length>4096)throw Error();password=new URLSearchParams(body).get('password')||''}catch{return html(loginPage('Please enter the password.'),400)}
  if(password.length>256||!await validPassword(password,env))return html(loginPage('Incorrect password. Please try again.'),401);
  attempts.delete(ip);return redirect('/',{'Set-Cookie':sessionCookie(await token(env.ANH_SESSION_SECRET,'shared-website'))});
 }
 const signedIn=await authenticated(request,env.ANH_SESSION_SECRET);
 if(path==='/account/logout')return redirect('/login',{'Set-Cookie':'__Host-anh_session=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0'});
 if(path==='/login')return signedIn?redirect('/'):html(loginPage());
 if(!signedIn)return path.startsWith('/api/')?json({error:'Please log in again'},401):redirect('/login');
 if(path==='/bind-account')return redirect('/');
 if(path==='/api/me')return json({id:'shared-website',email:null,shared:true});
 if(path==='/api/attachments'||path.startsWith('/api/attachments/'))return attachmentsAPI(request,env);
 if(path==='/api/project-lifestyle')return lifestyleAPI(request,env);
 if(path==='/api/reports'||path.startsWith('/api/reports/'))return reportsAPI(request,env,'shared-website');
 if(path==='/api/property-searches'||path.startsWith('/api/property-searches/'))return reportsAPI(request,env,'shared-website','property-searches');
 if(path==='/api/profiles'||path.startsWith('/api/profiles/'))return reportsAPI(request,env,'shared-website','profiles');
 if(path.startsWith('/api/preferences/'))return preferencesAPI(request,env);
 if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405,headers:headers({Allow:'GET, HEAD'})});
 if(['/resale','/new-launch','/scorecards.html'].includes(path))return redirect('/'+url.search);
 return asset(path==='/'?'/index.html':path,request.method,request);
}};
