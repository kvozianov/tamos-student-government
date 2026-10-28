import type { Metadata } from 'next'

import { AlbumCard } from '@/components/site/cards'
import { EmptyState } from '@/components/site/EmptyState'
import { FilterTabs } from '@/components/site/FilterTabs'
import { PageHero } from '@/components/site/PageHero'
import { Reveal } from '@/components/site/Reveal'
import { getAlbums } from '@/lib/data'
import { dateParts } from '@/lib/format'
import { pageMeta } from '@/lib/meta'

export const galleryMeta: Metadata = pageMeta({ title: 'Галерея', description: 'Фотографии и видео с мероприятий президентской администрации TAMOS.', path: '/gallery' })

/** Страница «Галерея». Фильтр приходит из адреса: /gallery?year=… (см. rewrites в next.config.ts). */
export async function GalleryView({ year }: { year?: string }) {
  const albums = await getAlbums()
  const years = [...new Set(albums.map((a) => dateParts(a.date).year))].sort((a, b) => Number(b) - Number(a))
  const list = year ? albums.filter((a) => dateParts(a.date).year === year) : albums
  const tabs = [{ label: 'Все', href: '/gallery', active: !year, count: albums.length }, ...years.map((y) => ({ label: y, href: `/gallery?year=${y}`, active: year === y }))]
  return (
    <>
      <PageHero title="Галерея" lead="Фотографии и видео с мероприятий, сгруппированные по событиям." crumbs={[{ label: 'Галерея' }]}>
        {years.length > 1 ? <FilterTabs tabs={tabs} label="Годы" /> : null}
      </PageHero>
      <div className="container-site py-14 md:py-20">
        {list.length ? (
          <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {list.map((a, i) => (
              <Reveal key={a.id} delay={(i % 3) * 0.06}>
                <AlbumCard album={a} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState title="Альбомов пока нет" text="Фотографии появятся после первых мероприятий." />
        )}
      </div>
    </>
  )
}
