import { getPayload } from 'payload'
import config from '@payload-config'
import { getTranslations } from 'next-intl/server'
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
    <div>
      <div className="bg-navy-900 px-4 py-10 md:px-12">
        <h1 className="font-heading mb-2 text-4xl text-white">{t('title')}</h1>
        <p className="text-sm text-white/55">
          {locale === 'da'
            ? 'Guider, tips og indsigt til at arbejde i udlandet'
            : 'Guides, tips and insights for working abroad'}
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <a
              key={post.id}
              href={`/${locale}/blog/${post.slug}`}
              className="card-radius block overflow-hidden border border-sand-200 bg-white transition-all duration-200 hover:scale-[1.01] hover:shadow-lg"
            >
              <div
                className="h-[180px]"
                style={{
                  background: 'linear-gradient(160deg, #E8622A, #1A1A2E)',
                }}
              />
              <div className="p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">
                  Article
                </span>
                <h2 className="font-heading mt-1.5 mb-2 line-clamp-2 text-base font-bold text-navy-900">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mb-3 line-clamp-2 text-sm text-gray-500">
                    {post.excerpt}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  {formatDate(post.publishedAt)}
                </p>
              </div>
            </a>
          ))}
        </div>

        {result.totalPages > 1 && (
          <nav
            className="mt-10 flex justify-center gap-2"
            aria-label="Pagination"
          >
            {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <a
                  key={p}
                  href={`?page=${p}`}
                  className={`pill px-4 py-2 text-sm font-medium ${
                    p === result.page
                      ? 'bg-navy-900 text-white'
                      : 'border border-sand-200 bg-white text-navy-900 hover:bg-sand-50'
                  }`}
                >
                  {p}
                </a>
              )
            )}
          </nav>
        )}
      </div>
    </div>
  )
}
