/** Часовой пояс школы: в нём показываются даты и время событий. */
export const SITE_TIMEZONE = process.env.NEXT_PUBLIC_SITE_TIMEZONE || 'Asia/Almaty'

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')

const ROUTES = {
  news: '/news',
  events: '/events',
  promises: '/programme',
  ideas: '/ideas',
  reports: '/reports',
  gallery: '/gallery',
  administration: '/team',
} as const

export type RouteKey = keyof typeof ROUTES

export const pathFor = (route: RouteKey, slug?: string | null) => (slug ? `${ROUTES[route]}/${slug}` : ROUTES[route])

/** Только адреса внутри сайта: защищает от открытого редиректа на чужой домен. */
export const safePath = (value: string | null) => (value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : '/')

/**
 * Ссылка из CMS (бегущая строка, инициативы кампании): путь внутри сайта или полный адрес http(s).
 * Всё остальное — javascript:, //чужой-домен, адреса с пробелами — отбрасывается, возвращается null.
 */
export const safeHref = (value: string | null | undefined): string | null => {
  if (!value || /[\s\\]/.test(value)) return null
  if (value.startsWith('/')) return safePath(value) === value ? value : null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? value : null
  } catch {
    return null
  }
}

/** Кнопка «Предпросмотр» в панели: включает режим черновиков и открывает страницу материала. */
export const previewUrl = (route: RouteKey, slug?: string | null) =>
  slug ? `${siteUrl()}/next/preview?path=${encodeURIComponent(pathFor(route, slug))}` : null

/** Коллекция Payload → публичный путь. Используется для внутренних ссылок в тексте. */
export const COLLECTION_ROUTE: Record<string, RouteKey> = {
  news: 'news',
  events: 'events',
  promises: 'promises',
  ideas: 'ideas',
  reports: 'reports',
  albums: 'gallery',
  members: 'administration',
}
