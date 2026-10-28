import { EVENT_STATUSES, NEWS_CATEGORIES, PROMISE_STATUSES, REPORT_TYPES } from './status'

/**
 * Фильтры списков (/programme?status=…, /events?status=… и т. п.) без потери кэша.
 *
 * Страница, которая читает searchParams, рендерится заново на каждый запрос. Поэтому страницы разделов
 * параметры не читают и отдаются из кэша (ISR), а запросы с фильтром next.config.ts переписывает (rewrites)
 * на служебные страницы /filtered/<раздел>/<значения>: значения фильтра становятся частью пути, и каждая
 * комбинация тоже кэшируется. Адрес в браузере не меняется.
 *
 * Переписываются только допустимые значения. Остальные открывают раздел без фильтра, как и раньше.
 *
 * Важно: ссылки на списки с фильтром должны быть обычными <a>, а не next/link. Клиентский роутер Next
 * считает статичную /programme независимой от параметров адреса и показал бы её без фильтра, не спросив
 * сервер. Компонент SiteLink (src/components/site/SiteLink.tsx) выбирает нужный вариант сам.
 *
 * Файл импортируется из next.config.ts, поэтому импорты здесь только относительные.
 */

/** Сегмент пути для незаданного фильтра. */
export const ANY = '-'

/** Значение фильтра из сегмента пути служебной страницы. */
export const fromSegment = (value: string) => (value === ANY ? undefined : decodeURIComponent(value))

type QueryHas = { type: 'query'; key: string; value?: string }
type FilterRewrite = { source: string; has: QueryHas[]; destination: string }

/** Параметр адреса, значение которого попадает в путь как :key. */
const param = (key: string, pattern: string): QueryHas => ({ type: 'query', key, value: `(?<${key}>${pattern})` })
const oneOf = (dict: object) => Object.keys(dict).join('|')

const SLUG = '[a-z0-9-]{1,80}'
const PAGE = '[1-9][0-9]{0,3}'
const YEAR = '[0-9]{4}'

/** Порядок важен: срабатывает первое подходящее правило, поэтому сочетания фильтров идут раньше одиночных. */
export const filterRewrites: FilterRewrite[] = [
  // Поиск по новостям зависит от произвольного текста, поэтому остаётся динамическим, как /search.
  { source: '/news', has: [{ type: 'query', key: 'q' }], destination: '/filtered/news/search' },
  { source: '/news', has: [param('category', oneOf(NEWS_CATEGORIES)), param('page', PAGE)], destination: '/filtered/news/:category/:page' },
  { source: '/news', has: [param('category', oneOf(NEWS_CATEGORIES))], destination: '/filtered/news/:category/1' },
  { source: '/news', has: [param('page', PAGE)], destination: `/filtered/news/${ANY}/:page` },

  { source: '/programme', has: [param('category', SLUG), param('status', oneOf(PROMISE_STATUSES))], destination: '/filtered/programme/:category/:status' },
  { source: '/programme', has: [param('category', SLUG)], destination: `/filtered/programme/:category/${ANY}` },
  { source: '/programme', has: [param('status', oneOf(PROMISE_STATUSES))], destination: `/filtered/programme/${ANY}/:status` },

  { source: '/events', has: [param('status', oneOf(EVENT_STATUSES))], destination: '/filtered/events/:status' },
  { source: '/reports', has: [param('type', oneOf(REPORT_TYPES))], destination: '/filtered/reports/:type' },
  { source: '/gallery', has: [param('year', YEAR)], destination: '/filtered/gallery/:year' },
]

/** Ведёт ли ссылка на список с фильтром, то есть на одну из служебных страниц выше. */
export function isFilteredListHref(href: string) {
  const [pathAndQuery] = href.split('#')
  const start = pathAndQuery.indexOf('?')
  if (start === -1) return false
  const pathname = pathAndQuery.slice(0, start)
  const params = new URLSearchParams(pathAndQuery.slice(start + 1))
  return filterRewrites.some((rule) => rule.source === pathname && rule.has.every((h) => params.has(h.key)))
}
