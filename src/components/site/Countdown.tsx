'use client'

import clsx from 'clsx'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useSyncExternalStore } from 'react'

import { plural } from '@/lib/format'

type Props = {
  startsAt: string
  endsAt?: string | null
  size?: 'lg' | 'md'
  onDark?: boolean
  className?: string
}

const UNITS = [
  { key: 'd', forms: ['день', 'дня', 'дней'] as [string, string, string] },
  { key: 'h', forms: ['час', 'часа', 'часов'] as [string, string, string] },
  { key: 'm', forms: ['минута', 'минуты', 'минут'] as [string, string, string] },
  { key: 's', forms: ['секунда', 'секунды', 'секунд'] as [string, string, string] },
] as const

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 }
}

function Digit({ value, reduce }: { value: string; reduce: boolean | null }) {
  return (
    <span className="relative inline-flex overflow-hidden" style={{ height: '1em' }}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={reduce ? false : { y: '-0.6em', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? undefined : { y: '0.6em', opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
          className="inline-block leading-none tabular-nums"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

const subscribeClock = (onTick: () => void) => {
  const timer = setInterval(onTick, 1000)
  return () => clearInterval(timer)
}
/** Время с точностью до секунды: в пределах секунды значение стабильно, как требует useSyncExternalStore. */
const readClock = () => Math.floor(Date.now() / 1000) * 1000

/**
 * Обратный отсчёт до начала мероприятия. Компонент рендерится только для утверждённых дат;
 * после начала показывает, что мероприятие идёт, а после окончания — что оно завершено.
 */
export function Countdown({ startsAt, endsAt, size = 'lg', onDark = false, className }: Props) {
  const reduce = useReducedMotion()
  const start = new Date(startsAt).getTime()
  const end = endsAt ? new Date(endsAt).getTime() : start + 3 * 60 * 60 * 1000
  // На сервере и при гидратации времени нет (null), в браузере часы тикают раз в секунду.
  const now = useSyncExternalStore(subscribeClock, readClock, () => null)

  const tone = onDark ? 'text-white' : 'text-ink'
  const sub = onDark ? 'text-white/55' : 'text-subtle'

  if (now !== null && now >= start) {
    return (
      <div className={clsx('flex items-center gap-3', className)} role="status">
        <span className={clsx('relative flex size-2.5', now < end ? '' : 'hidden')}>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-tone-soon opacity-60 motion-reduce:hidden" />
          <span className="relative inline-flex size-2.5 rounded-full bg-tone-soon" />
        </span>
        <span className={clsx('font-serif', size === 'lg' ? 'text-[40px] md:text-[56px]' : 'text-[28px]', tone)}>
          {now < end ? 'Мероприятие уже идёт' : 'Мероприятие завершено'}
        </span>
      </div>
    )
  }

  const parts = now === null ? null : split(start - now)
  const minutesLeft = parts ? parts.d * 1440 + parts.h * 60 + parts.m : 0

  return (
    <div className={className}>
      <div
        role="timer"
        aria-live="off"
        aria-label={parts ? `До начала ${parts.d} ${plural(parts.d, UNITS[0].forms)}, ${parts.h} ${plural(parts.h, UNITS[1].forms)}, ${parts.m} ${plural(parts.m, UNITS[2].forms)}` : 'Загружается обратный отсчёт'}
        className={clsx('flex items-start', size === 'lg' ? 'gap-3 sm:gap-5 md:gap-8' : 'gap-3 md:gap-5')}
      >
        {UNITS.map((u, i) => {
          const raw = parts ? parts[u.key] : null
          const value = raw === null ? '––' : u.key === 'd' ? String(raw) : String(raw).padStart(2, '0')
          return (
            <div key={u.key} className="flex items-start">
              {i > 0 ? (
                <span aria-hidden="true" className={clsx('font-serif leading-none', sub, size === 'lg' ? 'mr-3 text-[56px] sm:mr-5 md:mr-8 md:text-[112px]' : 'mr-3 text-[38px] md:mr-5 md:text-[52px]')}>
                  :
                </span>
              ) : null}
              <div className="flex flex-col">
                <span className={clsx('flex font-serif leading-none', tone, size === 'lg' ? 'text-[60px] sm:text-[80px] md:text-[124px]' : 'text-[40px] md:text-[56px]')}>
                  {value.split('').map((ch, idx) => (
                    <Digit key={`${u.key}-${idx}`} value={ch} reduce={reduce} />
                  ))}
                </span>
                <span className={clsx('label-wide-sm mt-3', sub)}>{raw === null ? ' ' : plural(raw, u.forms)}</span>
              </div>
            </div>
          )
        })}
      </div>
      <span className="sr-only" aria-live="polite">
        {parts && minutesLeft % 60 === 0 ? `До начала осталось ${parts.d} ${plural(parts.d, UNITS[0].forms)}` : ''}
      </span>
    </div>
  )
}
