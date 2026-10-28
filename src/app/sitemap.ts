import type { MetadataRoute } from 'next'

import { getAlbums, getEvents, getIdeas, getNewsList, getPromises, getReports, getTeam, getPresident } from '@/lib/data'
import { siteUrl } from '@/lib/site'

// Карта сайта не зависит от времени: обновляется раз в час и сразу после правок в CMS.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const [news, events, promises, ideas, reports, albums, team, president] = await Promise.all([
    getNewsList({ limit: 1000 }),
    getEvents(),
    getPromises(),
    getIdeas(),
    getReports(),
    getAlbums(),
    getTeam(),
    getPresident(),
  ])
  const statics = ['', '/team', '/news', '/events', '/programme', '/ideas', '/gallery', '/campaign', '/reports'].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: 'daily' as const,
    priority: p === '' ? 1 : 0.8,
  }))
  const entry = (path: string, updatedAt?: string) => ({ url: `${base}${path}`, lastModified: updatedAt ? new Date(updatedAt) : undefined })
  return [
    ...statics,
    ...news.docs.map((d) => entry(`/news/${d.slug}`, d.updatedAt)),
    ...events.map((d) => entry(`/events/${d.slug}`, d.updatedAt)),
    ...promises.map((d) => entry(`/programme/${d.slug}`, d.updatedAt)),
    ...ideas.map((d) => entry(`/ideas/${d.slug}`, d.updatedAt)),
    ...reports.map((d) => entry(`/reports/${d.slug}`, d.updatedAt)),
    ...albums.map((d) => entry(`/gallery/${d.slug}`, d.updatedAt)),
    ...[president, ...team].filter(Boolean).map((d) => entry(`/team/${d!.slug}`, d!.updatedAt)),
  ]
}
