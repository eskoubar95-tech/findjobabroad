import type { Job } from '@/payload-types'

export function isVisibleInLocale(job: Job, locale: string): boolean {
  const langs = job.requiredLanguages ?? []
  const codes = langs
    .map((l) => (l as { language?: string | null }).language)
    .filter(Boolean) as string[]
  if (codes.length === 0) return false
  if (locale === 'da') {
    if (codes.includes('da')) return true
    if (codes.every((c) => c === 'en')) return true
    return false
  }
  return codes.includes('en')
}
