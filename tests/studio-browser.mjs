import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TEST_URL||'http://localhost:5173';
const shots=process.env.SHOTS_DIR||'/tmp/sacred-bloom-studio';mkdirSync(shots,{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1050}});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
let original;
const read=async()=> (await (await context.request.get(base+'/api/admin')).json()).products;
try{
 await page.goto(base+'/signin-with-chatgpt?return_to=/admin');
 const card=page.locator('[data-product-id="eclipse-garden"]');await card.waitFor();
 original=(await read()).find(p=>p.id==='eclipse-garden');
 await page.screenshot({path:shots+'/desktop.png'});
 await card.getByRole('button',{name:'Edit Subtitle',exact:true}).click();
 await card.getByRole('textbox',{name:'Subtitle',exact:true}).fill(original.subtitle+' [studio test]');
 await card.getByRole('button',{name:'Save Subtitle',exact:true}).click();
 await card.getByRole('button',{name:'Edit Subtitle',exact:true}).waitFor();
 assert.equal((await read()).find(p=>p.id===original.id).subtitle,original.subtitle+' [studio test]');
 await page.reload();await card.waitFor();assert.match(await card.innerText(),/\[studio test\]/);
 console.log('PASS inline save and refresh persistence');
 await card.getByRole('button',{name:'Edit Title',exact:true}).click();
 await card.getByRole('textbox',{name:'Title',exact:true}).fill('Do not save');await card.getByRole('textbox',{name:'Title',exact:true}).press('Escape');
 assert.equal((await read()).find(p=>p.id===original.id).title,original.title);
 await page.locator('[data-product-id="prismatic-heart"]').getByRole('button',{name:'Details & story'}).click();
 assert.equal(await page.getByRole('button',{name:'Story is protected'}).isDisabled(),true);
 await page.getByRole('button',{name:'Close',exact:true}).last().click();
 console.log('PASS cancel and protected story');
 await card.getByRole('button',{name:'Edit images for '+original.title}).click();
 await page.getByRole('slider',{name:'Horizontal focus',exact:true}).fill('37');
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('[role=dialog]')).opacity==='1');await page.screenshot({path:shots+'/images.png'});
 await page.getByRole('button',{name:'Save images',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
 assert.equal((await read()).find(p=>p.id===original.id).focalX,37);
 console.log('PASS live crop and persisted image settings');
 // A real concurrent edit must not be overwritten by stale inline content.
 const latest=(await read()).find(p=>p.id===original.id);
 const concurrent=await context.request.post(base+'/api/catalog',{data:{...latest,summary:latest.summary+' [concurrent]'}});assert.equal(concurrent.status(),200);
 await card.getByRole('button',{name:'Edit Subtitle',exact:true}).click();await card.getByRole('textbox',{name:'Subtitle',exact:true}).fill('Keep my unsaved text');await card.getByRole('button',{name:'Save Subtitle',exact:true}).click();await card.getByRole('alert').waitFor();
 assert.match(await card.getByRole('alert').innerText(),/another session|another edit/i);
 assert.equal(await card.getByRole('textbox',{name:'Subtitle',exact:true}).inputValue(),'Keep my unsaved text');
 await card.getByRole('button',{name:'Cancel Subtitle',exact:true}).click();
 console.log('PASS conflict preserves unsaved input');
 await page.reload();await card.waitFor();await card.getByRole('button',{name:'Details & story'}).click();await page.getByText('Revision history',{exact:true}).click();await page.locator('.studio-revision').first().waitFor();await page.getByRole('button',{name:'Close',exact:true}).last().click();
 for(const width of [390,768]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`No overflow at ${width}`);await page.screenshot({path:shots+`/width-${width}.png`});}
 await page.setViewportSize({width:390,height:844});await card.getByRole('button',{name:'Edit images for '+original.title}).click();assert.equal(await page.getByRole('dialog').evaluate(el=>el.scrollWidth>el.clientWidth),false);await page.screenshot({path:shots+'/mobile-images.png'});await page.getByRole('button',{name:'Cancel',exact:true}).click();
 await page.getByRole('button',{name:'Backup & recovery',exact:true}).click();const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export catalog',exact:true}).click();assert.match((await download).suggestedFilename(),/sacred-bloom-catalog/);
 await page.getByRole('button',{name:'Collection',exact:true}).click();
 await page.getByRole('button',{name:'Add a stone',exact:true}).click();
 await page.getByRole('textbox',{name:'New stone title'}).fill('Temporary draft');
 let created;
 await page.route('**/api/catalog',async route=>{if(route.request().method()!=='POST')return route.continue();created=route.request().postDataJSON();await route.fulfill({json:{product:{...created,revision:1}}})});
 await page.getByRole('button',{name:'Create draft',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});assert.equal(created.published,false);assert.equal(created.title,'Temporary draft');
 await page.unroute('**/api/catalog');await page.reload();await card.waitFor();
 await card.getByRole('button',{name:'Edit images for '+original.title}).click();
 await page.route('**/api/upload',route=>route.fulfill({json:{url:'/images/wonder-cards/01.webp',type:'image/webp'}}));
 await page.locator('input[type=file]').setInputFiles({name:'test.webp',mimeType:'image/webp',buffer:Buffer.from('mock upload')});
 const uploaded=page.locator('.studio-media-tile > button').filter({has:page.locator('img[src="/images/wonder-cards/01.webp"]')});
 await uploaded.waitFor();await uploaded.click();
 assert.equal(await page.locator('.studio-crop-preview img').getAttribute('src'),'/images/wonder-cards/01.webp');
 page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Cancel',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
 assert.notEqual((await read()).find(p=>p.id===original.id).hero,'/images/wonder-cards/01.webp');
 console.log('PASS draft creation and image upload/cover selection with mocked writes; cancelling keeps saved media');
 assert.deepEqual(errors,[]);console.log('PASS revision history, export, desktop/tablet/mobile layouts, no runtime errors');
}finally{
 if(original){const current=(await read()).find(p=>p.id===original.id);const r=await context.request.post(base+'/api/catalog',{data:{...original,revision:current.revision}});assert.equal(r.status(),200,'Restore original test content')}
 await browser.close();
}
