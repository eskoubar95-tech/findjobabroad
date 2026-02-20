'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

type NavLink = { href: string; key: string }

type Props = {
  links: readonly NavLink[]
  locale: string
}

export function NavLinks({ links, locale }: Props) {
  const pathname = usePathname()
  const t = useTranslations('nav')

  return (
    <nav className="hidden md:flex items-center gap-6">
      {links.map(({ href, key }) => {
        const isActive = pathname.startsWith(`/${locale}${href}`)
        return (
          <Link
            key={key}
            href={`/${locale}${href}`}
            className={
              isActive
                ? 'text-primary-600 font-semibold text-sm'
                : 'text-navy-700 hover:text-primary-600 font-medium text-sm transition-colors'
            }
          >
            {t(key)}
          </Link>
        )
      })}
    </nav>
  )
}
