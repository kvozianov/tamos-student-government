import { GalleryView, galleryMeta } from '@/app/(frontend)/gallery/view'
import { fromSegment } from '@/lib/filters'

// Служебная страница для /gallery?year=… (rewrites в next.config.ts). Каждый фильтр кэшируется.
export const metadata = galleryMeta

export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ year: string }> }

export default async function FilteredGalleryPage({ params }: Props) {
  return <GalleryView year={fromSegment((await params).year)} />
}
