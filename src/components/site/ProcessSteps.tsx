import clsx from 'clsx'

import { Reveal } from './Reveal'

export type Step = { title: string; text?: string | null }

/** Путь идеи: подача → рассмотрение → доработка → согласование → реализация. */
export function ProcessSteps({ steps, onDark, activeIndex }: { steps: Step[]; onDark?: boolean; activeIndex?: number }) {
  return (
    <ol className={clsx('grid gap-0 md:grid-cols-5', onDark ? 'text-white' : 'text-ink')}>
      {steps.map((s, i) => (
        <Reveal as="li" key={`${s.title}-${i}`} delay={i * 0.08} className={clsx('relative border-t pt-6 pb-8 md:pr-6', onDark ? 'border-white/20' : 'border-rule')}>
          <span
            aria-hidden="true"
            className={clsx(
              'absolute -top-[5px] left-0 size-[9px]',
              activeIndex !== undefined && i <= activeIndex ? (onDark ? 'bg-white' : 'bg-navy-800') : onDark ? 'bg-white/40' : 'bg-rule',
            )}
          />
          <span className={clsx('label-wide-sm', onDark ? 'text-white/50' : 'text-subtle')}>Шаг {String(i + 1).padStart(2, '0')}</span>
          <p className="mt-3 font-serif text-[25px] leading-[1.1]">{s.title}</p>
          {s.text ? <p className={clsx('mt-3 text-[15px] leading-relaxed', onDark ? 'text-white/65' : 'text-muted')}>{s.text}</p> : null}
        </Reveal>
      ))}
    </ol>
  )
}
