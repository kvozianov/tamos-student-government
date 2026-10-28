import { NewsView, newsMeta, type NewsFilter } from '@/app/(frontend)/news/view'

// Служебная страница для /news?q=… (rewrites в next.config.ts). Поиск по тексту не кэшируется, как и /search.
export const dynamic = 'force-dynamic'

export const metadata = newsMeta

type Props = { searchParams: Promise<NewsFilter> }

export default async function NewsSearchPage({ searchParams }: Props) {
  const { category, q, page } = await searchParams
  return <NewsView category={category} q={q} page={page} />
}
