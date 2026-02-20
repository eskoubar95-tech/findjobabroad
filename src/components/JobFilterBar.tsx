'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState, useCallback } from 'react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const JOB_TYPES = ['full-time', 'part-time', 'seasonal'] as const
const LANGUAGE_OPTIONS = ['en', 'da', 'de', 'sv', 'nl', 'no'] as const

export interface JobFilterBarProps {
  locale: string
  countries: { slug: string; name: string }[]
  categories: string[]
  currentCountry: string
  currentCategory: string
  currentType: string
  currentLanguages: string[]
  totalCount: number
}

function buildSearchParams(params: {
  country: string
  category: string
  type: string
  languages: string[]
  locale: string
}): URLSearchParams {
  const u = new URLSearchParams()
  if (params.country) u.set('country', params.country)
  if (params.category) u.set('category', params.category)
  if (params.type) u.set('type', params.type)
  if (params.locale === 'en' && params.languages.length > 0) {
    params.languages.forEach((l) => u.append('languages', l))
  }
  return u
}

function buildJobsUrl(
  locale: string,
  params: { country: string; category: string; type: string; languages: string[] }
): string {
  const q = buildSearchParams({ ...params, locale })
  const query = q.toString()
  return `/${locale}/jobs${query ? `?${query}` : ''}`
}

export function JobFilterBar({
  locale,
  countries,
  categories,
  currentCountry,
  currentCategory,
  currentType,
  currentLanguages,
  totalCount,
}: JobFilterBarProps) {
  const router = useRouter()
  const t = useTranslations('jobs')
  const [sheetOpen, setSheetOpen] = useState(false)

  const [sheetCountry, setSheetCountry] = useState(currentCountry)
  const [sheetCategory, setSheetCategory] = useState(currentCategory)
  const [sheetType, setSheetType] = useState(currentType)
  const [sheetLanguages, setSheetLanguages] = useState<string[]>(currentLanguages)

  const navigate = useCallback(
    (params: { country?: string; category?: string; type?: string; languages?: string[] }) => {
      const url = buildJobsUrl(locale, {
        country: params.country ?? currentCountry,
        category: params.category ?? currentCategory,
        type: params.type ?? currentType,
        languages: params.languages ?? currentLanguages,
      })
      router.push(url)
    },
    [locale, currentCountry, currentCategory, currentType, currentLanguages, router]
  )

  const syncSheetFromProps = useCallback(() => {
    setSheetCountry(currentCountry)
    setSheetCategory(currentCategory)
    setSheetType(currentType)
    setSheetLanguages([...currentLanguages])
  }, [currentCountry, currentCategory, currentType, currentLanguages])

  const handleOpenSheet = useCallback(() => {
    syncSheetFromProps()
    setSheetOpen(true)
  }, [syncSheetFromProps])

  const handleApplySheet = useCallback(() => {
    navigate({
      country: sheetCountry,
      category: sheetCategory,
      type: sheetType,
      languages: sheetLanguages,
    })
    setSheetOpen(false)
  }, [navigate, sheetCountry, sheetCategory, sheetType, sheetLanguages])

  const handleClearSheet = useCallback(() => {
    setSheetCountry('')
    setSheetCategory('')
    setSheetType('')
    setSheetLanguages(locale === 'en' ? ['en'] : [])
  }, [locale])

  const handleClearAll = useCallback(() => {
    handleClearSheet()
    navigate({
      country: '',
      category: '',
      type: '',
      languages: locale === 'en' ? ['en'] : [],
    })
    setSheetOpen(false)
  }, [locale, navigate, handleClearSheet])

  const selectedCountryName =
    currentCountry && countries.find((c) => c.slug === currentCountry)?.name

  const pillBase =
    'pill shrink-0 px-4 py-2 text-sm font-semibold border transition-colors cursor-pointer'
  const pillActive = 'bg-navy-900 text-white border-navy-900'
  const pillHasValue = 'bg-primary-100 text-primary-600 border-primary-600'
  const pillDefault = 'border-sand-200 bg-white text-navy-900 hover:bg-sand-50'

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center gap-2 overflow-x-auto border-b border-sand-200 bg-white px-4 py-3 scrollbar-hide md:px-12">
        {/* Country pill */}
        <button
          type="button"
          onClick={() => navigate({ country: '' })}
          className={`${pillBase} ${currentCountry ? pillHasValue : pillDefault}`}
        >
          {selectedCountryName ?? t('filters.allCountries')}
        </button>

        <div className="w-px h-6 shrink-0 bg-sand-200" />

        {/* Category pill */}
        <button
          type="button"
          onClick={() => navigate({ category: '' })}
          className={`${pillBase} ${currentCategory ? pillHasValue : pillDefault}`}
        >
          {currentCategory || t('filters.allCategories')}
        </button>

        <div className="w-px h-6 shrink-0 bg-sand-200" />

        {/* Type pills */}
        {JOB_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => navigate({ type: currentType === type ? '' : type })}
            className={`${pillBase} ${currentType === type ? pillActive : pillDefault}`}
          >
            {type === 'full-time' ? 'Full-time' : type === 'part-time' ? 'Part-time' : 'Seasonal'}
          </button>
        ))}

        {locale === 'en' && (
          <>
            <div className="w-px h-6 shrink-0 bg-sand-200" />
            {LANGUAGE_OPTIONS.map((lang) => {
              const isActive = currentLanguages.includes(lang)
              const nextLangs = isActive
                ? currentLanguages.filter((l) => l !== lang)
                : [...currentLanguages, lang]
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => navigate({ languages: nextLangs.length ? nextLangs : ['en'] })}
                  className={`${pillBase} ${isActive ? pillHasValue : pillDefault}`}
                >
                  {lang.toUpperCase()}
                </button>
              )
            })}
          </>
        )}

        <div className="w-px h-6 shrink-0 bg-sand-200" />

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              onClick={handleOpenSheet}
              className={`${pillBase} ml-auto border-navy-900 text-navy-900 hover:bg-sand-50`}
            >
              ≡ More filters
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-3xl p-7 md:p-8"
            showCloseButton
          >
            <SheetHeader>
              <SheetTitle className="font-heading text-xl font-extrabold">
                More Filters
              </SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <label htmlFor="sheet-category" className="mb-1 block text-sm font-medium text-navy-900">
                  {t('filters.category')}
                </label>
                <select
                  id="sheet-category"
                  value={sheetCategory}
                  onChange={(e) => setSheetCategory(e.target.value)}
                  className="w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-navy-900"
                >
                  <option value="">{t('filters.allCategories')}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sheet-type" className="mb-1 block text-sm font-medium text-navy-900">
                  {t('filters.type')}
                </label>
                <select
                  id="sheet-type"
                  value={sheetType}
                  onChange={(e) => setSheetType(e.target.value)}
                  className="w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-navy-900"
                >
                  <option value="">{t('filters.allTypes')}</option>
                  {JOB_TYPES.map((ty) => (
                    <option key={ty} value={ty}>
                      {ty === 'full-time' ? 'Full-time' : ty === 'part-time' ? 'Part-time' : 'Seasonal'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {locale === 'en' && (
              <div className="py-2">
                <p className="mb-2 text-sm font-medium text-navy-900">{t('filters.languages')}</p>
                <div className="flex flex-wrap gap-2">
                  {[...LANGUAGE_OPTIONS, 'fi'].map((lang) => {
                    const isOn = sheetLanguages.includes(lang)
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          if (isOn) {
                            setSheetLanguages((prev) => {
                              const next = prev.filter((l) => l !== lang)
                              return next.length ? next : ['en']
                            })
                          } else {
                            setSheetLanguages((prev) => [...prev, lang])
                          }
                        }}
                        className={`pill px-3 py-1.5 text-sm font-medium ${
                          isOn
                            ? 'bg-primary-100 text-primary-600 border border-primary-600'
                            : 'border border-sand-200 bg-white text-navy-900 hover:bg-sand-50'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            <SheetFooter className="flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="pill"
                onClick={handleClearAll}
              >
                Clear all
              </Button>
              <Button
                type="button"
                className="pill bg-primary-600 text-white hover:bg-primary-500"
                onClick={handleApplySheet}
              >
                Show {totalCount} jobs
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
