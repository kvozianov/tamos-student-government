import type { Metadata } from 'next'
import Link from 'next/link'

import { EmptyState } from '@/components/site/EmptyState'
import { PageHero } from '@/components/site/PageHero'
import { searchSite } from '@/lib/data'
import { formatDate } from '@/lib/format'

// Результаты зависят от произвольного запроса, поэтому поиск не кэшируется.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Поиск', robots: { index: false } }

type Props = { searchParams: Promise<{ q?: string }> }

export default async function SearchPage({ searchParams }: Props) {
  const q = ((await searchParams).q ?? '').trim().slice(0, 80)
  const hits = q.length >= 2 ? await searchSite(q) : []
  return (
    <>
      <PageHero title="Поиск" crumbs={[{ label: 'Поиск' }]} size="md">
        <form action="/search" role="search" className="mx-auto flex max-w-2xl border border-rule bg-paper focus-within:border-ink">
          <label htmlFor="q" className="sr-only">
            Что найти
          </label>
          <input id="q" name="q" defaultValue={q} minLength={2} required placeholder="Новости, события, обещания, отчёты" className="w-full bg-transparent px-5 py-4 text-[17px] outline-none placeholder:text-subtle" />
          <button type="submit" className="label-wide-sm shrink-0 bg-navy-900 px-6 text-white hover:bg-navy-700">
            Найти
          </button>
        </form>
      </PageHero>
      <div className="container-site max-w-[980px] py-14 md:py-20">
        {q.length < 2 ? (
          <p className="text-center text-muted">Введите хотя бы два символа.</p>
        ) : hits.length ? (
          <>
            <p className="mb-6 text-[15px] text-muted">
              Найдено: {hits.length} по запросу «{q}»
            </p>
            <ul className="border-t border-ink">
              {hits.map((h) => (
                <li key={h.href} className="group relative border-b border-rule py-6">
                  <p className="label-wide-sm text-navy-700">
                    {h.kind}
                    {h.date ? <span className="text-subtle"> · {formatDate(h.date)}</span> : null}
                  </p>
                  <Link href={h.href} className="mt-2 block font-serif text-[26px] leading-snug after:absolute after:inset-0 group-hover:underline">
                    {h.title}
                  </Link>
                  {h.excerpt ? <p className="mt-2 line-clamp-2 text-[15px] text-muted">{h.excerpt}</p> : null}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyState title="Ничего не найдено" text="Попробуйте другую формулировку или откройте нужный раздел через меню." />
        )}
      </div>
    </>
  )
}
