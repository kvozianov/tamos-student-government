import clsx from 'clsx'

export function DemoBadge({ show, className, onDark }: { show?: boolean | null; className?: string; onDark?: boolean }) {
  if (!show) return null
  return (
    <span
      title="Временный пример. Будет заменён настоящим материалом."
      className={clsx(
        'label-wide-sm inline-flex items-center border px-1.5 py-0.5',
        onDark ? 'border-white/40 text-white/80' : 'border-brass/60 text-brass',
        className,
      )}
    >
      Демо
    </span>
  )
}
