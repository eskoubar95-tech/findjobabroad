/**
 * Normalized job shape from affiliate feeds. Maps directly to Jobs collection fields.
 */
export interface NormalizedJob {
  title: string
  company?: string
  jobType?: 'full-time' | 'part-time' | 'seasonal'
  requiredLanguages: string[]
  countrySlug?: string
  citySlug?: string
  affiliateId: string
  affiliateSource: string
  affiliateUrl: string
  category?: string
  salary?: string
  postedAt?: string
  expiresAt?: string
}

export interface JobFeedAdapter {
  fetchJobs(): Promise<NormalizedJob[]>
}
