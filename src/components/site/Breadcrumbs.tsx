import clsx from 'clsx'

import { jsonLdHtml } from '@/lib/json-ld'
import { siteUrl } from '@/lib/site'

import { SiteLink } from './SiteLink'

export type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items, onDark = false }: { items: Crumb[]; onDark?: boolean }) {
  const all: Crumb[] = [{ label: 'Главная', href: '/' }, ...items]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${siteUrl()}${c.href}` } : {}),
    })),
  }
  return (
    <nav aria-label="Навигационная цепочка" className={clsx('label-wide-sm', onDark ? 'text-white/55' : 'text-subtle')}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {all.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-2">
            {i > 0 ? <span aria-hidden="true">/</span> : null}
            {c.href && i < all.length - 1 ? (
              <SiteLink href={c.href} className={clsx('link-draw', onDark ? 'hover:text-white' : 'hover:text-ink')}>
                {c.label}
              </SiteLink>
            ) : (
              <span aria-current={i === all.length - 1 ? 'page' : undefined} className={onDark ? 'text-white/85' : 'text-ink'}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />
    </nav>
  )
}
