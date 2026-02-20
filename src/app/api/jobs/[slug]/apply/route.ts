import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const locale = req.nextUrl.searchParams.get('locale') ?? 'en'

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'jobs',
    locale: 'en',
    depth: 0,
    limit: 1,
    where: { slug: { equals: slug } },
  })
  const job = result.docs[0]

  if (!job || !job.affiliateUrl) {
    return NextResponse.redirect(new URL(`/${locale}/jobs`, req.url))
  }

  const userAgent = req.headers.get('user-agent') ?? null
  const referrer = req.headers.get('referer') ?? null

  void Promise.resolve(
    supabaseAdmin.from('job_clicks').insert({
      job_id: String(job.id),
      job_slug: slug,
      locale,
      user_agent: userAgent,
      referrer,
    })
  ).catch(() => {})

  return NextResponse.redirect(job.affiliateUrl, { status: 302 })
}
