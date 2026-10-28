import clsx from 'clsx'

import { EVENT_STATUSES, IDEA_STATUSES, PROMISE_STATUSES, type Tone } from '@/lib/status'

const TONE_TEXT: Record<Tone, string> = {
  neutral: 'text-tone-neutral',
  review: 'text-tone-review',
  approved: 'text-tone-approved',
  progress: 'text-tone-progress',
  soon: 'text-tone-soon',
  done: 'text-tone-done',
  partial: 'text-tone-partial',
  negative: 'text-tone-negative',
}

export const TONE_BG: Record<Tone, string> = {
  neutral: 'bg-tone-neutral',
  review: 'bg-tone-review',
  approved: 'bg-tone-approved',
  progress: 'bg-tone-progress',
  soon: 'bg-tone-soon',
  done: 'bg-tone-done',
  partial: 'bg-tone-partial',
  negative: 'bg-tone-negative',
}

const MAPS = { event: EVENT_STATUSES, promise: PROMISE_STATUSES, idea: IDEA_STATUSES } as const

type Props = {
  kind: keyof typeof MAPS
  status: string
  onDark?: boolean
  className?: string
}

/** Статус всегда подписан словами: цвет только помогает, а не заменяет текст. */
export function StatusBadge({ kind, status, onDark, className }: Props) {
  const def = (MAPS[kind] as Record<string, { label: string; tone: Tone }>)[status]
  if (!def) return null
  return (
    <span
      className={clsx(
        'label-wide-sm inline-flex items-center gap-2 whitespace-nowrap',
        onDark ? 'text-white/85' : TONE_TEXT[def.tone],
        className,
      )}
    >
      <span aria-hidden="true" className={clsx('inline-block size-[7px] shrink-0', TONE_BG[def.tone], onDark && 'ring-1 ring-white/40')} />
      {def.label}
    </span>
  )
}

export function statusLabel(kind: keyof typeof MAPS, status: string) {
  return (MAPS[kind] as Record<string, { label: string }>)[status]?.label ?? status
}
