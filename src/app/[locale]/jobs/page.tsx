import { getPayload } from 'payload'
import config from '@payload-config'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import type { Job } from '@/payload-types'

const JOBS_PER_PAGE = 20
const JOB_TYPES = ['full-time', 'part-time', 'seasonal'] as const
const LANGUAGE_OPTIONS = ['en', 'sv', 'no', 'de', 'da'] as const

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

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    country?: string
    category?: string
    type?: string
    languages?: string | string[]
    page?: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const title = locale === 'da' ? 'Find job i udlandet | findjobabroad.com' : 'Browse Jobs Abroad | findjobabroad.com'
  const description =
    locale === 'da'
      ? 'Find jobs i udlandet. Filtrer efter land, jobtype og sprog.'
      : 'Find jobs abroad. Filter by country, job type and language.'
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/jobs`,
      languages: { en: '/en/jobs', da: '/da/jobs', 'x-default': '/en/jobs' },
    },
  }
}

export default async function JobsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const resolved = await searchParams
  const t = await getTranslations('jobs')

  const page = Math.max(1, parseInt(resolved.page ?? '1', 10) || 1)
  const countryParam = resolved.country ?? ''
  const categoryParam = resolved.category ?? ''
  const typeParam = resolved.type ?? ''

  let selectedLanguages: string[] = ['en']
  if (resolved.languages !== undefined) {
    selectedLanguages = Array.isArray(resolved.languages) ? resolved.languages : [resolved.languages]
  }

  const payload = await getPayload({ config })

  const [countriesResult, jobsResult] = await Promise.all([
    payload.find({
      collection: 'countries',
      locale: locale as 'en' | 'da',
      depth: 0,
      limit: 200,
      where: { _status: { equals: 'published' } },
    }),
    (async () => {
      const and: Record<string, unknown>[] = [
        { status: { equals: 'active' } },
        { _status: { equals: 'published' } },
      ]
      if (countryParam) {
        const countryDoc = (await payload.find({
          collection: 'countries',
          depth: 0,
          limit: 1,
          where: { slug: { equals: countryParam } },
        })).docs[0]
        if (countryDoc) and.push({ country: { equals: countryDoc.id } })
      }
      if (categoryParam) and.push({ category: { equals: categoryParam } })
      if (typeParam) and.push({ jobType: { equals: typeParam } })
      return payload.find({
        collection: 'jobs',
        locale: locale as 'en' | 'da',
        depth: 1,
        limit: 200,
        where: { and } as { and: { status: { equals: string }; _status: { equals: string }; country?: { equals: number }; category?: { equals: string }; jobType?: { equals: string } }[] },
      })
    })(),
  ])

  const allJobs = jobsResult.docs as Job[]
  const visibleJobs =
    locale === 'da'
      ? allJobs.filter(isVisibleInDa)
      : allJobs.filter((j) => isVisibleInEn(j, selectedLanguages))

  const totalPages = Math.ceil(visibleJobs.length / JOBS_PER_PAGE)
  const pageJobs = visibleJobs.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE)

  const categories = [...new Set(allJobs.map((j) => j.category).filter(Boolean))] as string[]

  function countryName(job: Job): string {
    const c = job.country
    return typeof c === 'object' && c !== null && 'name' in c ? (c as { name: string }).name : ''
  }

  function buildPageUrl(nextPage: number): string {
    const u = new URLSearchParams()
    if (countryParam) u.set('country', countryParam)
    if (categoryParam) u.set('category', categoryParam)
    if (typeParam) u.set('type', typeParam)
    if (locale === 'en' && selectedLanguages.length) selectedLanguages.forEach((l) => u.append('languages', l))
    u.set('page', String(nextPage))
    return `/${locale}/jobs?${u.toString()}`
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">{t('title')}</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <form method="get" className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div>
              <label htmlFor="country" className="mb-1 block text-sm font-medium text-gray-700">
                {t('filters.country')}
              </label>
              <select
                id="country"
                name="country"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                defaultValue={countryParam}
              >
                <option value="">{t('filters.allCountries')}</option>
                {countriesResult.docs.map((c: { slug: string; name: string }) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700">
                {t('filters.category')}
              </label>
              <select
                id="category"
                name="category"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                defaultValue={categoryParam}
              >
                <option value="">{t('filters.allCategories')}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="type" className="mb-1 block text-sm font-medium text-gray-700">
                {t('filters.type')}
              </label>
              <select
                id="type"
                name="type"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                defaultValue={typeParam}
              >
                <option value="">{t('filters.allTypes')}</option>
                {JOB_TYPES.map((ty) => (
                  <option key={ty} value={ty}>
                    {ty}
                  </option>
                ))}
              </select>
            </div>
            {locale === 'en' && (
              <div>
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  {t('filters.languages')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <label key={lang} className="inline-flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        name="languages"
                        value={lang}
                        defaultChecked={selectedLanguages.includes(lang)}
                        className="rounded border-gray-300"
                      />
                      {lang}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <button type="submit" className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Apply filters
            </button>
          </form>
        </aside>

        <main>
          {visibleJobs.length === 0 ? (
            <p className="text-gray-600">{t('noResults')}</p>
          ) : (
            <>
              <ul className="space-y-4">
                {pageJobs.map((job) => (
                  <li key={job.id}>
                    <a
                      href={`/${locale}/jobs/${job.slug}`}
                      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow"
                    >
                      <h2 className="font-semibold text-gray-900">{job.title}</h2>
                      <p className="text-sm text-gray-600">
                        {job.company}
                        {countryName(job) ? ` · ${countryName(job)}` : ''}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {job.jobType && (
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                            {job.jobType}
                          </span>
                        )}
                        {(job.requiredLanguages ?? []).map((r, i) => {
                          const code = (r as { language?: string | null }).language
                          return code ? (
                            <span
                              key={i}
                              className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-800"
                            >
                              {code}
                            </span>
                          ) : null
                        })}
                      </div>
                      <p className="mt-2 text-sm text-blue-600">{t('card.viewJob')}</p>
                    </a>
                  </li>
                ))}
              </ul>

              <nav className="mt-6 flex items-center justify-center gap-4" aria-label="Pagination">
                {page > 1 ? (
                  <a
                    href={buildPageUrl(page - 1)}
                    className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {t('pagination.previous')}
                  </a>
                ) : (
                  <span className="rounded border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-400">
                    {t('pagination.previous')}
                  </span>
                )}
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages || 1}
                </span>
                {page < totalPages ? (
                  <a
                    href={buildPageUrl(page + 1)}
                    className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {t('pagination.next')}
                  </a>
                ) : (
                  <span className="rounded border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-400">
                    {t('pagination.next')}
                  </span>
                )}
              </nav>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
