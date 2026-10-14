import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import {wonderCards,wonderCardArt} from '../content/wonder-cards.ts';

const manifest = JSON.parse(await fs.readFile('app/data/wonder-card-variants.json', 'utf8'));
const approved = wonderCards.filter(card => card.status === 'locked');
assert.equal(Object.keys(manifest).length, approved.length, 'every approved card has a responsive entry');
assert.equal(manifest[wonderCardArt(9)], undefined, 'unconfirmed card 9 has no artwork');
let originalBytes = 0;
let smallBytes = 0;
for (const card of approved) {
  const url = wonderCardArt(card.id);
  assert.ok(manifest[url], `missing card ${card.id}`);
  const original = await sharp(`public${url}`).metadata();
  assert.equal(original.width, 1536);
  assert.equal(original.height, 1024);
  assert.equal(manifest[url].length, 5);
  for (const [index, width] of [160, 320, 640, 960, 1536].entries()) {
    const [variant, descriptor] = manifest[url][index].split(' ');
    assert.equal(descriptor, `${width}w`);
    const info = await sharp(`public${variant}`).metadata();
    assert.equal(info.format, 'webp');
    assert.equal(info.width, width, 'descriptor matches the encoded width');
    assert.ok(Math.abs(info.width / info.height - 1.5) < 0.01, 'card aspect ratio preserved');
    const {size} = await fs.stat(`public${variant}`);
    if (width === 640) smallBytes += size;
    if (width === 1536) originalBytes += size;
  }
}
assert.ok(smallBytes < originalBytes, '640px cards reduce transfer bytes');
console.log(`PASS: ${approved.length} approved cards, 96 responsive WebPs, correct dimensions and manifests. 640px deck: ${smallBytes} bytes vs ${originalBytes} full-size (${Math.round((1-smallBytes/originalBytes)*100)}% smaller).`);
