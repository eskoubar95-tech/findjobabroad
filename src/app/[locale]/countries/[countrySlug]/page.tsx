import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Country, Job } from '@/payload-types'
import { isVisibleInLocale } from '../_utils'
import { articleJsonLd } from '@/lib/jsonld'

type Props = {
  params: Promise<{ locale: string; countrySlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, countrySlug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'countries',
    locale: locale as 'en' | 'da',
    where: {
      and: [
        { slug: { equals: countrySlug } },
        { _status: { equals: 'published' } },
      ],
    },
    depth: 0,
    limit: 1,
  })
  const country = result.docs[0] as Country | undefined
  if (!country) return {}
  const title = country.seo?.title ?? `Work in ${country.name} | findjobabroad.com`
  const description =
    country.seo?.description ?? country.topIndustries ?? `Guide to working in ${country.name}.`
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/countries/${countrySlug}`,
      languages: {
        en: `/en/countries/${countrySlug}`,
        da: `/da/countries/${countrySlug}`,
        'x-default': `/en/countries/${countrySlug}`,
      },
    },
  }
}

export default async function CountryGuidePage({ params }: Props) {
  const { locale, countrySlug } = await params
  const t = await getTranslations('guides')
  const payload = await getPayload({ config })

  const countryResult = await payload.find({
    collection: 'countries',
    locale: locale as 'en' | 'da',
    where: {
      and: [
        { slug: { equals: countrySlug } },
        { _status: { equals: 'published' } },
      ],
    },
    depth: 1,
    limit: 1,
  })
  const country = countryResult.docs[0] as Country | undefined
  if (!country || !country.name) notFound()

  const [citiesResult, jobsResult, otherCountriesResult] = await Promise.all([
    payload.find({
      collection: 'cities',
      locale: locale as 'en' | 'da',
      where: {
        and: [
          { 'country.slug': { equals: countrySlug } },
          { _status: { equals: 'published' } },
        ],
      },
      depth: 1,
    }),
    payload.find({
      collection: 'jobs',
      locale: locale as 'en' | 'da',
      where: {
        and: [
          { 'country.slug': { equals: countrySlug } },
          { status: { equals: 'active' } },
          { _status: { equals: 'published' } },
        ],
      },
      limit: 20,
      depth: 1,
    }),
    payload.find({
      collection: 'countries',
      locale: locale as 'en' | 'da',
      where: {
        and: [
          { slug: { not_equals: countrySlug } },
          { _status: { equals: 'published' } },
        ],
      },
      limit: 4,
    }),
  ])

  const cities = citiesResult.docs as Array<{ slug: string; name: string }>
  const allJobs = jobsResult.docs as Job[]
  const visibleJobs = allJobs.filter((j) => isVisibleInLocale(j, locale)).slice(0, 6)
  const otherCountries = otherCountriesResult.docs as Array<{ slug: string; name: string }>
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://findjobabroad.com'
  const jsonLd = articleJsonLd({
    title: country.name,
    description: country.seo?.description ?? undefined,
    url: `${baseUrl}/${locale}/countries/${countrySlug}`,
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="mb-6 text-sm text-gray-600">
        <Link href={`/${locale}/countries`} className="hover:underline">
          Countries
        </Link>
        {' → '}
        <span className="text-gray-900">{country.name}</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        {country.flag ? <span className="mr-2">{country.flag}</span> : null}
        {country.name}
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <main>
          <div className="mb-8 grid grid-cols-2 gap-4">
            {country.avgMonthlySalary && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-500">{t('avgSalary')}</p>
                <p className="text-gray-900">{country.avgMonthlySalary}</p>
              </div>
            )}
            {country.costOfLiving != null && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-500">{t('costOfLiving')}</p>
                <p className="text-gray-900">{country.costOfLiving}</p>
              </div>
            )}
            {country.visaType && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-500">{t('visaType')}</p>
                <p className="text-gray-900">{country.visaType}</p>
              </div>
            )}
            {country.topIndustries && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-500">{t('topIndustries')}</p>
                <p className="text-gray-900">{country.topIndustries}</p>
              </div>
            )}
          </div>

          <section id="content" className="prose prose-gray max-w-none">
            {country.content && <RichText data={country.content} />}
          </section>

          <section id="cities" className="mt-10">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              {t('citiesIn', { country: country.name })}
            </h2>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/${locale}/countries/${countrySlug}/cities/${city.slug}`}
                  className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-800 hover:bg-gray-50"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </section>

          <section id="jobs" className="mt-10">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              {t('jobsIn', { destination: country.name })}
            </h2>
            {visibleJobs.length > 0 ? (
              <>
                <ul className="space-y-3">
                  {visibleJobs.map((job) => (
                    <li key={job.id}>
                      <Link
                        href={`/${locale}/jobs/${job.slug}`}
                        className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow"
                      >
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">
                          {job.company}
                          {job.jobType ? ` · ${job.jobType}` : ''}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-4">
                  <Link
                    href={`/${locale}/jobs?country=${countrySlug}`}
                    className="text-blue-600 hover:underline"
                  >
                    {t('seeAllJobs', { destination: country.name })}
                  </Link>
                </p>
              </>
            ) : null}
          </section>
        </main>

        <aside className="space-y-6 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">{t('onThisPage')}</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="#content" className="text-blue-600 hover:underline">
                  Content
                </Link>
              </li>
              <li>
                <Link href="#cities" className="text-blue-600 hover:underline">
                  {t('citiesIn', { country: country.name })}
                </Link>
              </li>
              <li>
                <Link href="#jobs" className="text-blue-600 hover:underline">
                  {t('jobsIn', { destination: country.name })}
                </Link>
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">{t('otherCountries')}</h3>
            <ul className="space-y-2 text-sm">
              {otherCountries.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${locale}/countries/${c.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
