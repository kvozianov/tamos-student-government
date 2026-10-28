import Link from 'next/link'
import type { ComponentProps } from 'react'

import { isFilteredListHref } from '@/lib/filters'

/**
 * Ссылка сайта: next/link для обычных адресов и простой <a> для списков с фильтром (/promises?status=…).
 * Списки с фильтром отдаются из кэша через rewrites, а клиентский роутер Next о них не знает и показал бы
 * раздел без фильтра. Обычный переход берёт страницу из кэша CDN, поэтому остаётся быстрым. См. src/lib/filters.ts.
 */
export function SiteLink(props: ComponentProps<typeof Link>) {
  if (typeof props.href === 'string' && isFilteredListHref(props.href)) {
    const { href, as, replace, scroll, shallow, passHref, prefetch, locale, legacyBehavior, onNavigate, transitionTypes, ...anchor } = props
    return <a href={href} {...anchor} />
  }
  return <Link {...props} />
}
