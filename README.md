# Astraea storefront

See [the workspace README](../README.md) for the asset inventory and operating notes.

Run with Node 24.18.0: `npm run dev`.

Production content is backed by Cloudflare D1 and R2. Set `ADMIN_EMAILS` through Sites before inviting an editor. Every protected API enforces the allowlist server-side; the local sign-in simulator is not shipped to production. The app currently has no payment provider.

Useful checks:

- `node node_modules/typescript/bin/tsc --noEmit`
- `npm run build`
- `node tests/api-smoke.mjs` against the local preview

Local database initialization after building:

```
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_fancy_ezekiel_stane.sql
```

Apply this only to a fresh local database. Hosted schema changes use generated, append-only Drizzle migrations.
