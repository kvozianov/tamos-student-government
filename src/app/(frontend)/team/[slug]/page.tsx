import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DemoBadge } from '@/components/site/DemoBadge'
import { MediaImage } from '@/components/site/MediaImage'
import { PageHero } from '@/components/site/PageHero'
import { Related, type RelatedItem } from '@/components/site/Related'
import { RichText } from '@/components/site/RichText'
import { Signature } from '@/components/site/Signature'
import { StatusBadge } from '@/components/site/StatusBadge'
import type { Event, Idea, Promise as PromiseDoc } from '@/payload-types'
import { getMember } from '@/lib/data'
import { effectiveEventStatus } from '@/lib/events'
import { pageMeta } from '@/lib/meta'
import { parseSignature } from '@/lib/signature'

// Страница собирается при первом посещении и дальше отдаётся из кэша (ISR), как и остальной сайт.
export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await getMember((await params).slug)
  if (!m) return { title: 'Страница не найдена' }
  return pageMeta({ title: m.name, description: m.shortBio ?? m.position, image: m.photo, path: `/team/${m.slug}` })
}

export default async function MemberPage({ params }: Props) {
  const m = await getMember((await params).slug)
  if (!m) notFound()
  const projects: RelatedItem[] = (m.projects ?? []).flatMap((p): RelatedItem[] => {
    const v = p.value
    if (!v || typeof v !== 'object') return []
    if (p.relationTo === 'events') {
      const e = v as Event
      return e._status === 'published' ? [{ href: `/events/${e.slug}`, kind: 'Событие', title: e.title, meta: <StatusBadge kind="event" status={effectiveEventStatus(e)} /> }] : []
    }
    if (p.relationTo === 'promises') {
      const pr = v as PromiseDoc
      return pr._status === 'published' ? [{ href: `/programme/${pr.slug}`, kind: 'Обещание', title: pr.title, meta: <StatusBadge kind="promise" status={pr.status} /> }] : []
    }
    const i = v as Idea
    return i._status === 'published' ? [{ href: `/ideas/${i.slug}`, kind: 'Бюро идей', title: i.title }] : []
  })

  return (
    <article>
      <PageHero title={m.name} eyebrow={m.position} crumbs={[{ label: 'Команда', href: '/team' }, { label: m.name }]} size="md" />
      <div className="container-site grid gap-14 py-14 md:grid-cols-[minmax(0,360px)_1fr] md:py-20 lg:gap-20">
        <div className="space-y-8">
          <MediaImage media={m.photo} size="card" className="aspect-[4/5]" sizes="360px" priority placeholderLabel="Портрет будет добавлен" />
          <dl className="space-y-4 border-t border-ink pt-6 text-[16px]">
            <div>
              <dt className="label-wide-sm text-subtle">Должность</dt>
              <dd className="mt-1">{m.position}</dd>
            </div>
            {m.area ? (
              <div>
                <dt className="label-wide-sm text-subtle">Направление</dt>
                <dd className="mt-1">{m.area}</dd>
              </div>
            ) : null}
            {m.email ? (
              <div>
                <dt className="label-wide-sm text-subtle">Почта</dt>
                <dd className="mt-1">
                  <a href={`mailto:${m.email}`} className="link-draw text-navy-700">
                    {m.email}
                  </a>
                </dd>
              </div>
            ) : null}
            {m.telegram ? (
              <div>
                <dt className="label-wide-sm text-subtle">Telegram</dt>
                <dd className="mt-1">
                  <a href={`https://t.me/${m.telegram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="link-draw text-navy-700">
                    {m.telegram}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
          <DemoBadge show={m.isDemo} />
        </div>
        <div className="min-w-0 space-y-14">
          {m.shortBio ? <p className="max-w-[760px] font-serif text-[26px] leading-[1.35] md:text-[30px]">{m.shortBio}</p> : null}
          <RichText data={m.bio} className="max-w-[760px]" />
          {m.responsibilities?.length ? (
            <section aria-labelledby="resp-title">
              <h2 id="resp-title" className="mb-5 font-serif text-[34px] leading-none">
                Обязанности
              </h2>
              <ul className="max-w-[760px] border-t border-rule">
                {m.responsibilities.map((r) => (
                  <li key={r.id} className="flex gap-4 border-b border-rule py-4 text-[17px]">
                    <span aria-hidden="true" className="mt-2.5 size-[7px] shrink-0 bg-navy-700" />
                    {r.text}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {(m.isPresident || m.isVicePresident) && m.priorities?.length ? (
            <section aria-labelledby="prio-title">
              <h2 id="prio-title" className="mb-5 font-serif text-[34px] leading-none">
                Приоритеты
              </h2>
              <ul className="grid max-w-[760px] gap-6 sm:grid-cols-2">
                {m.priorities.map((p) => (
                  <li key={p.id} className="border-t border-ink pt-4">
                    <p className="label-wide-sm">{p.title}</p>
                    {p.text ? <p className="mt-2 text-[15px] text-muted">{p.text}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <Related title="Проекты и направления работы" items={projects} />
          {m.isPresident || m.isVicePresident ? (
            <Signature shape={parseSignature(m.signatureSvg)} fallback={Boolean(m.isPresident)} trigger="view" label={`Подпись: ${m.name}`} className="h-auto w-[240px] text-navy-950" />
          ) : null}
          <div>
            <Link href="/team" className="label-wide-sm link-draw">
              ← Вся администрация
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
