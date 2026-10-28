'use client'

import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { NAV_GROUPS, PRIMARY_NAV } from './nav'
import { Seal } from './Seal'
import { SiteLink } from './SiteLink'
import { Ticker } from './Ticker'

export type NavFeature = { kind: string; title: string; href: string; image?: string | null; meta?: string | null }

type Props = {
  shortName: string
  descriptor: string
  logoUrl?: string | null
  ticker: { text: string; href?: string | null }[]
  features: NavFeature[]
}

export function Header({ shortName, descriptor, logoUrl, ticker, features }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [panel, setPanel] = useState<null | 'menu' | 'search'>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const searchButton = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = useCallback((restoreFocus = false) => {
    setPanel((current) => {
      if (restoreFocus) (current === 'search' ? searchButton : menuButton).current?.focus()
      return null
    })
  }, [])

  // Переход на другую страницу закрывает меню и поиск.
  const [panelPath, setPanelPath] = useState(pathname)
  if (panelPath !== pathname) {
    setPanelPath(pathname)
    setPanel(null)
  }

  useEffect(() => {
    if (!panel) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true)
    }
    document.addEventListener('keydown', onKey)
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    const t = setTimeout(() => {
      if (panel === 'search') searchInput.current?.focus()
      else panelRef.current?.querySelector<HTMLElement>('a')?.focus()
    }, 60)
    return () => {
      document.removeEventListener('keydown', onKey)
      html.style.overflow = prev
      clearTimeout(t)
    }
  }, [panel, close])

  const compact = scrolled && !panel
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      <a href="#content" className="label-wide-sm sr-only z-[60] bg-paper px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Перейти к содержанию
      </a>
      <header
        className={clsx(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,color,box-shadow] duration-500',
          'bg-paper/95 text-ink shadow-[0_1px_0_var(--color-rule)] backdrop-blur',
        )}
      >
        <div className={clsx('overflow-hidden transition-[max-height] duration-500', compact ? 'max-h-0' : 'max-h-[30px]')}>
          <Ticker items={ticker} />
        </div>

        <div className="container-site">
          <div className="relative grid h-[62px] grid-cols-[1fr_auto_1fr] items-center">
            <div className="flex items-center">
              <button
                ref={menuButton}
                type="button"
                aria-expanded={panel === 'menu'}
                aria-controls="site-menu"
                onClick={() => setPanel((p) => (p === 'menu' ? null : 'menu'))}
                className="label-wide-sm -ml-2 flex items-center gap-3 px-2 py-3"
              >
                <span aria-hidden="true" className="relative block h-3 w-5">
                  <span className={clsx('absolute left-0 block h-[1.5px] w-5 bg-current transition-transform duration-300', panel === 'menu' ? 'top-[5px] rotate-45' : 'top-0.5')} />
                  <span className={clsx('absolute left-0 block h-[1.5px] w-5 bg-current transition-transform duration-300', panel === 'menu' ? 'top-[5px] -rotate-45' : 'top-[9px]')} />
                </span>
                <span className="hidden sm:inline">{panel === 'menu' ? 'Закрыть' : 'Меню'}</span>
                <span className="sr-only sm:hidden">{panel === 'menu' ? 'Закрыть меню' : 'Меню'}</span>
              </button>
            </div>

            <SiteLink href="/" className="flex items-center gap-3">
              {logoUrl ? (
                <Image src={logoUrl} alt="" width={40} height={40} className="size-9 object-contain md:size-10" />
              ) : (
                <Seal size={40} className="size-9 md:size-10" />
              )}
              <span className="flex flex-col leading-none">
                <span className="font-serif text-[23px] tracking-[0.14em] md:text-[26px]">{shortName}</span>
                <span className="label-wide-sm mt-1 hidden text-[8.5px] opacity-75 sm:block">{descriptor}</span>
                <span className="sr-only"> — на главную</span>
              </span>
            </SiteLink>

            <div className="flex items-center justify-end">
              <button
                ref={searchButton}
                type="button"
                aria-expanded={panel === 'search'}
                aria-controls="site-search"
                onClick={() => setPanel((p) => (p === 'search' ? null : 'search'))}
                className="label-wide-sm -mr-2 flex items-center gap-3 px-2 py-3"
              >
                <span className="hidden sm:inline">{panel === 'search' ? 'Закрыть' : 'Поиск'}</span>
                <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true">
                  <circle cx="7" cy="7" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M11.2 11.2 16 16" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="sr-only sm:hidden">Поиск</span>
              </button>
            </div>
          </div>

          <div className={clsx('hidden overflow-hidden transition-[max-height,opacity] duration-500 xl:block', compact ? 'max-h-0 opacity-0' : 'max-h-[46px] opacity-100')}>
            <div className="hairline" />
            <nav aria-label="Основные разделы">
              <ul className="flex h-[45px] items-center justify-center gap-8">
                {PRIMARY_NAV.map((item) => (
                  <li key={item.href}>
                    <SiteLink
                      href={item.href}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={clsx('label-wide-sm relative py-2 transition-opacity hover:opacity-100', isActive(item.href) ? 'opacity-100' : 'opacity-80')}
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className={clsx(
                          'absolute inset-x-0 -bottom-0.5 h-px origin-left bg-current transition-transform duration-500',
                          isActive(item.href) ? 'scale-x-100' : 'scale-x-0',
                        )}
                      />
                    </SiteLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <AnimatePresence>
          {panel === 'menu' ? (
            <motion.div
              key="menu"
              id="site-menu"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Меню сайта"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
              className="absolute inset-x-0 top-full max-h-[calc(100dvh-92px)] overflow-y-auto border-t border-rule bg-mist text-ink"
            >
              <div className="container-site grid gap-12 py-10 md:py-14 lg:grid-cols-[1.4fr_1fr]">
                <nav aria-label="Все разделы" className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                  {NAV_GROUPS.map((g, gi) => (
                    <motion.div
                      key={g.title}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 * gi + 0.05, duration: 0.35 }}
                    >
                      <p className="label-wide-sm mb-4 text-subtle">{g.title}</p>
                      <ul className="space-y-3">
                        {g.links.map((l) => (
                          <li key={l.href}>
                            <SiteLink href={l.href} onClick={() => close()} className="group inline-flex items-center gap-2 font-serif text-[24px] leading-tight">
                              <span className="link-draw">{l.label}</span>
                            </SiteLink>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </nav>
                {features.length ? (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {features.map((f) => (
                      <SiteLink key={f.href} href={f.href} onClick={() => close()} className="group block">
                        <div className="relative aspect-[4/3] overflow-hidden photo-hatch">
                          {f.image ? (
                            <Image src={f.image} alt="" fill sizes="280px" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                          ) : (
                            <div className="flex size-full items-center justify-center text-ink/25">
                              <Seal size={48} />
                            </div>
                          )}
                        </div>
                        <p className="label-wide-sm mt-3 text-subtle">{f.kind}{f.meta ? ` · ${f.meta}` : ''}</p>
                        <p className="mt-1 font-serif text-[20px] leading-snug group-hover:underline">{f.title}</p>
                      </SiteLink>
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.div>
          ) : null}

          {panel === 'search' ? (
            <motion.div
              key="search"
              id="site-search"
              role="dialog"
              aria-modal="true"
              aria-label="Поиск по сайту"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="absolute inset-x-0 top-full border-t border-rule bg-mist text-ink"
            >
              <form
                className="container-site py-10 md:py-14"
                role="search"
                onSubmit={(e) => {
                  e.preventDefault()
                  const q = new FormData(e.currentTarget).get('q')?.toString().trim()
                  if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
                }}
              >
                <label htmlFor="site-search-input" className="label-wide-sm mb-4 block text-subtle">
                  Поиск по новостям, событиям, обещаниям и отчётам
                </label>
                <div className="flex items-end gap-4 border-b border-ink/40 focus-within:border-ink">
                  <input
                    ref={searchInput}
                    id="site-search-input"
                    name="q"
                    type="search"
                    minLength={2}
                    required
                    placeholder="Например, прятки"
                    className="w-full bg-transparent pb-3 font-serif text-[34px] leading-tight outline-none placeholder:text-ink/30 md:text-[52px]"
                  />
                  <button type="submit" className="label-wide-sm mb-4 shrink-0 bg-navy-900 px-5 py-3 text-white hover:bg-navy-700">
                    Найти
                  </button>
                </div>
              </form>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
      {panel ? <button type="button" aria-label="Закрыть" tabIndex={-1} onClick={() => close()} className="fixed inset-0 z-40 cursor-default bg-navy-950/40" /> : null}
      <div aria-hidden="true" className="h-[var(--header-h)]" />
    </>
  )
}
