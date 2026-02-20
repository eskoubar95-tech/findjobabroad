'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function CountryNotFound() {
  const params = useParams()
  const countrySlug = params?.countrySlug as string | undefined
  const t = useTranslations('guides')

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">{t('notAvailable')}</h1>
      <p className="mb-6 text-gray-600">{t('notAvailableDesc')}</p>
      {countrySlug && (
        <Link
          href={`/en/countries/${countrySlug}`}
          className="text-blue-600 hover:underline"
        >
          {t('readInEnglish')}
        </Link>
      )}
    </div>
  )
}
