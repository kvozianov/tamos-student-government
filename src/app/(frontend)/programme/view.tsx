import type { Metadata } from 'next'

import { PromiseRow } from '@/components/site/cards'
import { EmptyState } from '@/components/site/EmptyState'
import { FilterTabs } from '@/components/site/FilterTabs'
import { PageHero } from '@/components/site/PageHero'
import { PromiseStats } from '@/components/site/PromiseStats'
import { StatusBadge } from '@/components/site/StatusBadge'
import type { Category } from '@/payload-types'
import { computePromiseStats, getCategories, getPromises } from '@/lib/data'
import { pageMeta } from '@/lib/meta'
import { doc } from '@/lib/rel'
import { PROMISE_STATUSES, type PromiseStatus } from '@/lib/status'

export const promisesMeta: Metadata = pageMeta({
  title: 'Программа',
  description: 'Публичное отслеживание обещаний администрации TAMOS: статус каждого пункта программы, история изменений и подтверждающие материалы.',
  path: '/programme',
})

export type PromisesFilter = { category?: string; status?: string }

/** Страница «Программа». Фильтры приходят из адреса: /programme?category=…&status=… (см. rewrites в next.config.ts). */
export async function PromisesView(sp: PromisesFilter) {
  const [promises, categories] = await Promise.all([getPromises(), getCategories()])
  const stats = computePromiseStats(promises)
  const category = categories.find((c) => c.slug === sp.category)
  const status = sp.status && sp.status in PROMISE_STATUSES ? (sp.status as PromiseStatus) : undefined

  const inCategory = category ? promises.filter((p) => doc<Category>(p.category)?.id === category.id) : promises
  const list = status ? inCategory.filter((p) => p.status === status) : inCategory

  const qs = (c?: string | null, s?: string | null) => {
    const u = new URLSearchParams()
    if (c) u.set('category', c)
    if (s) u.set('status', s)
    const str = u.toString()
    // Фильтр открывается обычным переходом (см. SiteLink), якорь возвращает читателя к списку.
    return str ? `/programme?${str}#filters` : '/programme#filters'
  }
  const usedCategories = categories.filter((c) => promises.some((p) => doc<Category>(p.category)?.id === c.id))
  const categoryTabs = [
    { label: 'Все темы', href: qs(null, status), active: !category, count: promises.length },
    ...usedCategories.map((c) => ({
      label: c.title,
      href: qs(c.slug, status),
      active: category?.id === c.id,
      count: promises.filter((p) => doc<Category>(p.category)?.id === c.id).length,
    })),
  ]
  const statusCounts: Record<string, number> = {}
  for (const p of inCategory) statusCounts[p.status] = (statusCounts[p.status] ?? 0) + 1
  const statusTabs = [
    { label: 'Любой статус', href: qs(category?.slug, null), active: !status, count: inCategory.length },
    ...(Object.keys(PROMISE_STATUSES) as PromiseStatus[])
      .filter((k) => statusCounts[k])
      .map((k) => ({ label: PROMISE_STATUSES[k].label, href: qs(category?.slug, k), active: status === k, count: statusCounts[k] })),
  ]

  return (
    <>
      <PageHero
        title="Программа"
        lead="Это не перечень достижений, а система публичного контроля. Каждое обещание получает статус только по фактам, а каждое изменение — дату и объяснение."
        crumbs={[{ label: 'Программа' }]}
      />

      <section id="stats" className="border-b border-rule bg-paper py-14 md:py-16" aria-label="Статистика выполнения">
        <div className="container-site">
          <PromiseStats stats={stats} />
        </div>
      </section>

      <div className="container-site py-14 md:py-16">
        <div id="filters" className="space-y-3">
          <FilterTabs tabs={categoryTabs} label="Темы" align="left" />
          <FilterTabs tabs={statusTabs} label="Статусы" align="left" />
        </div>
        <div className="mt-10 border-t border-ink">
          {list.length ? (
            list.map((p) => <PromiseRow key={p.id} item={p} />)
          ) : (
            <EmptyState title="Нет обещаний с такими условиями" text="Измените тему или статус." className="mt-10" />
          )}
        </div>

        <section className="mt-24" aria-labelledby="legend-title">
          <h2 id="legend-title" className="font-serif text-[36px] leading-none">
            Как читать статусы
          </h2>
          <dl className="mt-8 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(PROMISE_STATUSES) as PromiseStatus[]).map((k) => (
              <div key={k} className="bg-paper p-6">
                <dt>
                  <StatusBadge kind="promise" status={k} />
                </dt>
                <dd className="mt-3 text-[15px] leading-relaxed text-muted">{PROMISE_STATUSES[k].description}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  )
}
