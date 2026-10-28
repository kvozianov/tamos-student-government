import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DemoBadge } from '@/components/site/DemoBadge'
import { DocumentList } from '@/components/site/DocumentList'
import { Lightbox } from '@/components/site/Lightbox'
import { PageHero } from '@/components/site/PageHero'
import { Related } from '@/components/site/Related'
import { RichText } from '@/components/site/RichText'
import { StatusBadge } from '@/components/site/StatusBadge'
import type { Event, Idea, Promise as PromiseDoc } from '@/payload-types'
import { getReport } from '@/lib/data'
import { effectiveEventStatus } from '@/lib/events'
import { formatDate, formatPeriod } from '@/lib/format'
import { mediaListToGallery } from '@/lib/gallery'
import { pageMeta } from '@/lib/meta'
import { docs } from '@/lib/rel'
import { REPORT_TYPE_SINGULAR, type ReportType } from '@/lib/status'

// Страница собирается при первом посещении и дальше отдаётся из кэша (ISR), как и остальной сайт.
export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getReport((await params).slug)
  if (!r) return { title: 'Отчёт не найден' }
  return pageMeta({ title: r.title, description: r.summary, image: r.images?.[0], path: `/reports/${r.slug}`, type: 'article', publishedTime: r.publishedAt })
}

export default async function ReportPage({ params }: Props) {
  const r = await getReport((await params).slug)
  if (!r) notFound()
  const period = formatPeriod(r.periodStart, r.periodEnd, r.periodLabel)
  const images = mediaListToGallery(r.images)
  const promises = docs<PromiseDoc>(r.relatedPromises)
  const events = docs<Event>(r.relatedEvents)
  const ideas = docs<Idea>(r.relatedIdeas)
  const typeLabel = REPORT_TYPE_SINGULAR[r.type as ReportType]

  return (
    <article>
      <PageHero title={r.title} eyebrow={typeLabel} crumbs={[{ label: 'Отчётность', href: '/reports' }, { label: r.title }]} align="left" size="md">
        <dl className="flex flex-wrap gap-x-10 gap-y-3">
          <div>
            <dt className="label-wide-sm text-subtle">Опубликовано</dt>
            <dd className="mt-1 text-[16px]">{formatDate(r.publishedAt)}</dd>
          </div>
          {period ? (
            <div>
              <dt className="label-wide-sm text-subtle">Отчётный период</dt>
              <dd className="mt-1 text-[16px]">{period}</dd>
            </div>
          ) : null}
          {r.isDemo ? (
            <div className="self-end">
              <DemoBadge show />
            </div>
          ) : null}
        </dl>
      </PageHero>

      <div className="container-site grid gap-14 py-14 md:py-20 lg:grid-cols-[1fr_320px] lg:gap-20">
        <div className="min-w-0 space-y-14">
          <section aria-label="Краткое резюме">
            <p className="label-wide-sm mb-3 text-navy-700">Краткое резюме</p>
            <p className="max-w-[760px] font-serif text-[26px] leading-[1.35] md:text-[30px]">{r.summary}</p>
          </section>
          {r.keyFacts?.length ? (
            <dl className="grid grid-cols-2 border-t border-ink md:grid-cols-3">
              {r.keyFacts.map((f, i) => (
                <div key={f.id ?? i} className={`border-b border-rule py-6 pr-4 ${i % 3 !== 0 ? 'md:border-l md:pl-6' : ''} ${i % 2 === 1 ? 'border-l pl-5 md:pl-6' : ''}`}>
                  <dd className="font-serif text-[56px] leading-none text-navy-950">{f.value}</dd>
                  <dt className="mt-2 text-[15px] text-muted">{f.label}</dt>
                </div>
              ))}
            </dl>
          ) : null}
          <RichText data={r.content} className="max-w-[760px]" />
          <DocumentList items={r.documents} title="Прикреплённые документы" />
          {images.length ? (
            <section aria-label="Изображения">
              <h2 className="label-wide mb-5 text-subtle">Изображения</h2>
              <Lightbox items={images} title={r.title} />
            </section>
          ) : null}
        </div>
        <aside className="space-y-12">
          <Related title="Обещания" items={promises.map((p) => ({ href: `/programme/${p.slug}`, kind: 'Обещание', title: p.title, meta: <StatusBadge kind="promise" status={p.status} /> }))} />
          <Related title="События" items={events.map((e) => ({ href: `/events/${e.slug}`, kind: 'Событие', title: e.title, meta: <StatusBadge kind="event" status={effectiveEventStatus(e)} /> }))} />
          <Related title="Бюро идей" items={ideas.map((i) => ({ href: `/ideas/${i.slug}`, kind: 'Проект', title: i.title }))} />
          <div>
            <Link href="/reports" className="label-wide-sm link-draw">
              ← Вся отчётность
            </Link>
          </div>
        </aside>
      </div>
    </article>
  )
}
