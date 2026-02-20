'use client'
// TODO: Replace with a Next.js server action in production — NEXT_PUBLIC_SYNC_SECRET exposes the secret to the browser.

import { useState } from 'react'

type SyncResult =
  | { ok: true; newCount: number; updatedCount: number; inactiveCount: number }
  | { ok: false; status: number; message: string }

export function SyncButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)

  async function handleSync() {
    const secret = process.env.NEXT_PUBLIC_SYNC_SECRET
    if (!secret) {
      setResult({ ok: false, status: 0, message: 'NEXT_PUBLIC_SYNC_SECRET not set' })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/sync-jobs', {
        method: 'POST',
        headers: {
          'x-sync-secret': secret,
          'x-triggered-by': 'manual',
        },
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setResult({
          ok: true,
          newCount: data.newCount ?? 0,
          updatedCount: data.updatedCount ?? 0,
          inactiveCount: data.inactiveCount ?? 0,
        })
      } else if (res.status === 409) {
        setResult({ ok: false, status: 409, message: 'Sync already running' })
      } else {
        setResult({
          ok: false,
          status: res.status,
          message: data.error ?? data.details ?? res.statusText,
        })
      }
    } catch (err) {
      setResult({
        ok: false,
        status: 0,
        message: err instanceof Error ? err.message : 'Request failed',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        style={{ padding: '8px 16px', cursor: loading ? 'wait' : 'pointer' }}
      >
        {loading ? 'Syncing…' : 'Run sync now'}
      </button>
      {result && (
        <div style={{ marginTop: 8 }}>
          {result.ok ? (
            <p style={{ color: 'var(--theme-success-500, green)' }}>
              Done: {result.newCount} new, {result.updatedCount} updated, {result.inactiveCount}{' '}
              marked inactive.
            </p>
          ) : (
            <p style={{ color: 'var(--theme-error-500, red)' }}>
              {result.status === 409 ? result.message : `Error (${result.status}): ${result.message}`}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
