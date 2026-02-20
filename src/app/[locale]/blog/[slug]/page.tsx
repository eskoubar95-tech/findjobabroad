import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { articleJsonLd } from '@/lib/jsonld'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
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
    depth: 0,
    limit: 1,
  })
  const post = result.docs[0]
  if (!post) return {}
  return {
    title: post.seo?.title ?? `${post.title} | findjobabroad.com`,
    description: post.seo?.description ?? post.excerpt ?? undefined,
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: {
        en: `/en/blog/${slug}`,
        da: `/da/blog/${slug}`,
        'x-default': `/en/blog/${slug}`,
      },
    },
  }
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://findjobabroad.com'
  const jsonLd = articleJsonLd({
    title: post.title,
    description: post.seo?.description ?? post.excerpt ?? undefined,
    publishedAt: post.publishedAt ?? undefined,
    url: `${baseUrl}/${locale}/blog/${slug}`,
  })

  return (
    <article className="px-4 py-8 max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
