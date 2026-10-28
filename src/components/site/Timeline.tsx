import { formatDate } from '@/lib/format'

import { StatusBadge } from './StatusBadge'

export type TimelineItem = { id?: string | null; date: string; status?: string | null; text: string; extra?: React.ReactNode }

function TimelineDate({ date }: { date: string }) {
  return (
    <time dateTime={date} className="label-wide-sm block text-subtle">
      {formatDate(date)}
    </time>
  )
}

/** История изменений: от новых к старым, с датой и статусом на момент записи. */
export function Timeline({ items, kind, empty }: { items: TimelineItem[]; kind: 'event' | 'promise'; empty?: string }) {
  const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  if (!sorted.length) return empty ? <p className="border-t border-rule pt-6 text-muted">{empty}</p> : null
  return (
    <ol className="relative border-t border-rule">
      {sorted.map((item, i) => (
        <li key={item.id ?? `${item.date}-${i}`} className="grid gap-3 border-b border-rule py-7 md:grid-cols-[180px_1fr] md:gap-10">
          <div className="flex items-center gap-3 md:block">
            <time dateTime={item.date} className="label-wide-sm block text-subtle">
              {formatDate(item.date)}
            </time>
            {i === 0 ? <span className="label-wide-sm text-navy-700 md:mt-2 md:block">Последнее</span> : null}
          </div>
          <div>
            {item.status ? <StatusBadge kind={kind} status={item.status} /> : null}
            <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-ink">{item.text}</p>
            {item.extra}
          </div>
        </li>
      ))}
    </ol>
  )
}

Timeline.Date = TimelineDate
