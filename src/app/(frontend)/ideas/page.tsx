import type { Metadata } from 'next'

import { IdeaCard } from '@/components/site/cards'
import { EmptyState } from '@/components/site/EmptyState'
import { IdeasCta } from '@/components/site/IdeasCta'
import { PageHero } from '@/components/site/PageHero'
import { ProcessSteps } from '@/components/site/ProcessSteps'
import { Reveal } from '@/components/site/Reveal'
import { RichText } from '@/components/site/RichText'
import { getIdeas, getIdeasPage, getSettings } from '@/lib/data'
import { pageMeta } from '@/lib/meta'

export const metadata: Metadata = pageMeta({
  title: 'Бюро идей',
  description: 'Бюро идей администрации TAMOS помогает превратить идею ученика в проект школы: рассмотрение, доработка, согласование и реализация.',
  path: '/ideas',
})

export default async function IdeasPage() {
  const [page, settings, ideas] = await Promise.all([getIdeasPage(), getSettings(), getIdeas()])
  return (
    <>
      <PageHero title="Бюро идей" lead={page.lead} crumbs={[{ label: 'Бюро идей' }]}>
        <div className="flex justify-center">
          <IdeasCta url={settings.ideasFormUrl} note={settings.ideasFormNote} className="items-center text-center" />
        </div>
      </PageHero>

      <section className="py-16 md:py-24" aria-labelledby="about-title">
        <div className="container-site grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <Reveal>
            <h2 id="about-title" className="font-serif text-[40px] leading-[1.05] md:text-[52px]">
              Что такое Бюро идей
            </h2>
            <RichText data={page.about} className="mt-8" />
          </Reveal>
          {page.principles?.length ? (
            <dl className="grid gap-px self-start border border-rule bg-rule sm:grid-cols-2">
              {page.principles.map((pr, i) => (
                <Reveal key={pr.id ?? i} delay={i * 0.06} className="bg-paper p-7">
                  <dt className="font-serif text-[25px] leading-tight">{pr.title}</dt>
                  {pr.text ? <dd className="mt-3 text-[15px] leading-relaxed text-muted">{pr.text}</dd> : null}
                </Reveal>
              ))}
            </dl>
          ) : null}
        </div>
      </section>

      {page.steps?.length ? (
        <section className="border-y border-rule bg-mist py-16 md:py-24" aria-labelledby="how-title">
          <div className="container-site">
            <h2 id="how-title" className="mb-12 font-serif text-[40px] leading-none md:text-[52px]">
              Как это работает
            </h2>
            <ProcessSteps steps={page.steps} />
          </div>
        </section>
      ) : null}

      <section className="py-16 md:py-24" aria-labelledby="cases-title">
        <div className="container-site">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <h2 id="cases-title" className="font-serif text-[40px] leading-none md:text-[52px]">
              Проекты, прошедшие Бюро
            </h2>
          </div>
          {ideas.length ? (
            <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
              {ideas.map((idea, i) => (
                <Reveal key={idea.id} delay={(i % 3) * 0.06} className="h-full">
                  <IdeaCard idea={idea} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState title="Каталог проектов пока пуст" text="Первые кейсы появятся после рассмотрения заявок." />
          )}
        </div>
      </section>

      <section className="border-t border-rule bg-mist py-16 md:py-20" aria-labelledby="cta-title">
        <div className="container-site grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 id="cta-title" className="font-serif text-[36px] leading-tight md:text-[48px]">
              {page.ctaTitle || 'Есть идея для школы?'}
            </h2>
            {page.ctaText ? <p className="mt-4 max-w-2xl text-[17px] text-muted">{page.ctaText}</p> : null}
          </div>
          <IdeasCta url={settings.ideasFormUrl} note={settings.ideasFormNote} />
        </div>
      </section>
    </>
  )
}
