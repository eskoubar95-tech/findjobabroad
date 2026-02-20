import { SyncButton } from './SyncButton'

type SyncLogRow = {
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

export default async function SyncPage() {
  const { supabaseAdmin } = await import('@/lib/supabase.js')
  const { data: logs } = await supabaseAdmin
    .from('sync_logs')
    .select('id, triggered_by, started_at, finished_at, status, new_count, updated_count, inactive_count, error_message')
    .order('started_at', { ascending: false })
    .limit(5)

  const recentLogs = (logs ?? []) as SyncLogRow[]
  const latest = recentLogs[0]

  function statusColor(status: string) {
    switch (status) {
      case 'success':
        return 'var(--theme-success-500, green)'
      case 'error':
        return 'var(--theme-error-500, red)'
      case 'running':
        return 'var(--theme-warning-500, orange)'
      default:
        return 'inherit'
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h1 style={{ marginBottom: 16 }}>Job Sync</h1>

      {latest && (
        <div
          style={{
            border: '1px solid #eee',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Latest sync</h2>
          <p>
            <strong>Started:</strong>{' '}
            {new Date(latest.started_at).toLocaleString()} ·{' '}
            <strong>Triggered by:</strong> {latest.triggered_by}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <span style={{ color: statusColor(latest.status) }}>{latest.status}</span>
            {latest.finished_at && (
              <> · Finished: {new Date(latest.finished_at).toLocaleString()}</>
            )}
          </p>
          <p>
            New: {latest.new_count} · Updated: {latest.updated_count} · Inactive: {latest.inactive_count}
          </p>
          {latest.error_message && (
            <p style={{ color: 'var(--theme-error-500, red)' }}>{latest.error_message}</p>
          )}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <SyncButton />
      </div>

      <h2 style={{ fontSize: 18 }}>Recent syncs</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Started</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Triggered by</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Status</th>
            <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #eee' }}>New</th>
            <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #eee' }}>Updated</th>
            <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #eee' }}>Inactive</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Error</th>
          </tr>
        </thead>
        <tbody>
          {recentLogs.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: 16, color: '#666' }}>
                No syncs yet.
              </td>
            </tr>
          ) : (
            recentLogs.map((row) => (
              <tr key={row.id}>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  {new Date(row.started_at).toLocaleString()}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{row.triggered_by}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee', color: statusColor(row.status) }}>
                  {row.status}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  {row.new_count}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  {row.updated_count}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  {row.inactive_count}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12, maxWidth: 200 }}>
                  {row.error_message ?? '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
