import { getLocale } from 'next-intl/server'
import Link from 'next/link'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileMenu } from './MobileMenu'
import { NavLinks } from './NavLinks'
import { NavWrapper } from './NavWrapper'

const NAV_LINKS = [
  { href: '/jobs', key: 'jobs' },
  { href: '/countries', key: 'countries' },
  { href: '/cities', key: 'cities' },
  { href: '/blog', key: 'blog' },
] as const

export async function Nav() {
  const locale = await getLocale()

  return (
    <NavWrapper locale={locale}>
      <Link href={`/${locale}`} className="font-heading font-extrabold text-xl">
        <span className="text-navy-900">findjob</span>
        <span className="text-amber-500">abroad</span>
      </Link>
      <NavLinks links={NAV_LINKS} locale={locale} />
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <MobileMenu links={NAV_LINKS} />
      </div>
    </NavWrapper>
  )
}
