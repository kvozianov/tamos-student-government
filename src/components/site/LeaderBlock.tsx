import clsx from 'clsx'
import Link from 'next/link'

import type { Member } from '@/payload-types'
import { parseSignature } from '@/lib/signature'

import { MediaImage } from './MediaImage'
import { Reveal } from './Reveal'
import { Signature } from './Signature'

type Props = {
  member: Member
  /** Надзаголовок; по умолчанию — должность. */
  eyebrow?: string
  /** Портрет справа, а не слева: так президент и вице-президент на одной странице читаются как пара. */
  reverse?: boolean
  priority?: boolean
  className?: string
}

/** Крупный блок руководителя: портрет, имя, должность, справка, приоритеты и подпись. */
export function LeaderBlock({ member, eyebrow, reverse, priority, className }: Props) {
  const signature = parseSignature(member.signatureSvg)
  return (
    <div className={clsx('grid gap-10 md:gap-16 lg:gap-24', reverse ? 'md:grid-cols-[1fr_minmax(0,380px)]' : 'md:grid-cols-[minmax(0,380px)_1fr]', className)}>
      <Reveal className={clsx(reverse && 'md:order-2')}>
        <MediaImage media={member.photo} size="card" className="aspect-[4/5]" sizes="(min-width: 768px) 380px, 100vw" priority={priority} placeholderLabel="Официальный портрет будет добавлен" />
      </Reveal>
      <Reveal delay={0.1} className="flex flex-col justify-center">
        <p className="label-wide text-navy-700">{eyebrow ?? member.position}</p>
        <h2 className="mt-4 font-serif text-[56px] leading-[0.95] text-navy-950 md:text-[84px]">{member.name}</h2>
        {member.shortBio ? <p className="mt-8 max-w-2xl text-[19px] leading-relaxed text-muted">{member.shortBio}</p> : null}
        {member.priorities?.length ? (
          <ul className="mt-10 grid max-w-2xl gap-6 border-t border-rule pt-8 sm:grid-cols-2">
            {member.priorities.map((p) => (
              <li key={p.id}>
                <p className="label-wide-sm text-ink">{p.title}</p>
                {p.text ? <p className="mt-2 text-[15px] text-muted">{p.text}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-10 flex flex-wrap items-end gap-10">
          <Signature
            shape={signature}
            fallback={Boolean(member.isPresident)}
            trigger="view"
            label={`Подпись: ${member.name}`}
            className="h-auto w-[260px] text-navy-950"
          />
          <Link href={`/administration/${member.slug}`} className="label-wide link-draw mb-3">
            Подробнее →
          </Link>
        </div>
      </Reveal>
    </div>
  )
}
