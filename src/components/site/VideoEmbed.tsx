import { youtubeEmbed, youtubeId } from '@/lib/youtube'

export function VideoEmbed({ url, title }: { url?: string | null; title?: string | null }) {
  const id = youtubeId(url)
  if (!id) return null
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-navy-950">
      <iframe
        src={youtubeEmbed(id)}
        title={title ?? 'Видео'}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 size-full border-0"
      />
    </div>
  )
}
