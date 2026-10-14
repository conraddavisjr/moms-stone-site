# Sacred Bloom repository guide

Read this first when continuing work in ChatGPT or Codex. Paths below are relative to the Git repository root.

## Repository boundaries and source history

The GitHub repository is `conraddavisjr/moms-stone-site`. On Conrad's machine its root is `/Users/conraddavis/Projects/moms-stone-site/storefront`, not the parent `moms-stone-site` workspace directory. The parent contains local asset archives and historical handoffs that a fresh GitHub clone will not contain.

On October 13, 2026, GitHub main was `8e4ae1b` and only main existed remotely. The separate local `wonder-card-ritual` branch ended at `3489384`. Sites had already deployed that latter commit as version 15 on October 2, 2026. Consequently the live site contained Wonder Cards and studio/discovery improvements absent from GitHub main. The `wonder-card-assets-responsive` PR carries that deployed source forward and adds responsive Wonder Card artwork. Check current branches and deployment records rather than assuming this historical snapshot is still current.

## App structure

- React 19, TypeScript, Next-compatible routing through Vinext/Vite, hosted as a Cloudflare Worker by ChatGPT Sites.
- `app/storefront.tsx`: discovery, collection, bag, product detail, and Wonder Card integration.
- `app/wonder/`: card procession, reveal, keepsake, recollection, and water/sky effects.
- `content/wonder-cards.ts`: canonical messages, artwork descriptions, approval status, and numbered image paths.
- `app/data/catalog.json`: curated product seed. D1 overrides can preserve seller edits; seed content is not the whole live catalog.
- `app/api/`, `lib/`, `db/schema.ts`, `drizzle/`: server APIs, content rules, persistence, and append-only migrations.
- `app/admin/`: owner studio. Allowlist enforcement lives on the server. Local simulated sign-in is development only.
- `.openai/hosting.json`: retained Sites identity and D1 `DB` / R2 `BUCKET` bindings.

## Which images are which

| Directory | Purpose |
| --- | --- |
| `public/images/catalog/` | Original product photographs and video posters |
| `public/images/staged/` | Generated product covers, not Wonder Cards |
| `public/images/responsive/` | Product cover size variants |
| `public/images/wonder-cards/` | 24 full-size generated Wonder Card backgrounds: 01-08, 10-25 |
| `public/images/wonder-cards/responsive/` | Wonder Card backgrounds at 160, 320, 640, and 960 pixels wide |

Wonder Card images are text-free 3:2 artwork. `wonder-card-face.tsx` overlays the card number, protected message, divider, lotus, and Sacred Bloom wordmark in HTML/CSS. Looking at an image alone will not show the complete card. Card 9 is unconfirmed, has no image, and is excluded from the procession. Do not invent its art or approve its wording.

Original 1536x1024 PNGs are archived locally at `../curated-products/wonder-cards/originals/` outside Git. The matching generation prompts are tracked in `content/wonder-card-generation-prompts.json`. Full-size WebPs and responsive variants are tracked, so a fresh clone contains everything needed to render the approved cards. Local PNGs are optional for rebuilding variants.

Run with Node 24.18.0:

```sh
npm ci
node scripts/optimize-wonder-cards.mjs
# Optional archive source:
node scripts/optimize-wonder-cards.mjs /absolute/path/to/originals
```

The processor preserves existing full-size WebPs, validates 3:2 input, and regenerates the responsive manifest `app/data/wonder-card-variants.json`. It prefers available PNGs and falls back to tracked WebPs. Rebuilding from WebPs can produce different bytes from rebuilding from PNGs. Commit generated assets and the manifest together. Delete a full-size WebP explicitly only when replacing its approved artwork. Product variants use the separate `scripts/optimize-covers.mjs` script.

## GitHub and Sites deployment are separate

The live URL is https://sacred-bloom.conraddavisjr.chatgpt.site. Preserve the existing project ID in `.openai/hosting.json` and the site's current audience.

A GitHub push or merge stores source; there is no tracked GitHub Actions deployment workflow. Do not claim that merging a PR deploys the website automatically. Sites saved version 15 records source commit `3489384f565eb66654ec64c28399f04c455ec2e7` and a 358-file deployment archive; its publish status was verified as succeeded on October 13. That archive explains how the cards were served without that commit appearing in GitHub main. The records establish the archive and commit, but do not establish the precise upload command used at the time.

For a future release, use the installed Sites skill and supported source/package/save/deploy workflow. Synchronize the exact source being published, build/package it with its tracked images, save a version, deploy it with the existing access mode, and verify status. Keep GitHub and Sites source provenance aligned. Public files are copied into the build's static assets; the deployment does not read the local PNG archive at runtime. R2 serves uploaded media, while these committed card backgrounds ship as static assets.

The Wonder Card API requires migration `drizzle/0001_wonder_cards.sql`. A fresh local database needs migration 0000 and then 0001. Hosted releases must apply required append-only migrations through the supported Sites workflow. Verify actual database state before executing migrations; do not replay schema initialization blindly.

## Development and validation

Use Node 24.18.0 (the default shell may select Node 16). Install dependencies with `npm ci`, then run `npm run dev` on port 5173. `npm run build` creates the deployable build. Generated `dist/`, tool state, and secrets stay ignored.

Relevant checks:

```sh
node tests/content-policy.mjs
node tests/artwork-upgrade.mjs
node tests/cart-request.mjs
node tests/wonder-card-assets.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

Browser suites in `tests/*-browser.mjs` require a running local server, initialized D1, and a provisioned Playwright module (`PLAYWRIGHT_MODULE` can identify it). Test desktop, mobile, and reduced motion; acceptance must persist after reload and permit only one complimentary card per bag session.

Read `CONTENT_NOTES.md` for content authority and release limits. Preserve locked card/brand wording and seller edits. Product prices, factual attributes, and most stories remain provisional. There is no payment provider or physical fulfillment workflow. Avoid invented claims. Commits must not include agent attribution or Co-Authored-By lines.
