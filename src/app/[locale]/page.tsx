import { getPayload } from 'payload'
import config from '@payload-config'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Country, Job } from '@/payload-types'
import { websiteJsonLd } from '@/lib/jsonld'
import { HeroSearch } from '@/components/HeroSearch'

const CARD_GRADIENTS = [
  'from-blue-600 to-blue-900',
  'from-primary-600 to-red-900',
  'from-green-600 to-green-900',
  'from-purple-600 to-purple-900',
] as const

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const title =
    locale === 'da'
      ? 'Find job i udlandet | findjobabroad.com'
      : 'Find Jobs Abroad | findjobabroad.com'
  const description =
    locale === 'da'
      ? 'Internationale jobs og landeguider for danskere der søger arbejde i udlandet.'
      : 'International job listings and country guides for professionals seeking work abroad.'
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: '/en', da: '/da', 'x-default': '/en' },
    },
  }
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
      limit: 8,
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
      limit: 10,
      sort: '-createdAt',
      depth: 1,
    }),
  ])

  const countries = countriesResult.docs.filter(
    (c): c is Country => locale === 'en' || !!c.name
  )
  const jobs = jobsResult.docs as Job[]
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://findjobabroad.com'

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd(baseUrl)) }}
      />

      {/* Section 1 — Hero */}
      <section
        className="relative min-h-[90vh] flex flex-col justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 to-navy-900/95" />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4 pt-32 pb-16">
          <p className="text-amber-500 text-xs font-semibold tracking-widest uppercase mb-4">
            🌍 {t('hero.eyebrow')}
          </p>
          <h1 className="text-5xl md:text-6xl text-white leading-tight mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-white/70 text-lg mb-10">{t('hero.subtitle')}</p>
          <HeroSearch countries={countries.map((c) => ({ slug: c.slug, name: c.name }))} />
          <div className="flex gap-8 justify-center mt-8 text-white">
            <div className="text-center">
              <span className="font-bold text-2xl block">12,400+</span>
              <span className="text-white/60 text-xs">{t('stats.jobs')}</span>
            </div>
            <div className="text-center">
              <span className="font-bold text-2xl block">40+</span>
              <span className="text-white/60 text-xs">{t('stats.countries')}</span>
            </div>
            <div className="text-center">
              <span className="font-bold text-2xl block">8+</span>
              <span className="text-white/60 text-xs">{t('stats.languages')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Popular Destinations Carousel */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-navy-900">{t('popularDestinations')}</h2>
          <Link
            href={`/${locale}/countries`}
            className="text-primary-600 hover:text-primary-500 font-semibold text-sm"
          >
            {t('viewAll')}
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide">
          {countries.map((country, i) => (
            <Link
              key={country.id}
              href={`/${locale}/countries/${country.slug}`}
              className={`flex-shrink-0 w-[220px] h-[280px] rounded-[20px] overflow-hidden relative cursor-pointer bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]}`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-2xl" role="img" aria-hidden>
                  {country.flag ?? '🌍'}
                </span>
                <h3 className="text-white font-heading font-bold text-lg mt-1">{country.name}</h3>
                <span className="inline-block mt-2 px-2 py-0.5 bg-white/20 text-white text-xs rounded">
                  Jobs
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 3 — Latest Jobs Carousel */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-navy-900">{t('latestJobs')}</h2>
          <Link
            href={`/${locale}/jobs`}
            className="text-primary-600 hover:text-primary-500 font-semibold text-sm"
          >
            {t('browseAll')}
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide">
          {jobs.map((job, i) => {
            const destination = getDestination(job)
            const country = typeof job.country === 'object' && job.country ? job.country : null
            return (
              <Link
                key={job.id}
                href={`/${locale}/jobs/${job.slug}`}
                className="flex-shrink-0 w-[260px] bg-white rounded-[20px] border border-sand-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div
                  className={`h-[150px] relative flex items-end p-3 bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]}`}
                >
                  {destination && (
                    <span className="bg-white/90 text-navy-700 text-xs font-semibold px-2 py-1 rounded">
                      {destination}
                      {country?.name && typeof country === 'object' ? `, ${country.name}` : ''}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-navy-900 line-clamp-2">{job.title}</h3>
                  {job.company && (
                    <p className="text-sm text-navy-600 mt-0.5">{job.company}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {job.jobType && (
                      <span className="px-2 py-0.5 bg-sand-100 text-navy-700 text-xs rounded">
                        {job.jobType}
                      </span>
                    )}
                    {Array.isArray(job.requiredLanguages) &&
                      job.requiredLanguages.slice(0, 2).map((lang, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded"
                        >
                          {typeof lang === 'object' && lang !== null && 'language' in lang
                            ? String((lang as { language?: string }).language ?? '')
                            : String(lang)}
                        </span>
                      ))}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Section 4 — Country & City Guides Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-navy-900">{t('guides')}</h2>
          <Link
            href={`/${locale}/countries`}
            className="text-primary-600 hover:text-primary-500 font-semibold text-sm"
          >
            {t('allGuides')}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {countries.slice(0, 6).map((country, i) => (
            <Link
              key={country.id}
              href={`/${locale}/countries/${country.slug}`}
              className="bg-white rounded-[20px] border border-sand-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className={`h-[180px] relative bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]}`}
              >
                <span className="absolute top-3 left-3 bg-white/90 text-primary-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Country Guide
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-heading font-bold text-navy-900 text-lg">{country.name}</h3>
                <p className="text-sm text-navy-600 mt-1">
                  {country.topIndustries ?? country.costOfLiving ?? ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
