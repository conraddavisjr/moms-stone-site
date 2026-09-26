import fs from 'node:fs/promises';
import sharp from 'sharp';
const products=JSON.parse(await fs.readFile('app/data/catalog.json','utf8'));
const variants={};await fs.mkdir('public/images/responsive',{recursive:true});
for(const p of products){if(!p.hero)continue;variants[p.hero]=[];for(const width of [320,640,960]){const url=`/images/responsive/${p.id}-${width}.webp`;await sharp('public'+p.hero).resize({width,withoutEnlargement:true}).webp({quality:86}).toFile('public'+url);variants[p.hero].push(`${url} ${width}w`)}}
await fs.writeFile('app/data/image-variants.json',JSON.stringify(variants,null,2)+'\n');
console.log(`Created responsive covers for ${Object.keys(variants).length} records; originals preserved.`);
