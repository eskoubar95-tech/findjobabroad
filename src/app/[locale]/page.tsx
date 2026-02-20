import { getPayload } from 'payload'
import config from '@payload-config'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Country, Job } from '@/payload-types'

type Props = {
  params: Promise<{ locale: string }>
}

function getDestination(job: Job): string {
  const country = typeof job.country === 'object' && job.country !== null ? job.country : null
  const city = typeof job.city === 'object' && job.city !== null ? job.city : null
  if (city?.name) return city.name
  if (country?.name) return country.name
  return ''
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('home')
  const payload = await getPayload({ config })

  const [countriesResult, jobsResult] = await Promise.all([
    payload.find({
      collection: 'countries',
      locale: locale as 'en' | 'da',
      where: { _status: { equals: 'published' } },
      limit: 6,
      depth: 0,
    }),
    payload.find({
      collection: 'jobs',
      locale: locale as 'en' | 'da',
      where: {
        and: [
          { status: { equals: 'active' } },
          { _status: { equals: 'published' } },
        ],
      },
      limit: 6,
      sort: '-createdAt',
      depth: 1,
    }),
  ])

  const countries = countriesResult.docs.filter(
    (c): c is Country => locale === 'en' || !!c.name
  )
  const jobs = jobsResult.docs as Job[]

  return (
    <>
      <section className="px-4 py-12 md:py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('hero.title')}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          {t('hero.subtitle')}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href={`/${locale}/jobs`}
            className={cn(
              'inline-block px-6 py-3 rounded-lg font-medium',
              'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {t('hero.browseJobs')}
          </Link>
          <Link
            href={`/${locale}/countries`}
            className={cn(
              'inline-block px-6 py-3 rounded-lg font-medium border border-gray-300',
              'hover:bg-gray-50'
            )}
          >
            {t('hero.exploreCountries')}
          </Link>
        </div>
      </section>

      <section className="px-4 py-8 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{t('featuredDestinations')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {countries.map((country) => (
            <Link
              key={country.id}
              href={`/${locale}/countries/${country.slug}`}
              className={cn(
                'block p-4 rounded-lg border border-gray-200',
                'hover:border-gray-300 hover:shadow-sm'
              )}
            >
              <span className="text-2xl" role="img" aria-hidden>
                {country.flag ?? '🌍'}
              </span>
              <h3 className="font-semibold mt-2">{country.name}</h3>
              {country.topIndustries && (
                <p className="text-sm text-gray-600 mt-1">{country.topIndustries}</p>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 py-8 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{t('featuredJobs')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/${locale}/jobs/${job.slug}`}
              className={cn(
                'block p-4 rounded-lg border border-gray-200',
                'hover:border-gray-300 hover:shadow-sm'
              )}
            >
              <h3 className="font-semibold">{job.title}</h3>
              {job.company && <p className="text-sm text-gray-600">{job.company}</p>}
              {getDestination(job) && (
                <p className="text-sm text-gray-500 mt-1">{getDestination(job)}</p>
              )}
              {job.jobType && (
                <span
                  className={cn(
                    'inline-block mt-2 px-2 py-0.5 text-xs rounded',
                    'bg-gray-100 text-gray-700'
                  )}
                >
                  {job.jobType}
                </span>
              )}
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <Link href={`/${locale}/jobs`} className="text-blue-600 hover:underline font-medium">
            {t('viewAllJobs')}
          </Link>
        </div>
      </section>
    </>
  )
}
