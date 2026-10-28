import clsx from 'clsx'
import Link from 'next/link'

import type { Album, Category, Event, Idea, Member, News, Promise as PromiseDoc, Report } from '@/payload-types'
import { eventPhase } from '@/lib/events'
import { dateParts, formatDate, formatPeriod, formatTime, formatWeekday } from '@/lib/format'
import { asMedia } from '@/lib/media'
import { doc } from '@/lib/rel'
import { NEWS_CATEGORIES, REPORT_TYPE_SINGULAR, type EventStatus, type NewsCategory, type ReportType } from '@/lib/status'

import { DemoBadge } from './DemoBadge'
import { MediaImage } from './MediaImage'
import { StatusBadge } from './StatusBadge'

/* ---------- Новости ---------- */

export function NewsMeta({ item, onDark }: { item: Pick<News, 'category' | 'publishedAt' | 'isDemo'>; onDark?: boolean }) {
  return (
    <p className={clsx('flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]', onDark ? 'text-white/65' : 'text-muted')}>
      <span>{NEWS_CATEGORIES[item.category as NewsCategory]}</span>
      <span aria-hidden="true" className={clsx('h-3.5 w-px', onDark ? 'bg-white/30' : 'bg-rule')} />
      <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
      <DemoBadge show={item.isDemo} onDark={onDark} />
    </p>
  )
}

/** Строка редакционного списка, как лента «News» на whitehouse.gov. */
export function NewsRow({ item, withImage = false }: { item: News; withImage?: boolean }) {
  return (
    <article className="group relative grid gap-5 border-b border-rule py-7 md:grid-cols-[1fr_auto] md:gap-10">
      <div>
        <h3 className="font-serif text-[26px] leading-[1.15] text-ink md:text-[30px]">
          <Link href={`/news/${item.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
            {item.title}
          </Link>
        </h3>
        <div className="mt-3">
          <NewsMeta item={item} />
        </div>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">{item.excerpt}</p>
      </div>
      {withImage ? <MediaImage media={item.cover} size="thumbnail" className="hidden aspect-[4/3] w-[220px] md:block" sizes="220px" tone="light" /> : null}
    </article>
  )
}

export function NewsCard({ item, priority, large }: { item: News; priority?: boolean; large?: boolean }) {
  return (
    <article className="group relative">
      <MediaImage
        media={item.cover}
        size={large ? 'wide' : 'card'}
        className={clsx(large ? 'aspect-[16/10]' : 'aspect-[3/2]')}
        imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-official)] group-hover:scale-[1.03]"
        sizes={large ? '(min-width: 1200px) 760px, 100vw' : '(min-width: 1200px) 400px, 100vw'}
        priority={priority}
      />
      <div className="mt-5">
        <NewsMeta item={item} />
        <h3 className={clsx('mt-3 font-serif leading-[1.1] text-ink', large ? 'text-[34px] md:text-[46px]' : 'text-[26px]')}>
          <Link href={`/news/${item.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
            {item.title}
          </Link>
        </h3>
        {large ? <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">{item.excerpt}</p> : null}
      </div>
    </article>
  )
}

/* ---------- События ---------- */

export function EventDateLine({ ev, onDark }: { ev: Event; onDark?: boolean }) {
  const phase = eventPhase(ev)
  const muted = onDark ? 'text-white/60' : 'text-muted'
  if (!ev.startsAt) return <p className={clsx('text-[15px]', muted)}>{ev.tentativeLabel || 'Дата проведения уточняется'}</p>
  if (phase === 'tentative') {
    return (
      <p className={clsx('text-[15px]', muted)}>
        Предварительно: {ev.tentativeLabel || formatDate(ev.startsAt)} · дата уточняется
      </p>
    )
  }
  return (
    <p className={clsx('text-[15px]', onDark ? 'text-white/85' : 'text-ink')}>
      <time dateTime={ev.startsAt}>
        {formatWeekday(ev.startsAt)}, {formatDate(ev.startsAt)}, {formatTime(ev.startsAt)}
      </time>
    </p>
  )
}

export function DateBlock({ iso, confirmed, onDark }: { iso?: string | null; confirmed?: boolean | null; onDark?: boolean }) {
  if (!iso) {
    return (
      <div className={clsx('flex h-[88px] w-[78px] shrink-0 flex-col items-center justify-center border', onDark ? 'border-white/25 text-white/70' : 'border-rule text-subtle')}>
        <span className="font-serif text-[30px] leading-none">—</span>
        <span className="label-wide-sm mt-2 text-[8.5px]">уточняется</span>
      </div>
    )
  }
  const p = dateParts(iso)
  return (
    <div className={clsx('flex h-[88px] w-[78px] shrink-0 flex-col items-center justify-center border', onDark ? 'border-white/25 text-white' : 'border-rule text-ink', !confirmed && 'border-dashed')}>
      <span className="font-serif text-[40px] leading-none">{p.day}</span>
      <span className={clsx('label-wide-sm mt-1.5', onDark ? 'text-white/60' : 'text-subtle')}>{p.month}</span>
    </div>
  )
}

export function EventCard({ ev, status }: { ev: Event; status: EventStatus }) {
  return (
    <article className="group relative flex h-full flex-col border-t border-ink pt-5">
      <MediaImage media={ev.cover} size="card" className="aspect-[3/2]" sizes="(min-width: 1200px) 400px, 100vw" imgClassName="transition-transform duration-[1200ms] group-hover:scale-[1.03]" placeholderLabel="Обложка события появится позже" />
      <div className="mt-5 flex items-start gap-5">
        <DateBlock iso={ev.startsAt} confirmed={ev.dateConfirmed} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge kind="event" status={status} />
            <DemoBadge show={ev.isDemo} />
          </div>
          <h3 className="mt-3 font-serif text-[27px] leading-[1.1] text-ink">
            <Link href={`/events/${ev.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
              {ev.title}
            </Link>
          </h3>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-muted">{ev.summary}</p>
      <div className="mt-auto pt-5">
        <EventDateLine ev={ev} />
        {ev.place ? <p className="mt-1 text-[14px] text-subtle">{ev.place}</p> : null}
      </div>
    </article>
  )
}

/* ---------- Обещания ---------- */

export function NewBadge({ show, className }: { show?: boolean | null; className?: string }) {
  if (!show) return null
  return <span className={clsx('label-wide-sm inline-flex items-center border border-navy-700/50 px-1.5 py-0.5 text-navy-700', className)}>Новый пункт</span>
}

export function PromiseRow({ item }: { item: PromiseDoc }) {
  const category = doc<Category>(item.category)
  const updates = [...(item.updates ?? [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const last = updates[0]
  return (
    <article className="group relative grid gap-4 border-b border-rule py-7 md:grid-cols-[220px_1fr_150px] md:gap-10">
      <div className="flex flex-wrap items-start gap-3 md:flex-col">
        <StatusBadge kind="promise" status={item.status} />
        <NewBadge show={item.isNew} />
        <DemoBadge show={item.isDemo} />
      </div>
      <div>
        {item.number ? <p className="label-wide-sm mb-2 text-subtle">Пункт {item.number}</p> : null}
        <h3 className="font-serif text-[26px] leading-[1.15] text-ink md:text-[29px]">
          <Link href={`/promises/${item.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
            {item.title}
          </Link>
        </h3>
        <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-muted">{last ? last.text : item.summary}</p>
        {item.deadline ? (
          <p className="mt-3 flex max-w-3xl flex-wrap items-baseline gap-x-3 text-[15px] text-ink">
            <span className="label-wide-sm text-subtle">Срок</span>
            {item.deadline}
          </p>
        ) : null}
      </div>
      <div className="label-wide-sm flex gap-4 text-subtle md:flex-col md:items-end md:gap-2 md:text-right">
        {category ? <span>{category.title}</span> : null}
        <span>{last ? formatDate(last.date) : 'Без обновлений'}</span>
      </div>
    </article>
  )
}

/* ---------- Администрация ---------- */

export function MemberCard({ member, priority }: { member: Member; priority?: boolean }) {
  return (
    <article className="group relative">
      <MediaImage
        media={member.photo}
        size="card"
        className="aspect-[4/5]"
        sizes="(min-width: 1200px) 300px, 50vw"
        priority={priority}
        imgClassName="grayscale-[15%] transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
        placeholderLabel="Портрет будет добавлен"
      />
      <div className="mt-4">
        <h3 className="font-serif text-[25px] leading-tight text-ink">
          <Link href={`/administration/${member.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
            {member.name}
          </Link>
        </h3>
        <p className="label-wide-sm mt-2 text-muted">{member.position}</p>
        {member.area ? <p className="mt-2 text-[15px] text-subtle">{member.area}</p> : null}
        <DemoBadge show={member.isDemo} className="mt-3" />
      </div>
    </article>
  )
}

/* ---------- Отчётность ---------- */

export function ReportRow({ report }: { report: Report }) {
  const period = formatPeriod(report.periodStart, report.periodEnd, report.periodLabel)
  const docsCount = Array.isArray(report.documents) ? report.documents.length : 0
  return (
    <article className="group relative grid gap-4 border-b border-rule py-8 md:grid-cols-[220px_1fr_auto] md:gap-10">
      <div>
        <p className="label-wide-sm text-navy-700">{REPORT_TYPE_SINGULAR[report.type as ReportType]}</p>
        <p className="mt-2 text-[14px] text-subtle">
          Опубликовано <time dateTime={report.publishedAt}>{formatDate(report.publishedAt)}</time>
        </p>
      </div>
      <div>
        <h3 className="font-serif text-[27px] leading-[1.12] text-ink md:text-[31px]">
          <Link href={`/reports/${report.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
            {report.title}
          </Link>
        </h3>
        {period ? <p className="label-wide-sm mt-3 text-subtle">Период: {period}</p> : null}
        <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-muted">{report.summary}</p>
      </div>
      <div className="flex items-start gap-3 md:flex-col md:items-end">
        <DemoBadge show={report.isDemo} />
        {docsCount ? <span className="label-wide-sm text-subtle">{docsCount} док.</span> : null}
      </div>
    </article>
  )
}

/* ---------- Галерея ---------- */

export function AlbumCard({ album }: { album: Album }) {
  const items = album.items ?? []
  const cover = asMedia(album.cover) ?? asMedia(items.find((i) => asMedia(i.media)?.mimeType?.startsWith('image/'))?.media)
  const ev = doc<Event>(album.event)
  return (
    <article className="group relative">
      <div className="relative">
        <MediaImage media={cover} size="card" className="aspect-[3/2]" sizes="(min-width: 1200px) 400px, 100vw" imgClassName="transition-transform duration-[1200ms] group-hover:scale-[1.04]" placeholderLabel="Фотографии появятся после мероприятия" />
        <span className="label-wide-sm absolute bottom-0 left-0 bg-navy-950/85 px-3 py-2 text-white">
          {items.length ? `${items.length} ${items.length === 1 ? 'материал' : items.length < 5 ? 'материала' : 'материалов'}` : 'Скоро'}
        </span>
      </div>
      <p className="label-wide-sm mt-4 flex items-center gap-3 text-subtle">
        <time dateTime={album.date}>{formatDate(album.date)}</time>
        <DemoBadge show={album.isDemo} />
      </p>
      <h3 className="mt-2 font-serif text-[26px] leading-[1.12] text-ink">
        <Link href={`/gallery/${album.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
          {album.title}
        </Link>
      </h3>
      {ev ? <p className="mt-1 text-[14px] text-muted">{ev.title}</p> : null}
    </article>
  )
}

/* ---------- Бюро идей ---------- */

export function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <article className="group relative flex h-full flex-col">
      <MediaImage media={idea.cover} size="card" className="aspect-[3/2]" sizes="(min-width: 1200px) 400px, 100vw" imgClassName="transition-transform duration-[1200ms] group-hover:scale-[1.03]" tone="light" placeholderLabel="Изображение проекта появится позже" />
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <StatusBadge kind="idea" status={idea.status} />
        <DemoBadge show={idea.isDemo} />
      </div>
      <h3 className="mt-3 font-serif text-[27px] leading-[1.1] text-ink">
        <Link href={`/ideas/${idea.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
          {idea.title}
        </Link>
      </h3>
      <p className="mt-2 text-[14px] text-subtle">Автор: {idea.author}</p>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{idea.summary}</p>
      {idea.result ? (
        <p className="mt-auto border-t border-rule pt-4 text-[15px] text-ink">
          <span className="label-wide-sm mb-1 block text-subtle">Результат</span>
          {idea.result}
        </p>
      ) : null}
    </article>
  )
}

