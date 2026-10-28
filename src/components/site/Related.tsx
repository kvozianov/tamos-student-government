import Link from 'next/link'

export type RelatedItem = { href: string; kind: string; title: string; meta?: React.ReactNode }

export function Related({ title, items }: { title: string; items: RelatedItem[] }) {
  if (!items.length) return null
  return (
    <section aria-label={title}>
      <h2 className="label-wide mb-4 text-subtle">{title}</h2>
      <ul className="border-t border-rule">
        {items.map((it) => (
          <li key={it.href} className="group relative border-b border-rule py-4">
            <p className="label-wide-sm text-subtle">{it.kind}</p>
            <Link href={it.href} className="mt-1 block font-serif text-[21px] leading-snug after:absolute after:inset-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
              {it.title}
            </Link>
            {it.meta ? <div className="mt-2">{it.meta}</div> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
