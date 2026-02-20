'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'

type NavLink = { href: string; key: string }

export function MobileMenu({ links }: { links: readonly NavLink[] }) {
  const [open, setOpen] = useState(false)
  const locale = useLocale()
  const pathname = usePathname()
  const t = useTranslations('nav')

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-label="Toggle menu"
        className="md:hidden p-2"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sr-only">{open ? 'Close' : 'Open'} menu</span>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      {open && (
        <div className="fixed inset-0 bg-navy-900 z-[100] flex flex-col p-6 md:hidden">
          <div className="flex items-center justify-between">
            <span className="font-heading font-extrabold text-xl">
              <span className="text-white">findjob</span>
              <span className="text-amber-500">abroad</span>
            </span>
            <button
              type="button"
              aria-label="Close menu"
              className="p-2 text-white"
              onClick={() => setOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-6 mt-12">
            {links.map(({ href, key }) => {
              const isActive = pathname.startsWith(`/${locale}${href}`)
              return (
                <Link
                  key={key}
                  href={`/${locale}${href}`}
                  className={`text-2xl font-heading font-bold transition-colors ${
                    isActive ? 'text-amber-500' : 'text-white hover:text-amber-500'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {t(key)}
                </Link>
              )
            })}
          </nav>
          <div className="mt-auto pt-8">
            <LanguageSwitcher variant="dark" />
          </div>
        </div>
      )}
    </>
  )
}
