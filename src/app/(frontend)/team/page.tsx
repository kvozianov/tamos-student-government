import type { Metadata } from 'next'
import Link from 'next/link'

import { DemoBadge } from '@/components/site/DemoBadge'
import { EmptyState } from '@/components/site/EmptyState'
import { MediaImage } from '@/components/site/MediaImage'
import { PageHero } from '@/components/site/PageHero'
import { Reveal } from '@/components/site/Reveal'
import { hasRichText, RichText } from '@/components/site/RichText'
import { LeaderBlock } from '@/components/site/LeaderBlock'
import { getHome, getPresident, getTeam, getVicePresident } from '@/lib/data'
import { pageMeta } from '@/lib/meta'

export const metadata: Metadata = pageMeta({ title: 'Команда', description: 'Президент, вице-президент и команда президентской администрации TAMOS: должности, направления ответственности и биографии.', path: '/team' })

export default async function AdministrationPage() {
  const [president, vicePresident, team, home] = await Promise.all([getPresident(), getVicePresident(), getTeam(), getHome()])
  return (
    <>
      <PageHero title="Команда" crumbs={[{ label: 'Команда' }]} />

      {president ? (
        <section className="py-16 md:py-24" aria-label="Президент">
          <div className="container-site">
            <LeaderBlock member={president} priority />
          </div>
        </section>
      ) : null}

      {vicePresident ? (
        <section className="border-t border-rule py-16 md:py-24" aria-label="Вице-президент">
          <div className="container-site">
            <LeaderBlock member={vicePresident} reverse />
          </div>
        </section>
      ) : null}

      {hasRichText(home.address) ? (
        <section className="border-y border-rule bg-mist py-16 md:py-24" aria-labelledby="address-title">
          <div className="container-text">
            <h2 id="address-title" className="label-wide mb-8 text-center text-navy-700">
              {home.addressTitle || 'Обращение президента'}
            </h2>
            <RichText data={home.address} />
          </div>
        </section>
      ) : null}

      <section className="py-16 md:py-24" aria-labelledby="team-title">
        <div className="container-site">
          <h2 id="team-title" className="mb-4 font-serif text-[44px] leading-none md:text-[60px]">
            Команда министров
          </h2>
          <p className="mb-12 max-w-2xl text-[17px] text-muted">Министры и руководители направлений: должности и зоны ответственности.</p>
          {team.length ? (
            <ul className="border-t border-ink">
              {team.map((m) => (
                <Reveal as="li" key={m.id} className="group relative grid gap-6 border-b border-rule py-8 sm:grid-cols-[160px_1fr] md:grid-cols-[200px_1fr] md:gap-12">
                  <MediaImage media={m.photo} size="thumbnail" className="aspect-[4/5] w-[160px] md:w-[200px]" sizes="200px" placeholderLabel="Портрет" />
                  <div className="self-center">
                    <h3 className="font-serif text-[32px] leading-tight md:text-[38px]">
                      <Link href={`/team/${m.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                        {m.name}
                      </Link>
                    </h3>
                    <p className="label-wide-sm mt-2 text-navy-700">{m.position}</p>
                    {m.area ? <p className="mt-3 text-[15px] text-ink">{m.area}</p> : null}
                    {m.shortBio ? <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-muted">{m.shortBio}</p> : null}
                    <DemoBadge show={m.isDemo} className="mt-4" />
                  </div>
                </Reveal>
              ))}
            </ul>
          ) : (
            <EmptyState title="Команда министров будет представлена позже" text="Состав формируется. Как только министры будут назначены, их карточки появятся здесь." />
          )}
        </div>
      </section>
    </>
  )
}
