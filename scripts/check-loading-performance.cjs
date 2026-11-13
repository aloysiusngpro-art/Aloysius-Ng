const fs=require('fs'),assert=require('assert'),{gzipSync,gunzipSync}=require('zlib'),{webcrypto}=require('crypto'),{execFileSync}=require('child_process');
const fixture={type:'application/json',data:Buffer.from('{"ok":true}').toString('base64'),gzip:gzipSync('{"ok":true}').toString('base64'),etag:'"v1"'};
const load=source=>new Function('crypto',source.replace('__ASSET_MAP__',JSON.stringify({'/test.json':fixture})).replace('export default{async fetch','const worker={async fetch')+';return {reportsAPI,asset,worker};')(webcrypto);
const source=fs.readFileSync('worker/index.mjs','utf8'),current=load(source),before=load(source.replace(/for\(let i=0;i<listing.objects.length;i\+=8\)\{.*?reports.push\(record\)\}/, 'for(const item of listing.objects){const obj=await env.BUCKET.get(item.key);if(obj){const record=await obj.json();if(!record.deleted)reports.push(record)}}'));
(async()=>{
let active=0,peak=0;const env={BUCKET:{list:async()=>({objects:Array.from({length:24},(_,i)=>({key:String(i)})),truncated:false}),get:async key=>{active++;peak=Math.max(peak,active);await new Promise(r=>setTimeout(r,8));active--;return {json:async()=>({id:key,savedAt:'2026-10-15',deleted:key==='3'})}}}};
const request=new Request('https://example.com/api/reports');
let t=performance.now();const old=await (await before.reportsAPI(request,env,'user')).json(),oldMs=performance.now()-t;t=performance.now();const next=await (await current.reportsAPI(request,env,'user')).json(),newMs=performance.now()-t;
assert.deepEqual(next,old);assert(peak<=8);assert(oldMs/newMs>=2);console.log(`24-record retrieval benchmark: ${oldMs.toFixed(0)}ms → ${newMs.toFixed(0)}ms (${(oldMs/newMs).toFixed(1)}× faster, simulated 8ms storage latency).`);
const response=current.asset('/test.json','GET',new Request('https://example.com/test.json',{headers:{'accept-encoding':'gzip'}}));assert.equal(response.headers.get('content-encoding'),null);assert.equal(await response.text(),'{"ok":true}');assert.equal(response.headers.get('cache-control'),'no-store, private');
const unauth=await current.worker.fetch(new Request('https://example.com/test.json',{headers:{'if-none-match':'"v1"'}}),{ANH_PASSWORD_HASH:'x',ANH_PASSWORD_SALT:'x',ANH_SESSION_SECRET:'secret'});assert.equal(unauth.status,303);assert.equal(unauth.headers.get('location'),'/login');
console.log('PASS: identical records, bounded concurrency, plain asset delivery and protected authentication.');
})().catch(e=>{console.error(e);process.exit(1)});
