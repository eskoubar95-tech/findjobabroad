/**
 * Seed Payload CMS with mock data: Countries, Cities, Jobs, BlogPosts.
 * Run: npm run seed
 * Loads .env from project root. Requires DATABASE_URL and PAYLOAD_SECRET.
 */
import dotenv from 'dotenv'
import path from 'path'

const root = process.cwd()
dotenv.config({ path: path.join(root, '.env') })
dotenv.config({ path: path.join(root, '.env.local'), override: true })

import { getPayload } from 'payload'
import config from '../payload.config.js'
import { lexicalParagraph } from './lexical.js'

const createOpts = { overrideAccess: true as const }

async function findOrCreate<T extends { id: number }>(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: 'countries' | 'cities' | 'jobs' | 'blog_posts',
  slug: string,
  data: Record<string, unknown>,
): Promise<T> {
  const existing = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    ...createOpts,
  })
  if (existing.docs[0]) return existing.docs[0] as unknown as T
  return payload.create({ collection, data: data as never, ...createOpts }) as Promise<unknown> as Promise<T>
}

async function seed() {
  const payload = await getPayload({ config })

  console.log('Seeding countries...')
  const countryPortugal = await findOrCreate<{ id: number }>(payload, 'countries', 'portugal', {
    _status: 'published',
    slug: 'portugal',
      flag: '🇵🇹',
      avgMonthlySalary: '€1,400',
      costOfLiving: 'medium',
      visaType: 'D7 / Tech Visa',
      topIndustries: 'Tech, Tourism, Finance',
      name: 'Portugal',
      content: lexicalParagraph(
        'Portugal offers a mild climate, affordable living, and a growing tech scene. Popular with digital nomads and remote workers.',
      ),
    seo: { title: 'Work in Portugal', description: 'Jobs and relocation guide for Portugal.' },
  })
  const countrySpain = await findOrCreate<{ id: number }>(payload, 'countries', 'spain', {
    _status: 'published',
    slug: 'spain',
      flag: '🇪🇸',
      avgMonthlySalary: '€1,800',
      costOfLiving: 'medium-high',
      visaType: 'Digital Nomad Visa',
      topIndustries: 'Tech, Tourism, Agriculture',
      name: 'Spain',
      content: lexicalParagraph(
        'Spain combines great weather, culture, and a strong job market in major cities like Barcelona and Madrid.',
      ),
    seo: { title: 'Work in Spain', description: 'Jobs and relocation guide for Spain.' },
  })
  const countryGermany = await findOrCreate<{ id: number }>(payload, 'countries', 'germany', {
    _status: 'published',
    slug: 'germany',
      flag: '🇩🇪',
      avgMonthlySalary: '€3,200',
      costOfLiving: 'high',
      visaType: 'EU Blue Card / Job Seeker',
      topIndustries: 'Engineering, IT, Automotive',
      name: 'Germany',
      content: lexicalParagraph(
        'Germany has a strong economy and demand for skilled workers. Berlin, Munich, and Hamburg are key hubs.',
      ),
    seo: { title: 'Work in Germany', description: 'Jobs and relocation guide for Germany.' },
  })

  console.log('Seeding cities...')
  const cityLisbon = await findOrCreate<{ id: number }>(payload, 'cities', 'lisbon', {
    _status: 'published',
    slug: 'lisbon',
      country: countryPortugal.id,
      avgMonthlySalary: '€1,500',
      costOfLiving: 'medium',
      name: 'Lisbon',
      content: lexicalParagraph('Lisbon is a vibrant capital with a growing startup and tech scene.'),
    seo: { title: 'Jobs in Lisbon', description: 'Find jobs and live in Lisbon.' },
  })
  const cityPorto = await findOrCreate<{ id: number }>(payload, 'cities', 'porto', {
    _status: 'published',
    slug: 'porto',
      country: countryPortugal.id,
      avgMonthlySalary: '€1,300',
      costOfLiving: 'low-medium',
      name: 'Porto',
      content: lexicalParagraph('Porto offers lower costs than Lisbon with a strong cultural and tech presence.'),
    seo: { title: 'Jobs in Porto', description: 'Find jobs and live in Porto.' },
  })
  const cityBarcelona = await findOrCreate<{ id: number }>(payload, 'cities', 'barcelona', {
    _status: 'published',
    slug: 'barcelona',
      country: countrySpain.id,
      avgMonthlySalary: '€2,000',
      costOfLiving: 'high',
      name: 'Barcelona',
      content: lexicalParagraph('Barcelona is a major European hub for tech, design, and tourism.'),
    seo: { title: 'Jobs in Barcelona', description: 'Find jobs and live in Barcelona.' },
  })
  const cityBerlin = await findOrCreate<{ id: number }>(payload, 'cities', 'berlin', {
    _status: 'published',
    slug: 'berlin',
      country: countryGermany.id,
      avgMonthlySalary: '€3,500',
      costOfLiving: 'high',
      name: 'Berlin',
      content: lexicalParagraph('Berlin is a leading European tech and startup city with a diverse job market.'),
    seo: { title: 'Jobs in Berlin', description: 'Find jobs and live in Berlin.' },
  })

  console.log('Seeding jobs...')
  const now = new Date()
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  await findOrCreate<{ id: number }>(payload, 'jobs', 'senior-frontend-developer-lisbon', {
    _status: 'published',
    slug: 'senior-frontend-developer-lisbon',
      source: 'manual',
      status: 'active',
      company: 'TechStart Portugal',
      jobType: 'full-time',
      category: 'IT & Tech',
      country: countryPortugal.id,
      city: cityLisbon.id,
      salary: '€45,000–60,000',
      postedAt: now.toISOString().slice(0, 10),
      expiresAt: in30Days.toISOString().slice(0, 10),
      title: 'Senior Frontend Developer',
      description: lexicalParagraph(
        'We are looking for a Senior Frontend Developer to join our team in Lisbon. React/TypeScript experience required.',
      ),
    seo: { title: 'Senior Frontend Developer – Lisbon', description: 'Full-time frontend role in Lisbon.' },
  })
  await findOrCreate<{ id: number }>(payload, 'jobs', 'marketing-manager-barcelona', {
    _status: 'published',
    slug: 'marketing-manager-barcelona',
      source: 'manual',
      status: 'active',
      company: 'Growth Labs',
      jobType: 'full-time',
      category: 'Marketing',
      country: countrySpain.id,
      city: cityBarcelona.id,
      salary: '€35,000–45,000',
      postedAt: now.toISOString().slice(0, 10),
      expiresAt: in30Days.toISOString().slice(0, 10),
      title: 'Marketing Manager',
      description: lexicalParagraph(
        'Join our marketing team in Barcelona. Experience with B2B and content marketing preferred.',
      ),
    seo: { title: 'Marketing Manager – Barcelona', description: 'Full-time marketing role in Barcelona.' },
  })
  await findOrCreate<{ id: number }>(payload, 'jobs', 'backend-engineer-berlin', {
    _status: 'published',
    slug: 'backend-engineer-berlin',
      source: 'manual',
      status: 'active',
      company: 'ScaleUp GmbH',
      jobType: 'full-time',
      category: 'IT & Tech',
      country: countryGermany.id,
      city: cityBerlin.id,
      salary: '€65,000–85,000',
      postedAt: now.toISOString().slice(0, 10),
      expiresAt: in30Days.toISOString().slice(0, 10),
      title: 'Backend Engineer',
      description: lexicalParagraph(
        'Backend engineer for our Berlin office. Go or Node.js, PostgreSQL, and cloud experience required.',
      ),
    seo: { title: 'Backend Engineer – Berlin', description: 'Full-time backend role in Berlin.' },
  })
  await findOrCreate<{ id: number }>(payload, 'jobs', 'customer-support-porto', {
    _status: 'published',
    slug: 'customer-support-porto',
      source: 'manual',
      status: 'active',
      company: 'Support Pro',
      jobType: 'full-time',
      category: 'Customer Service',
      country: countryPortugal.id,
      city: cityPorto.id,
      salary: '€22,000–28,000',
      postedAt: now.toISOString().slice(0, 10),
      expiresAt: in30Days.toISOString().slice(0, 10),
      title: 'Customer Support Specialist',
      description: lexicalParagraph(
        'English and Portuguese required. Help our customers via chat and email from our Porto office.',
      ),
    seo: { title: 'Customer Support – Porto', description: 'Full-time support role in Porto.' },
  })

  console.log('Seeding blog posts...')
  await findOrCreate<{ id: number }>(payload, 'blog_posts', 'how-to-find-a-job-abroad', {
    _status: 'published',
    slug: 'how-to-find-a-job-abroad',
      publishedAt: now.toISOString(),
      title: 'How to Find a Job Abroad',
      excerpt: 'A practical guide to searching and applying for jobs in another country.',
      content: lexicalParagraph(
        'Finding a job abroad involves research, preparation, and persistence. Start by identifying countries and sectors that match your skills, then tailor your applications and consider visa requirements.',
      ),
    seo: { title: 'How to Find a Job Abroad', description: 'Guide to finding and landing jobs abroad.' },
  })
  await findOrCreate<{ id: number }>(payload, 'blog_posts', 'best-european-cities-for-remote-workers', {
    _status: 'published',
    slug: 'best-european-cities-for-remote-workers',
      publishedAt: now.toISOString(),
      title: 'Best European Cities for Remote Workers',
      excerpt: 'Top cities in Europe for digital nomads and remote workers in 2025.',
      content: lexicalParagraph(
        'Lisbon, Barcelona, Berlin, and Tallinn rank among the best European cities for remote workers, offering good infrastructure, community, and quality of life.',
      ),
    seo: {
      title: 'Best European Cities for Remote Workers',
      description: 'Top European cities for remote work and digital nomads.',
    },
  })
  await findOrCreate<{ id: number }>(payload, 'blog_posts', 'visa-options-for-working-in-europe', {
    _status: 'published',
    slug: 'visa-options-for-working-in-europe',
      publishedAt: now.toISOString(),
      title: 'Visa Options for Working in Europe',
      excerpt: 'An overview of work and digital nomad visas in the EU.',
      content: lexicalParagraph(
        'European countries offer various visa options: work visas tied to employers, digital nomad visas for remote workers, and freelancer or D7-style visas. Requirements and processing times vary by country.',
      ),
    seo: {
      title: 'Visa Options for Working in Europe',
      description: 'Work and digital nomad visa overview for Europe.',
    },
  })

  console.log('Seed complete: 3 countries, 4 cities, 4 jobs, 3 blog posts.')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
