import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
// An optional PNG archive can seed new cards. Fresh clones can rebuild from tracked WebPs.
const source = path.resolve(process.argv[2] || path.join(root, '../curated-products/wonder-cards/originals'));
const destination = path.join(root, 'public/images/wonder-cards');
const responsive = path.join(destination, 'responsive');
const cardFile = /^(0[1-9]|1\d|2[0-5])\.(png|webp)$/;
const widths = [160, 320, 640, 960];
await fs.mkdir(responsive, {recursive: true});
let originals = [];
try { originals = (await fs.readdir(source)).filter(name => cardFile.test(name) && name.endsWith('.png')).sort(); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
let written = 0;
for (const name of originals) {
  const output = path.join(destination, name.replace('.png', '.webp'));
  // Preserve approved full-size assets; remove an output explicitly to rebuild it.
  try { await fs.access(output); continue; } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const input = path.join(source, name);
  await validate(input);
  await sharp(input).webp({quality: 82, effort: 6}).toFile(output);
  written++;
}
async function validate(input) {
  const {width, height} = await sharp(input).metadata();
  if (!width || !height || Math.abs(width / height - 1.5) > 0.01) {
    throw new Error(`${input}: expected landscape 3:2 artwork, got ${width}x${height}`);
  }
  return width;
}
const cards = (await fs.readdir(destination)).filter(name => cardFile.test(name) && name.endsWith('.webp')).sort();
if (!cards.length) throw new Error('No Wonder Card artwork found in the archive or public/images/wonder-cards.');
const variants = {};
for (const name of cards) {
  const fullSize = path.join(destination, name);
  const fullWidth = await validate(fullSize);
  const png = path.join(source, name.replace('.webp', '.png'));
  let input = fullSize;
  try { await fs.access(png); input = png; } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await validate(input);
  const url = `/images/wonder-cards/${name}`;
  variants[url] = [];
  for (const width of widths.filter(width => width < fullWidth)) {
    const filename = name.replace('.webp', `-${width}.webp`);
    await sharp(input).resize({width, withoutEnlargement: true}).webp({quality: 82, effort: 6}).toFile(path.join(responsive, filename));
    variants[url].push(`/images/wonder-cards/responsive/${filename} ${width}w`);
  }
  variants[url].push(`${url} ${fullWidth}w`);
}
await fs.writeFile(path.join(root, 'app/data/wonder-card-variants.json'), JSON.stringify(variants, null, 2) + '\n');
console.log(`Added ${written} full-size assets; generated responsive variants for ${cards.length} Wonder Cards. Approved full-size assets preserved.`);
