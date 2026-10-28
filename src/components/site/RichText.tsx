import type { DefaultNodeTypes, SerializedLinkNode } from '@payloadcms/richtext-lexical'
import { LinkJSXConverter, RichText as LexicalRichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import clsx from 'clsx'
import Image from 'next/image'

import type { Media } from '@/payload-types'
import { mediaDims, mediaUrl } from '@/lib/media'
import { COLLECTION_ROUTE, pathFor } from '@/lib/site'

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const docRef = linkNode.fields.doc
  if (!docRef) return '#'
  const value = docRef.value as { slug?: string } | number | string
  const slug = typeof value === 'object' ? value?.slug : null
  const route = COLLECTION_ROUTE[docRef.relationTo]
  return route && slug ? pathFor(route, slug) : '#'
}

const converters: JSXConvertersFunction<DefaultNodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  upload: ({ node }) => {
    const m = node.value as Media
    if (!m || typeof m !== 'object' || !m.mimeType?.startsWith('image/')) return null
    const src = mediaUrl(m, 'wide')
    const dims = mediaDims(m, 'wide')
    if (!src || !dims) return null
    return (
      <figure>
        <Image src={src} alt={m.alt ?? ''} width={dims.width} height={dims.height} sizes="(min-width: 800px) 760px, 100vw" className="h-auto w-full" />
        {m.caption ? <figcaption>{m.caption}</figcaption> : null}
      </figure>
    )
  },
})

type Data = Parameters<typeof LexicalRichText>[0]['data']

export function RichText({ data, className }: { data?: unknown; className?: string }) {
  const root = (data as { root?: { children?: unknown[] } } | null)?.root
  if (!root?.children?.length) return null
  return <LexicalRichText data={data as Data} converters={converters} className={clsx('prose-official', className)} />
}

export function hasRichText(data?: unknown) {
  const children = (data as { root?: { children?: { children?: unknown[] }[] } } | null)?.root?.children
  return Boolean(children?.some((c) => (c.children?.length ?? 0) > 0 || (c as { type?: string }).type === 'upload'))
}
