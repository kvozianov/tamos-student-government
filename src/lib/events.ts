import type { Event } from '@/payload-types'

import type { EventStatus } from './status'

const HOUR = 60 * 60 * 1000
const SOON_WINDOW = 14 * 24 * HOUR
const DEFAULT_DURATION = 3 * HOUR

type EventTiming = Pick<Event, 'status' | 'dateConfirmed' | 'startsAt' | 'endsAt'>

export type EventPhase = 'unscheduled' | 'tentative' | 'upcoming' | 'live' | 'past'

export function eventBounds(ev: EventTiming) {
  if (!ev.startsAt) return null
  const start = new Date(ev.startsAt).getTime()
  const end = ev.endsAt ? new Date(ev.endsAt).getTime() : start + DEFAULT_DURATION
  return { start, end }
}

export function eventPhase(ev: EventTiming, now = Date.now()): EventPhase {
  const bounds = eventBounds(ev)
  if (!bounds) return 'unscheduled'
  if (!ev.dateConfirmed) return 'tentative'
  if (now >= bounds.end) return 'past'
  if (now >= bounds.start) return 'live'
  return 'upcoming'
}

/**
 * Статус, который видит посетитель. Ручной статус из CMS дополняется датой:
 * по утверждённой дате событие само становится «Скоро состоится», а после окончания — «Завершено».
 * Отменённые и вручную завершённые события не меняются.
 */
export function effectiveEventStatus(ev: EventTiming, now = Date.now()): EventStatus {
  const status = ev.status as EventStatus
  if (status === 'cancelled' || status === 'completed') return status
  const phase = eventPhase(ev, now)
  const bounds = eventBounds(ev)
  if (phase === 'past') return 'completed'
  if ((phase === 'live' || phase === 'upcoming') && bounds && bounds.start - now <= SOON_WINDOW) return 'soon'
  if (status === 'soon' && phase !== 'upcoming' && phase !== 'live') return ev.dateConfirmed ? 'date_confirmed' : 'preparing'
  return status
}

/** Обратный отсчёт показывается только по официально утверждённой дате и только до начала. */
export function shouldShowCountdown(ev: EventTiming, now = Date.now()) {
  const status = ev.status as EventStatus
  if (status === 'cancelled' || status === 'completed') return false
  return eventPhase(ev, now) === 'upcoming'
}

export function isUpcoming(ev: EventTiming, now = Date.now()) {
  const status = effectiveEventStatus(ev, now)
  return status !== 'completed' && status !== 'cancelled'
}

/** Сортировка: сначала ближайшие утверждённые, затем предварительные, затем без даты. */
export function compareUpcoming(a: EventTiming, b: EventTiming) {
  const rank = (e: EventTiming) => (e.dateConfirmed && e.startsAt ? 0 : e.startsAt ? 1 : 2)
  const r = rank(a) - rank(b)
  if (r !== 0) return r
  const ta = a.startsAt ? new Date(a.startsAt).getTime() : Infinity
  const tb = b.startsAt ? new Date(b.startsAt).getTime() : Infinity
  return ta - tb
}
