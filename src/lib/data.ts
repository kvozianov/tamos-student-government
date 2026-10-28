import config from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import type { Album, Category, Event, Idea, Member, News, Promise as PromiseDoc } from '@/payload-types'

import { compareUpcoming, effectiveEventStatus, isUpcoming } from './events'
import { PROMISE_STATUSES, type EventStatus, type NewsCategory, type PromiseStatus, type ReportType } from './status'

export const getClient = cache(async () => getPayload({ config }))

export const getSettings = cache(async () => (await getClient()).findGlobal({ slug: 'settings', depth: 1 }))
export const getHome = cache(async () => (await getClient()).findGlobal({ slug: 'home', depth: 1 }))
export const getIdeasPage = cache(async () => (await getClient()).findGlobal({ slug: 'ideas-page', depth: 1 }))
export const getCampaign = cache(async () => (await getClient()).findGlobal({ slug: 'campaign', depth: 2 }))

const PUBLISHED: Where = { _status: { equals: 'published' } }
const NOT_DEMO: Where = { or: [{ isDemo: { equals: false } }, { isDemo: { exists: false } }] }

/** Общий фильтр публичных запросов: только опубликованное и, при необходимости, без демо-материалов. */
async function publicWhere(parts: (Where | null | undefined | false)[], { drafts = true } = {}): Promise<Where> {
  const settings = await getSettings()
  const and = parts.filter(Boolean) as Where[]
  if (drafts) and.push(PUBLISHED)
  if (settings.showDemo === false) and.push(NOT_DEMO)
  return { and }
}

/**
 * Условие для страницы материала. В режиме предпросмотра (/next/preview, только для вошедших в панель)
 * отдаётся последняя версия, в том числе неопубликованный черновик.
 */
async function bySlug(slug: string): Promise<{ where: Where; draft: boolean }> {
  const { isEnabled } = await draftMode()
  if (isEnabled) return { where: { slug: { equals: slug } }, draft: true }
  return { ...(await bySlug(slug)), draft: false }
}

/* ---------- Администрация ---------- */

export const getPresident = cache(async (): Promise<Member | null> => {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'members',
    where: await publicWhere([{ isPresident: { equals: true } }, { active: { equals: true } }], { drafts: false }),
    depth: 1,
    limit: 1,
  })
  return res.docs[0] ?? null
})

export const getVicePresident = cache(async (): Promise<Member | null> => {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'members',
    where: await publicWhere([{ isVicePresident: { equals: true } }, { active: { equals: true } }], { drafts: false }),
    depth: 1,
    limit: 1,
  })
  return res.docs[0] ?? null
})

/** Команда без президента и вице-президента: они показываются отдельными крупными блоками. */
export const getTeam = cache(async (): Promise<Member[]> => {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'members',
    where: await publicWhere(
      [
        { active: { equals: true } },
        { isPresident: { not_equals: true } },
        { or: [{ isVicePresident: { equals: false } }, { isVicePresident: { exists: false } }] },
      ],
      { drafts: false },
    ),
    sort: ['order', 'name'],
    depth: 1,
    limit: 100,
  })
  return res.docs
})

export async function getMember(slug: string) {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'members',
    where: await publicWhere([{ slug: { equals: slug } }, { active: { equals: true } }], { drafts: false }),
    depth: 2,
    limit: 1,
  })
  return res.docs[0] ?? null
}

/* ---------- Новости ---------- */

export async function getNewsList({ category, q, page = 1, limit = 12 }: { category?: NewsCategory; q?: string; page?: number; limit?: number }) {
  const payload = await getClient()
  return payload.find({
    collection: 'news',
    where: await publicWhere([
      category ? { category: { equals: category } } : null,
      q ? { or: [{ title: { like: q } }, { excerpt: { like: q } }] } : null,
    ]),
    sort: '-publishedAt',
    depth: 1,
    page,
    limit,
  })
}

export const getLatestNews = cache(async (limit = 5): Promise<News[]> => {
  const payload = await getClient()
  const where = await publicWhere([])
  const [featured, latest] = await Promise.all([
    payload.find({ collection: 'news', where: { and: [where, { featured: { equals: true } }] }, sort: '-publishedAt', depth: 1, limit: 1 }),
    payload.find({ collection: 'news', where, sort: '-publishedAt', depth: 1, limit: limit + 1 }),
  ])
  const lead = featured.docs[0] ?? latest.docs[0]
  if (!lead) return []
  return [lead, ...latest.docs.filter((n) => n.id !== lead.id)].slice(0, limit)
})

export async function getNewsItem(slug: string) {
  const payload = await getClient()
  const res = await payload.find({ collection: 'news', ...(await bySlug(slug)), depth: 2, limit: 1 })
  return res.docs[0] ?? null
}

export async function getNewsCategoryCounts() {
  const payload = await getClient()
  const where = await publicWhere([])
  const res = await payload.find({ collection: 'news', where, limit: 0, pagination: false, select: { category: true } })
  const counts: Record<string, number> = {}
  for (const n of res.docs) counts[n.category] = (counts[n.category] ?? 0) + 1
  return { counts, total: res.docs.length }
}

/* ---------- События ---------- */

export type EventWithStatus = Event & { effectiveStatus: EventStatus }

export const getEvents = cache(async (): Promise<EventWithStatus[]> => {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'events',
    where: await publicWhere([]),
    sort: 'startsAt',
    depth: 1,
    limit: 200,
    pagination: false,
  })
  const now = Date.now()
  return res.docs.map((e) => ({ ...e, effectiveStatus: effectiveEventStatus(e, now) }))
})

export async function getUpcomingEvents(limit = 3) {
  const events = await getEvents()
  const now = Date.now()
  return events.filter((e) => isUpcoming(e, now)).sort(compareUpcoming).slice(0, limit)
}

export async function getEvent(slug: string) {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'events',
    ...(await bySlug(slug)),
    depth: 2,
    limit: 1,
    joins: {
      newsJoin: { where: PUBLISHED, sort: '-publishedAt', limit: 6 },
      reportsJoin: { where: PUBLISHED, sort: '-publishedAt', limit: 6 },
      albumsJoin: { where: PUBLISHED, sort: '-date', limit: 6 },
    },
  })
  const ev = res.docs[0]
  return ev ? { ...ev, effectiveStatus: effectiveEventStatus(ev) } : null
}

/* ---------- Обещания ---------- */

export const getCategories = cache(async (): Promise<Category[]> => {
  const payload = await getClient()
  const res = await payload.find({ collection: 'categories', sort: ['order', 'title'], limit: 100, pagination: false })
  return res.docs
})

export const getPromises = cache(async (): Promise<PromiseDoc[]> => {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'promises',
    where: await publicWhere([]),
    sort: ['order', 'title'],
    depth: 1,
    limit: 500,
    pagination: false,
  })
  return res.docs
})

export type PromiseStats = {
  total: number
  byStatus: Record<PromiseStatus, number>
  done: number
  inWork: number
  awaiting: number
  planned: number
}

export function computePromiseStats(list: Pick<PromiseDoc, 'status'>[]): PromiseStats {
  const byStatus = Object.fromEntries(Object.keys(PROMISE_STATUSES).map((k) => [k, 0])) as Record<PromiseStatus, number>
  for (const p of list) byStatus[p.status as PromiseStatus] = (byStatus[p.status as PromiseStatus] ?? 0) + 1
  return {
    total: list.length,
    byStatus,
    done: byStatus.done,
    inWork: byStatus.agreed + byStatus.in_progress,
    awaiting: byStatus.review,
    planned: byStatus.planned,
  }
}

export async function getPromise(slug: string) {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'promises',
    ...(await bySlug(slug)),
    depth: 2,
    limit: 1,
    joins: {
      eventsJoin: { where: PUBLISHED, sort: 'startsAt', limit: 10 },
      reportsJoin: { where: PUBLISHED, sort: '-publishedAt', limit: 10 },
      newsJoin: { where: PUBLISHED, sort: '-publishedAt', limit: 10 },
    },
  })
  return res.docs[0] ?? null
}

/* ---------- Бюро идей ---------- */

export const getIdeas = cache(async (): Promise<Idea[]> => {
  const payload = await getClient()
  const res = await payload.find({ collection: 'ideas', where: await publicWhere([]), sort: '-submittedAt', depth: 1, limit: 100, pagination: false })
  return res.docs
})

export async function getIdea(slug: string) {
  const payload = await getClient()
  const res = await payload.find({ collection: 'ideas', ...(await bySlug(slug)), depth: 2, limit: 1 })
  return res.docs[0] ?? null
}

/* ---------- Отчётность ---------- */

export async function getReports(type?: ReportType) {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'reports',
    where: await publicWhere([type ? { type: { equals: type } } : null]),
    sort: '-publishedAt',
    depth: 1,
    limit: 100,
    pagination: false,
  })
  return res.docs
}

export async function getReport(slug: string) {
  const payload = await getClient()
  const res = await payload.find({ collection: 'reports', ...(await bySlug(slug)), depth: 2, limit: 1 })
  return res.docs[0] ?? null
}

/* ---------- Галерея ---------- */

export const getAlbums = cache(async (): Promise<Album[]> => {
  const payload = await getClient()
  const res = await payload.find({ collection: 'albums', where: await publicWhere([]), sort: '-date', depth: 1, limit: 200, pagination: false })
  return res.docs
})

export async function getAlbum(slug: string) {
  const payload = await getClient()
  const res = await payload.find({ collection: 'albums', ...(await bySlug(slug)), depth: 2, limit: 1 })
  return res.docs[0] ?? null
}

/* ---------- Итоги и поиск ---------- */

export async function getResultsSummary() {
  const [promises, events, ideas, reports] = await Promise.all([getPromises(), getEvents(), getIdeas(), getReports()])
  return {
    promisesDone: promises.filter((p) => p.status === 'done').length,
    promisesTotal: promises.length,
    eventsHeld: events.filter((e) => e.effectiveStatus === 'completed').length,
    ideasImplemented: ideas.filter((i) => i.status === 'implemented').length,
    reportsPublished: reports.length,
    latestReports: reports.slice(0, 3),
  }
}

export type SearchHit = { kind: string; title: string; href: string; excerpt?: string | null; date?: string | null }

export async function searchSite(q: string): Promise<SearchHit[]> {
  const query = q.trim()
  if (query.length < 2) return []
  const payload = await getClient()
  const like = (fields: string[]) => ({ or: fields.map((f) => ({ [f]: { like: query } })) }) as Where
  const [news, events, promises, reports, ideas] = await Promise.all([
    payload.find({ collection: 'news', where: await publicWhere([like(['title', 'excerpt'])]), limit: 10, depth: 0 }),
    payload.find({ collection: 'events', where: await publicWhere([like(['title', 'summary'])]), limit: 10, depth: 0 }),
    payload.find({ collection: 'promises', where: await publicWhere([like(['title', 'summary'])]), limit: 10, depth: 0 }),
    payload.find({ collection: 'reports', where: await publicWhere([like(['title', 'summary'])]), limit: 10, depth: 0 }),
    payload.find({ collection: 'ideas', where: await publicWhere([like(['title', 'summary'])]), limit: 10, depth: 0 }),
  ])
  return [
    ...news.docs.map((d) => ({ kind: 'Новость', title: d.title, href: `/news/${d.slug}`, excerpt: d.excerpt, date: d.publishedAt })),
    ...events.docs.map((d) => ({ kind: 'Событие', title: d.title, href: `/events/${d.slug}`, excerpt: d.summary, date: d.startsAt })),
    ...promises.docs.map((d) => ({ kind: 'Обещание', title: d.title, href: `/programme/${d.slug}`, excerpt: d.summary })),
    ...reports.docs.map((d) => ({ kind: 'Отчёт', title: d.title, href: `/reports/${d.slug}`, excerpt: d.summary, date: d.publishedAt })),
    ...ideas.docs.map((d) => ({ kind: 'Бюро идей', title: d.title, href: `/ideas/${d.slug}`, excerpt: d.summary })),
  ]
}

export type { PromiseDoc }
