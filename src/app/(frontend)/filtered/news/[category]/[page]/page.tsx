import { NewsView, newsMeta } from '@/app/(frontend)/news/view'
import { fromSegment } from '@/lib/filters'

// Служебная страница для /news?category=…&page=… (rewrites в next.config.ts). Каждое сочетание кэшируется.
export const metadata = newsMeta

export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ category: string; page: string }> }

export default async function FilteredNewsPage({ params }: Props) {
  const { category, page } = await params
  return <NewsView category={fromSegment(category)} page={fromSegment(page)} />
}
