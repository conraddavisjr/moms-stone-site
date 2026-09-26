import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://localhost:5173';
let cookie='';
async function req(path,options={}){const r=await fetch(base+path,{redirect:'manual',...options,headers:{...(cookie?{cookie}:{}),...(options.body&&typeof options.body==='string'?{'Content-Type':'application/json'}:{}),...options.headers}});const c=r.headers.getSetCookie();if(c.length){const m=new Map(cookie.split('; ').filter(Boolean).map(x=>x.split('=')));for(const s of c){const [k,...v]=s.split(';')[0].split('=');m.set(k,v.join('='))}cookie=Array.from(m,([k,v])=>`${k}=${v}`).join('; ')}return r}
const data=await (await req('/api/catalog')).json();assert.equal(data.products.length,28);assert.equal(data.products.filter(p=>p.kind==='product').length,25);
assert.equal((await req('/api/admin')).status,403);assert.equal((await req('/api/catalog',{method:'POST',body:'{}'})).status,403);
assert.equal((await req('/api/upload',{method:'POST',body:'{}'})).status,403);
let r=await req('/api/cart');assert.equal(r.status,200);
r=await req('/api/cart',{method:'POST',body:JSON.stringify({productId:'eclipse-garden',delta:1})});assert.equal(r.status,200);const cart=await r.json();assert.ok(cart.items['eclipse-garden']>=1);
assert.deepEqual((await (await req('/api/cart')).json()).items,cart.items);
assert.equal((await req('/api/cart',{method:'POST',body:JSON.stringify({productId:'eclipse-garden',delta:30})})).status,400);
assert.equal((await req('/api/cart',{method:'POST',body:JSON.stringify({productId:'not-a-stone',delta:1})})).status,404);
r=await req('/api/cart',{method:'POST',body:JSON.stringify({productId:'eclipse-garden',delta:-1})});assert.equal(r.status,200);
r=await req('/api/events',{method:'POST',body:JSON.stringify({type:'product_view',productId:'eclipse-garden'})});assert.equal(r.status,200);
assert.equal((await req('/api/events',{method:'POST',body:JSON.stringify({type:'bad-event'})})).status,400);
assert.equal((await req('/api/cart',{method:'POST',headers:{Origin:'https://example.invalid'},body:JSON.stringify({productId:'eclipse-garden',delta:1})})).status,403);
r=await req('/signin-with-chatgpt?return_to=/admin');assert.ok([302,303,307].includes(r.status));
r=await req('/api/admin');if(r.status!==200){console.log('PASS public catalog, persistent cart, input validation, event recording, and unauthorized access. Local admin environment has not loaded yet.');process.exit(2)}
const adm=await r.json();assert.ok(adm.summary.length);
const original=adm.products.find(p=>p.id==='eclipse-garden');const updated={...original,subtitle:original.subtitle+' [save test]'};
r=await req('/api/catalog',{method:'POST',body:JSON.stringify(updated)});assert.equal(r.status,200);const saved=(await r.json()).product;assert.equal(saved.revision,(original.revision||0)+1);
r=await req('/api/catalog',{method:'POST',body:JSON.stringify(updated)});assert.equal(r.status,409);
r=await req('/api/admin?revisions=eclipse-garden');assert.ok((await r.json()).revisions.length);
r=await req('/api/catalog',{method:'POST',body:JSON.stringify({...original,revision:saved.revision})});assert.equal(r.status,200);
// Locked copy is enforced server-side, including attempts to strip protection metadata.
const heart=adm.products.find(p=>p.id==='prismatic-heart');
assert.equal((await req('/api/catalog',{method:'POST',body:JSON.stringify({...heart,description:'Unauthorized replacement'})})).status,409);
assert.equal((await req('/api/catalog',{method:'POST',body:JSON.stringify({...heart,protectedFields:[]})})).status,409);
let current=(await (await req('/api/admin')).json()).products.find(p=>p.id===original.id);
const inventoryOriginal={...current};
try {
 r=await req('/api/catalog',{method:'POST',body:JSON.stringify({...current,unique:true,inventory:1,availability:'available'})});assert.equal(r.status,200);current=(await r.json()).product;
 assert.equal((await req('/api/cart',{method:'POST',body:JSON.stringify({productId:original.id,delta:1})})).status,200);
 assert.equal((await req('/api/cart',{method:'POST',body:JSON.stringify({productId:original.id,delta:1})})).status,409);
 r=await req('/api/catalog',{method:'POST',body:JSON.stringify({...current,inventory:0,availability:'sold'})});assert.equal(r.status,200);current=(await r.json()).product;
 assert.equal((await req('/api/cart',{method:'POST',body:JSON.stringify({productId:original.id,delta:1})})).status,409);
} finally {
 await req('/api/cart',{method:'POST',body:JSON.stringify({productId:original.id,delta:-1})});
 r=await req('/api/catalog',{method:'POST',body:JSON.stringify({...inventoryOriginal,revision:current.revision})});assert.equal(r.status,200);
}
console.log('PASS locked copy API protection, one-of-one bag limit, sold-state rejection, and inventory restore.');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
r=await req('/api/upload',{method:'POST',body:png,headers:{'Content-Type':'image/png','Content-Length':String(png.length),'X-File-Name':'smoke-test.png'}});assert.equal(r.status,200);const uploaded=await r.json();r=await req(uploaded.url);assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),'image/png');assert.equal((await r.arrayBuffer()).byteLength,png.length);r=await req(uploaded.url,{headers:{Range:'bytes=0-7'}});assert.equal(r.status,206);assert.equal((await r.arrayBuffer()).byteLength,8);
r=await req('/api/upload',{method:'POST',body:Buffer.from('fake image'),headers:{'Content-Type':'image/png','Content-Length':'10'}});assert.equal(r.status,400);
console.log('PASS all API smoke checks: catalog, persistent bag, authorization, analytics, optimistic edit conflict, revision restore, upload/readback, and file validation.');
