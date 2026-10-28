import clsx from 'clsx'

import { SiteLink } from './SiteLink'

export type Tab = { label: string; href: string; active?: boolean; count?: number }

/** Вкладки фильтров капсом, как разделы в «News» на whitehouse.gov. Работают обычными ссылками без JavaScript. */
export function FilterTabs({ tabs, label, onDark = false, align = 'center' }: { tabs: Tab[]; label: string; onDark?: boolean; align?: 'center' | 'left' }) {
  return (
    <nav aria-label={label} className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
      <ul className={clsx('flex min-w-max gap-1', align === 'center' ? 'md:justify-center' : '')}>
        {tabs.map((t) => (
          <li key={t.href}>
            <SiteLink
              href={t.href}
              scroll={false}
              aria-current={t.active ? 'page' : undefined}
              className={clsx(
                'label-wide-sm flex items-center gap-2 px-4 py-3 transition-colors duration-200',
                onDark
                  ? t.active
                    ? 'bg-navy-700 text-white'
                    : 'text-white/70 hover:bg-white/8 hover:text-white'
                  : t.active
                    ? 'bg-navy-900 text-white'
                    : 'text-muted hover:bg-mist hover:text-ink',
              )}
            >
              {t.label}
              {typeof t.count === 'number' ? <span className={clsx('tabular-nums', t.active ? 'opacity-70' : 'opacity-50')}>{t.count}</span> : null}
            </SiteLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
