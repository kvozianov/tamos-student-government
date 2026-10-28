import React from 'react'

const links = [
  { href: '/admin/collections/news/create', label: 'Написать новость' },
  { href: '/admin/collections/events', label: 'События и статусы' },
  { href: '/admin/collections/promises', label: 'Пункты программы' },
  { href: '/admin/collections/members', label: 'Команда' },
  { href: '/admin/collections/messages', label: 'Обращения' },
  { href: '/admin/collections/reports/create', label: 'Новый отчёт' },
  { href: '/admin/collections/albums/create', label: 'Новый альбом' },
  { href: '/admin/globals/settings', label: 'Ссылка на Google Forms' },
]

export function Welcome() {
  return (
    <div style={{ border: '1px solid var(--theme-elevation-150)', padding: '20px 24px', marginBottom: 32 }}>
      <h2 style={{ margin: '0 0 6px', fontSize: 20 }}>Панель управления сайтом</h2>
      <p style={{ margin: '0 0 14px', opacity: 0.75, maxWidth: 760 }}>
        Все материалы сохраняются как черновики, пока вы не нажмёте «Опубликовать». Статусы событий и обещаний на сайте
        обновляются сразу после публикации. Записи с отметкой «Демо-материал» — временные примеры: замените их настоящими.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {links.map((l) => (
          <a key={l.href} href={l.href} className="btn btn--style-secondary btn--size-small" style={{ margin: 0 }}>
            {l.label}
          </a>
        ))}
        <a href="/" target="_blank" rel="noreferrer" className="btn btn--style-primary btn--size-small" style={{ margin: 0 }}>
          Открыть сайт ↗
        </a>
      </div>
    </div>
  )
}
