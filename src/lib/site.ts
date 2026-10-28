/** Часовой пояс школы: в нём показываются даты и время событий. */
export const SITE_TIMEZONE = process.env.NEXT_PUBLIC_SITE_TIMEZONE || 'Asia/Almaty'

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')

const ROUTES = {
  news: '/news',
  events: '/events',
  promises: '/promises',
  ideas: '/ideas',
  reports: '/reports',
  gallery: '/gallery',
  administration: '/administration',
} as const

export type RouteKey = keyof typeof ROUTES

export const pathFor = (route: RouteKey, slug?: string | null) => (slug ? `${ROUTES[route]}/${slug}` : ROUTES[route])

export const previewUrl = (route: RouteKey, slug?: string | null) => (slug ? `${siteUrl()}${pathFor(route, slug)}` : null)

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
