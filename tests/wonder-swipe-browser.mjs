import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.TEST_URL||'http://localhost:5173');await page.locator('.wc-item').first().waitFor();await page.waitForFunction(()=>Math.abs(Number(document.querySelector('.wonder-procession')?.dataset.speed)-39.1)<2,{},{timeout:30000});
 const speed=()=>page.locator('.wonder-procession').evaluate(el=>Number(el.dataset.speed));
 assert.ok(Math.abs(await speed()-39.1)<2,'mobile cruise is 15% faster');
 assert.equal(await page.locator('.wc-item .wcf').first().evaluate(el=>getComputedStyle(el).filter),'none');
 const cdp=await context.newCDPSession(page);
 const row=await page.locator('.wonder-procession').boundingBox(),y=Math.round(row.y+row.height/2);
 async function swipe(from,to){
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:from,y}]});
  for(let i=1;i<=5;i++){await page.waitForTimeout(16);await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from+(to-from)*i/5,y}]});}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(80);
 }
 await swipe(60,330);assert.ok(await speed()<-150,'right swipe imparts rightward momentum');assert.equal(await page.getByRole('dialog').count(),0,'swiping does not select');
 await page.waitForFunction(()=>Math.abs(Number(document.querySelector('.wonder-procession')?.dataset.speed)-39.1)<2,{},{timeout:30000});assert.ok(Math.abs(await speed()-39.1)<6,'rightward momentum returns to normal leftward cruise');
 await swipe(330,60);assert.ok(await speed()>150,'left swipe accelerates leftward');assert.equal(await page.getByRole('dialog').count(),0);
 await page.waitForFunction(()=>Math.abs(Number(document.querySelector('.wonder-procession')?.dataset.speed)-39.1)<2,{},{timeout:30000});assert.ok(Math.abs(await speed()-39.1)<3,'leftward momentum settles');
 const target=await page.evaluate(()=>{const b=[...document.querySelectorAll('.wc-item')].find(b=>{const r=b.getBoundingClientRect();return r.left<195&&r.right>195});const r=b.getBoundingClientRect();return {x:195,y:r.top+r.height/2}});
 await page.touchscreen.tap(target.x,target.y);await page.getByRole('dialog').waitFor();
 assert.equal(await page.locator('.wonder-hero .wcf').evaluate(el=>getComputedStyle(el).filter),'none','selected card is sharp');
 await page.screenshot({path:'/tmp/sb-swipe-reveal.png'});
 await page.getByRole('button',{name:'Part ways',exact:true}).tap();await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.waitForTimeout(300);assert.ok(Math.abs(await speed()-39.1)<1,'parting restores faster mobile cruise');
 await page.screenshot({path:'/tmp/sb-swipe-procession.png'});
 assert.deepEqual(errors,[]);console.log('PASS mobile cruise, blur/reveal, real touch momentum both directions, decay, tap and part ways');
}finally{await browser.close()}
