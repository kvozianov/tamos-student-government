import clsx from 'clsx'

type Props = { url?: string | null; note?: string | null; onDark?: boolean; className?: string }

/** Кнопка подачи идеи. Ведёт на Google Forms из настроек; пока ссылки нет — честное сообщение без фиктивной формы. */
export function IdeasCta({ url, note, onDark, className }: Props) {
  if (!url) {
    return (
      <div className={clsx('flex flex-col items-start gap-3', className)}>
        <span
          aria-disabled="true"
          className={clsx('label-wide inline-flex cursor-not-allowed items-center gap-3 border px-7 py-4', onDark ? 'border-white/30 text-white/60' : 'border-rule text-subtle')}
        >
          Предложить идею
        </span>
        <p className={clsx('text-[14px]', onDark ? 'text-white/60' : 'text-muted')}>Приём заявок скоро откроется. Следите за новостями.</p>
      </div>
    )
  }
  return (
    <div className={clsx('flex flex-col items-start gap-3', className)}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(
          'group label-wide inline-flex items-center gap-4 px-7 py-4 transition-colors duration-300',
          onDark ? 'bg-paper text-navy-950 hover:bg-navy-100' : 'bg-navy-900 text-white hover:bg-navy-700',
        )}
      >
        Предложить идею
        <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5">
          ↗
        </span>
        <span className="sr-only">(форма откроется в новой вкладке)</span>
      </a>
      {note ? <p className={clsx('text-[14px]', onDark ? 'text-white/60' : 'text-muted')}>{note}</p> : null}
    </div>
  )
}
