import { PromisesView, promisesMeta } from '@/app/(frontend)/programme/view'
import { fromSegment } from '@/lib/filters'

// Служебная страница для /programme?category=…&status=… (rewrites в next.config.ts). Каждое сочетание кэшируется.
export const metadata = promisesMeta

export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ category: string; status: string }> }

export default async function FilteredPromisesPage({ params }: Props) {
  const { category, status } = await params
  return <PromisesView category={fromSegment(category)} status={fromSegment(status)} />
}
