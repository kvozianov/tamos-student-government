import { ReportsView, reportsMeta } from '@/app/(frontend)/reports/view'
import { fromSegment } from '@/lib/filters'

// Служебная страница для /reports?type=… (rewrites в next.config.ts). Каждый фильтр кэшируется.
export const metadata = reportsMeta

export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ type: string }> }

export default async function FilteredReportsPage({ params }: Props) {
  return <ReportsView type={fromSegment((await params).type)} />
}
