'use client'

import { useState, type FormEvent } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

type CountryOption = { slug: string; name: string }

type Props = {
  countries: CountryOption[]
}

export function HeroSearch({ countries }: Props) {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('home')
  const [keyword, setKeyword] = useState('')
  const [country, setCountry] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('keyword', keyword.trim())
    if (country) params.set('country', country)
    router.push(`/${locale}/jobs?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2 max-w-2xl mx-auto"
    >
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="flex-1 px-4 py-3 text-sm outline-none rounded-xl placeholder:text-gray-400"
      />
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="px-4 py-3 text-sm bg-sand-50 rounded-xl border-0 outline-none cursor-pointer"
      >
        <option value="">{t('allCountries')}</option>
        {countries.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-500 transition-colors whitespace-nowrap"
      >
        {t('searchBtn')}
      </button>
    </form>
  )
}
