import clsx from 'clsx'
import Image from 'next/image'

import type { Media } from '@/payload-types'
import { asMedia, mediaUrl, type SizeName } from '@/lib/media'

import { Seal } from './Seal'

type Props = {
  media: unknown
  size?: SizeName
  alt?: string
  className?: string
  imgClassName?: string
  sizes?: string
  priority?: boolean
  placeholderLabel?: string
  tone?: 'dark' | 'light'
}

export function PhotoPlaceholder({ label, className, tone = 'light' }: { label?: string; className?: string; tone?: 'dark' | 'light' }) {
  return (
    <div
      className={clsx(
        'relative flex size-full items-center justify-center overflow-hidden',
        tone === 'dark' ? 'bg-navy-950 text-white/35' : 'photo-hatch text-ink/25',
        className,
      )}
      role="img"
      aria-label={label ?? 'Фотография будет добавлена'}
    >
      <Seal size={64} />
      {label ? <span className="label-wide-sm absolute bottom-4 left-4 right-4">{label}</span> : null}
    </div>
  )
}

/**
 * Изображение из медиатеки с учётом точки фокуса. Если фото нет или файл недоступен,
 * показывается аккуратная заглушка вместо пустого места.
 */
export function MediaImage({ media, size = 'card', alt, className, imgClassName, sizes, priority, placeholderLabel, tone }: Props) {
  const m = asMedia(media) as Media | null
  const src = m?.mimeType?.startsWith('image/') ? mediaUrl(m, size) : null
  if (!src) {
    return (
      <div className={clsx('relative overflow-hidden', className)}>
        <PhotoPlaceholder label={placeholderLabel} tone={tone} />
      </div>
    )
  }
  const position = m?.focalX != null && m?.focalY != null ? `${m.focalX}% ${m.focalY}%` : '50% 50%'
  return (
    <div className={clsx('relative overflow-hidden bg-stone', className)}>
      <Image
        src={src}
        alt={alt ?? m?.alt ?? ''}
        fill
        sizes={sizes ?? '(min-width: 1200px) 50vw, 100vw'}
        priority={priority}
        className={clsx('object-cover', imgClassName)}
        style={{ objectPosition: position }}
      />
    </div>
  )
}
