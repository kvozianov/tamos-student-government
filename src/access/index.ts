import type { Access, FieldAccess } from 'payload'

/** Разделы сайта, которые администратор может выдать редактору. */
export const SECTIONS = {
  news: 'Новости',
  events: 'События',
  promises: 'Обещания',
  ideas: 'Бюро идей',
  albums: 'Галерея',
  reports: 'Отчётность',
  members: 'Администрация',
  campaign: 'Кампания',
  home: 'Главная страница',
  categories: 'Темы обещаний',
} as const
export type Section = keyof typeof SECTIONS

type StaffUser = { role?: string | null; sections?: string[] | null } | null | undefined

export const isAdminUser = (user: StaffUser) => user?.role === 'admin'

export const canManageSection = (user: StaffUser, section: Section) => {
  if (!user) return false
  if (isAdminUser(user)) return true
  return Array.isArray(user.sections) && user.sections.includes(section)
}

export const isAdmin: Access = ({ req }) => isAdminUser(req.user as StaffUser)
export const isAdminField: FieldAccess = ({ req }) => isAdminUser(req.user as StaffUser)
export const isStaff: Access = ({ req }) => Boolean(req.user)
export const anyone: Access = () => true

/** Создание и правка материалов раздела: администратор или редактор с доступом к разделу. */
export const canManage =
  (section: Section): Access =>
  ({ req }) =>
    canManageSection(req.user as StaffUser, section)

/** Посетители видят только опубликованное, сотрудники видят и черновики. */
export const publishedOrStaff: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}
