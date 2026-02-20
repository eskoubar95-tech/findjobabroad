import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const resolvedLocale = await requestLocale
  const requestedLocale = resolvedLocale || routing.defaultLocale

  return {
    locale: requestedLocale,
    messages: (await import(`../../messages/${requestedLocale}.json`)).default,
  }
})
