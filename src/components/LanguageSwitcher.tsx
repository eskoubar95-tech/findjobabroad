'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

const LOCALES = ['en', 'da'] as const

type Variant = 'light' | 'dark'

export function LanguageSwitcher({ variant = 'light' }: { variant?: Variant }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const otherLocale = LOCALES.find((l) => l !== locale) ?? 'en'
  const segments = pathname.split('/')
  segments[1] = otherLocale
  const targetPath = segments.join('/')

  function handleClick() {
    router.push(targetPath)
  }

  const lightClasses =
    'border border-sand-200 rounded-full px-3 py-1.5 text-sm font-semibold text-navy-700 hover:border-primary-600 hover:text-primary-600 transition-colors'
  const darkClasses =
    'border border-white/50 rounded-full px-3 py-1.5 text-sm font-semibold text-white hover:border-white transition-colors'
  const className = variant === 'dark' ? darkClasses : lightClasses

  const label: ReactNode = (
    <>
      <span className={locale === 'en' ? 'font-bold' : 'opacity-50'}>EN</span>
      <span className="mx-1">/</span>
      <span className={locale === 'da' ? 'font-bold' : 'opacity-50'}>DA</span>
    </>
  )

  return (
    <button type="button" onClick={handleClick} className={className}>
      {label}
    </button>
  )
}
