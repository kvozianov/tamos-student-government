import clsx from 'clsx'

import { Breadcrumbs, type Crumb } from './Breadcrumbs'

type Props = {
  title: string
  lead?: string | null
  eyebrow?: string
  crumbs: Crumb[]
  children?: React.ReactNode
  align?: 'center' | 'left'
  size?: 'lg' | 'md'
}

/** Шапка внутренних страниц: крупный серифный заголовок по центру, как на whitehouse.gov, в белом исполнении. */
export function PageHero({ title, lead, eyebrow, crumbs, children, align = 'center', size = 'lg' }: Props) {
  return (
    <section className="border-b border-rule bg-paper text-ink">
      <div className="container-site pt-7 pb-0">
        <Breadcrumbs items={crumbs} onDark={false} />
      </div>
      <div className={clsx('container-site', size === 'lg' ? 'pt-12 pb-14 md:pt-16 md:pb-20' : 'pt-10 pb-12 md:pt-12 md:pb-14', align === 'center' && 'text-center')}>
        <div className="animate-rise">
          {eyebrow ? <p className="label-wide mb-5 text-navy-700">{eyebrow}</p> : null}
          <h1
            className={clsx(
              'font-serif leading-[0.98] text-ink',
              size === 'lg' ? 'text-[52px] md:text-[96px]' : 'text-[42px] md:text-[72px]',
              align === 'center' && 'mx-auto max-w-5xl',
            )}
          >
            {title}
          </h1>
          {lead ? (
            <p className={clsx('mt-6 text-[18px] leading-relaxed text-muted md:text-[20px]', align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-3xl')}>{lead}</p>
          ) : null}
        </div>
        {children ? <div className="mt-10 md:mt-12">{children}</div> : null}
      </div>
    </section>
  )
}
