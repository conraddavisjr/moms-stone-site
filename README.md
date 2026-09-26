# Sacred Bloom storefront

See [CONTENT_NOTES.md](CONTENT_NOTES.md) for content authority, copy protection, migration, placeholders and launch boundaries. The [workspace README](../README.md) preserves the original asset inventory.

Run with Node 24.18.0: `npm run dev`.

Production content is backed by Cloudflare D1 and R2. Set `ADMIN_EMAILS` through Sites before inviting an editor. Every protected API enforces the allowlist server-side; the local sign-in simulator is not shipped to production. The app currently has no payment provider.

Studio covers live in `public/images/staged`. Original photographs and films remain available on product detail pages. In the admin media editor, the Gallery switches select the main storefront photographs; other photos remain in the expandable reference section. AI interpretations are labeled in the storefront.

Full-resolution generated images and their prompts are archived in `../curated-products`. To integrate another generated batch, run `node scripts/import-staged-artwork.mjs /path/to/manifest.json` from this directory. Each manifest entry has `id`, `path`, `refs`, and `prompt` fields.

Useful checks:

- `node node_modules/typescript/bin/tsc --noEmit`
- `npm run build`
- `node tests/api-smoke.mjs` against the local preview
- `node tests/artwork-upgrade.mjs`

Local database initialization after building:

```
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_fancy_ezekiel_stane.sql
```

Apply this only to a fresh local database. Hosted schema changes use generated, append-only Drizzle migrations.
