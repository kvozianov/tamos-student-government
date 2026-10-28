import type { SignatureShape } from '@/lib/signature'

import { Signature } from './Signature'

type Props = {
  eyebrow?: string | null
  name: string
  position?: string | null
  slogan?: string | null
  signature?: SignatureShape | null
}

const delay = (s: number) => ({ animationDelay: `${s}s` })

/** Текст первого экрана. Анимации на CSS: текст виден сразу из серверной разметки, без ожидания скриптов. */
export function HeroIntro({ eyebrow, name, position, slogan, signature }: Props) {
  const words = name.split(' ')
  return (
    <div>
      {eyebrow ? (
        <p className="label-wide animate-rise text-navy-700" style={delay(0.1)}>
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-5 font-serif text-[76px] leading-[0.9] tracking-[-0.01em] text-navy-950 sm:text-[112px] lg:text-[140px] xl:text-[164px]">
        {words.map((w, i) => (
          <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
            <span className="animate-word inline-block" style={delay(0.2 + i * 0.12)}>
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          </span>
        ))}
      </h1>
      {position ? (
        <p className="label-wide animate-fade mt-6 text-muted" style={delay(0.7)}>
          {position}
        </p>
      ) : null}
      <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:gap-14">
        {slogan ? (
          <p
            className={
              // девиз капсом набираем широким фирменным шрифтом, обычную фразу — текстовым
              slogan === slogan.toUpperCase()
                ? 'animate-rise max-w-[22ch] font-wide text-[17px] font-medium leading-snug tracking-[0.12em] text-navy-700 md:text-[19px]'
                : 'animate-rise max-w-[30ch] text-[19px] leading-relaxed text-muted md:text-[21px]'
            }
            style={delay(0.9)}
          >
            {slogan}
          </p>
        ) : null}
        <Signature shape={signature} className="h-auto w-[260px] shrink-0 text-navy-950 md:w-[340px]" delay={1.1} duration={3.6} />
      </div>
    </div>
  )
}
