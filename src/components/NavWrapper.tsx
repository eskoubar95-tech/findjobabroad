'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type Props = {
  locale: string
  children: ReactNode
}

export function NavWrapper({ locale, children }: Props) {
  const pathname = usePathname()
  const isHero = pathname === `/${locale}` || pathname === `/${locale}/`
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    handler()
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300 flex items-center justify-between px-4 py-3',
        isHero && !scrolled ? 'bg-transparent' : 'bg-white border-b border-sand-200'
      )}
    >
      {children}
    </header>
  )
}
