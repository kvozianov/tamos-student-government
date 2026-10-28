import type { Metadata } from 'next'
import Link from 'next/link'

import { ContactForm } from '@/components/site/ContactForm'
import { PageHero } from '@/components/site/PageHero'
import { getSettings } from '@/lib/data'
import { pageMeta } from '@/lib/meta'

export const metadata: Metadata = pageMeta({
  title: 'Контакты',
  description: 'Как связаться со студенческим самоуправлением TAMOS: почта, соцсети и форма обращения к президенту и вице-президенту.',
  path: '/contact',
})

const SOCIAL_LABEL: Record<string, string> = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  other: 'Ссылка',
}

export default async function ContactPage() {
  const settings = await getSettings()
  return (
    <>
      <PageHero
        title="Контакты"
        lead="Вопрос, предложение или проблема в школе — напишите администрации. Мы читаем каждое обращение и отвечаем в течение недели."
        crumbs={[{ label: 'Контакты' }]}
      />
      <div className="container-site grid gap-16 py-14 md:py-20 lg:grid-cols-[1fr_1.6fr] lg:gap-24">
        <aside className="space-y-10">
          {settings.contactEmail ? (
            <section aria-labelledby="mail-title">
              <h2 id="mail-title" className="label-wide-sm text-subtle">
                Почта
              </h2>
              <a href={`mailto:${settings.contactEmail}`} className="link-draw mt-3 inline-block font-serif text-[28px] leading-tight text-navy-700">
                {settings.contactEmail}
              </a>
            </section>
          ) : null}
          {settings.socials?.length ? (
            <section aria-labelledby="social-title">
              <h2 id="social-title" className="label-wide-sm text-subtle">
                Соцсети
              </h2>
              <ul className="mt-3 space-y-2 text-[17px]">
                {settings.socials.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noreferrer" className="link-draw">
                      {SOCIAL_LABEL[s.platform] ?? s.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section aria-labelledby="place-title">
            <h2 id="place-title" className="label-wide-sm text-subtle">
              Где нас найти
            </h2>
            <p className="mt-3 text-[17px] leading-relaxed">{settings.address || 'TAMOS Education, Алматы. Спросите президента или вице-президента на перемене.'}</p>
          </section>
          <section aria-labelledby="idea-title" className="border-t border-rule pt-8">
            <h2 id="idea-title" className="font-serif text-[28px] leading-tight">
              Есть идея проекта?
            </h2>
            <p className="mt-3 text-[16px] text-muted">Для проектов есть отдельная заявка в Бюро идей: её рассматривают на заседании администрации.</p>
            <Link href="/ideas" className="label-wide-sm link-draw mt-4 inline-block text-navy-700">
              В Бюро идей
            </Link>
          </section>
        </aside>
        <section aria-labelledby="form-title">
          <h2 id="form-title" className="mb-8 font-serif text-[40px] leading-none md:text-[48px]">
            Написать администрации
          </h2>
          <ContactForm />
        </section>
      </div>
    </>
  )
}
