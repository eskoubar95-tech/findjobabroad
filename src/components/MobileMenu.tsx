'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useTranslations } from 'next-intl'

type NavLink = { href: string; key: string }

export function MobileMenu({ links }: { links: readonly NavLink[] }) {
  const [open, setOpen] = useState(false)
  const locale = useLocale()
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
        <nav className="absolute top-full left-0 right-0 bg-white border-b md:hidden z-10 p-4 flex flex-col gap-2">
          {links.map(({ href, key }) => (
            <Link
              key={key}
              href={`/${locale}${href}`}
              className="block py-2"
              onClick={() => setOpen(false)}
            >
              {t(key)}
            </Link>
          ))}
        </nav>
      )}
    </>
  )
}
