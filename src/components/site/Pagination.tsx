import clsx from 'clsx'

import { SiteLink } from './SiteLink'

export function Pagination({ page, totalPages, hrefFor }: { page: number; totalPages: number; hrefFor: (p: number) => string }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
  return (
    <nav aria-label="Страницы" className="mt-14 flex items-center justify-center gap-1">
      {page > 1 ? (
        <SiteLink href={hrefFor(page - 1)} className="label-wide-sm px-4 py-3 text-muted hover:text-ink">
          ← Назад
        </SiteLink>
      ) : null}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && p - pages[i - 1] > 1 ? <span className="px-2 text-subtle">…</span> : null}
          <SiteLink
            href={hrefFor(p)}
            aria-current={p === page ? 'page' : undefined}
            className={clsx('label-wide-sm flex size-11 items-center justify-center tabular-nums', p === page ? 'bg-navy-900 text-white' : 'text-muted hover:bg-mist hover:text-ink')}
          >
            {p}
          </SiteLink>
        </span>
      ))}
      {page < totalPages ? (
        <SiteLink href={hrefFor(page + 1)} className="label-wide-sm px-4 py-3 text-muted hover:text-ink">
          Дальше →
        </SiteLink>
      ) : null}
    </nav>
  )
}
