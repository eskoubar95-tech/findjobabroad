import { getPayload } from 'payload'
import config from '@payload-config'
import type { Job } from '@/payload-types'
import type { NormalizedJob } from '@/lib/affiliate'
import { jobFeedAdapter } from '@/lib/affiliate'

const SYNC_SECRET = process.env.SYNC_SECRET
const EXPIRY_HOURS = 48

function generateSlug(title: string, company: string, countrySlug?: string): string {
  const base = [title, company, countrySlug ?? '']
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const trimmed = base.slice(0, 60)
  const shortId = Math.random().toString(36).slice(2, 7)
  return `${trimmed}-${shortId}`
}

type TriggeredBy = 'cron' | 'manual'

export async function POST(request: Request) {
  const secret = request.headers.get('x-sync-secret')
  if (!SYNC_SECRET || secret !== SYNC_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rawTriggered = request.headers.get('x-triggered-by')
  const triggeredBy: TriggeredBy =
    rawTriggered === 'manual' || rawTriggered === 'cron' ? rawTriggered : 'cron'

  const { supabaseAdmin } = await import('@/lib/supabase.js')

  const { data: running } = await supabaseAdmin
    .from('sync_logs')
    .select('id')
    .eq('status', 'running')
    .limit(1)
    .maybeSingle()

  if (running) {
    return Response.json({ error: 'Sync already running' }, { status: 409 })
  }

  const { data: logRow, error: insertError } = await supabaseAdmin
    .from('sync_logs')
    .insert({
      triggered_by: triggeredBy,
      status: 'running',
      new_count: 0,
      updated_count: 0,
      inactive_count: 0,
    })
    .select('id')
    .single()

  if (insertError || !logRow) {
    return Response.json(
      { error: 'Failed to create sync log', details: insertError?.message },
      { status: 500 }
    )
  }

  const logId = logRow.id

  let jobs: NormalizedJob[]
  try {
    jobs = await jobFeedAdapter.fetchJobs()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await supabaseAdmin
      .from('sync_logs')
      .update({
        status: 'error',
        error_message: message,
        finished_at: new Date().toISOString(),
      })
      .eq('id', logId)
    return Response.json({ error: 'Fetch failed', details: message }, { status: 502 })
  }

  const payload = await getPayload({ config })
  let newCount = 0
  let updatedCount = 0
  const now = new Date().toISOString()

  try {
    for (const job of jobs) {
      let countryId: number | null = null
      if (job.countrySlug != null && job.countrySlug !== '') {
        const countryResult = await payload.find({
          collection: 'countries',
          where: { slug: { equals: job.countrySlug } },
          limit: 1,
        })
        countryId = countryResult.docs[0]?.id ?? null
      }

      let cityId: number | null = null
      if (job.citySlug) {
        const cityWhere: { slug: { equals: string }; country?: { equals: number } } = {
          slug: { equals: job.citySlug },
        }
        if (countryId != null) cityWhere.country = { equals: countryId }
        const cityResult = await payload.find({
          collection: 'cities',
          where: cityWhere,
          limit: 1,
        })
        cityId = cityResult.docs[0]?.id ?? null
      }

      const existingResult = await payload.find({
        collection: 'jobs',
        where: { affiliateId: { equals: job.affiliateId } },
        limit: 1,
      })
      const existingJob = existingResult.docs[0]

      const requiredLanguagesPayload = job.requiredLanguages.map((language) => ({ language }))

      if (!existingJob) {
        const slug = generateSlug(job.title, job.company ?? '', job.countrySlug)
        await payload.create({
          collection: 'jobs',
          data: {
            slug,
            source: 'affiliate',
            status: 'active',
            affiliateId: job.affiliateId,
            affiliateSource: job.affiliateSource,
            affiliateUrl: job.affiliateUrl,
            company: job.company ?? undefined,
            jobType: job.jobType ?? undefined,
            category: job.category ?? undefined,
            requiredLanguages: requiredLanguagesPayload,
            country: countryId ?? undefined,
            city: cityId ?? undefined,
            salary: job.salary ?? undefined,
            postedAt: job.postedAt ?? undefined,
            expiresAt: job.expiresAt ?? undefined,
            lastSeenAt: now,
            title: job.title,
          },
          draft: false,
        })
        newCount += 1
      } else {
        const overrides =
          existingJob.manualOverrides?.map((o) => (o as { fieldName?: string }).fieldName).filter(Boolean) ?? []
        const skipSet = new Set(overrides as string[])

        const updatePayload: Record<string, unknown> = {
          lastSeenAt: now,
          status: 'active',
          affiliateSource: job.affiliateSource,
          affiliateUrl: job.affiliateUrl,
          company: job.company ?? undefined,
          jobType: job.jobType ?? undefined,
          category: job.category ?? undefined,
          requiredLanguages: requiredLanguagesPayload,
          country: countryId ?? undefined,
          city: cityId ?? undefined,
          salary: job.salary ?? undefined,
          postedAt: job.postedAt ?? undefined,
          expiresAt: job.expiresAt ?? undefined,
          title: job.title,
        }

        const filtered: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(updatePayload)) {
          if (!skipSet.has(key)) filtered[key] = value
        }

        await payload.update({
          collection: 'jobs',
          id: existingJob.id,
          data: filtered as Partial<Job>,
          draft: false,
        })
        updatedCount += 1
      }
    }

    const threshold = new Date(Date.now() - EXPIRY_HOURS * 60 * 60 * 1000).toISOString()
    const staleResult = await payload.find({
      collection: 'jobs',
      where: {
        and: [
          { source: { equals: 'affiliate' } },
          { status: { equals: 'active' } },
          { lastSeenAt: { less_than: threshold } },
        ],
      },
      limit: 1000,
    })
    let inactiveCount = 0
    for (const doc of staleResult.docs) {
      await payload.update({
        collection: 'jobs',
        id: doc.id,
        data: { status: 'expired' },
        draft: false,
      })
      inactiveCount += 1
    }

    await supabaseAdmin
      .from('sync_logs')
      .update({
        status: 'success',
        new_count: newCount,
        updated_count: updatedCount,
        inactive_count: inactiveCount,
        finished_at: new Date().toISOString(),
      })
      .eq('id', logId)

    return Response.json({
      success: true,
      newCount,
      updatedCount,
      inactiveCount,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await supabaseAdmin
      .from('sync_logs')
      .update({
        status: 'error',
        error_message: message,
        finished_at: new Date().toISOString(),
      })
      .eq('id', logId)
    return Response.json({ error: 'Sync failed', details: message }, { status: 500 })
  }
}
