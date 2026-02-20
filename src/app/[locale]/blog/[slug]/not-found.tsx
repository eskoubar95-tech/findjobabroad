'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function BlogNotFound() {
  const params = useParams()
  const slug = params?.slug as string | undefined
  const locale = params?.locale as string | undefined
  const t = useTranslations('blog')

  return (
    <div className="px-4 py-12 max-w-xl mx-auto text-center">
      <p className="text-lg mb-4">{t('notAvailable')}</p>
      {slug && (
        <Link href={`/en/blog/${slug}`} className="text-blue-600 hover:underline">
          {t('readInEnglish')}
        </Link>
      )}
    </div>
  )
}
