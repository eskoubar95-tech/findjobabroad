-- job_clicks: analytics for job link clicks
CREATE TABLE IF NOT EXISTS job_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  job_slug text NOT NULL,
  locale text NOT NULL CHECK (locale IN ('en', 'da')),
  clicked_at timestamptz NOT NULL DEFAULT now(),
  user_agent text,
  referrer text
);

CREATE INDEX IF NOT EXISTS idx_job_clicks_job_id ON job_clicks (job_id);
CREATE INDEX IF NOT EXISTS idx_job_clicks_clicked_at ON job_clicks (clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_clicks_locale ON job_clicks (locale);
