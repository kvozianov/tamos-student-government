import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DemoBadge } from '@/components/site/DemoBadge'
import { Lightbox } from '@/components/site/Lightbox'
import { MediaImage } from '@/components/site/MediaImage'
import { PageHero } from '@/components/site/PageHero'
import { ProcessSteps } from '@/components/site/ProcessSteps'
import { Related } from '@/components/site/Related'
import { RichText } from '@/components/site/RichText'
import { StatusBadge } from '@/components/site/StatusBadge'
import type { Event, Promise as PromiseDoc } from '@/payload-types'
import { getIdea, getIdeasPage } from '@/lib/data'
import { effectiveEventStatus } from '@/lib/events'
import { formatDate } from '@/lib/format'
import { mediaListToGallery } from '@/lib/gallery'
import { pageMeta } from '@/lib/meta'
import { docs } from '@/lib/rel'
import { IDEA_STATUSES, type IdeaStatus } from '@/lib/status'

// Страница собирается при первом посещении и дальше отдаётся из кэша (ISR), как и остальной сайт.
export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idea = await getIdea((await params).slug)
  if (!idea) return { title: 'Проект не найден' }
  return pageMeta({ title: idea.title, description: idea.summary, image: idea.cover, path: `/ideas/${idea.slug}` })
}

export default async function IdeaPage({ params }: Props) {
  const [idea, page] = await Promise.all([getIdea((await params).slug), getIdeasPage()])
  if (!idea) notFound()
  const order = Object.keys(IDEA_STATUSES) as IdeaStatus[]
  const stage = Math.min(order.indexOf(idea.status as IdeaStatus), 4)
  const photos = mediaListToGallery(idea.gallery)
  const events = docs<Event>(idea.relatedEvents)
  const promises = docs<PromiseDoc>(idea.relatedPromises)

  return (
    <article>
      <PageHero title={idea.title} lead={idea.summary} eyebrow="Бюро идей" crumbs={[{ label: 'Бюро идей', href: '/ideas' }, { label: idea.title }]} align="left" size="md">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <StatusBadge kind="idea" status={idea.status} className="text-[12px]" />
          <DemoBadge show={idea.isDemo} />
          <span className="label-wide-sm text-subtle">Автор: {idea.author}</span>
          {idea.submittedAt ? <span className="label-wide-sm text-subtle">Подана {formatDate(idea.submittedAt)}</span> : null}
        </div>
      </PageHero>

      <div className="container-site py-14 md:py-20">
        {page.steps?.length ? (
          <section aria-label="Этап проекта" className="mb-16">
            <ProcessSteps steps={page.steps.map((s) => ({ title: s.title }))} activeIndex={idea.status === 'implemented' ? 4 : stage} />
          </section>
        ) : null}

        <div className="grid gap-14 lg:grid-cols-[1fr_320px] lg:gap-20">
          <div className="min-w-0 space-y-14">
            {idea.cover ? <MediaImage media={idea.cover} size="wide" className="aspect-[16/9]" sizes="(min-width: 1200px) 860px, 100vw" priority /> : null}
            {idea.result ? (
              <section aria-label="Результат" className="border-l-2 border-navy-700 pl-6">
                <p className="label-wide-sm text-navy-700">Результат</p>
                <p className="mt-3 font-serif text-[28px] leading-snug">{idea.result}</p>
              </section>
            ) : null}
            <RichText data={idea.content} className="max-w-[760px]" />
            {photos.length ? <Lightbox items={photos} title={idea.title} /> : null}
          </div>
          <aside className="space-y-12">
            <Related title="Связанные обещания" items={promises.map((p) => ({ href: `/promises/${p.slug}`, kind: 'Обещание', title: p.title, meta: <StatusBadge kind="promise" status={p.status} /> }))} />
            <Related title="События" items={events.map((e) => ({ href: `/events/${e.slug}`, kind: 'Событие', title: e.title, meta: <StatusBadge kind="event" status={effectiveEventStatus(e)} /> }))} />
            <div>
              <Link href="/ideas" className="label-wide-sm link-draw">
                ← Все проекты
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}
