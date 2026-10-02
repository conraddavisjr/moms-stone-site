import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
// End-to-end check of the Wonder Card ritual against a running local server (real API, local D1).
// Uses a provisioned Playwright install, like tests/cart-browser.mjs.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TEST_URL||'http://localhost:5173';
const shots=process.env.SHOTS_DIR||'';if(shots)mkdirSync(shots,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.CHROME_TEST_EXECUTABLE?{executablePath:process.env.CHROME_TEST_EXECUTABLE}:{})});
const snap=(page,name)=>shots?page.screenshot({path:`${shots}/${name}.png`}):null;
const cardX=(page,label)=>page.evaluate(l=>{const b=[...document.querySelectorAll('.wc-item')].find(e=>e.getAttribute('aria-label').startsWith(l));return b?b.getBoundingClientRect().left:null},label);
async function clickCenterCard(page){
 const target=await page.evaluate(()=>{const w=innerWidth/2;let best=null;for(const b of document.querySelectorAll('.wc-item')){const r=b.getBoundingClientRect();if(r.right<0||r.left>innerWidth)continue;const d=Math.abs(r.left+r.width/2-w);if(!best||d<best.d)best={d,x:r.left+r.width/2,y:r.top+r.height/2,label:b.getAttribute('aria-label')}}return best});
 await page.mouse.click(target.x,target.y);return Number(target.label.match(/Wonder Card (\d+)/)[1]);
}
async function run(name,{viewport,reducedMotion='no-preference'}){
 const context=await browser.newContext({viewport,reducedMotion});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/');await page.locator('.wc-item').first().waitFor();
 assert.equal(await page.locator('.wc-item').count(),24,'only confirmed cards enter the procession');
 assert.equal(await page.getByRole('button',{name:/^Wonder Card 9:/}).count(),0);
 if(reducedMotion==='no-preference'){
  const layout=await page.locator('.wonder-procession').evaluate(el=>({width:el.clientWidth,card:parseFloat(getComputedStyle(el).getPropertyValue('--wc-w')),overflow:getComputedStyle(el).overflow}));
  const original=layout.width<600?Math.min(layout.width*.8,360):Math.min(Math.max(layout.width*.24,240),400);
  assert.equal(layout.card,Math.round(original*1.12));assert.equal(layout.overflow,'visible','hover glow must not be clipped by the row');
 }

 if(reducedMotion==='no-preference'){
  // Fast arrival that decelerates into a slow procession.
  await page.waitForFunction(()=>!document.querySelector('.phase-arrival'));
  // Follow the rightmost card on screen (so it cannot leave and wrap around while sampled).
  const pick=()=>page.evaluate(()=>{let best=null;for(const b of document.querySelectorAll('.wc-item')){const r=b.getBoundingClientRect();if(r.left<innerWidth&&r.right>0&&(!best||r.left>best.x))best={x:r.left,l:b.getAttribute('aria-label').split(':')[0]}}return best.l});
  const xs=[];let card=await page.evaluate(()=>document.querySelectorAll('.wc-item')[4].getAttribute('aria-label').split(':')[0]);for(const ms of [0,400,400]){await page.waitForTimeout(ms);xs.push(await cardX(page,card))}
  await page.waitForTimeout(3500);card=await pick();for(const ms of [0,1500]){await page.waitForTimeout(ms);xs.push(await cardX(page,card))}
  const early=xs[0]-xs[2],late=xs[3]-xs[4];
  assert.ok(early>late*2,`arrival should be faster than the cruise (${early.toFixed(0)}px vs ${late.toFixed(0)}px)`);
  assert.ok(late>10&&late<160,`cruise should drift slowly (${late.toFixed(0)}px over 1.5s)`);
  console.log(`PASS ${name}: arrival ${early.toFixed(0)}px in 0.8s, cruise ${late.toFixed(0)}px in 1.5s`);
  // Endless loop: the card furthest left wraps to the tail of the line, one gap after the last card.
  const ring=()=>page.evaluate(()=>[...document.querySelectorAll('.wc-item')].map(b=>({l:b.getAttribute('aria-label').split(':')[0],x:b.getBoundingClientRect().left})));
  const before=await ring();const lead=before.reduce((a,b)=>b.x<a.x?b:a);
  await page.waitForFunction(l=>{const b=[...document.querySelectorAll('.wc-item')].find(e=>e.getAttribute('aria-label').startsWith(l+':'));return b&&b.getBoundingClientRect().left>innerWidth},lead.l,{timeout:30000});
  const after=await ring();const back=after.find(c=>c.l===lead.l),others=after.filter(c=>c.l!==lead.l).map(c=>c.x),tail=Math.max(...others);
  const step=(Math.max(...after.map(c=>c.x))-Math.min(...after.map(c=>c.x)))/(after.length-1);
  assert.ok(back.x>tail&&Math.abs(back.x-tail-step)<step*.2,`${lead.l} should re-enter as the new tail (gap ${(back.x-tail).toFixed(0)}px vs ${step.toFixed(0)}px)`);
  console.log(`PASS ${name}: ${lead.l} looped to the tail`);
  // Hover slows the procession; leaving eases back up rather than snapping (pointer devices only).
  if(viewport.width>600){
  const speed=()=>page.evaluate(()=>Number(document.querySelector('.wonder-procession')?.dataset.speed));
  const mid=await page.evaluate(()=>{for(const b of document.querySelectorAll('.wc-item')){const r=b.getBoundingClientRect();if(r.left>innerWidth*.3&&r.right<innerWidth*.9)return {x:r.left+r.width/2,y:r.top+r.height/2}}});
  await page.mouse.move(mid.x,mid.y);await page.waitForTimeout(2600);const slow=await speed();
  await page.mouse.move(5,5);await page.waitForTimeout(300);const easing=await speed();await page.waitForTimeout(2600);const resumed=await speed();
  assert.ok(slow<16,`hover should slow the procession (${slow})`);assert.ok(easing>slow&&easing<resumed-5,`leaving should ease back (${easing} then ${resumed})`);
  console.log(`PASS ${name}: hover ${slow}px/s, eased ${easing} -> ${resumed}px/s`);
  }
 }
 await snap(page,`${name}-1-procession`);
 // Keyboard: Tab reaches a card, Enter opens the reveal, Escape parts ways and returns focus.
 for(let i=0;i<12&&!(await page.evaluate(()=>document.activeElement?.classList.contains('wc-item')));i++)await page.keyboard.press('Tab');
 const focused=await page.evaluate(()=>document.activeElement?.getAttribute('aria-label'));assert.ok(focused?.startsWith('Wonder Card'),'a card is reachable by keyboard');
 await page.waitForTimeout(700);await page.keyboard.press('Enter');await page.getByRole('dialog').waitFor();await page.waitForTimeout(1200);
 await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'detached'});await page.waitForTimeout(150);
 assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),focused,'focus returns to the card');
 await page.mouse.move(5,5);await page.evaluate(()=>document.activeElement?.blur());await page.waitForTimeout(800);
 // Select, then part ways.
 await clickCenterCard(page);const dialog=page.getByRole('dialog');await dialog.waitFor();
 await page.waitForTimeout(2600);await snap(page,`${name}-2-reveal`);
 assert.equal(await page.evaluate(()=>document.activeElement?.id),'wonder-ritual-title');
 await page.getByRole('button',{name:'Part ways'}).click();await dialog.waitFor({state:'detached'});
 assert.equal((await page.request.get(base+'/api/wonder-card').then(r=>r.json())).cardId,null,'parting ways must not persist a card');
 // Select again and accept.
 await page.waitForTimeout(600);const chosen=await clickCenterCard(page);await dialog.waitFor();await page.waitForTimeout(1800);
 await page.getByRole('button',{name:'Accept'}).click();
 await page.locator('.wonder-keepsake.landed').waitFor({timeout:10000});await page.waitForTimeout(500);await snap(page,`${name}-3-accepted`);
 const saved=(await page.request.get(base+'/api/wonder-card').then(r=>r.json())).cardId;assert.equal(saved,chosen);
 // Refresh: the card stays, and the ritual does not restart.
 await page.reload();await page.locator('.wonder-keepsake.landed').waitFor();
 assert.equal(await page.locator('.wonder-ritual').count(),0,'ritual must not restart after acceptance');
 assert.match(await page.locator('.wonder-keepsake').getAttribute('aria-label'),new RegExp(`Wonder Card ${chosen}$`));
 // A second, different card is refused.
 const other=chosen===1?2:1;const r=await page.request.post(base+'/api/wonder-card',{data:{cardId:other},headers:{origin:base}});assert.equal(r.status(),409);
 assert.equal((await page.request.post(base+'/api/wonder-card',{data:{cardId:chosen},headers:{origin:base}})).status(),200,'accepting the same card again is a no-op');
 // Bag: exactly one complimentary $0 Wonder Card line.
 await page.locator('.bag-button').click();await page.locator('.wonder-bag-line').waitFor();
 assert.equal(await page.locator('.wonder-bag-line').count(),1);assert.match(await page.locator('.wonder-bag-line').innerText(),/\$0\.00/);
 await page.waitForTimeout(400);await snap(page,`${name}-4-bag`);await page.keyboard.press('Escape');
 // Keepsake recollection.
 await page.locator('.wonder-keepsake').click();await page.locator('.wonder-recollection').waitFor();await page.waitForTimeout(400);await snap(page,`${name}-5-recollection`);
 assert.equal(await page.getByRole('button',{name:/change|another|reset/i}).count(),0,'no replacement controls');
 assert.deepEqual(errors,[]);console.log(`PASS ${name}: part ways, accept (card ${chosen}), refresh, single $0 bag line, no swap`);
 await context.close();
}
try{
 await run('desktop',{viewport:{width:1440,height:900}});
 await run('mobile',{viewport:{width:390,height:844}});
 await run('reduced',{viewport:{width:1280,height:800},reducedMotion:'reduce'});
}finally{await browser.close()}
