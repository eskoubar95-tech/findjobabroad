import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const t = await getTranslations('nav')
  return (
    <main>
      <h1>{t('jobs')} / {t('guides')} / {t('blog')}</h1>
    </main>
  )
}
