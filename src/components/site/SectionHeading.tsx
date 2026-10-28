import clsx from 'clsx'

import { ArrowLink } from './ArrowLink'
import { Reveal } from './Reveal'

type Props = {
  eyebrow: string
  title: string
  lead?: string | null
  href?: string
  linkLabel?: string
  onDark?: boolean
  className?: string
}

export function SectionHeading({ eyebrow, title, lead, href, linkLabel, onDark, className }: Props) {
  return (
    <Reveal className={clsx('mb-10 grid gap-6 md:mb-14 md:grid-cols-[1fr_auto] md:items-end', className)}>
      <div>
        <p className={clsx('label-wide mb-4', onDark ? 'text-white/60' : 'text-subtle')}>{eyebrow}</p>
        <h2 className={clsx('font-serif text-[40px] leading-[1.02] md:text-[60px]', onDark ? 'text-white' : 'text-ink')}>{title}</h2>
        {lead ? <p className={clsx('mt-5 max-w-2xl text-[17px]', onDark ? 'text-white/70' : 'text-muted')}>{lead}</p> : null}
      </div>
      {href ? (
        <ArrowLink href={href} onDark={onDark} className="md:mb-3">
          {linkLabel ?? 'Все материалы'}
        </ArrowLink>
      ) : null}
    </Reveal>
  )
}
