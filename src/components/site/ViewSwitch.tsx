'use client'

import clsx from 'clsx'
import { useSyncExternalStore } from 'react'

type View = { id: string; label: string; content: React.ReactNode }

const subscribeHash = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

/** Переключатель «Список / Календарь». Выбранный вид хранится в якоре адреса (#calendar), им можно поделиться. */
export function ViewSwitch({ views, label }: { views: View[]; label: string }) {
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash, () => '')
  const active = views.find((v) => `#${v.id}` === hash)?.id ?? views[0].id

  const select = (id: string) => {
    const { pathname, search } = window.location
    history.replaceState(null, '', id === views[0].id ? pathname + search : `${pathname}${search}#${id}`)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  }

  return (
    <div>
      <div role="tablist" aria-label={label} className="mb-10 inline-flex border border-rule p-1">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            id={`tab-${v.id}`}
            aria-selected={active === v.id}
            aria-controls={`panel-${v.id}`}
            onClick={() => select(v.id)}
            className={clsx('label-wide-sm px-5 py-3 transition-colors', active === v.id ? 'bg-navy-900 text-white' : 'text-muted hover:text-ink')}
          >
            {v.label}
          </button>
        ))}
      </div>
      {views.map((v) => (
        <div key={v.id} role="tabpanel" id={`panel-${v.id}`} aria-labelledby={`tab-${v.id}`} hidden={active !== v.id}>
          {v.content}
        </div>
      ))}
    </div>
  )
}
