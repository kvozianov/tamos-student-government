import type { Metadata } from 'next'

import { NewsCard, NewsRow } from '@/components/site/cards'
import { EmptyState } from '@/components/site/EmptyState'
import { FilterTabs } from '@/components/site/FilterTabs'
import { PageHero } from '@/components/site/PageHero'
import { Pagination } from '@/components/site/Pagination'
import { getNewsCategoryCounts, getNewsList } from '@/lib/data'
import { pageMeta } from '@/lib/meta'
import { NEWS_CATEGORIES, type NewsCategory } from '@/lib/status'

export const newsMeta: Metadata = pageMeta({ title: 'Новости', description: 'Заявления, новости, анонсы инициатив и итоги мероприятий президентской администрации TAMOS.', path: '/news' })

export type NewsFilter = { category?: string; q?: string; page?: string }

/**
 * Страница «Новости». Рубрика и номер страницы приходят из адреса /news?category=…&page=…,
 * поиск — из /news?q=… (см. rewrites в next.config.ts).
 */
export async function NewsView(sp: NewsFilter) {
  const category = sp.category && sp.category in NEWS_CATEGORIES ? (sp.category as NewsCategory) : undefined
  const q = sp.q?.trim().slice(0, 80) || undefined
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)
  const [list, { counts, total }] = await Promise.all([getNewsList({ category, q, page, limit: 12 }), getNewsCategoryCounts()])

  const href = (params: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '' && !(k === 'page' && v === 1)) u.set(k, String(v))
    const s = u.toString()
    return s ? `/news?${s}` : '/news'
  }

  const tabs = [
    { label: 'Все', href: href({ q }), active: !category, count: total },
    ...Object.entries(NEWS_CATEGORIES)
      .filter(([key]) => counts[key])
      .map(([key, label]) => ({ label, href: href({ category: key, q }), active: category === key, count: counts[key] })),
  ]
  const showFeature = page === 1 && !q && !category && list.docs.length > 2
  const [first, ...rest] = list.docs

  return (
    <>
      <PageHero title="Новости" crumbs={[{ label: 'Новости' }]}>
        <form action="/news" role="search" className="mx-auto mb-10 flex max-w-xl border border-rule bg-paper focus-within:border-ink">
          {category ? <input type="hidden" name="category" value={category} /> : null}
          <label htmlFor="news-q" className="sr-only">
            Поиск по новостям
          </label>
          <input id="news-q" name="q" defaultValue={q} placeholder="Поиск по новостям" className="w-full bg-transparent px-5 py-4 text-[15px] text-ink outline-none placeholder:text-subtle" />
          <button type="submit" className="label-wide-sm shrink-0 bg-navy-900 px-5 text-white hover:bg-navy-700">
            Найти
          </button>
        </form>
        <FilterTabs tabs={tabs} label="Рубрики" />
      </PageHero>

      <div className="container-site py-14 md:py-20">
        {q ? (
          <p className="mb-8 text-[15px] text-muted">
            По запросу «{q}» найдено: {list.totalDocs}.{' '}
            <a href={href({ category })} className="underline underline-offset-4">
              Сбросить поиск
            </a>
          </p>
        ) : null}
        {list.docs.length ? (
          <>
            {showFeature && first ? (
              <div className="mb-14 border-b border-rule pb-14">
                <NewsCard item={first} large priority />
              </div>
            ) : null}
            <div className="mx-auto max-w-[980px] border-t border-ink">
              {(showFeature ? rest : list.docs).map((n) => (
                <NewsRow key={n.id} item={n} withImage />
              ))}
            </div>
            <Pagination page={list.page ?? 1} totalPages={list.totalPages} hrefFor={(p) => href({ category, q, page: p })} />
          </>
        ) : (
          <EmptyState title={q ? 'Ничего не найдено' : 'Публикаций пока нет'} text={q ? 'Попробуйте изменить запрос или выбрать другую рубрику.' : 'Материалы пресс-службы появятся здесь после публикации.'} />
        )}
      </div>
    </>
  )
}
