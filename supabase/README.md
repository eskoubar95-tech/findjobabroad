# Supabase migrations

This folder contains SQL migrations for the Supabase project used by findjobabroad (job_clicks analytics and sync_logs).

## Applying migrations

### Option 1: Supabase Dashboard SQL Editor

1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor**.
3. Run the migration files **in order**:
   - First: `migrations/001_create_job_clicks.sql`
   - Then: `migrations/002_create_sync_logs.sql`
4. Paste each file’s contents and execute.

### Option 2: Supabase CLI

From the project root (with [Supabase CLI](https://supabase.com/docs/guides/cli) installed and linked):

```bash
supabase db push
```

This applies all pending migrations in `supabase/migrations/` in order.

## Tables

| Table         | Purpose                                                                 |
|---------------|-------------------------------------------------------------------------|
| `job_clicks`  | Records job link clicks for analytics (job_id, job_slug, locale, time). |
| `sync_logs`   | Logs each sync run (cron or manual): status, counts, error_message.     |
