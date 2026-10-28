/** Структура навигации: основная строка меню и группы в раскрывающемся меню и подвале. */
export const PRIMARY_NAV = [
  { href: '/administration', label: 'Администрация' },
  { href: '/news', label: 'Новости' },
  { href: '/events', label: 'События' },
  { href: '/promises', label: 'Обещания' },
  { href: '/ideas', label: 'Бюро идей' },
  { href: '/gallery', label: 'Галерея' },
  { href: '/campaign', label: 'Кампания' },
  { href: '/reports', label: 'Отчётность' },
]

export const NAV_GROUPS = [
  {
    title: 'Администрация',
    links: [
      { href: '/administration', label: 'Президент и команда' },
      { href: '/campaign', label: 'Кампания' },
    ],
  },
  {
    title: 'Медиа',
    links: [
      { href: '/news', label: 'Все новости' },
      { href: '/news?category=statement', label: 'Заявления' },
      { href: '/gallery', label: 'Галерея' },
    ],
  },
  {
    title: 'Деятельность',
    links: [
      { href: '/events', label: 'События' },
      { href: '/promises', label: 'Обещания' },
      { href: '/ideas', label: 'Бюро идей' },
    ],
  },
  {
    title: 'Прозрачность',
    links: [
      { href: '/reports', label: 'Отчётность' },
      { href: '/promises#stats', label: 'Статистика обещаний' },
      { href: '/search', label: 'Поиск по сайту' },
    ],
  },
]
