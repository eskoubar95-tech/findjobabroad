/**
 * JSON-LD schema builders. Return plain objects; callers use JSON.stringify for script tags.
 */

export type JobPostingInput = {
  title: string
  company: string | null
  description: string
  jobType: string | null
  salary: string | null
  postedAt: string | null
  expiresAt: string | null
  countryName: string
  cityName: string
  slug: string
}

/**
 * Map jobType (e.g. "full-time") to schema.org employmentType (e.g. "FULL_TIME").
 */
function toEmploymentType(jobType: string | null): string | undefined {
  if (!jobType) return undefined
  const normalized = jobType.toLowerCase().replace(/-/g, '_').toUpperCase()
  if (['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY', 'VOLUNTEER', 'INTERN', 'OTHER'].includes(normalized)) {
    return normalized
  }
  if (normalized === 'SEASONAL') return 'OTHER'
  return undefined
}

export function jobPostingJsonLd(
  job: JobPostingInput,
  baseUrl: string,
  locale: string = 'en'
): Record<string, unknown> {
  const base = baseUrl.replace(/\/$/, '')
  const url = `${base}/${locale}/jobs/${job.slug}`
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    identifier: { '@type': 'PropertyValue', value: job.slug },
    datePosted: job.postedAt ?? undefined,
    validThrough: job.expiresAt ?? undefined,
    employmentType: toEmploymentType(job.jobType),
    hiringOrganization:
      job.company != null && job.company !== ''
        ? { '@type': 'Organization', name: job.company }
        : undefined,
    jobLocation:
      job.countryName || job.cityName
        ? {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: job.cityName || undefined,
              addressCountry: job.countryName || undefined,
            },
          }
        : undefined,
    url,
  }
  return Object.fromEntries(Object.entries(schema).filter(([, v]) => v !== undefined))
}

export type ArticleInput = {
  title: string
  description?: string | null
  publishedAt?: string | null
  url: string
}

export function articleJsonLd(article: ArticleInput): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description ?? undefined,
    datePublished: article.publishedAt ?? undefined,
    url: article.url,
  }
  return Object.fromEntries(Object.entries(schema).filter(([, v]) => v !== undefined))
}

export function websiteJsonLd(baseUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'findjobabroad.com',
    url: baseUrl.replace(/\/$/, ''),
  }
}
