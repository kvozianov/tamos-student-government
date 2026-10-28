import Image from 'next/image'
import Link from 'next/link'

import type { Setting } from '@/payload-types'
import { asMedia, mediaUrl } from '@/lib/media'

import { NAV_GROUPS } from './nav'
import { Seal } from './Seal'
import { SiteLink } from './SiteLink'

const SOCIAL_LABEL: Record<string, string> = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  other: 'Ссылка',
}

export function Footer({ settings }: { settings: Setting }) {
  const logo = mediaUrl(asMedia(settings.logo), 'thumbnail')
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-rule bg-mist text-ink">
      <div className="container-site py-16 md:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <SiteLink href="/" className="inline-flex items-center gap-4 text-navy-950">
              {logo ? <Image src={logo} alt="" width={56} height={56} className="size-14 object-contain" /> : <Seal size={56} />}
              <span className="flex flex-col leading-none">
                <span className="font-serif text-[30px] tracking-[0.14em]">{settings.shortName}</span>
                <span className="label-wide-sm mt-1.5 text-muted">{settings.descriptor}</span>
              </span>
            </SiteLink>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted">{settings.description}</p>
            {settings.contactEmail || settings.address ? (
              <div className="mt-8 space-y-2 text-[15px]">
                {settings.contactEmail ? (
                  <p>
                    <a href={`mailto:${settings.contactEmail}`} className="link-draw text-navy-700">
                      {settings.contactEmail}
                    </a>
                  </p>
                ) : null}
                {settings.address ? <p className="text-muted">{settings.address}</p> : null}
              </div>
            ) : null}
          </div>
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            {NAV_GROUPS.map((g) => (
              <nav key={g.title} aria-label={g.title}>
                <h2 className="label-wide mb-5 text-ink">{g.title}</h2>
                <ul className="space-y-3 text-[15px] text-muted">
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <SiteLink href={l.href} className="link-draw hover:text-ink">
                        {l.label}
                      </SiteLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        {settings.socials?.length ? (
          <ul className="mt-14 flex flex-wrap gap-3">
            {settings.socials.map((s) => (
              <li key={s.id ?? s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="label-wide-sm inline-flex border border-rule bg-paper px-4 py-2.5 text-ink transition-colors hover:border-navy-700 hover:text-navy-700">
                  {SOCIAL_LABEL[s.platform] ?? 'Ссылка'} ↗
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="border-t border-rule">
        <div className="container-site flex flex-col gap-4 py-6 text-[13px] text-subtle md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {settings.siteName}. Официальный сайт.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <SiteLink href="/search" className="hover:text-ink">
                Поиск
              </SiteLink>
            </li>
            <li>
              <a href="/sitemap.xml" className="hover:text-ink">
                Карта сайта
              </a>
            </li>
            <li>
              <Link href="/admin" prefetch={false} className="hover:text-ink">
                Вход для редакции
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
