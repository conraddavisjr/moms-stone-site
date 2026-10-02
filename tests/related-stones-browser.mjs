import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});
try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=process.env.TEST_URL||'http://localhost:5173';
  await page.goto(base+'/stone/prismatic-heart');await page.locator('.detail-title').waitFor();
  const original=await page.locator('.detail-title').innerText();
  const catalog=await page.request.get(base+'/api/catalog').then(r=>r.json());
  const links=await page.locator('.related-card').evaluateAll(es=>es.map(el=>el.getAttribute('href')));
  assert.equal(links.length,4);assert.equal(new Set(links).size,4);assert.ok(!links.includes('/stone/prismatic-heart'));
  const items=links.map(link=>catalog.products.find(p=>'/stone/'+(p.slug||p.id)===link));
  assert.ok(items.every(p=>p.published!==false&&p.kind!=='collection'&&p.availability!=='sold'&&p.inventory!==0));assert.ok(items.every(p=>/quartz/i.test(p.mineral)),'quartz piece recommends related quartz descriptions first');
  // Use real wheel/touch input: scrollIntoView can bypass overflow:hidden and mask regressions.
  const cdp=width<600?await context.newCDPSession(page):null;
  await page.mouse.move(width*.85,600);
  for(let attempt=0;attempt<30;attempt++){
   const bounds=await page.locator('.related-card').first().boundingBox();if(bounds.y<650)break;
   if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width*.9,y:780}]});for(let i=1;i<=6;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:width*.9,y:780-i*85}]});await page.waitForTimeout(20)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
   else await page.mouse.wheel(0,700);
   await page.waitForTimeout(180);
  }
  assert.ok((await page.locator('.related-card').first().boundingBox()).y<650,'real vertical input reaches related pieces');
await page.screenshot({path:`/tmp/sb-related-${width}.png`});
  const next=items[0];await page.locator('.related-card').first().click();
  await page.waitForFunction(title=>document.querySelector('.detail-title')?.textContent===title,next.title);
  assert.ok(page.url().endsWith('/stone/'+(next.slug||next.id)));assert.equal(await page.locator('.detail-reading').evaluate(el=>el.scrollTop),0);
  assert.equal(await page.locator('.detail-title').evaluate(el=>document.activeElement===el),true,'focus follows the new item');
  assert.equal(await page.locator('.detail-sheet').count(),1);assert.ok(!(await page.locator('.related-card').evaluateAll(es=>es.map(el=>el.getAttribute('href')))).includes('/stone/'+(next.slug||next.id)));
  await page.goBack();await page.waitForFunction(title=>document.querySelector('.detail-title')?.textContent===title,original);
  assert.equal(await page.locator('.detail-reading').evaluate(el=>el.scrollTop),0);
  assert.equal(await page.locator('.detail-sheet').evaluate(el=>el.scrollWidth>el.clientWidth),false);
  await page.getByRole('button',{name:'Close stone detail'}).click();await page.locator('.detail-sheet').waitFor({state:'hidden'});assert.deepEqual(errors,[]);
  console.log(`PASS ${width}px: relevant published items, seamless navigation, focus, scroll reset, Back, and close`);await context.close();
 }
}finally{await browser.close()}
