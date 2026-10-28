'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { dayKeyInZone, monthGrid, monthOf, shiftMonth, type MonthKey } from '@/lib/calendar'
import { SITE_TIMEZONE } from '@/lib/site'

export type CalendarEvent = { id: number | string; slug: string; title: string; startsAt: string; confirmed: boolean; statusLabel: string; place?: string | null }

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const monthTitle = (m: MonthKey) => {
  const s = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(m.year, m.month, 1)))
  return (s.charAt(0).toUpperCase() + s.slice(1)).replace(/\s?г\.$/, '')
}
const dayTitle = (key: string) =>
  new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', weekday: 'long', timeZone: 'UTC' }).format(new Date(`${key}T00:00:00Z`))
const timeOf = (iso: string) => new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: SITE_TIMEZONE }).format(new Date(iso))

/** Календарь событий на месяц. Открывается на месяце ближайшего события, листается кнопками. */
export function EventsCalendar({ events, initialMonth, today }: { events: CalendarEvent[]; initialMonth: string; today: string }) {
  const [month, setMonth] = useState<MonthKey>(() => monthOf(initialMonth))
  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      const k = dayKeyInZone(e.startsAt, SITE_TIMEZONE)
      map.set(k, [...(map.get(k) ?? []), e])
    }
    return map
  }, [events])
  const weeks = monthGrid(month)
  const inMonth = weeks.flat().filter((d) => d.inMonth && byDay.has(d.key))

  return (
    <div>
      <div className="flex items-center justify-between gap-4 border-b border-ink pb-4">
        <h3 className="font-serif text-[32px] leading-none md:text-[40px]" aria-live="polite">
          {monthTitle(month)}
        </h3>
        <div className="flex gap-2">
          <button type="button" onClick={() => setMonth((m) => shiftMonth(m, -1))} className="label-wide-sm border border-rule px-4 py-3 hover:border-navy-700" aria-label="Предыдущий месяц">
            ←
          </button>
          <button type="button" onClick={() => setMonth((m) => shiftMonth(m, 1))} className="label-wide-sm border border-rule px-4 py-3 hover:border-navy-700" aria-label="Следующий месяц">
            →
          </button>
        </div>
      </div>

      <table className="mt-6 w-full table-fixed border-collapse text-center">
        <caption className="sr-only">События за {monthTitle(month).toLowerCase()}</caption>
        <thead>
          <tr>
            {WEEKDAYS.map((w) => (
              <th key={w} scope="col" className="label-wide-sm pb-3 font-medium text-subtle">
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0].key}>
              {week.map((d) => {
                const list = byDay.get(d.key)
                return (
                  <td key={d.key} className="border border-rule p-0 align-top">
                    <div
                      className={clsx(
                        'flex h-14 flex-col items-center justify-start gap-1 pt-2 md:h-20',
                        !d.inMonth && 'bg-mist text-subtle',
                        d.key === today && 'bg-sky-100',
                      )}
                    >
                      <span className={clsx('text-[15px] tabular-nums', d.key === today && 'font-semibold text-navy-700')}>
                        {d.day}
                        {d.key === today ? <span className="sr-only"> (сегодня)</span> : null}
                      </span>
                      {list && d.inMonth ? (
                        <span className="flex gap-1" aria-label={`${list.length} ${list.length === 1 ? 'событие' : 'события'}`}>
                          {list.slice(0, 3).map((e) => (
                            <span key={e.id} className={clsx('size-2 rounded-full', e.confirmed ? 'bg-sky-600' : 'border border-sky-600')} />
                          ))}
                        </span>
                      ) : null}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-sky-600" /> дата утверждена
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full border border-sky-600" /> предварительная дата
        </span>
      </p>

      <ul className="mt-10 border-t border-ink">
        {inMonth.length ? (
          inMonth.flatMap((d) =>
            (byDay.get(d.key) ?? []).map((e) => (
              <li key={e.id} className="group relative grid gap-2 border-b border-rule py-5 sm:grid-cols-[220px_1fr] sm:gap-8">
                <p className="text-[15px] text-muted">
                  <span className="first-letter:uppercase">{dayTitle(d.key)}</span>
                  {e.confirmed ? `, ${timeOf(e.startsAt)}` : ' · дата уточняется'}
                </p>
                <div>
                  <p className="label-wide-sm text-navy-700">{e.statusLabel}</p>
                  <Link href={`/events/${e.slug}`} className="mt-1 block font-serif text-[24px] leading-tight after:absolute after:inset-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                    {e.title}
                  </Link>
                  {e.place ? <p className="mt-1 text-[14px] text-subtle">{e.place}</p> : null}
                </div>
              </li>
            )),
          )
        ) : (
          <li className="py-6 text-muted">В этом месяце событий нет.</li>
        )}
      </ul>
    </div>
  )
}
