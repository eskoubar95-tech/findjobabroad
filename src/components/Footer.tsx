import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { LanguageSwitcher } from './LanguageSwitcher'

const NAV_LINKS = [
  { href: '/jobs', key: 'jobs' },
  { href: '/countries', key: 'countries' },
  { href: '/cities', key: 'cities' },
  { href: '/blog', key: 'blog' },
] as const

export async function Footer() {
  const locale = await getLocale()
  const t = await getTranslations('footer')
  const tNav = await getTranslations('nav')

  return (
    <footer className="bg-navy-900 text-white border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Link href={`/${locale}`} className="font-heading font-extrabold text-xl">
            <span className="text-white">findjob</span>
            <span className="text-amber-500">abroad</span>
          </Link>
          <p className="text-white/60 text-sm mt-2">{t('tagline')}</p>
        </div>
        <ul className="flex flex-col gap-3">
          {NAV_LINKS.map(({ href, key }) => (
            <li key={key}>
              <Link
                href={`/${locale}${href}`}
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                {tNav(key)}
              </Link>
            </li>
          ))}
        </ul>
        <div>
          <LanguageSwitcher variant="dark" />
          <p className="text-white/50 text-xs mt-4">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
