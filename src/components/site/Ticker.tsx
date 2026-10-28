import { SiteLink } from './SiteLink'

type Item = { text: string; href?: string | null }

export function Ticker({ items }: { items: Item[] }) {
  if (!items.length) return null
  const loop = [...items, ...items, ...items, ...items]
  return (
    <div className="ticker relative h-[30px] overflow-hidden border-b border-rule bg-paper text-ink">
      <div className="ticker-track flex h-full w-max items-center whitespace-nowrap">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex items-center" aria-hidden={copy === 1 ? 'true' : undefined}>
            {loop.map((item, i) => (
              <li key={`${copy}-${i}`} className="label-wide-sm flex items-center">
                {item.href ? (
                  <SiteLink href={item.href} tabIndex={copy === 1 || i >= items.length ? -1 : undefined} className="px-5 hover:underline">
                    {item.text}
                  </SiteLink>
                ) : (
                  <span className="px-5">{item.text}</span>
                )}
                <span aria-hidden="true" className="text-subtle">
                  •
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
