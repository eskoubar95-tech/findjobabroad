import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing Supabase env: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
  )
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export type JobClick = {
  id: string
  job_id: string
  job_slug: string
  locale: string
  clicked_at: string
  user_agent: string | null
  referrer: string | null
}

export type SyncLog = {
  id: string
  triggered_by: 'cron' | 'manual'
  started_at: string
  finished_at: string | null
  status: 'running' | 'success' | 'error'
  new_count: number
  updated_count: number
  inactive_count: number
  error_message: string | null
}
