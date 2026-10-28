import type { Document } from '@/payload-types'
import { formatFileSize } from '@/lib/format'
import { toSitePath } from '@/lib/media'

const ext = (d: Document) => (d.filename?.split('.').pop() ?? '').toUpperCase()

export function DocumentList({ items, title = 'Документы' }: { items: unknown; title?: string }) {
  const list = (Array.isArray(items) ? items : []).filter((d): d is Document => Boolean(d && typeof d === 'object' && (d as Document).url))
  if (!list.length) return null
  return (
    <section aria-label={title}>
      <h2 className="label-wide mb-4 text-subtle">{title}</h2>
      <ul className="border-t border-rule">
        {list.map((d) => (
          <li key={d.id} className="border-b border-rule">
            <a href={toSitePath(d.url) ?? '#'} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-5 py-4">
              <span className="label-wide-sm flex h-11 w-11 shrink-0 items-center justify-center border border-rule text-muted group-hover:border-navy-800 group-hover:text-navy-800">
                {ext(d) || 'FILE'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-medium text-ink group-hover:underline">{d.title}</span>
                {d.description ? <span className="block text-[14px] text-muted">{d.description}</span> : null}
              </span>
              <span className="label-wide-sm shrink-0 text-subtle">{formatFileSize(d.filesize)}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
