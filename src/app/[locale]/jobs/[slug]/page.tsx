import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import type { Job } from '@/payload-types'

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

const EXPIRED_BANNER_EN = 'This job is no longer available.'
const EXPIRED_BANNER_DA = 'Dette job er ikke længere tilgængeligt.'
const DESCRIPTION_FALLBACK_DA = 'Jobbeskrivelsen er på engelsk.'

export default async function JobDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'jobs',
    locale,
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
    locale,
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav className="mb-6 text-sm text-gray-600">
        <a href={`/${locale}/jobs`} className="hover:underline">Jobs</a>
        {countryName && (
          <>
            {' → '}
            <a href={`/${locale}/countries/${countrySlug}`} className="hover:underline">{countryName}</a>
          </>
        )}
        {' → '}
        <span className="text-gray-900">{job.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <main>
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            <p className="mt-1 text-gray-600">
              {job.company}
              {job.city && typeof job.city === 'object' && job.city !== null && 'name' in job.city
                ? ` · ${(job.city as { name: string }).name}`
                : ''}
            </p>
          </header>

          <div className="mb-6 grid grid-cols-2 gap-3 text-sm">
            {job.jobType && (
              <div>
                <span className="font-medium text-gray-500">Job Type</span>
                <p className="text-gray-900">{job.jobType}</p>
              </div>
            )}
            {job.requiredLanguages?.length ? (
              <div>
                <span className="font-medium text-gray-500">Language(s)</span>
                <p className="text-gray-900">
                  {(job.requiredLanguages as { language?: string | null }[])
                    .map((r) => r.language)
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            )}
            {job.salary && (
              <div>
                <span className="font-medium text-gray-500">Salary</span>
                <p className="text-gray-900">{job.salary}</p>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-500">Source</span>
              <p className="text-gray-900">{job.source === 'affiliate' ? 'Affiliate' : 'Manual'}</p>
            </div>
          </div>

          {isExpired && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
              {locale === 'da' ? EXPIRED_BANNER_DA : EXPIRED_BANNER_EN}
            </div>
          )}

          <section className="prose prose-gray max-w-none">
            {showEnDescriptionNotice && (
              <p className="mb-4 rounded bg-blue-50 px-3 py-2 text-sm text-blue-800">
                {DESCRIPTION_FALLBACK_DA}
              </p>
            )}
            {bodyParagraphs.length > 0 ? (
              <div className="whitespace-pre-wrap">
                {bodyParagraphs.map((para, i) => (
                  <p key={i} className="mb-4">
                    {para}
                  </p>
                ))}
              </div>
            ) : null}
          </section>
        </main>

        <aside className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <a
              href={`/api/jobs/${slug}/apply?locale=${locale}`}
              className="block w-full rounded bg-blue-600 px-4 py-3 text-center font-medium text-white hover:bg-blue-700"
            >
              Apply / View Job
            </a>
            <p className="mt-2 text-xs text-gray-500">
              {locale === 'da' ? 'Du sendes videre til en partner-side' : 'You will be redirected to a partner site'}
            </p>
          </div>

          <div>
            <a
              href={`/${locale}/jobs`}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to jobs
            </a>
          </div>

          {countrySlug && (
            <div>
              <a
                href={`/${locale}/countries/${countrySlug}`}
                className="text-sm text-blue-600 hover:underline"
              >
                Country guide: {countryName}
              </a>
            </div>
          )}

          {relatedJobs.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Related jobs</h3>
              <ul className="space-y-2">
                {relatedJobs.map((related) => {
                  const rCountry = typeof related.country === 'object' && related.country !== null ? (related.country as { name: string }) : null
                  return (
                    <li key={related.id}>
                      <a
                        href={`/${locale}/jobs/${related.slug}`}
                        className="block rounded border border-gray-200 p-3 text-sm hover:bg-gray-50"
                      >
                        <span className="font-medium text-gray-900">{related.title}</span>
                        <span className="mt-1 block text-gray-600">
                          {rCountry?.name ?? ''} · {related.jobType ?? ''}
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
