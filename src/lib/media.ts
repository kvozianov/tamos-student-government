import type { Media } from '@/payload-types'

import { siteUrl } from './site'

export type SizeName = 'thumbnail' | 'card' | 'wide' | 'og'

export const asMedia = (value: unknown): Media | null =>
  value && typeof value === 'object' && 'id' in (value as object) ? (value as Media) : null

export const isVideo = (m?: Media | null) => Boolean(m?.mimeType?.startsWith('video/'))
export const isImage = (m?: Media | null) => Boolean(m?.mimeType?.startsWith('image/'))

/**
 * Payload отдаёт полный адрес файла (с serverURL). Для собственных файлов оставляем относительный путь:
 * так next/image оптимизирует их как локальные, а сайт работает на любом домене.
 * Адреса внешнего хранилища (Vercel Blob) остаются полными.
 */
export function toSitePath(url?: string | null) {
  if (!url) return null
  const base = siteUrl()
  if (url.startsWith(base)) return url.slice(base.length) || '/'
  const m = url.match(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(\/api\/.*)$/)
  return m ? m[1] : url
}

export function mediaUrl(m?: Media | null, size?: SizeName) {
  if (!m) return null
  const sized = size ? m.sizes?.[size]?.url : null
  return toSitePath(sized || m.url || null)
}

export function mediaDims(m?: Media | null, size?: SizeName) {
  if (!m) return null
  const s = size ? m.sizes?.[size] : null
  const width = s?.width || m.width
  const height = s?.height || m.height
  return width && height ? { width, height } : null
}
