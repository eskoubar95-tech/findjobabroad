import { getPayload } from 'payload'
import config from '@payload-config'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import type { BlogPost } from '@/payload-types'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
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

export default async function BlogListPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { page: pageParam } = await searchParams
  const page = Number(pageParam ?? 1)
  const t = await getTranslations('blog')
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'blog_posts',
    locale: locale as 'en' | 'da',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 10,
    page,
    depth: 0,
  })

  const posts = result.docs.filter(
    (p): p is BlogPost => locale === 'en' || !!p.title
  )

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.id} className="border-b border-gray-200 pb-6">
            <article>
              <h2 className="text-xl font-semibold">
                <Link href={`/${locale}/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && (
                <p className="text-gray-600 mt-2">{post.excerpt}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {formatDate(post.publishedAt)}
              </p>
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="inline-block mt-2 text-blue-600 hover:underline"
              >
                {t('readMore')}
              </Link>
            </article>
          </li>
        ))}
      </ul>
      {result.totalPages > 1 && (
        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Pagination">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <Link
                key={p}
                href={`?page=${p}`}
                className={`px-3 py-1 rounded ${
                  p === result.page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {p}
              </Link>
            )
          )}
        </nav>
      )}
    </div>
  )
}
