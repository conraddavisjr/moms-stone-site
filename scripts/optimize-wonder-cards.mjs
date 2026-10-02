import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.resolve(root, '../curated-products/wonder-cards/originals');
const destination = path.join(root, 'public/images/wonder-cards');
await fs.mkdir(destination, {recursive: true});
const originals = (await fs.readdir(source)).filter(name => /^(0[1-9]|1\d|2[0-5])\.png$/.test(name)).sort();
let written = 0;
for (const name of originals) {
  const output = path.join(destination, name.replace('.png', '.webp'));
  // Preserve existing approved assets; remove an output explicitly to rebuild it.
  try { await fs.access(output); continue; } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const input = path.join(source, name);
  const {width, height} = await sharp(input).metadata();
  if (!width || !height || Math.abs(width / height - 1.5) > 0.01) {
    throw new Error(`${name}: expected landscape 3:2 artwork, got ${width}x${height}`);
  }
  await sharp(input).webp({quality: 82, effort: 6}).toFile(output);
  written++;
}
console.log(`Converted ${written} Wonder Cards; ${originals.length} originals available. Existing assets preserved.`);
