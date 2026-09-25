import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const manifestPath=process.argv[2];
if(!manifestPath)throw Error('Pass the generated staging manifest path.');
const manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
const catalogPath='app/data/catalog.json';
const products=JSON.parse(await fs.readFile(catalogPath,'utf8'));
const archive=path.resolve('../curated-products');
const provenance=[];
for(const asset of manifest){
 const product=products.find(p=>p.id===asset.id);
 if(!product)throw Error(`Unknown product ${asset.id}`);
 const webPath=`/images/staged/${asset.id}.jpg`;
 const dest=path.join('public',webPath);
 // Encoding only: keep the generated composition and original pixel dimensions.
 await sharp(asset.path).jpeg({quality:92,chromaSubsampling:'4:4:4'}).toFile(dest);
 const originalPath=path.join(archive,asset.id,'ai-staged.png');
 await fs.copyFile(asset.path,originalPath);
 product.hero=webPath;
 product.generated=true;
 product.studioImages=[webPath];
 product.stagingRevision=2;
 provenance.push({...asset,path:originalPath,webPath,method:'built-in imagegen'});
}
for(const product of products){
 if(product.generated){product.studioImages=[product.hero];product.stagingRevision=2;}
 await fs.writeFile(path.join(archive,product.id,'product.json'),JSON.stringify(product,null,2)+'\n');
}
await fs.writeFile(catalogPath,JSON.stringify(products,null,2)+'\n');
await fs.writeFile(path.join(archive,'catalog.json'),JSON.stringify(products,null,2)+'\n');
await fs.writeFile(path.join(archive,'staging-prompts-v2.json'),JSON.stringify(provenance,null,2)+'\n');
console.log(`Integrated ${manifest.length} new staged covers; ${products.filter(p=>p.generated).length}/${products.length} covers staged.`);
