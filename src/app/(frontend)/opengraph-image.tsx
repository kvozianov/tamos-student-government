import { ogCard, OG_SIZE } from '@/lib/og'

export const alt = 'Президентская администрация TAMOS'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return ogCard({ eyebrow: 'Студенческое самоуправление', title: 'Новости, события и выполнение программы' })
}
