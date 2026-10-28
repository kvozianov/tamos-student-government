import type { Metadata } from 'next'
import Link from 'next/link'

import { AlbumCard, MemberCard, NewBadge } from '@/components/site/cards'
import { MediaImage } from '@/components/site/MediaImage'
import { PageHero } from '@/components/site/PageHero'
import { Reveal } from '@/components/site/Reveal'
import { hasRichText, RichText } from '@/components/site/RichText'
import { StatusBadge } from '@/components/site/StatusBadge'
import { Timeline } from '@/components/site/Timeline'
import type { Album, Member, Promise as PromiseDoc } from '@/payload-types'
import { getCampaign, getPromises } from '@/lib/data'
import { pageMeta } from '@/lib/meta'
import { docs } from '@/lib/rel'

export async function generateMetadata(): Promise<Metadata> {
  const c = await getCampaign()
  return pageMeta({ title: c.title || 'Кампания', description: c.lead, image: c.cover, path: '/campaign' })
}

const SECTIONS = [
  { id: 'story', label: 'История' },
  { id: 'goals', label: 'Идеи и цели' },
  { id: 'program', label: 'Программа' },
  { id: 'chronicle', label: 'Хроника' },
  { id: 'team', label: 'Команда' },
  { id: 'results', label: 'Итоги' },
]

export default async function CampaignPage() {
  const [c, allPromises] = await Promise.all([getCampaign(), getPromises()])
  const selected = docs<PromiseDoc>(c.programPromises)
  const program = selected.length ? selected : allPromises
  const team = docs<Member>(c.team).filter((m) => m.active !== false)
  const albums = docs<Album>(c.albums)

  return (
    <>
      <PageHero title={c.title || 'Кампания'} lead={c.lead} eyebrow="Архив кампании" crumbs={[{ label: 'Кампания' }]}>
        <nav aria-label="Разделы страницы" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="label-wide-sm link-draw text-muted hover:text-ink">
              {s.label}
            </a>
          ))}
        </nav>
      </PageHero>

      {c.isDemo ? (
        <p className="border-b border-rule bg-mist py-3 text-center text-[14px] text-muted">
          Тексты раздела временные и будут заменены историей кампании от команды президента.
        </p>
      ) : null}

      {c.cover ? (
        <div className="container-site pt-12 md:pt-16">
          <MediaImage media={c.cover} size="wide" className="aspect-[21/9]" sizes="100vw" priority />
        </div>
      ) : null}

      <div className="container-site space-y-24 py-16 md:space-y-32 md:py-24">
        <section id="story" aria-labelledby="story-title" className="grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-20">
          <h2 id="story-title" className="font-serif text-[40px] leading-none md:text-[52px]">
            История кампании
          </h2>
          <RichText data={c.story} className="max-w-[760px]" />
        </section>

        {c.goals?.length ? (
          <section id="goals" aria-labelledby="goals-title">
            <h2 id="goals-title" className="mb-10 font-serif text-[40px] leading-none md:text-[52px]">
              Основные идеи и цели
            </h2>
            <ol className="grid gap-px border border-rule bg-rule md:grid-cols-3">
              {c.goals.map((g, i) => (
                <Reveal as="li" key={g.id ?? i} delay={i * 0.06} className="bg-paper p-8">
                  <span className="font-serif text-[48px] leading-none text-navy-700/25">{String(i + 1).padStart(2, '0')}</span>
                  <p className="mt-4 font-serif text-[27px] leading-tight">{g.title}</p>
                  {g.text ? <p className="mt-3 text-[15px] leading-relaxed text-muted">{g.text}</p> : null}
                </Reveal>
              ))}
            </ol>
          </section>
        ) : null}

        <section id="program" aria-labelledby="program-title" className="grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-20">
          <div>
            <h2 id="program-title" className="font-serif text-[40px] leading-none md:text-[52px]">
              Предвыборная программа
            </h2>
            <Link href="/programme" className="label-wide-sm link-draw mt-6 inline-block text-navy-700">
              Ход выполнения →
            </Link>
          </div>
          <div>
            {hasRichText(c.programIntro) ? <RichText data={c.programIntro} className="mb-8 max-w-[760px]" /> : null}
            <ol className="border-t border-ink">
              {program.map((p, i) => (
                <li key={p.id} className="group relative grid gap-2 border-b border-rule py-5 md:grid-cols-[48px_1fr_240px] md:gap-6">
                  <span className="label-wide-sm pt-2 text-subtle">{String(p.number ?? i + 1).padStart(2, '0')}</span>
                  <div>
                    <Link href={`/programme/${p.slug}`} className="font-serif text-[23px] leading-snug after:absolute after:inset-0 group-hover:underline">
                      {p.title}
                    </Link>
                    <p className="mt-1 text-[15px] leading-relaxed text-muted">{p.summary}</p>
                    {p.deadline ? (
                      <p className="mt-2 text-[14px] text-ink">
                        <span className="label-wide-sm mr-2 text-subtle">Срок</span>
                        {p.deadline}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-start gap-2 md:flex-col md:items-end md:pt-2">
                    <StatusBadge kind="promise" status={p.status} />
                    <NewBadge show={p.isNew} />
                  </div>
                </li>
              ))}
            </ol>
            {c.initiatives?.length ? (
              <div className="mt-14">
                <h3 className="label-wide mb-5 text-subtle">Ключевые инициативы</h3>
                <ul className="grid gap-8 sm:grid-cols-2">
                  {c.initiatives.map((it, i) => (
                    <li key={it.id ?? i} className="border-t border-rule pt-4">
                      {it.href ? (
                        <Link href={it.href} className="font-serif text-[24px] leading-tight hover:underline">
                          {it.title}
                        </Link>
                      ) : (
                        <p className="font-serif text-[24px] leading-tight">{it.title}</p>
                      )}
                      {it.text ? <p className="mt-2 text-[15px] text-muted">{it.text}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>

        <section id="chronicle" aria-labelledby="chronicle-title" className="grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-20">
          <h2 id="chronicle-title" className="font-serif text-[40px] leading-none md:text-[52px]">
            Хроника
          </h2>
          <div className="space-y-14">
            <ol className="border-t border-ink">
              {[...(c.timeline ?? [])]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((t, i) => (
                  <li key={t.id ?? i} className="grid gap-2 border-b border-rule py-6 md:grid-cols-[180px_1fr] md:gap-10">
                    <Timeline.Date date={t.date} />
                    <div>
                      <p className="font-serif text-[24px] leading-snug">{t.title}</p>
                      {t.text ? <p className="mt-2 text-[15px] text-muted">{t.text}</p> : null}
                    </div>
                  </li>
                ))}
              {!c.timeline?.length ? <li className="py-6 text-muted">Хроника кампании будет добавлена.</li> : null}
            </ol>
            {albums.length ? (
              <div className="grid gap-10 md:grid-cols-2">
                {albums.map((a) => (
                  <AlbumCard key={a.id} album={a} />
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section id="team" aria-labelledby="team-title">
          <h2 id="team-title" className="mb-10 font-serif text-[40px] leading-none md:text-[52px]">
            Команда кампании
          </h2>
          {team.length ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-5">
              {team.map((m) => (
                <MemberCard key={m.id} member={m} />
              ))}
            </div>
          ) : null}
          {c.volunteers?.length ? (
            <ul className="mt-12 grid gap-x-10 gap-y-3 border-t border-rule pt-6 sm:grid-cols-2 lg:grid-cols-3">
              {c.volunteers.map((v, i) => (
                <li key={v.id ?? i} className="text-[16px]">
                  {v.name}
                  {v.role ? <span className="text-muted"> — {v.role}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section id="results" aria-labelledby="results-title" className="grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-20">
          <h2 id="results-title" className="font-serif text-[40px] leading-none md:text-[52px]">
            Итоги
          </h2>
          <div>
            {c.resultFacts?.length ? (
              <dl className="mb-10 grid grid-cols-2 border-t border-ink md:grid-cols-3">
                {c.resultFacts.map((f, i) => (
                  <div key={f.id ?? i} className="border-b border-rule py-6 pr-4">
                    <dd className="font-serif text-[56px] leading-none">{f.value}</dd>
                    <dt className="mt-2 text-[15px] text-muted">{f.label}</dt>
                  </div>
                ))}
              </dl>
            ) : null}
            <RichText data={c.results} className="max-w-[760px]" />
          </div>
        </section>
      </div>
    </>
  )
}
