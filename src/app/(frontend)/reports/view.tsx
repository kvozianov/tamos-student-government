import type { Metadata } from 'next'
import Link from 'next/link'

import { ReportRow } from '@/components/site/cards'
import { EmptyState } from '@/components/site/EmptyState'
import { FilterTabs } from '@/components/site/FilterTabs'
import { PageHero } from '@/components/site/PageHero'
import { StatusBadge } from '@/components/site/StatusBadge'
import { getEvents, getPromises, getReports } from '@/lib/data'
import { pageMeta } from '@/lib/meta'
import { REPORT_TYPES, type ReportType } from '@/lib/status'

export const reportsMeta: Metadata = pageMeta({
  title: 'Отчётность',
  description: 'Отчёты о деятельности, утверждённые инициативы, реализованные проекты и текущая работа президентской администрации TAMOS.',
  path: '/reports',
})

/** Страница «Отчётность». Фильтр приходит из адреса: /reports?type=… (см. rewrites в next.config.ts). */
export async function ReportsView({ type: raw }: { type?: string }) {
  const type = raw && raw in REPORT_TYPES ? (raw as ReportType) : undefined
  const [all, promises, events] = await Promise.all([getReports(), getPromises(), getEvents()])
  const list = type ? all.filter((r) => r.type === type) : all
  const counts: Record<string, number> = {}
  for (const r of all) counts[r.type] = (counts[r.type] ?? 0) + 1
  const tabs = [
    { label: 'Все', href: '/reports', active: !type, count: all.length },
    ...(Object.keys(REPORT_TYPES) as ReportType[]).map((k) => ({ label: REPORT_TYPES[k], href: `/reports?type=${k}`, active: type === k, count: counts[k] ?? 0 })),
  ]
  const inProgress = promises.filter((p) => p.status === 'in_progress' || p.status === 'agreed')
  const preparing = events.filter((e) => ['approved', 'preparing', 'date_confirmed', 'soon'].includes(e.effectiveStatus))
  const showCurrent = !type || type === 'current'

  return (
    <>
      <PageHero
        title="Отчётность"
        lead="Что сделано, что согласовано и что сейчас в работе. Каждый отчёт связан с обещаниями и событиями, к которым он относится."
        crumbs={[{ label: 'Отчётность' }]}
      >
        <FilterTabs tabs={tabs} label="Тип материалов" />
      </PageHero>

      <div className="container-site py-14 md:py-20">
        {list.length ? (
          <div className="border-t border-ink">
            {list.map((r) => (
              <ReportRow key={r.id} report={r} />
            ))}
          </div>
        ) : (
          <EmptyState title="Материалов этого типа пока нет" text="Они появятся после публикации отчёта." />
        )}

        {showCurrent && (inProgress.length || preparing.length) ? (
          <section className="mt-24" aria-labelledby="current-title">
            <h2 id="current-title" className="font-serif text-[40px] leading-none md:text-[52px]">
              Сейчас в работе
            </h2>
            <p className="mt-4 max-w-2xl text-[16px] text-muted">Сводка формируется автоматически по статусам обещаний и событий.</p>
            <div className="mt-10 grid gap-12 lg:grid-cols-2">
              <div>
                <h3 className="label-wide mb-4 text-subtle">Обещания в реализации · {inProgress.length}</h3>
                <ul className="border-t border-rule">
                  {inProgress.map((p) => (
                    <li key={p.id} className="group relative border-b border-rule py-4">
                      <StatusBadge kind="promise" status={p.status} />
                      <Link href={`/promises/${p.slug}`} className="mt-2 block font-serif text-[22px] leading-snug after:absolute after:inset-0 group-hover:underline">
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="label-wide mb-4 text-subtle">События в подготовке · {preparing.length}</h3>
                <ul className="border-t border-rule">
                  {preparing.map((e) => (
                    <li key={e.id} className="group relative border-b border-rule py-4">
                      <StatusBadge kind="event" status={e.effectiveStatus} />
                      <Link href={`/events/${e.slug}`} className="mt-2 block font-serif text-[22px] leading-snug after:absolute after:inset-0 group-hover:underline">
                        {e.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </>
  )
}
