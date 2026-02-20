import type { JobFeedAdapter, NormalizedJob } from './types.js'

export class MockJobFeedAdapter implements JobFeedAdapter {
  async fetchJobs(): Promise<NormalizedJob[]> {
    return [
      {
        title: 'Software Engineer',
        company: 'Tech Corp',
        jobType: 'full-time',
        requiredLanguages: ['en'],
        countrySlug: 'denmark',
        citySlug: 'copenhagen',
        affiliateId: 'mock-1',
        affiliateSource: 'mock',
        affiliateUrl: 'https://example.com/job/1',
        category: 'IT & Tech',
        salary: '€50,000–70,000',
        postedAt: new Date().toISOString(),
      },
      {
        title: 'Seasonal Farm Worker',
        company: 'Green Farms',
        jobType: 'seasonal',
        requiredLanguages: ['en', 'da'],
        countrySlug: 'denmark',
        citySlug: 'aarhus',
        affiliateId: 'mock-2',
        affiliateSource: 'mock',
        affiliateUrl: 'https://example.com/job/2',
      },
      {
        title: 'Marketing Manager',
        company: 'Nordic Agency',
        jobType: 'full-time',
        requiredLanguages: ['en', 'sv'],
        countrySlug: 'sweden',
        citySlug: 'stockholm',
        affiliateId: 'mock-3',
        affiliateSource: 'mock',
        affiliateUrl: 'https://example.com/job/3',
        category: 'Marketing',
      },
      {
        title: 'Part-time Barista',
        company: 'Coffee House',
        jobType: 'part-time',
        requiredLanguages: ['da'],
        countrySlug: 'denmark',
        citySlug: 'copenhagen',
        affiliateId: 'mock-4',
        affiliateSource: 'mock',
        affiliateUrl: 'https://example.com/job/4',
      },
      {
        title: 'Full-stack Developer',
        company: 'Startup AB',
        jobType: 'full-time',
        requiredLanguages: ['en'],
        countrySlug: 'sweden',
        citySlug: 'gothenburg',
        affiliateId: 'mock-5',
        affiliateSource: 'mock',
        affiliateUrl: 'https://example.com/job/5',
        category: 'IT & Tech',
      },
    ]
  }
}
