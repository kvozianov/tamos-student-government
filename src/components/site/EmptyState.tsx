import clsx from 'clsx'

import { Seal } from './Seal'

export function EmptyState({ title, text, className, children }: { title: string; text?: string; className?: string; children?: React.ReactNode }) {
  return (
    <div className={clsx('flex flex-col items-center border border-rule px-6 py-16 text-center md:py-20', className)}>
      <Seal size={56} className="mb-6 text-ink/25" />
      <p className="font-serif text-[30px] leading-tight text-ink">{title}</p>
      {text ? <p className="mt-3 max-w-md text-[16px] text-muted">{text}</p> : null}
      {children ? <div className="mt-8">{children}</div> : null}
    </div>
  )
}
