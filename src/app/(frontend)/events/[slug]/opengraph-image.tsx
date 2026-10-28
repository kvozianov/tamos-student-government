import { getEvent } from '@/lib/data'
import { ogCard, OG_SIZE } from '@/lib/og'

export const alt = 'Президентская администрация TAMOS'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = await getEvent(slug)
  return ogCard({ eyebrow: 'События', title: item?.title ?? 'Президентская администрация TAMOS' })
}
