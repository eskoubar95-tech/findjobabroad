import { getPayload } from 'payload'
import config from '@payload-config'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import type { Job } from '@/payload-types'
import { JobFilterBar } from '@/components/JobFilterBar'
import { JobCard } from '@/components/JobCard'

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
    sort?: string
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
  const sortParam = resolved.sort ?? 'recent'
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
  const filteredJobs =
    locale === 'da'
      ? allJobs.filter(isVisibleInDa)
      : allJobs.filter((j) => isVisibleInEn(j, selectedLanguages))

  const visibleJobs = [...filteredJobs].sort((a, b) => {
    if (sortParam === 'relevance') {
      const aDate = a.postedAt ?? a.updatedAt ?? ''
      const bDate = b.postedAt ?? b.updatedAt ?? ''
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    }
    const aUpdated = a.updatedAt ?? ''
    const bUpdated = b.updatedAt ?? ''
    return new Date(bUpdated).getTime() - new Date(aUpdated).getTime()
  })

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
    u.set('sort', sortParam)
    u.set('page', String(nextPage))
    return `/${locale}/jobs?${u.toString()}`
  }

  function buildSortUrl(sortValue: string): string {
    const u = new URLSearchParams()
    if (countryParam) u.set('country', countryParam)
    if (categoryParam) u.set('category', categoryParam)
    if (typeParam) u.set('type', typeParam)
    if (locale === 'en' && selectedLanguages.length) selectedLanguages.forEach((l) => u.append('languages', l))
    u.set('sort', sortValue)
    u.set('page', '1')
    return `/${locale}/jobs?${u.toString()}`
  }

  const countries = countriesResult.docs.map((c: { slug: string; name: string }) => ({
    slug: c.slug,
    name: c.name,
  }))

  return (
    <div>
      <div className="bg-navy-900 px-4 py-10 md:px-12">
        <p className="mb-3 text-xs text-white/40">
          {locale === 'da' ? 'Hjem › Jobs' : 'Home › Jobs'}
        </p>
        <h1 className="font-heading mb-2 text-4xl text-white">{t('title')}</h1>
        <p className="text-sm text-white/55">
          {visibleJobs.length}+{' '}
          {locale === 'da'
            ? 'internationale muligheder i Europa og ud over'
            : 'international opportunities across Europe and beyond'}
        </p>
      </div>

      <JobFilterBar
        locale={locale}
        countries={countries}
        categories={categories}
        currentCountry={countryParam}
        currentCategory={categoryParam}
        currentType={typeParam}
        currentLanguages={selectedLanguages}
        totalCount={visibleJobs.length}
      />

      <div className="mx-auto max-w-7xl px-4 py-7 md:px-12">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm text-gray-500">{visibleJobs.length} jobs found</span>
          <div className="flex shrink-0 gap-1">
            <a
              href={buildSortUrl('recent')}
              className={`pill px-4 py-2 text-sm font-medium transition-colors ${
                sortParam === 'recent'
                  ? 'bg-navy-900 text-white border border-navy-900'
                  : 'border border-sand-200 bg-white text-navy-900 hover:bg-sand-50'
              }`}
            >
              {locale === 'da' ? 'Seneste' : 'Most recent'}
            </a>
            <a
              href={buildSortUrl('relevance')}
              className={`pill px-4 py-2 text-sm font-medium transition-colors ${
                sortParam === 'relevance'
                  ? 'bg-navy-900 text-white border border-navy-900'
                  : 'border border-sand-200 bg-white text-navy-900 hover:bg-sand-50'
              }`}
            >
              {locale === 'da' ? 'Relevans' : 'Relevance'}
            </a>
          </div>
        </div>

        {visibleJobs.length === 0 ? (
          <p className="text-gray-600">{t('noResults')}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pageJobs.map((job) => (
                <JobCard key={job.id} job={job} locale={locale} />
              ))}
            </div>

            <nav
              className="mt-6 flex items-center justify-center gap-2"
              aria-label="Pagination"
            >
              {page > 1 ? (
                <a
                  href={buildPageUrl(page - 1)}
                  className="pill border border-sand-200 bg-white px-4 py-2 text-sm font-medium text-navy-900 hover:bg-sand-50"
                >
                  {t('pagination.previous')}
                </a>
              ) : (
                <span className="pill border border-sand-200 bg-sand-100 px-4 py-2 text-sm text-gray-400">
                  {t('pagination.previous')}
                </span>
              )}
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages || 1}
              </span>
              {page < totalPages ? (
                <a
                  href={buildPageUrl(page + 1)}
                  className="pill border border-sand-200 bg-white px-4 py-2 text-sm font-medium text-navy-900 hover:bg-sand-50"
                >
                  {t('pagination.next')}
                </a>
              ) : (
                <span className="pill border border-sand-200 bg-sand-100 px-4 py-2 text-sm text-gray-400">
                  {t('pagination.next')}
                </span>
              )}
            </nav>
          </>
        )}
      </div>
    </div>
  )
}
