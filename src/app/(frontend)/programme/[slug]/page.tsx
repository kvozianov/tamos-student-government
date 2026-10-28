import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { NewBadge } from '@/components/site/cards'
import { DemoBadge } from '@/components/site/DemoBadge'
import { DocumentList } from '@/components/site/DocumentList'
import { Lightbox } from '@/components/site/Lightbox'
import { PageHero } from '@/components/site/PageHero'
import { Related } from '@/components/site/Related'
import { hasRichText, RichText } from '@/components/site/RichText'
import { SiteLink } from '@/components/site/SiteLink'
import { StatusBadge } from '@/components/site/StatusBadge'
import { Timeline } from '@/components/site/Timeline'
import type { Category, Event, News, Report } from '@/payload-types'
import { getPromise } from '@/lib/data'
import { effectiveEventStatus } from '@/lib/events'
import { formatDate } from '@/lib/format'
import { mediaListToGallery } from '@/lib/gallery'
import { pageMeta } from '@/lib/meta'
import { doc, docs } from '@/lib/rel'
import { PROMISE_STATUSES, REPORT_TYPE_SINGULAR, type PromiseStatus, type ReportType } from '@/lib/status'

// Страница собирается при первом посещении и дальше отдаётся из кэша (ISR), как и остальной сайт.
export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPromise((await params).slug)
  if (!p) return { title: 'Обещание не найдено' }
  return pageMeta({ title: p.title, description: p.summary, path: `/programme/${p.slug}` })
}

export default async function PromisePage({ params }: Props) {
  const p = await getPromise((await params).slug)
  if (!p) notFound()
  const category = doc<Category>(p.category)
  const events = docs<Event>(p.eventsJoin)
  const reports = docs<Report>(p.reportsJoin)
  const news = docs<News>(p.newsJoin)
  const photos = mediaListToGallery(p.evidenceMedia)
  const status = p.status as PromiseStatus

  return (
    <article>
      <PageHero title={p.title} lead={p.summary} crumbs={[{ label: 'Программа', href: '/programme' }, { label: p.title }]} align="left" size="md">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {p.number ? <span className="label-wide-sm text-ink">Пункт {p.number}</span> : null}
          <StatusBadge kind="promise" status={status} className="text-[12px]" />
          <NewBadge show={p.isNew} />
          <DemoBadge show={p.isDemo} />
          {category ? (
            <SiteLink href={`/programme?category=${category.slug}`} className="label-wide-sm text-subtle hover:text-ink">
              Тема: {category.title}
            </SiteLink>
          ) : null}
          {p.source ? <span className="label-wide-sm text-subtle">Источник: {p.source}</span> : null}
        </div>
      </PageHero>

      <div className="container-site grid gap-14 py-14 md:py-20 lg:grid-cols-[1fr_320px] lg:gap-20">
        <div className="min-w-0 space-y-16">
          <section aria-label="Текущий статус" className="grid gap-6 border border-rule p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div>
              <p className="label-wide-sm text-subtle">Текущий статус</p>
              <p className="mt-2 font-serif text-[34px] leading-none">{PROMISE_STATUSES[status].label}</p>
              <p className="mt-3 text-[15px] text-muted">{PROMISE_STATUSES[status].description}</p>
            </div>
            {p.statusUpdatedAt ? <p className="label-wide-sm text-subtle md:text-right">Изменён {formatDate(p.statusUpdatedAt)}</p> : null}
            {p.deadline ? (
              <div className="border-t border-rule pt-5 md:col-span-2">
                <p className="label-wide-sm text-subtle">Планируемые сроки</p>
                <p className="mt-2 text-[18px] text-ink">{p.deadline}</p>
              </div>
            ) : null}
          </section>

          {hasRichText(p.details) ? (
            <section aria-labelledby="details-title">
              <h2 id="details-title" className="mb-6 font-serif text-[36px] leading-none">
                Ход реализации
              </h2>
              <RichText data={p.details} className="max-w-[760px]" />
            </section>
          ) : null}

          <section aria-labelledby="history-title">
            <h2 id="history-title" className="mb-6 font-serif text-[36px] leading-none">
              История обновлений
            </h2>
            <Timeline
              kind="promise"
              empty="Работа по этому обещанию ещё не начиналась. Первое обновление появится здесь."
              items={(p.updates ?? []).map((u) => ({
                id: u.id,
                date: u.date,
                status: u.status,
                text: u.text,
                extra: Array.isArray(u.attachments) && u.attachments.length ? (
                  <div className="mt-5">
                    <DocumentList items={u.attachments} title="Документы к обновлению" />
                  </div>
                ) : null,
              }))}
            />
          </section>

          {photos.length || p.evidenceDocuments?.length || p.evidenceLinks?.length ? (
            <section aria-labelledby="evidence-title" className="space-y-10">
              <h2 id="evidence-title" className="font-serif text-[36px] leading-none">
                Подтверждения
              </h2>
              <DocumentList items={p.evidenceDocuments} />
              {p.evidenceLinks?.length ? (
                <ul className="border-t border-rule">
                  {p.evidenceLinks.map((l) => (
                    <li key={l.id ?? l.url} className="border-b border-rule py-4">
                      <a href={l.url ?? '#'} target="_blank" rel="noopener noreferrer" className="link-draw text-[16px] text-navy-700">
                        {l.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
              {photos.length ? <Lightbox items={photos} title={p.title} /> : null}
            </section>
          ) : null}
        </div>

        <aside className="space-y-12">
          <Related
            title="Отчёты"
            items={reports.map((r) => ({ href: `/reports/${r.slug}`, kind: `${REPORT_TYPE_SINGULAR[r.type as ReportType]} · ${formatDate(r.publishedAt)}`, title: r.title }))}
          />
          <Related title="События" items={events.map((e) => ({ href: `/events/${e.slug}`, kind: 'Событие', title: e.title, meta: <StatusBadge kind="event" status={effectiveEventStatus(e)} /> }))} />
          <Related title="Новости" items={news.map((n) => ({ href: `/news/${n.slug}`, kind: formatDate(n.publishedAt), title: n.title }))} />
          <div>
            <Link href="/programme" className="label-wide-sm link-draw">
              ← Все обещания
            </Link>
          </div>
        </aside>
      </div>
    </article>
  )
}
