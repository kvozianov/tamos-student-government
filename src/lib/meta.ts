import type { Metadata } from 'next'

import { asMedia, mediaUrl } from './media'

type Args = { title: string; description?: string | null; image?: unknown; path: string; type?: 'website' | 'article'; publishedTime?: string | null }

export function pageMeta({ title, description, image, path, type = 'website', publishedTime }: Args): Metadata {
  const og = mediaUrl(asMedia(image), 'og')
  return {
    title,
    description: description ?? undefined,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: description ?? undefined,
      url: path,
      type,
      ...(publishedTime ? { publishedTime } : {}),
      ...(og ? { images: [{ url: og, width: 1200, height: 630 }] } : {}),
    },
  }
}
