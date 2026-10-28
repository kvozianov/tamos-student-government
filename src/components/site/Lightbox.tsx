'use client'

import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

export type GalleryItem = {
  id: string
  type: 'image' | 'video' | 'youtube'
  src: string
  full?: string | null
  width?: number | null
  height?: number | null
  alt: string
  caption?: string | null
  youtubeId?: string | null
}

/** Сетка альбома и полноэкранный просмотр: стрелки, Esc, свайп, подписи, видео. */
export function Lightbox({ items, title }: { items: GalleryItem[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const touchX = useRef<number | null>(null)

  const close = useCallback(() => {
    setIndex(null)
    setTimeout(() => opener.current?.focus(), 0)
  }, [])
  const go = useCallback((delta: number) => setIndex((i) => (i === null ? i : (i + delta + items.length) % items.length)), [items.length])

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    closeBtn.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      html.style.overflow = prev
    }
  }, [index, close, go])

  const current = index === null ? null : items[index]

  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
        {items.map((item, i) => (
          <li key={item.id} className="break-inside-avoid">
            <button
              type="button"
              onClick={(e) => {
                opener.current = e.currentTarget
                setIndex(i)
              }}
              className="group relative block w-full overflow-hidden bg-stone text-left"
              aria-label={`Открыть ${item.type === 'image' ? 'фото' : 'видео'} ${i + 1} из ${items.length}${item.caption ? `: ${item.caption}` : ''}`}
            >
              {item.type === 'image' && item.width && item.height ? (
                <Image src={item.src} alt={item.alt} width={item.width} height={item.height} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="h-auto w-full transition-transform duration-[1200ms] group-hover:scale-[1.03]" />
              ) : item.type === 'youtube' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.src} alt={item.alt} loading="lazy" className="aspect-video w-full object-cover" />
              ) : (
                <video src={item.src} muted playsInline preload="metadata" className="aspect-video w-full object-cover" aria-hidden="true" />
              )}
              {item.type !== 'image' ? (
                <span className="absolute inset-0 flex items-center justify-center bg-navy-950/25">
                  <span className="flex size-16 items-center justify-center rounded-full border border-white/80 bg-navy-950/40 text-white backdrop-blur-sm">
                    <svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true">
                      <path d="M2 1.5v17L17 10z" fill="currentColor" />
                    </svg>
                  </span>
                </span>
              ) : null}
              {item.caption ? (
                <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-navy-950/80 to-transparent px-4 pt-8 pb-3 text-[14px] text-white transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0">
                  {item.caption}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {current && index !== null ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${title}: ${index + 1} из ${items.length}`}
            className="fixed inset-0 z-[70] flex flex-col bg-navy-950/97 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
            onTouchEnd={(e) => {
              const start = touchX.current
              const end = e.changedTouches[0]?.clientX
              if (start != null && end != null && Math.abs(end - start) > 50) go(end < start ? 1 : -1)
              touchX.current = null
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 md:px-8">
              <p className="label-wide-sm text-white/70">
                {title} · {index + 1} / {items.length}
              </p>
              <button ref={closeBtn} type="button" onClick={close} className="label-wide-sm flex items-center gap-3 px-2 py-2 hover:text-white/80">
                Закрыть
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.id}
                  className="relative flex size-full items-center justify-center"
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.25 }}
                >
                  {current.type === 'image' ? (
                    <Image src={current.full ?? current.src} alt={current.alt} fill sizes="100vw" className="object-contain" />
                  ) : current.type === 'youtube' && current.youtubeId ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?autoplay=1&rel=0`}
                      title={current.caption ?? 'Видео'}
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      className="aspect-video w-full max-w-5xl border-0"
                    />
                  ) : (
                    <video src={current.src} controls autoPlay playsInline className="max-h-full max-w-full" />
                  )}
                </motion.div>
              </AnimatePresence>
              {items.length > 1 ? (
                <>
                  <button type="button" onClick={() => go(-1)} aria-label="Предыдущее" className="absolute left-2 top-1/2 hidden -translate-y-1/2 p-4 text-white/70 hover:text-white md:block">
                    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
                      <path d="M18 4 8 14l10 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label="Следующее" className="absolute right-2 top-1/2 hidden -translate-y-1/2 p-4 text-white/70 hover:text-white md:block">
                    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
                      <path d="m10 4 10 10-10 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </button>
                </>
              ) : null}
            </div>
            <div className={clsx('min-h-[64px] px-5 py-5 text-center text-[15px] text-white/80 md:px-8')}>{current.caption ?? ''}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
