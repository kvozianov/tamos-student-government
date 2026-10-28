import type { Metadata } from 'next'

import { EventCard } from '@/components/site/cards'
import { EmptyState } from '@/components/site/EmptyState'
import { EventsCalendar, type CalendarEvent } from '@/components/site/EventsCalendar'
import { FilterTabs } from '@/components/site/FilterTabs'
import { PageHero } from '@/components/site/PageHero'
import { Reveal } from '@/components/site/Reveal'
import { ViewSwitch } from '@/components/site/ViewSwitch'
import { dayKeyInZone } from '@/lib/calendar'
import { getEvents } from '@/lib/data'
import { compareUpcoming } from '@/lib/events'
import { pageMeta } from '@/lib/meta'
import { SITE_TIMEZONE } from '@/lib/site'
import { EVENT_STATUSES, type EventStatus } from '@/lib/status'

export const eventsMeta: Metadata = pageMeta({
  title: 'События',
  description: 'Каталог мероприятий администрации TAMOS: статусы подготовки, даты, программы и обратный отсчёт до утверждённых событий.',
  path: '/events',
})

/** Страница «События». Фильтр приходит из адреса: /events?status=… (см. rewrites в next.config.ts). */
export async function EventsView({ status: raw }: { status?: string }) {
  const status = raw && raw in EVENT_STATUSES ? (raw as EventStatus) : undefined
  const events = await getEvents()
  const counts: Record<string, number> = {}
  for (const e of events) counts[e.effectiveStatus] = (counts[e.effectiveStatus] ?? 0) + 1

  const tabs = [
    { label: 'Все', href: '/events', active: !status, count: events.length },
    ...(Object.keys(EVENT_STATUSES) as EventStatus[])
      .filter((k) => counts[k])
      .map((k) => ({ label: EVENT_STATUSES[k].label, href: `/events?status=${k}`, active: status === k, count: counts[k] })),
  ]

  const filtered = status ? events.filter((e) => e.effectiveStatus === status) : events
  const upcoming = filtered.filter((e) => e.effectiveStatus !== 'completed' && e.effectiveStatus !== 'cancelled').sort(compareUpcoming)
  const archive = filtered
    .filter((e) => e.effectiveStatus === 'completed' || e.effectiveStatus === 'cancelled')
    .sort((a, b) => new Date(b.startsAt ?? 0).getTime() - new Date(a.startsAt ?? 0).getTime())

  const calendarEvents: CalendarEvent[] = filtered
    .filter((e) => e.startsAt)
    .map((e) => ({
      id: e.id,
      slug: e.slug ?? String(e.id),
      title: e.title,
      startsAt: e.startsAt!,
      confirmed: Boolean(e.dateConfirmed),
      statusLabel: EVENT_STATUSES[e.effectiveStatus].label,
      place: e.place,
    }))
  const today = dayKeyInZone(new Date().toISOString(), SITE_TIMEZONE)
  const nextDated = upcoming.find((e) => e.startsAt)
  const initialMonth = nextDated?.startsAt ? dayKeyInZone(nextDated.startsAt, SITE_TIMEZONE) : today

  return (
    <>
      <PageHero
        title="События"
        lead="Каждое мероприятие проходит путь от идеи до проведения. Статус подготовки обновляется по фактам, отсчёт появляется только после утверждения даты."
        crumbs={[{ label: 'События' }]}
      >
        <FilterTabs tabs={tabs} label="Статус подготовки" />
      </PageHero>

      <div className="container-site py-14 md:py-20">
        <ViewSwitch
          label="Вид"
          views={[
            {
              id: 'list',
              label: 'Список',
              content: (
                <>
                  {upcoming.length ? (
                    <section aria-labelledby="upcoming-title">
                      <h2 id="upcoming-title" className="label-wide mb-8 text-subtle">
                        Предстоящие и в подготовке
                      </h2>
                      <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                        {upcoming.map((ev, i) => (
                          <Reveal key={ev.id} delay={(i % 3) * 0.06} className="h-full">
                            <EventCard ev={ev} status={ev.effectiveStatus} />
                          </Reveal>
                        ))}
                      </div>
                    </section>
                  ) : null}
                  {archive.length ? (
                    <section aria-labelledby="archive-title" className={upcoming.length ? 'mt-24' : ''}>
                      <h2 id="archive-title" className="label-wide mb-8 text-subtle">
                        Архив
                      </h2>
                      <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                        {archive.map((ev) => (
                          <EventCard key={ev.id} ev={ev} status={ev.effectiveStatus} />
                        ))}
                      </div>
                    </section>
                  ) : null}
                  {!upcoming.length && !archive.length ? (
                    <EmptyState title={status ? 'Нет событий с таким статусом' : 'События пока не опубликованы'} text="Новые мероприятия появятся здесь, как только начнётся их подготовка." />
                  ) : null}
                </>
              ),
            },
            { id: 'calendar', label: 'Календарь', content: <EventsCalendar events={calendarEvents} initialMonth={initialMonth} today={today} /> },
          ]}
        />
      </div>
    </>
  )
}
