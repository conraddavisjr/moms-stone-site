import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});
try{
 for(const [name,width,reducedMotion] of [['desktop',1440,'no-preference'],['mobile',390,'no-preference'],['reduced',390,'reduce']]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion}),page=await context.newPage();
  await page.goto(process.env.TEST_URL||'http://localhost:5173');await page.locator('.phase-procession').waitFor();
  if(reducedMotion==='no-preference')await page.waitForTimeout(6000);
  const point=await page.evaluate(()=>{const b=[...document.querySelectorAll('.wc-item')].find(b=>{const r=b.getBoundingClientRect();return r.right>innerWidth*.4&&r.left<innerWidth*.6});const r=b.getBoundingClientRect();return {x:Math.max(10,Math.min(innerWidth-10,r.left+r.width/2)),y:r.top+r.height/2}});
  await page.mouse.click(point.x,point.y);await page.getByRole('dialog').waitFor();
  const motion=await page.evaluate(()=>({hero:document.querySelector('.wonder-hero').getAnimations().map(a=>({frames:a.effect.getKeyframes(),duration:a.effect.getTiming().duration})),text:[...document.querySelectorAll('[data-reveal]')].map(el=>el.getAnimations().map(a=>({delay:a.effect.getTiming().delay,frames:a.effect.getKeyframes()}))[0])}));
  assert.equal(motion.hero.length,1);
  if(reducedMotion==='reduce'){assert.equal(motion.hero[0].duration,150);assert.ok(motion.text.every(t=>t.delay===0));}
  else{assert.match(motion.hero[0].frames[0].transform,/translate/);assert.equal(motion.hero[0].frames[0].filter,'blur(4px)');assert.ok(motion.text.every((t,i)=>i===0||t.delay>motion.text[i-1].delay));assert.equal(motion.text.at(-1).frames[0].transform,'translateY(22px)');}
  await page.waitForTimeout(1500);assert.equal(await page.locator('#wonder-ritual-title').innerText(),'Your card.');assert.equal(await page.locator('.wonder-whisper').innerText(),'It found you.');
  assert.equal(await page.locator('.wonder-procession').evaluate(el=>getComputedStyle(el).opacity),'0');
  await page.screenshot({path:`/tmp/sb-reveal-${name}.png`});
  await page.getByRole('button',{name:'Part ways',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
  await page.waitForTimeout(900);assert.equal(await page.locator('.wonder-procession').evaluate(el=>getComputedStyle(el).opacity),'1');
  await context.close();console.log(`PASS ${name}: card lift, staggered copy and buttons, carousel fade and return`);
 }
}finally{await browser.close()}
