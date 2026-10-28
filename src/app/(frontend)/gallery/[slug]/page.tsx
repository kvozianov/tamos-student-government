import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DemoBadge } from '@/components/site/DemoBadge'
import { EmptyState } from '@/components/site/EmptyState'
import { Lightbox } from '@/components/site/Lightbox'
import { PageHero } from '@/components/site/PageHero'
import type { Event } from '@/payload-types'
import { getAlbum } from '@/lib/data'
import { formatDate, plural } from '@/lib/format'
import { albumItems } from '@/lib/gallery'
import { pageMeta } from '@/lib/meta'
import { doc } from '@/lib/rel'

// Страница собирается при первом посещении и дальше отдаётся из кэша (ISR), как и остальной сайт.
export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const album = await getAlbum((await params).slug)
  if (!album) return { title: 'Альбом не найден' }
  return pageMeta({ title: album.title, description: album.description, image: album.cover ?? album.items?.[0]?.media, path: `/gallery/${album.slug}` })
}

export default async function AlbumPage({ params }: Props) {
  const album = await getAlbum((await params).slug)
  if (!album) notFound()
  const items = albumItems(album)
  const ev = doc<Event>(album.event)
  return (
    <>
      <PageHero title={album.title} lead={album.description} crumbs={[{ label: 'Галерея', href: '/gallery' }, { label: album.title }]} size="md">
        <p className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[15px] text-muted">
          <time dateTime={album.date}>{formatDate(album.date)}</time>
          <span>
            {items.length} {plural(items.length, ['материал', 'материала', 'материалов'])}
          </span>
          {ev ? (
            <Link href={`/events/${ev.slug}`} className="link-draw text-navy-700">
              Событие: {ev.title}
            </Link>
          ) : null}
          <DemoBadge show={album.isDemo} />
        </p>
      </PageHero>
      <div className="container-site py-12 md:py-16">
        {items.length ? <Lightbox items={items} title={album.title} /> : <EmptyState title="Фотографии появятся позже" text="Альбом создан, материалы ещё загружаются." />}
        <div className="mt-14">
          <Link href="/gallery" className="label-wide-sm link-draw">
            ← Все альбомы
          </Link>
        </div>
      </div>
    </>
  )
}
