import assert from 'node:assert/strict';
// Use a provisioned Playwright installation; no storefront runtime dependency is needed.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_TEST_EXECUTABLE?{executablePath:process.env.CHROME_TEST_EXECUTABLE}:{})});
const base=process.env.TEST_URL||'http://localhost:5173';
try{
 for(const scenario of ['success','rejection','stalled']){
  const context=await browser.newContext();const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/cart',async route=>{
   if(route.request().method()==='GET')return route.fulfill({json:{items:{}}});
   if(scenario==='stalled')return; // Deliberately leave this request unresolved.
   await route.fulfill({status:scenario==='rejection'?409:200,json:scenario==='rejection'?{error:'This piece is sold out.'}:{items:{'prismatic-heart':1}}});
  });
  await Promise.all([page.waitForResponse(r=>r.url().endsWith('/api/catalog')),page.goto(base+'/catalog')]);
  await page.getByRole('button',{name:'Meet the Stone: Clear Quartz Heart',exact:true}).click();
  const button=page.locator('.add-to-bag');await button.click();
  if(scenario==='success')await page.getByText('Clear Quartz Heart added to your bag',{exact:true}).waitFor();
  else await page.locator('.bag-error').waitFor({timeout:16000});
  await page.waitForFunction(()=>document.querySelector('.add-to-bag')?.getAttribute('aria-busy')==='false');
  assert.equal(await button.isEnabled(),true);
  await page.waitForFunction(()=>!document.querySelector('.bag-stardust'));
  assert.deepEqual(errors,[]);
  console.log(`PASS browser: ${scenario} releases button and removes pending feedback`);
  await context.close();
 }
}finally{await browser.close()}
