import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DemoBadge } from '@/components/site/DemoBadge'
import { Countdown } from '@/components/site/Countdown'
import { DocumentList } from '@/components/site/DocumentList'
import { MediaImage } from '@/components/site/MediaImage'
import { PageHero } from '@/components/site/PageHero'
import { Related } from '@/components/site/Related'
import { hasRichText, RichText } from '@/components/site/RichText'
import { StatusBadge } from '@/components/site/StatusBadge'
import { Timeline } from '@/components/site/Timeline'
import { VideoEmbed } from '@/components/site/VideoEmbed'
import type { Album, Member, News, Promise as PromiseDoc, Report } from '@/payload-types'
import { getEvent } from '@/lib/data'
import { eventPhase, shouldShowCountdown } from '@/lib/events'
import { formatDate, formatTime, formatWeekday } from '@/lib/format'
import { pageMeta } from '@/lib/meta'
import { docs } from '@/lib/rel'
import { siteUrl } from '@/lib/site'
import { EVENT_STATUSES } from '@/lib/status'
import { youtubeId } from '@/lib/youtube'

// Страница собирается при первом посещении и дальше отдаётся из кэша (ISR), как и остальной сайт.
export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ev = await getEvent((await params).slug)
  if (!ev) return { title: 'Событие не найдено' }
  return pageMeta({ title: ev.title, description: ev.summary, image: ev.cover, path: `/events/${ev.slug}` })
}

export default async function EventPage({ params }: Props) {
  const ev = await getEvent((await params).slug)
  if (!ev) notFound()
  const now = Date.now()
  const phase = eventPhase(ev, now)
  const countdown = shouldShowCountdown(ev, now) && ev.startsAt
  const reg = ev.registration
  const regState = !reg?.opensAt && !reg?.closesAt && !reg?.url ? null : reg?.opensAt && new Date(reg.opensAt).getTime() > now ? 'soon' : reg?.closesAt && new Date(reg.closesAt).getTime() < now ? 'closed' : 'open'
  const organizers = docs<Member>(ev.organizers)
  const promises = docs<PromiseDoc>(ev.relatedPromises)
  const news = docs<News>(ev.newsJoin)
  const reports = docs<Report>(ev.reportsJoin)
  const albums = docs<Album>(ev.albumsJoin)
  const refVideo = youtubeId(ev.reference?.url)
  const status = ev.effectiveStatus

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: ev.title,
    description: ev.summary,
    ...(ev.startsAt && ev.dateConfirmed ? { startDate: ev.startsAt } : {}),
    ...(ev.endsAt ? { endDate: ev.endsAt } : {}),
    eventStatus: status === 'cancelled' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
    ...(ev.place ? { location: { '@type': 'Place', name: ev.place } } : {}),
    url: `${siteUrl()}/events/${ev.slug}`,
  }

  return (
    <article>
      <PageHero title={ev.title} crumbs={[{ label: 'События', href: '/events' }, { label: ev.title }]} align="left" size="md" lead={ev.summary}>
        <div className="flex flex-wrap items-center gap-4">
          <StatusBadge kind="event" status={status} />
          <DemoBadge show={ev.isDemo} />
        </div>
        <div className="mt-10 border-t border-rule pt-8">
          {countdown ? (
            <>
              <p className="label-wide-sm mb-5 text-subtle">До начала мероприятия</p>
              <Countdown startsAt={ev.startsAt!} endsAt={ev.endsAt} size="lg" />
            </>
          ) : phase === 'live' || (phase === 'past' && status !== 'cancelled') ? (
            <Countdown startsAt={ev.startsAt!} endsAt={ev.endsAt} size="md" />
          ) : status === 'cancelled' ? (
            <p className="font-serif text-[34px] text-tone-negative">Мероприятие отменено</p>
          ) : (
            <div>
              <p className="font-serif text-[34px] leading-tight md:text-[44px]">Дата проведения уточняется</p>
              {ev.startsAt || ev.tentativeLabel ? (
                <p className="mt-3 text-[16px] text-muted">
                  Предварительно: {ev.tentativeLabel || formatDate(ev.startsAt)}. Обратный отсчёт появится после официального утверждения даты.
                </p>
              ) : null}
            </div>
          )}
        </div>
      </PageHero>

      <div className="container-site grid gap-14 py-14 md:py-20 lg:grid-cols-[1fr_340px] lg:gap-20">
        <div className="min-w-0 space-y-16">
          {ev.cover ? <MediaImage media={ev.cover} size="wide" className="aspect-[16/9]" sizes="(min-width: 1200px) 860px, 100vw" priority /> : null}

          {hasRichText(ev.description) ? (
            <section aria-label="Описание">
              <RichText data={ev.description} className="max-w-[760px]" />
            </section>
          ) : (
            <p className="max-w-[760px] text-[18px] leading-relaxed">{ev.summary}</p>
          )}

          {ev.program?.length ? (
            <section aria-labelledby="program-title">
              <h2 id="program-title" className="mb-6 font-serif text-[36px] leading-none">
                Программа
              </h2>
              <ol className="border-t border-ink">
                {ev.program.map((item, i) => (
                  <li key={item.id ?? i} className="grid gap-2 border-b border-rule py-5 sm:grid-cols-[120px_1fr] sm:gap-8">
                    <span className="font-serif text-[26px] leading-none text-navy-700">{item.time || String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="text-[17px] text-ink">{item.title}</p>
                      {item.description ? <p className="mt-1 text-[15px] text-muted">{item.description}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {ev.reference?.url || ev.reference?.note ? (
            <section aria-labelledby="ref-title">
              <h2 id="ref-title" className="mb-6 font-serif text-[36px] leading-none">
                Референс
              </h2>
              {ev.reference.note ? <p className="mb-6 max-w-[760px] text-[17px] leading-relaxed text-ink">{ev.reference.note}</p> : null}
              {refVideo ? <VideoEmbed url={ev.reference.url} title={ev.reference.title} /> : null}
              {ev.reference.url && !refVideo ? (
                <a href={ev.reference.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-6 border border-rule p-6 transition-colors hover:border-ink">
                  <span>
                    <span className="label-wide-sm block text-subtle">{ev.reference.platform || 'Ссылка'}</span>
                    <span className="mt-2 block font-serif text-[24px] leading-snug group-hover:underline">{ev.reference.title || ev.reference.url}</span>
                    {ev.reference.author ? <span className="mt-1 block text-[15px] text-muted">{ev.reference.author}</span> : null}
                  </span>
                  <span aria-hidden="true" className="text-[22px]">
                    ↗
                  </span>
                  <span className="sr-only">(откроется в новой вкладке)</span>
                </a>
              ) : null}
            </section>
          ) : null}

          <section aria-labelledby="updates-title">
            <h2 id="updates-title" className="mb-6 font-serif text-[36px] leading-none">
              Ход подготовки
            </h2>
            <Timeline kind="event" items={(ev.updates ?? []).map((u) => ({ id: u.id, date: u.date, status: u.status, text: u.text }))} empty="Обновления о подготовке появятся здесь." />
          </section>

          <DocumentList items={ev.materials} title="Материалы" />
        </div>

        <aside className="space-y-12">
          <section aria-label="Дата и место" className="border-t border-ink pt-6">
            <dl className="space-y-5 text-[16px]">
              <div>
                <dt className="label-wide-sm text-subtle">{ev.dateConfirmed ? 'Дата утверждена' : 'Дата'}</dt>
                <dd className="mt-1">
                  {ev.startsAt && ev.dateConfirmed ? (
                    <>
                      {formatWeekday(ev.startsAt)}, {formatDate(ev.startsAt)}
                      <br />
                      {formatTime(ev.startsAt)}
                      {ev.endsAt ? `–${formatTime(ev.endsAt)}` : ''}
                    </>
                  ) : (
                    <>Уточняется{ev.tentativeLabel || ev.startsAt ? <span className="block text-muted">предварительно {ev.tentativeLabel || formatDate(ev.startsAt)}</span> : null}</>
                  )}
                </dd>
              </div>
              {ev.place ? (
                <div>
                  <dt className="label-wide-sm text-subtle">Место</dt>
                  <dd className="mt-1">{ev.place}</dd>
                </div>
              ) : null}
              {ev.audience ? (
                <div>
                  <dt className="label-wide-sm text-subtle">Участники</dt>
                  <dd className="mt-1">{ev.audience}</dd>
                </div>
              ) : null}
              <div>
                <dt className="label-wide-sm text-subtle">Статус</dt>
                <dd className="mt-1">
                  <StatusBadge kind="event" status={status} />
                  <p className="mt-2 text-[14px] text-muted">{EVENT_STATUSES[status].description}</p>
                </dd>
              </div>
            </dl>
          </section>

          {regState ? (
            <section aria-labelledby="reg-title" className="border-t border-ink pt-6">
              <h2 id="reg-title" className="label-wide-sm text-subtle">
                Регистрация
              </h2>
              <p className="mt-2 font-serif text-[26px] leading-tight">
                {regState === 'soon' ? `Откроется ${formatDate(reg!.opensAt, { withYear: false })}` : regState === 'closed' ? 'Регистрация закрыта' : reg?.closesAt ? `Открыта до ${formatDate(reg.closesAt, { withYear: false })}` : 'Открыта'}
              </p>
              {reg?.note ? <p className="mt-3 text-[15px] text-muted">{reg.note}</p> : null}
              {regState === 'open' && reg?.url ? (
                <a href={reg.url} target="_blank" rel="noopener noreferrer" className="label-wide mt-5 inline-flex items-center gap-3 bg-navy-900 px-6 py-4 text-white transition-colors hover:bg-navy-700">
                  Зарегистрироваться ↗<span className="sr-only">(откроется в новой вкладке)</span>
                </a>
              ) : regState === 'open' ? (
                <p className="mt-4 text-[14px] text-subtle">Ссылка на форму регистрации появится здесь.</p>
              ) : null}
            </section>
          ) : null}

          {organizers.length || ev.organizersNote ? (
            <section aria-labelledby="org-title" className="border-t border-ink pt-6">
              <h2 id="org-title" className="label-wide-sm mb-3 text-subtle">
                Организаторы
              </h2>
              <ul className="space-y-2 text-[16px]">
                {organizers.map((m) => (
                  <li key={m.id}>
                    <Link href={`/team/${m.slug}`} className="link-draw">
                      {m.name}
                    </Link>
                    <span className="block text-[14px] text-muted">{m.position}</span>
                  </li>
                ))}
                {ev.organizersNote ? <li className="text-muted">{ev.organizersNote}</li> : null}
              </ul>
            </section>
          ) : null}

          <Related title="Связанные обещания" items={promises.map((p) => ({ href: `/programme/${p.slug}`, kind: 'Обещание', title: p.title, meta: <StatusBadge kind="promise" status={p.status} /> }))} />
          <Related title="Новости" items={news.map((n) => ({ href: `/news/${n.slug}`, kind: formatDate(n.publishedAt), title: n.title }))} />
          <Related title="Отчёты" items={reports.map((r) => ({ href: `/reports/${r.slug}`, kind: formatDate(r.publishedAt), title: r.title }))} />
          <Related title="Фото и видео" items={albums.map((a) => ({ href: `/gallery/${a.slug}`, kind: 'Альбом', title: a.title }))} />
        </aside>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  )
}
