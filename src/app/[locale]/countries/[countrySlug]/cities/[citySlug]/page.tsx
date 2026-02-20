import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { City, Country, Job } from '@/payload-types'
import { isVisibleInLocale } from '../../../_utils'
import { articleJsonLd } from '@/lib/jsonld'

type Props = {
  params: Promise<{ locale: string; countrySlug: string; citySlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, countrySlug, citySlug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'cities',
    locale: locale as 'en' | 'da',
    where: {
      and: [
        { slug: { equals: citySlug } },
        { _status: { equals: 'published' } },
      ],
    },
    depth: 0,
    limit: 1,
  })
  const city = result.docs[0] as City | undefined
  if (!city) return {}
  const title = city.seo?.title ?? `Work in ${city.name} | findjobabroad.com`
  const description = city.seo?.description ?? `Guide to working in ${city.name}.`
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/countries/${countrySlug}/cities/${citySlug}`,
      languages: {
        en: `/en/countries/${countrySlug}/cities/${citySlug}`,
        da: `/da/countries/${countrySlug}/cities/${citySlug}`,
        'x-default': `/en/countries/${countrySlug}/cities/${citySlug}`,
      },
    },
  }
}

export default async function CityGuidePage({ params }: Props) {
  const { locale, countrySlug, citySlug } = await params
  const t = await getTranslations('guides')
  const payload = await getPayload({ config })

  const cityResult = await payload.find({
    collection: 'cities',
    locale: locale as 'en' | 'da',
    where: {
      and: [
        { slug: { equals: citySlug } },
        { _status: { equals: 'published' } },
      ],
    },
    depth: 2,
    limit: 1,
  })
  const city = cityResult.docs[0] as (City & { country?: Country | number }) | undefined
  if (!city || !city.name) notFound()

  const country =
    typeof city.country !== 'number' && city.country != null
      ? (city.country as Country)
      : null
  const countryName = country?.name ?? ''

  const jobsResult = await payload.find({
    collection: 'jobs',
    locale: locale as 'en' | 'da',
    where: {
      and: [
        { 'city.slug': { equals: citySlug } },
        { status: { equals: 'active' } },
        { _status: { equals: 'published' } },
      ],
    },
    limit: 20,
    depth: 1,
  })
  const allJobs = jobsResult.docs as Job[]
  const visibleJobs = allJobs.filter((j) => isVisibleInLocale(j, locale)).slice(0, 6)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://findjobabroad.com'
  const jsonLd = articleJsonLd({
    title: city.name,
    description: city.seo?.description ?? undefined,
    url: `${baseUrl}/${locale}/countries/${countrySlug}/cities/${citySlug}`,
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
        {countryName && (
          <>
            {' → '}
            <Link href={`/${locale}/countries/${countrySlug}`} className="hover:underline">
              {countryName}
            </Link>
          </>
        )}
        {' → '}
        <span className="text-gray-900">{city.name}</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold text-gray-900">{city.name}</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 max-w-2xl">
        {city.avgMonthlySalary && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-500">{t('avgSalary')}</p>
            <p className="text-gray-900">{city.avgMonthlySalary}</p>
          </div>
        )}
        {city.costOfLiving != null && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-500">{t('costOfLiving')}</p>
            <p className="text-gray-900">{city.costOfLiving}</p>
          </div>
        )}
      </div>

      <div className="prose prose-gray max-w-none">
        {city.content && <RichText data={city.content} />}
      </div>

      <section id="jobs" className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          {t('jobsIn', { destination: city.name })}
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
                href={`/${locale}/jobs?city=${citySlug}`}
                className="text-blue-600 hover:underline"
              >
                {t('seeAllJobs', { destination: city.name })}
              </Link>
            </p>
          </>
        ) : null}
      </section>
    </div>
  )
}
