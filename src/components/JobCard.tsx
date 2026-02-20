import type { Job } from '@/payload-types'

const GRADIENTS = [
  'linear-gradient(160deg, #E8622A, #8B2A00)',
  'linear-gradient(160deg, #4A90D9, #1A3A6B)',
  'linear-gradient(160deg, #5BA85A, #1A4A1A)',
  'linear-gradient(160deg, #C4A882, #6B4A28)',
] as const

function gradientForJob(job: Job): string {
  return GRADIENTS[job.id % 4] ?? GRADIENTS[0]
}

function getCountryName(job: Job): string {
  const c = job.country
  return typeof c === 'object' && c !== null && 'name' in c ? (c as { name: string }).name : ''
}

function getCountryFlag(job: Job): string | undefined {
  const c = job.country
  return typeof c === 'object' && c !== null && 'flag' in c ? (c as { flag?: string }).flag : undefined
}

function getCityName(job: Job): string {
  const city = job.city
  return typeof city === 'object' && city !== null && 'name' in city ? (city as { name: string }).name : ''
}

function getLanguageCodes(job: Job): string[] {
  const langs = job.requiredLanguages ?? []
  return langs
    .map((l) => (l as { language?: string | null }).language)
    .filter((code): code is string => Boolean(code))
}

type JobCardProps = {
  job: Job
  locale: string
}

export function JobCard({ job, locale }: JobCardProps) {
  const countryName = getCountryName(job)
  const countryFlag = getCountryFlag(job)
  const cityName = getCityName(job)
  const locationLabel = cityName || countryName
  const languages = getLanguageCodes(job)

  return (
    <a
      href={`/${locale}/jobs/${job.slug}`}
      className="block overflow-hidden rounded-[20px] border border-sand-200 bg-white transition-all duration-200 hover:scale-[1.01] hover:shadow-lg cursor-pointer card-radius"
    >
      <div
        className="relative flex h-[150px] items-end p-3"
        style={{ background: gradientForJob(job) }}
      >
        <span className="pill px-3 py-1 text-xs font-semibold text-white bg-white/20">
          {countryFlag ? `${countryFlag} ` : ''}
          {locationLabel || '—'}
        </span>
      </div>
      <div className="p-4">
        <h2 className="font-heading mb-1 line-clamp-2 text-[15px] font-bold leading-snug text-navy-900">
          {job.title}
        </h2>
        <p className="mb-3 text-xs text-gray-500">
          {job.company ?? ''} · {locationLabel || '—'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {job.jobType && (
            <span className="pill bg-sand-100 px-2.5 py-1 text-xs text-[#4A3728]">
              {job.jobType}
            </span>
          )}
          {languages.map((lang) => (
            <span
              key={lang}
              className="pill bg-primary-100 px-2.5 py-1 text-xs text-primary-600"
            >
              {lang.toUpperCase()}
            </span>
          ))}
          {job.salary && (
            <span className="pill bg-green-50 px-2.5 py-1 text-xs text-green-700">
              {job.salary}
            </span>
          )}
        </div>
      </div>
    </a>
  )
}
