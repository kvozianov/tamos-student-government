/** Структура навигации: основная строка меню и группы в раскрывающемся меню и подвале. */
export const PRIMARY_NAV = [
  { href: '/news', label: 'Новости' },
  { href: '/events', label: 'События' },
  { href: '/programme', label: 'Программа' },
  { href: '/team', label: 'Команда' },
  { href: '/ideas', label: 'Бюро идей' },
  { href: '/gallery', label: 'Галерея' },
  { href: '/reports', label: 'Отчётность' },
  { href: '/contact', label: 'Контакты' },
]

export const NAV_GROUPS = [
  {
    title: 'Администрация',
    links: [
      { href: '/team', label: 'Президент и команда' },
      { href: '/campaign', label: 'Кампания' },
      { href: '/contact', label: 'Контакты' },
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
      { href: '/programme', label: 'Программа' },
      { href: '/ideas', label: 'Бюро идей' },
    ],
  },
  {
    title: 'Прозрачность',
    links: [
      { href: '/reports', label: 'Отчётность' },
      { href: '/programme#stats', label: 'Выполнение программы' },
      { href: '/search', label: 'Поиск по сайту' },
    ],
  },
]
