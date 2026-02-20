import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const t = await getTranslations('blog')
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'blog_posts',
    locale: locale as 'en' | 'da',
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
      ],
    },
    depth: 1,
    limit: 1,
  })

  const post = result.docs[0]
  if (!post || !post.title) notFound()

  return (
    <article className="px-4 py-8 max-w-3xl mx-auto">
      <Link
        href={`/${locale}/blog`}
        className="inline-block text-blue-600 hover:underline mb-6"
      >
        ← {t('title')}
      </Link>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <p className="text-gray-500 mt-2">{formatDate(post.publishedAt)}</p>
      </header>
      {post.content && (
        <div className="prose prose-gray max-w-none">
          <RichText data={post.content} />
        </div>
      )}
    </article>
  )
}
