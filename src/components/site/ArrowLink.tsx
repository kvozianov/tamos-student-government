import clsx from 'clsx'

import { SiteLink } from './SiteLink'

type Props = {
  href: string
  children: React.ReactNode
  className?: string
  external?: boolean
  onDark?: boolean
}

export function ArrowLink({ href, children, className, external, onDark }: Props) {
  const content = (
    <>
      <span className="link-draw pb-0.5">{children}</span>
      <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true" className="shrink-0 transition-transform duration-300 group-hover:translate-x-1">
        <path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    </>
  )
  const cls = clsx('group label-wide inline-flex items-center gap-3', onDark ? 'text-white' : 'text-ink', className)
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {content}
        <span className="sr-only">(откроется в новой вкладке)</span>
      </a>
    )
  }
  return (
    <SiteLink href={href} className={cls}>
      {content}
    </SiteLink>
  )
}
