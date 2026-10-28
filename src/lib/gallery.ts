import type { GalleryItem } from '@/components/site/Lightbox'
import type { Album, Media } from '@/payload-types'

import { asMedia, mediaDims, mediaUrl, toSitePath } from './media'
import { youtubeId, youtubeThumb } from './youtube'

export function mediaToGalleryItem(m: Media, caption?: string | null, key?: string): GalleryItem | null {
  if (m.mimeType?.startsWith('image/')) {
    const src = mediaUrl(m, 'card')
    const dims = mediaDims(m, 'card')
    if (!src) return null
    return { id: key ?? String(m.id), type: 'image', src, full: mediaUrl(m, 'wide'), width: dims?.width, height: dims?.height, alt: m.alt ?? '', caption: caption ?? m.caption }
  }
  if (m.mimeType?.startsWith('video/') && m.url) {
    return { id: key ?? String(m.id), type: 'video', src: toSitePath(m.url)!, alt: m.alt ?? '', caption: caption ?? m.caption }
  }
  return null
}

export function albumItems(album: Album): GalleryItem[] {
  return (album.items ?? [])
    .map((item, i): GalleryItem | null => {
      if (item.kind === 'youtube') {
        const id = youtubeId(item.youtubeUrl)
        return id ? { id: item.id ?? `yt-${i}`, type: 'youtube', src: youtubeThumb(id), youtubeId: id, alt: item.caption ?? 'Видео', caption: item.caption } : null
      }
      const m = asMedia(item.media)
      return m ? mediaToGalleryItem(m, item.caption, item.id ?? `m-${i}`) : null
    })
    .filter((x): x is GalleryItem => Boolean(x))
}

export function mediaListToGallery(list: unknown): GalleryItem[] {
  if (!Array.isArray(list)) return []
  return list.map((v) => asMedia(v)).filter((m): m is Media => Boolean(m)).map((m) => mediaToGalleryItem(m)).filter((x): x is GalleryItem => Boolean(x))
}
