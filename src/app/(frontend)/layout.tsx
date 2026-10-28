import type { Metadata, Viewport } from 'next'
import { draftMode } from 'next/headers'
import { Golos_Text, Oranienbaum, Unbounded } from 'next/font/google'

import { Footer } from '@/components/site/Footer'
import { Header, type NavFeature } from '@/components/site/Header'
import { PreviewBar } from '@/components/site/PreviewBar'
import { Providers } from '@/components/site/Providers'
import { getLatestNews, getSettings, getUpcomingEvents } from '@/lib/data'
import { formatDate } from '@/lib/format'
import { asMedia, mediaUrl } from '@/lib/media'
import { siteUrl } from '@/lib/site'

import './globals.css'

// Страницы отдаются из кэша (ISR) и пересобираются не реже раза в минуту: статусы событий зависят от текущего
// времени. Правки в CMS сбрасывают кэш сразу (src/hooks/revalidate.ts). Подробнее — README, раздел «Кэш».
export const revalidate = 60

const serif = Oranienbaum({ weight: '400', subsets: ['latin', 'cyrillic'], variable: '--font-oranienbaum', display: 'swap' })
const sans = Golos_Text({ subsets: ['latin', 'cyrillic'], variable: '--font-golos', display: 'swap' })
const wide = Unbounded({ weight: ['400', '500'], subsets: ['latin', 'cyrillic'], variable: '--font-unbounded', display: 'swap' })

const DEFAULT_TICKER = [
  { text: 'Официальный портал президентской администрации TAMOS', href: null },
  { text: 'Новости и заявления', href: '/news' },
  { text: 'Ближайшие события', href: '/events' },
  { text: 'Выполнение предвыборной программы', href: '/programme' },
  { text: 'Бюро идей', href: '/ideas' },
  { text: 'Отчётность', href: '/reports' },
]

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  const og = mediaUrl(asMedia(s.ogImage), 'og')
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.siteName, template: `%s — ${s.siteName}` },
    description: s.description,
    applicationName: s.siteName,
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      siteName: s.siteName,
      title: s.siteName,
      description: s.description,
      images: og ? [{ url: og, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: 'summary_large_image' },
    icons: { icon: '/favicon.svg' },
  }
}

export const viewport: Viewport = { themeColor: '#060c1f', width: 'device-width', initialScale: 1 }

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, latest, upcoming, draft] = await Promise.all([getSettings(), getLatestNews(1), getUpcomingEvents(1), draftMode()])
  const features: NavFeature[] = []
  if (latest[0]) {
    features.push({ kind: 'Последняя новость', title: latest[0].title, href: `/news/${latest[0].slug}`, image: mediaUrl(asMedia(latest[0].cover), 'card'), meta: formatDate(latest[0].publishedAt) })
  }
  if (upcoming[0]) {
    const ev = upcoming[0]
    features.push({
      kind: 'Ближайшее событие',
      title: ev.title,
      href: `/events/${ev.slug}`,
      image: mediaUrl(asMedia(ev.cover), 'card'),
      meta: ev.dateConfirmed && ev.startsAt ? formatDate(ev.startsAt) : 'дата уточняется',
    })
  }
  const ticker = settings.ticker?.length ? settings.ticker.map((t) => ({ text: t.text, href: t.href })) : DEFAULT_TICKER

  return (
    <html lang="ru" className={`${serif.variable} ${sans.variable} ${wide.variable}`}>
      <head>
        <noscript>
          <style>{'[data-reveal]{opacity:1!important;transform:none!important}.sig-wait .sig-path{animation-play-state:running!important}'}</style>
        </noscript>
      </head>
      <body>
        <Providers>
          {draft.isEnabled ? <PreviewBar /> : null}
          <Header
            shortName={settings.shortName}
            descriptor={settings.descriptor ?? 'Президентская администрация'}
            logoUrl={mediaUrl(asMedia(settings.logo), 'thumbnail')}
            ticker={ticker}
            features={features}
          />
          <main id="content" tabIndex={-1} className="outline-none">
            {children}
          </main>
          {settings.showDemo !== false ? (
            <aside className="border-t border-rule bg-mist">
              <p className="container-site py-4 text-[13px] text-muted">
                Материалы с пометкой <span className="label-wide-sm border border-brass/60 px-1.5 py-0.5 text-brass">Демо</span> — временные примеры. Они будут заменены настоящими публикациями администрации.
              </p>
            </aside>
          ) : null}
          <Footer settings={settings} />
        </Providers>
      </body>
    </html>
  )
}
