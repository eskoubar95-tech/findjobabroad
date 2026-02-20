import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Job } from '@/payload-types'
import { jobPostingJsonLd } from '@/lib/jsonld'

function isVisibleInDa(job: Job): boolean {
  const langs = job.requiredLanguages ?? []
  if (langs.length === 0) return false
  const codes = langs.map((l) => (l as { language?: string | null }).language).filter(Boolean) as string[]
  if (codes.includes('da')) return true
  if (codes.every((c) => c === 'en')) return true
  return false
}

function isVisibleInEn(job: Job, selectedLanguages: string[]): boolean {
  const langs = job.requiredLanguages ?? []
  if (langs.length === 0) return false
  const codes = langs.map((l) => (l as { language?: string | null }).language).filter(Boolean) as string[]
  return selectedLanguages.some((s) => codes.includes(s))
}

function renderRichText(content: Job['description']): string {
  if (!content?.root?.children?.length) return ''
  const topLevel = content.root.children as { type?: string; text?: string; children?: unknown[] }[]
  const blockTexts: string[] = []
  function collectText(nodes: { type?: string; text?: string; children?: unknown[] }[]): string {
    const parts: string[] = []
    for (const node of nodes) {
      if (node.text != null) parts.push(String(node.text))
      if (Array.isArray(node.children) && node.children.length) parts.push(collectText(node.children as { type?: string; text?: string; children?: unknown[] }[]))
    }
    return parts.join('')
  }
  for (const node of topLevel) {
    blockTexts.push(collectText([node]))
  }
  return blockTexts.join('\n')
}

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://findjobabroad.com'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'jobs',
    locale: locale as 'en' | 'da',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  const job = result.docs[0] as Job | undefined
  if (!job) return {}
  const country = typeof job.country === 'object' && job.country !== null ? (job.country as { name: string }) : null
  const countryName = country?.name ?? ''
  const company = job.company ?? ''
  const jobType = job.jobType ?? ''
  return {
    title: job.seo?.title ?? `${job.title} in ${countryName} | findjobabroad.com`,
    description: job.seo?.description ?? `${jobType} at ${company} in ${countryName}`,
    alternates: {
      canonical: `/${locale}/jobs/${slug}`,
      languages: { en: `/en/jobs/${slug}`, da: `/da/jobs/${slug}`, 'x-default': `/en/jobs/${slug}` },
    },
  }
}

const EXPIRED_BANNER_EN = 'This job is no longer available.'
const EXPIRED_BANNER_DA = 'Dette job er ikke længere tilgængeligt.'
const DESCRIPTION_FALLBACK_DA = 'Jobbeskrivelsen er på engelsk.'

export default async function JobDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'jobs',
    locale: locale as 'en' | 'da',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  const job = result.docs[0] as Job | undefined
  if (!job) notFound()

  const country = typeof job.country === 'object' && job.country !== null ? (job.country as { slug: string; name: string }) : null
  const countrySlug = country?.slug ?? ''
  const countryName = country?.name ?? ''

  let descriptionToRender = job.description
  let showEnDescriptionNotice = false
  if (locale === 'da') {
    const hasLocalDescription = job.description?.root?.children?.length
    if (!hasLocalDescription) {
      const enResult = await payload.find({
        collection: 'jobs',
        locale: 'en',
        where: { slug: { equals: slug } },
        depth: 0,
        limit: 1,
      })
      const enJob = enResult.docs[0] as Job | undefined
      if (enJob?.description) {
        descriptionToRender = enJob.description
        showEnDescriptionNotice = true
      }
    }
  }

  const relatedResult = await payload.find({
    collection: 'jobs',
    locale: locale as 'en' | 'da',
    depth: 1,
    limit: 10,
    where: {
      and: [
        { status: { equals: 'active' } },
        { _status: { equals: 'published' } },
        ...(job.country ? [{ country: { equals: typeof job.country === 'object' ? (job.country as { id: number }).id : job.country } }] : []),
        { slug: { not_equals: slug } },
      ],
    },
  })
  const relatedRaw = (relatedResult.docs as Job[]).filter(
    (j) => locale === 'da' ? isVisibleInDa(j) : isVisibleInEn(j, ['en'])
  )
  const relatedJobs = relatedRaw.slice(0, 3)

  const isExpired = job.status === 'expired'
  const bodyText = renderRichText(descriptionToRender)
  const bodyParagraphs = bodyText.split(/\n/).filter(Boolean)
  const cityName =
    job.city && typeof job.city === 'object' && job.city !== null && 'name' in job.city
      ? (job.city as { name: string }).name
      : ''
  const jsonLd = jobPostingJsonLd(
    {
      title: job.title,
      company: job.company ?? null,
      description: bodyText,
      jobType: job.jobType ?? null,
      salary: job.salary ?? null,
      postedAt: job.postedAt ?? null,
      expiresAt: job.expiresAt ?? null,
      countryName,
      cityName,
      slug: job.slug,
    },
    BASE_URL,
    locale
  )
  const languageCodes = (job.requiredLanguages as { language?: string | null }[])
    .map((r) => r.language)
    .filter((code): code is string => Boolean(code))

  const expiredText = locale === 'da' ? EXPIRED_BANNER_DA : EXPIRED_BANNER_EN

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        className="relative flex h-[280px] items-end px-6 py-8 md:px-12"
        style={{ background: 'linear-gradient(135deg, #4A90D9, #1A1A2E)' }}
      >
        <div>
          <p className="mb-3 text-xs text-white/50">
            {locale === 'da' ? 'Jobs' : 'Jobs'} › {countryName} › {job.title}
          </p>
          <h1 className="font-heading mb-1 text-3xl font-bold text-white md:text-4xl">
            {job.title}
          </h1>
          <p className="text-base text-white/70">
            {job.company ?? ''} · {cityName || countryName}
          </p>
        </div>
      </div>

      {isExpired && (
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm font-medium text-amber-800 md:px-12">
          {expiredText}
        </div>
      )}

      <div className="mx-auto max-w-5xl grid grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-[1fr_320px] md:px-12">
        <main>
          <div className="mb-6 flex flex-wrap gap-2">
            {job.jobType && (
              <span className="pill bg-sand-100 px-3 py-1.5 text-sm text-[#4A3728]">
                {job.jobType}
              </span>
            )}
            {languageCodes.map((lang) => (
              <span
                key={lang}
                className="pill bg-primary-100 px-3 py-1.5 text-sm text-primary-600"
              >
                🗣 {lang.toUpperCase()}
              </span>
            ))}
          </div>

          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="rounded-[10px] border border-sand-200 bg-white p-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-widest text-gray-400">
                Location
              </p>
              <p className="text-[15px] font-semibold text-navy-900">{cityName || countryName || '—'}</p>
            </div>
            <div className="rounded-[10px] border border-sand-200 bg-white p-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-widest text-gray-400">
                Salary
              </p>
              <p className="text-[15px] font-semibold text-navy-900">{job.salary ?? '—'}</p>
            </div>
            <div className="rounded-[10px] border border-sand-200 bg-white p-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-widest text-gray-400">
                Job Type
              </p>
              <p className="text-[15px] font-semibold text-navy-900">{job.jobType ?? '—'}</p>
            </div>
          </div>

          <h2 className="font-heading mb-4 text-xl">Job Description</h2>
          {showEnDescriptionNotice && (
            <p className="mb-4 rounded-xl bg-blue-50 px-4 py-2.5 text-sm text-blue-800">
              {DESCRIPTION_FALLBACK_DA}
            </p>
          )}
          <div className="prose prose-gray max-w-none text-[15px] leading-relaxed">
            {bodyParagraphs.map((para, i) => (
              <p key={i} className="mb-4">
                {para}
              </p>
            ))}
          </div>
        </main>

        <aside>
          <div className="sticky top-4 space-y-4">
            <div className="rounded-2xl border border-sand-200 bg-white p-6">
              <a
                href={`/api/jobs/${slug}/apply?locale=${locale}`}
                className="mb-3 block w-full bg-primary-600 py-4 text-center font-bold text-white transition-colors hover:bg-primary-500 pill"
              >
                Apply / View Job ↗
              </a>
              <p className="text-center text-xs leading-relaxed text-gray-400">
                {locale === 'da'
                  ? 'Du sendes videre til en partner-side. findjobabroad.com kan modtage provision.'
                  : 'You will be redirected to a partner site. findjobabroad.com may earn a commission.'}
              </p>
              {job.company && (
                <div className="mt-4 border-t border-sand-100 pt-4">
                  <p className="text-sm font-semibold text-navy-900">{job.company}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{countryName}</p>
                </div>
              )}
            </div>

            {relatedJobs.length > 0 && (
              <div className="rounded-2xl border border-sand-200 bg-white p-5">
                <h3 className="font-heading mb-4 text-sm font-bold">
                  Similar Jobs in {countryName}
                </h3>
                <div className="space-y-0 divide-y divide-sand-100">
                  {relatedJobs.map((related) => (
                    <a
                      key={related.id}
                      href={`/${locale}/jobs/${related.slug}`}
                      className="block py-3 transition-colors hover:text-primary-600"
                    >
                      <p className="text-sm font-semibold text-navy-900">{related.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {related.company ?? ''} · {related.jobType ?? ''}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-sand-200 bg-white p-4 lg:hidden">
        <a
          href={`/api/jobs/${slug}/apply?locale=${locale}`}
          className="block w-full bg-primary-600 py-3.5 text-center font-bold text-white pill"
        >
          Apply / View Job ↗
        </a>
      </div>
    </div>
  )
}
