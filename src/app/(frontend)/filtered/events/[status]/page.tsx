import { EventsView, eventsMeta } from '@/app/(frontend)/events/view'
import { fromSegment } from '@/lib/filters'

// Служебная страница для /events?status=… (rewrites в next.config.ts). Каждый фильтр кэшируется.
export const metadata = eventsMeta

export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ status: string }> }

export default async function FilteredEventsPage({ params }: Props) {
  return <EventsView status={fromSegment((await params).status)} />
}
