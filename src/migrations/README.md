# Payload database schema

## "Relation does not exist" / "Column does not exist" when using `npm run start`

If you see errors like `relation "_countries_v" does not exist` or `column countries_id does not exist` in `payload_locked_documents_rels`, the database schema is out of date.

**Fix:** Run the app in development mode once so Payload can push the schema:

```bash
npm run dev
```

Let it start (open http://localhost:3000/admin if you like), then stop it. After that, `npm run start` will work because the missing tables and columns have been created.

Reason: With `npm run start` (production), Payload does not auto-push schema changes. With `npm run dev`, it does.

## Migrations

Migrations in this folder are for **new** databases (e.g. a fresh production deploy). If your DB already had data from before T2 (e.g. users/media only), use the dev push above instead of running the full migration.

- `npm run payload migrate:status` – see which migrations have been run
- `npm run payload migrate` – run pending migrations (only safe on DBs that match the "before" state of the migration)
- `npm run payload migrate:create [name]` – generate a new migration after changing collections
