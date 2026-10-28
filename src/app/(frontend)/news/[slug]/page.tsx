import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { NewsRow } from '@/components/site/cards'
import { DemoBadge } from '@/components/site/DemoBadge'
import { Lightbox } from '@/components/site/Lightbox'
import { MediaImage } from '@/components/site/MediaImage'
import { PageHero } from '@/components/site/PageHero'
import { Related } from '@/components/site/Related'
import { RichText } from '@/components/site/RichText'
import { StatusBadge } from '@/components/site/StatusBadge'
import { VideoEmbed } from '@/components/site/VideoEmbed'
import type { Event, Idea, Promise as PromiseDoc } from '@/payload-types'
import { getNewsItem, getNewsList } from '@/lib/data'
import { effectiveEventStatus } from '@/lib/events'
import { formatDate } from '@/lib/format'
import { mediaListToGallery } from '@/lib/gallery'
import { asMedia, mediaUrl } from '@/lib/media'
import { pageMeta } from '@/lib/meta'
import { docs } from '@/lib/rel'
import { siteUrl } from '@/lib/site'
import { NEWS_CATEGORIES, type NewsCategory } from '@/lib/status'

// Страница собирается при первом посещении и дальше отдаётся из кэша (ISR), как и остальной сайт.
export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getNewsItem((await params).slug)
  if (!item) return { title: 'Материал не найден' }
  return pageMeta({ title: item.title, description: item.excerpt, image: item.cover, path: `/news/${item.slug}`, type: 'article', publishedTime: item.publishedAt })
}

export default async function NewsArticle({ params }: Props) {
  const item = await getNewsItem((await params).slug)
  if (!item) notFound()
  const more = (await getNewsList({ limit: 4 })).docs.filter((n) => n.id !== item.id).slice(0, 3)
  const gallery = mediaListToGallery(item.gallery)
  const cover = asMedia(item.cover)
  const events = docs<Event>(item.relatedEvents)
  const promises = docs<PromiseDoc>(item.relatedPromises)
  const ideas = docs<Idea>(item.relatedIdeas)
  const category = NEWS_CATEGORIES[item.category as NewsCategory]
  const coverPath = mediaUrl(cover, 'og')
  const coverAbs = coverPath ? (coverPath.startsWith('http') ? coverPath : `${siteUrl()}${coverPath}`) : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    datePublished: item.publishedAt,
    dateModified: item.updatedAt,
    description: item.excerpt,
    mainEntityOfPage: `${siteUrl()}/news/${item.slug}`,
    ...(coverAbs ? { image: [coverAbs] } : {}),
  }

  return (
    <article>
      <PageHero title={item.title} eyebrow={category} crumbs={[{ label: 'Новости', href: '/news' }, { label: category, href: `/news?category=${item.category}` }, { label: item.title }]} size="md">
        <p className="flex items-center justify-center gap-4 text-[15px] text-muted">
          <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
          <DemoBadge show={item.isDemo} />
        </p>
      </PageHero>

      {cover ? (
        <div className="container-site -mt-0 pt-12 md:pt-16">
          <figure>
            <MediaImage media={cover} size="wide" className="aspect-[16/9]" sizes="(min-width: 1320px) 1224px, 100vw" priority />
            {cover.caption || cover.credit ? (
              <figcaption className="mt-3 text-[14px] text-subtle">
                {cover.caption}
                {cover.credit ? ` · Фото: ${cover.credit}` : ''}
              </figcaption>
            ) : null}
          </figure>
        </div>
      ) : null}

      <div className="container-site grid gap-14 py-14 md:py-20 lg:grid-cols-[1fr_300px] lg:gap-20">
        <div className="min-w-0 max-w-[760px]">
          <p className="mb-10 font-serif text-[26px] leading-[1.35] text-ink md:text-[30px]">{item.excerpt}</p>
          <RichText data={item.content} />
          {item.videoUrl ? (
            <div className="mt-12">
              <VideoEmbed url={item.videoUrl} title={item.title} />
            </div>
          ) : null}
          {gallery.length ? (
            <section className="mt-14" aria-label="Фотографии">
              <h2 className="label-wide mb-5 text-subtle">Фотографии</h2>
              <Lightbox items={gallery} title={item.title} />
            </section>
          ) : null}
        </div>
        <aside className="space-y-12 lg:pt-2">
          <Related
            title="События"
            items={events.map((e) => ({ href: `/events/${e.slug}`, kind: 'Событие', title: e.title, meta: <StatusBadge kind="event" status={effectiveEventStatus(e)} /> }))}
          />
          <Related
            title="Обещания"
            items={promises.map((p) => ({ href: `/promises/${p.slug}`, kind: 'Обещание', title: p.title, meta: <StatusBadge kind="promise" status={p.status} /> }))}
          />
          <Related title="Бюро идей" items={ideas.map((i) => ({ href: `/ideas/${i.slug}`, kind: 'Проект', title: i.title }))} />
          <div>
            <Link href="/news" className="label-wide-sm link-draw text-ink">
              ← Все новости
            </Link>
          </div>
        </aside>
      </div>

      {more.length ? (
        <section className="border-t border-rule bg-mist py-16 md:py-20" aria-label="Другие материалы">
          <div className="container-site">
            <h2 className="label-wide mb-6 text-subtle">Другие материалы</h2>
            <div className="border-t border-ink">
              {more.map((n) => (
                <NewsRow key={n.id} item={n} withImage />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  )
}
