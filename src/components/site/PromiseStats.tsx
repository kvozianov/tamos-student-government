import clsx from 'clsx'

import type { PromiseStats as Stats } from '@/lib/data'
import { plural } from '@/lib/format'
import { PROMISE_STATUSES, type PromiseStatus } from '@/lib/status'

import { TONE_BG } from './StatusBadge'

const ORDER: PromiseStatus[] = ['done', 'partial', 'in_progress', 'agreed', 'review', 'planned', 'failed']

/** Сводка выполнения обязательств. Считается из фактических статусов в базе при каждом запросе. */
export function PromiseStats({ stats, onDark, compact }: { stats: Stats; onDark?: boolean; compact?: boolean }) {
  const pct = (n: number) => (stats.total ? Math.round((n / stats.total) * 100) : 0)
  const headline = [
    { label: 'Всего обещаний', value: stats.total, note: null },
    { label: 'Выполнено', value: stats.done, note: `${pct(stats.done)}%` },
    { label: 'В работе', value: stats.inWork, note: `${pct(stats.inWork)}%` },
    { label: 'На согласовании', value: stats.awaiting, note: `${pct(stats.awaiting)}%` },
    { label: 'Запланировано', value: stats.planned, note: `${pct(stats.planned)}%` },
  ]
  const line = onDark ? 'border-white/15' : 'border-rule'
  return (
    <div>
      <dl className={clsx('grid grid-cols-2 border-t md:grid-cols-5', line)}>
        {headline.map((h, i) => (
          <div key={h.label} className={clsx('border-b py-6 pr-4 md:border-b-0', line, i > 0 && 'md:border-l md:pl-6', i % 2 === 1 && 'border-l pl-5 md:pl-6', i === headline.length - 1 && i % 2 === 0 && 'col-span-2 md:col-span-1')}>
            <dt className={clsx('label-wide-sm', onDark ? 'text-white/60' : 'text-subtle')}>{h.label}</dt>
            <dd className="mt-3 flex items-baseline gap-3">
              <span className={clsx('font-serif leading-none', compact ? 'text-[52px]' : 'text-[60px] md:text-[76px]', onDark ? 'text-white' : 'text-ink')}>{h.value}</span>
              {h.note ? <span className={clsx('label-wide-sm', onDark ? 'text-white/50' : 'text-subtle')}>{h.note}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
      {stats.total ? (
        <div className="mt-8">
          <div className="flex h-2 w-full gap-[2px]" role="img" aria-label={ORDER.map((k) => `${PROMISE_STATUSES[k].label}: ${stats.byStatus[k]}`).join(', ')}>
            {ORDER.filter((k) => stats.byStatus[k] > 0).map((k) => (
              <span key={k} className={clsx('h-full', TONE_BG[PROMISE_STATUSES[k].tone])} style={{ flexGrow: stats.byStatus[k] }} title={`${PROMISE_STATUSES[k].label}: ${stats.byStatus[k]}`} />
            ))}
          </div>
          <ul className={clsx('mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[14px]', onDark ? 'text-white/70' : 'text-muted')}>
            {ORDER.map((k) => (
              <li key={k} className="flex items-center gap-2">
                <span aria-hidden="true" className={clsx('size-[7px]', TONE_BG[PROMISE_STATUSES[k].tone])} />
                {PROMISE_STATUSES[k].label} <span className="font-medium tabular-nums">{stats.byStatus[k]}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="sr-only">
        Всего {stats.total} {plural(stats.total, ['обещание', 'обещания', 'обещаний'])}, выполнено {stats.done}.
      </p>
    </div>
  )
}
