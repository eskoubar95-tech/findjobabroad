import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileMenu } from './MobileMenu'

const NAV_LINKS = [
  { href: '/jobs', key: 'jobs' },
  { href: '/countries', key: 'countries' },
  { href: '/cities', key: 'cities' },
  { href: '/blog', key: 'blog' },
] as const

export async function Nav() {
  const locale = await getLocale()
  const t = await getTranslations('nav')

  return (
    <header className="relative sticky top-0 z-50 bg-white border-b flex items-center justify-between px-4 py-3">
      <Link href={`/${locale}`} className="font-semibold">
        FindJobAbroad
      </Link>
      <nav className="hidden md:flex items-center gap-6">
        {NAV_LINKS.map(({ href, key }) => (
          <Link key={key} href={`/${locale}${href}`}>
            {t(key)}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <MobileMenu links={NAV_LINKS} />
        <LanguageSwitcher />
      </div>
    </header>
  )
}
