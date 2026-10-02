import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});
try{
 for(const [name,width,reducedMotion] of [['desktop',1440,'no-preference'],['mobile',390,'no-preference'],['reduced',390,'reduce']]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.TEST_URL||'http://localhost:5173');await page.locator('.wc-item').first().waitFor();
  assert.equal(await page.locator('.product-grid').count(),1,'one collection shared by both navigation entries');
  const layout=await page.evaluate(()=>({discover:document.querySelector('#discover').getBoundingClientRect().bottom,collection:document.querySelector('#collection').getBoundingClientRect().top}));assert.ok(layout.collection>=layout.discover-1,'collection follows Discover');
  if(reducedMotion!=='reduce')assert.equal(await page.locator('.product-card').last().getAttribute('data-entrance'),'waiting','offscreen cards await scroll');
  await page.evaluate(()=>scrollTo(0,document.querySelector('#collection').offsetTop-106));await page.waitForTimeout(1200);
  assert.equal(await page.getByRole('link',{name:'Collection',exact:true}).getAttribute('aria-current'),'location');
  if(reducedMotion!=='reduce')assert.equal(await page.locator('.product-card').first().getAttribute('data-entrance'),'shown');
  assert.equal(await page.locator('.product-card').first().evaluate(el=>getComputedStyle(el).opacity),'1');
  await page.evaluate(()=>scrollTo(0,document.querySelector('.catalog-search-anchor').getBoundingClientRect().top+scrollY+200));await page.waitForTimeout(500);
  const sticky=await page.locator('.catalog-toolbar').boundingBox(),nav=await page.locator('.masthead').boundingBox();assert.ok(Math.abs(sticky.y-nav.height)<2,'sticky search sits under compact nav');
  await page.getByRole('textbox',{name:'Search the collection'}).fill('quartz');await page.waitForTimeout(1000);assert.ok(await page.locator('.product-card').count()>0);
  await page.getByRole('button',{name:'Clear search'}).click();
  await page.getByRole('link',{name:'Discover',exact:true}).click();await page.waitForFunction(()=>scrollY<2);assert.equal(await page.getByRole('link',{name:'Discover',exact:true}).getAttribute('aria-current'),'location');
  await page.getByRole('link',{name:'Collection',exact:true}).click();await page.waitForTimeout(1200);assert.ok(await page.locator('#collection').evaluate(el=>el.getBoundingClientRect().top<130));
  await page.screenshot({path:`/tmp/sb-scroll-${name}.png`});
  await page.reload();await page.locator('.wc-item').first().waitFor();await page.waitForTimeout(1000);assert.ok(await page.locator('#collection').evaluate(el=>Math.abs(el.getBoundingClientRect().top)<150),'direct collection route starts at collection');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
  console.log(`PASS ${name}: continuous page, scroll navigation, card entrances, sticky search, filter, direct collection route`);await context.close();
 }
}finally{await browser.close()}
