import Link from 'next/link'

import { ArrowLink } from '@/components/site/ArrowLink'
import { NewsCard, NewsMeta } from '@/components/site/cards'
import { Countdown } from '@/components/site/Countdown'
import { EmptyState } from '@/components/site/EmptyState'
import { HeroIntro } from '@/components/site/HeroIntro'
import { LeaderBlock } from '@/components/site/LeaderBlock'
import { MediaImage, PhotoPlaceholder } from '@/components/site/MediaImage'
import { Reveal } from '@/components/site/Reveal'
import { hasRichText, RichText } from '@/components/site/RichText'
import { Signature } from '@/components/site/Signature'
import { computePromiseStats, getHome, getIdeas, getLatestNews, getPresident, getPromises, getReports, getUpcomingEvents, getVicePresident } from '@/lib/data'
import { shouldShowCountdown } from '@/lib/events'
import { formatDate, plural } from '@/lib/format'
import { asMedia } from '@/lib/media'
import { parseSignature } from '@/lib/signature'

/**
 * Главная устроена по образцу whitehouse.gov: первый экран с президентом, обращение с подписью,
 * пять направлений работы и последние новости. Подробности живут во внутренних разделах.
 */
export default async function HomePage() {
  const [home, president, vicePresident, news, events, promises, ideas, reports] = await Promise.all([
    getHome(),
    getPresident(),
    getVicePresident(),
    getLatestNews(4),
    getUpcomingEvents(1),
    getPromises(),
    getIdeas(),
    getReports(),
  ])

  const stats = computePromiseStats(promises)
  const signature = parseSignature(president?.signatureSvg)
  const heroImage = asMedia(home.heroImage)
  const portrait = heroImage?.url ? heroImage : asMedia(president?.photo)
  const nextEvent = events[0]
  const [leadNews, ...restNews] = news
  const implemented = ideas.filter((i) => i.status === 'implemented').length

  const directions = [
    {
      href: '/events',
      label: 'События',
      line: nextEvent ? `Ближайшее: ${nextEvent.title}` : 'Календарь мероприятий',
      media: nextEvent?.cover,
    },
    {
      href: '/promises',
      label: 'Обещания',
      line: stats.total ? `Выполнено ${stats.done} из ${stats.total}` : 'Публичное отслеживание',
      media: null,
    },
    {
      href: '/ideas',
      label: 'Бюро идей',
      line: ideas.length ? `${ideas.length} ${plural(ideas.length, ['проект', 'проекта', 'проектов'])}, реализовано ${implemented}` : 'Предложите свой проект',
      media: ideas[0]?.cover,
    },
    {
      href: '/reports',
      label: 'Отчётность',
      line: reports.length ? `${reports.length} ${plural(reports.length, ['отчёт', 'отчёта', 'отчётов'])} опубликовано` : 'Отчёты о работе',
      media: null,
    },
    {
      href: '/administration',
      label: 'Администрация',
      line: vicePresident ? `Президент и вице-президент` : 'Президент и команда',
      media: president?.photo,
    },
  ]

  return (
    <>
      {/* ---------- Первый экран ---------- */}
      <section className="relative overflow-hidden bg-paper" aria-label="Президент">
        <div className={`container-site grid items-center gap-12 py-12 lg:grid-cols-[1fr_400px] lg:gap-16 lg:py-14 xl:grid-cols-[1fr_440px] ${nextEvent ? 'lg:min-h-[calc(100svh-var(--header-h)-104px)]' : 'lg:min-h-[calc(100svh-var(--header-h))]'}`}>
          <div>
            <HeroIntro eyebrow={home.heroEyebrow} name={president?.name ?? 'Президент TAMOS'} position={president?.position} slogan={home.heroSlogan} signature={signature} />
            <ArrowLink href="/administration" className="mt-12">
              {home.heroCta || 'О президенте и администрации'}
            </ArrowLink>
          </div>
          <div className="animate-fade relative aspect-[4/5] w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[440px]" style={{ animationDelay: '0.3s' }}>
            {portrait?.url ? (
              <MediaImage media={portrait} size="card" className="size-full" sizes="(min-width: 1200px) 440px, 90vw" priority />
            ) : (
              <PhotoPlaceholder label="Официальный портрет президента будет добавлен" />
            )}
            <span aria-hidden="true" className="absolute -bottom-3 -right-3 -z-10 size-full border border-navy-700/25" />
          </div>
        </div>

        {nextEvent ? (
          <div className="border-t border-rule bg-mist">
            <div className="container-site grid gap-5 py-6 md:grid-cols-[1fr_auto] md:items-center md:gap-10">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                <p className="label-wide-sm shrink-0 text-navy-700">До следующего события</p>
                <Link href={`/events/${nextEvent.slug}`} className="font-serif text-[26px] leading-tight hover:underline hover:decoration-1 hover:underline-offset-4 md:text-[30px]">
                  {nextEvent.title}
                </Link>
              </div>
              {shouldShowCountdown(nextEvent) && nextEvent.startsAt ? (
                <Countdown startsAt={nextEvent.startsAt} endsAt={nextEvent.endsAt} size="md" />
              ) : (
                <p className="text-[15px] text-muted">Дата проведения уточняется{nextEvent.tentativeLabel ? `: ${nextEvent.tentativeLabel.toLowerCase()}` : ''}</p>
              )}
            </div>
          </div>
        ) : null}
      </section>

      {/* ---------- Вице-президент ---------- */}
      {vicePresident ? (
        <section className="border-t border-rule bg-paper py-20 md:py-28" aria-label="Вице-президент">
          <div className="container-site">
            <LeaderBlock member={vicePresident} reverse />
          </div>
        </section>
      ) : null}

      {/* ---------- Обращение президента ---------- */}
      {hasRichText(home.address) ? (
        <section className="bg-paper py-20 md:py-28" aria-labelledby="address-title">
          <div className="container-text">
            <Reveal>
              <h2 id="address-title" className="label-wide mb-10 text-center text-navy-700">
                {home.addressTitle || 'Обращение президента'}
              </h2>
              <RichText data={home.address} className="text-[19px]" />
              {president ? (
                <div className="mt-14 flex flex-col items-center text-center">
                  <p className="font-serif text-[36px] leading-none">{president.name}</p>
                  <p className="label-wide-sm mt-3 text-muted">{president.position}</p>
                  <Signature shape={signature} trigger="view" delay={0.2} className="mt-6 h-auto w-[220px] text-ink" />
                </div>
              ) : null}
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ---------- Направления работы ---------- */}
      <section className="border-t border-rule bg-paper py-16 md:py-20" aria-labelledby="directions-title">
        <div className="container-site">
          <h2 id="directions-title" className="sr-only">
            Направления работы
          </h2>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            {directions.map((d, i) => (
              <Reveal as="li" key={d.href} delay={i * 0.06} className={i === 4 ? 'col-span-2 md:col-span-1' : ''}>
                {asMedia(d.media)?.url ? (
                  <Link href={d.href} className="group relative block aspect-[3/4] overflow-hidden bg-mist">
                    <MediaImage media={d.media} size="card" className="absolute inset-0" sizes="(min-width: 1200px) 260px, 50vw" imgClassName="transition-transform duration-[1200ms] group-hover:scale-[1.05]" />
                    <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgb(11_27_66/0.86),rgb(11_27_66/0.15)_55%,transparent)]" />
                    <span className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <span className="label-wide block">{d.label}</span>
                      <span className="mt-2 block text-[14px] leading-snug text-white/80">{d.line}</span>
                    </span>
                    <span aria-hidden="true" className="absolute inset-x-5 bottom-0 h-[3px] origin-left scale-x-0 bg-brand-red transition-transform duration-500 group-hover:scale-x-100" />
                  </Link>
                ) : (
                  <Link href={d.href} className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden border border-rule bg-paper p-5 transition-colors duration-300 hover:border-navy-700">
                    <span className="font-serif text-[64px] leading-none text-navy-700/15 transition-colors duration-300 group-hover:text-navy-700/30">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <span className="label-wide block text-ink">{d.label}</span>
                      <span className="mt-2 block text-[14px] leading-snug text-muted">{d.line}</span>
                      <span aria-hidden="true" className="mt-5 block h-px w-full bg-rule">
                        <span className="block h-[3px] -translate-y-px origin-left scale-x-[0.18] bg-navy-700 transition-transform duration-500 group-hover:scale-x-100" />
                      </span>
                    </span>
                  </Link>
                )}
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Последние новости ---------- */}
      <section className="border-t border-rule bg-paper py-20 md:py-24" aria-labelledby="news-title">
        <div className="container-site">
          <Reveal className="mb-10 flex items-end justify-between gap-6">
            <h2 id="news-title" className="font-serif text-[40px] leading-none md:text-[56px]">
              Новости
            </h2>
            <ArrowLink href="/news" className="mb-2">
              Все новости
            </ArrowLink>
          </Reveal>
          {leadNews ? (
            <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
              <Reveal>
                <NewsCard item={leadNews} large />
              </Reveal>
              <ul className="border-t border-ink">
                {restNews.map((n, i) => (
                  <Reveal as="li" key={n.id} delay={i * 0.06} className="group relative border-b border-rule py-6">
                    <NewsMeta item={n} />
                    <h3 className="mt-2 font-serif text-[24px] leading-[1.15]">
                      <Link href={`/news/${n.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                        {n.title}
                      </Link>
                    </h3>
                  </Reveal>
                ))}
                {!restNews.length ? <li className="py-6 text-muted">Новые материалы появятся здесь.</li> : null}
              </ul>
            </div>
          ) : (
            <EmptyState title="Новостей пока нет" text="Первая публикация пресс-службы появится здесь." />
          )}
          {leadNews ? <p className="sr-only">Последняя публикация: {formatDate(leadNews.publishedAt)}</p> : null}
        </div>
      </section>
    </>
  )
}
