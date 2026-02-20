import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
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
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex h-[320px] items-end bg-gradient-to-br from-primary-600 to-navy-900 px-4 py-10 md:px-12">
        <div className="max-w-3xl">
          <a
            href={`/${locale}/blog`}
            className="mb-4 inline-block text-xs text-white/60 hover:text-white/90"
          >
            ← {t('title')}
          </a>
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-white/60">
            {formatDate(post.publishedAt)}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 md:px-12">
        {post.content && (
          <div className="prose prose-gray max-w-none text-[15px] leading-relaxed">
            <RichText data={post.content} />
          </div>
        )}
      </div>
    </article>
  )
}
