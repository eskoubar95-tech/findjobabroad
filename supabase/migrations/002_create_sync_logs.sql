-- sync_logs: single-flight sync runs (cron or manual)
CREATE TABLE IF NOT EXISTS sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by text NOT NULL CHECK (triggered_by IN ('cron', 'manual')),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'error')),
  new_count int NOT NULL DEFAULT 0,
  updated_count int NOT NULL DEFAULT 0,
  inactive_count int NOT NULL DEFAULT 0,
  error_message text
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs (status) WHERE status = 'running';
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON sync_logs (started_at DESC);
