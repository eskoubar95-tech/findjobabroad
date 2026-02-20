import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import type { Country } from '@/payload-types'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function CountriesListPage({ params }: Props) {
  const { locale } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'countries',
    locale: locale as 'en' | 'da',
    where: { _status: { equals: 'published' } },
    limit: 100,
    depth: 0,
  })

  const countries = result.docs.filter(
    (c): c is Country => locale === 'en' || !!c.name
  )

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Countries</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((country) => (
          <Link
            key={country.id}
            href={`/${locale}/countries/${country.slug}`}
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm"
          >
            <span className="text-2xl" role="img" aria-hidden>
              {country.flag ?? '🌍'}
            </span>
            <span className="font-medium">{country.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
