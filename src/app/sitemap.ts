import { getPayload } from 'payload'
import config from '@payload-config'
import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://findjobabroad.com'
const LOCALES = ['en', 'da'] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      changeFrequency: 'daily',
      priority: 1,
    })
    entries.push({
      url: `${BASE_URL}/${locale}/jobs`,
      changeFrequency: 'hourly',
      priority: 0.9,
    })
    entries.push({
      url: `${BASE_URL}/${locale}/countries`,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
    entries.push({
      url: `${BASE_URL}/${locale}/blog`,
      changeFrequency: 'daily',
      priority: 0.7,
    })
  }

  const jobsResult = await payload.find({
    collection: 'jobs',
    where: {
      and: [
        { status: { equals: 'active' } },
        { _status: { equals: 'published' } },
      ],
    },
    limit: 10000,
    depth: 0,
  })
  for (const job of jobsResult.docs) {
    const slug = (job as { slug?: string }).slug
    const updatedAt = (job as { updatedAt?: string }).updatedAt
    if (!slug) continue
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/jobs/${slug}`,
        changeFrequency: 'weekly',
        priority: 0.7,
        lastModified: updatedAt,
      })
    }
  }

  const countriesResult = await payload.find({
    collection: 'countries',
    where: { _status: { equals: 'published' } },
    limit: 1000,
    depth: 0,
  })
  for (const country of countriesResult.docs) {
    const slug = (country as { slug?: string }).slug
    const updatedAt = (country as { updatedAt?: string }).updatedAt
    if (!slug) continue
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/countries/${slug}`,
        changeFrequency: 'weekly',
        priority: 0.7,
        lastModified: updatedAt,
      })
    }
  }

  const citiesResult = await payload.find({
    collection: 'cities',
    where: { _status: { equals: 'published' } },
    limit: 1000,
    depth: 1,
  })
  for (const city of citiesResult.docs) {
    const citySlug = (city as { slug?: string }).slug
    const updatedAt = (city as { updatedAt?: string }).updatedAt
    const country = (city as { country?: { slug?: string } }).country
    const countrySlug = typeof country === 'object' && country != null ? country.slug : undefined
    if (!citySlug || !countrySlug) continue
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/countries/${countrySlug}/cities/${citySlug}`,
        changeFrequency: 'weekly',
        priority: 0.7,
        lastModified: updatedAt,
      })
    }
  }

  const blogResult = await payload.find({
    collection: 'blog_posts',
    where: { _status: { equals: 'published' } },
    limit: 1000,
    depth: 0,
  })
  for (const post of blogResult.docs) {
    const slug = (post as { slug?: string }).slug
    const updatedAt = (post as { updatedAt?: string }).updatedAt
    if (!slug) continue
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${slug}`,
        changeFrequency: 'monthly',
        priority: 0.6,
        lastModified: updatedAt,
      })
    }
  }

  return entries
}
