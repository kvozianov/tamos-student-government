/**
 * Справочники статусов и категорий. Используются и в CMS (варианты select),
 * и на сайте (подписи, цвета). Ключи хранятся в базе, поэтому их нельзя
 * переименовывать без миграции данных.
 */

export type Tone = 'neutral' | 'review' | 'approved' | 'progress' | 'soon' | 'done' | 'partial' | 'negative'

type StatusDef = { label: string; tone: Tone; description?: string }

export const EVENT_STATUSES = {
  idea: { label: 'Идея', tone: 'neutral', description: 'Идея озвучена, работа ещё не начата.' },
  review: { label: 'На рассмотрении', tone: 'review', description: 'Предложение обсуждается с администрацией школы.' },
  approved: { label: 'Одобрено', tone: 'approved', description: 'Проведение одобрено, дата пока не утверждена.' },
  preparing: { label: 'В подготовке', tone: 'progress', description: 'Команда готовит программу, площадку и материалы.' },
  date_confirmed: { label: 'Дата утверждена', tone: 'approved', description: 'Дата и время проведения официально утверждены.' },
  soon: { label: 'Скоро состоится', tone: 'soon', description: 'До начала осталось меньше двух недель.' },
  completed: { label: 'Завершено', tone: 'done', description: 'Мероприятие проведено.' },
  cancelled: { label: 'Отменено', tone: 'negative', description: 'Мероприятие не состоится.' },
} as const satisfies Record<string, StatusDef>
export type EventStatus = keyof typeof EVENT_STATUSES

export const PROMISE_STATUSES = {
  planned: { label: 'Запланировано', tone: 'neutral', description: 'Обещание внесено в план, работа ещё не начата.' },
  review: { label: 'На рассмотрении', tone: 'review', description: 'Предложение находится на согласовании.' },
  agreed: { label: 'Согласовано', tone: 'approved', description: 'Получено согласие, работа скоро начнётся.' },
  in_progress: { label: 'В процессе реализации', tone: 'progress', description: 'Команда выполняет конкретные шаги.' },
  done: { label: 'Выполнено', tone: 'done', description: 'Обещание выполнено полностью.' },
  partial: { label: 'Частично выполнено', tone: 'partial', description: 'Сделано частично или в изменённом виде.' },
  failed: { label: 'Не реализовано', tone: 'negative', description: 'Выполнить не удалось. Причина указана в истории.' },
} as const satisfies Record<string, StatusDef>
export type PromiseStatus = keyof typeof PROMISE_STATUSES

export const IDEA_STATUSES = {
  submitted: { label: 'Идея подана', tone: 'neutral' },
  review: { label: 'Первичное рассмотрение', tone: 'review' },
  refining: { label: 'Доработка концепции', tone: 'progress' },
  approval: { label: 'Согласование', tone: 'approved' },
  implementation: { label: 'Реализация', tone: 'progress' },
  implemented: { label: 'Реализовано', tone: 'done' },
} as const satisfies Record<string, StatusDef>
export type IdeaStatus = keyof typeof IDEA_STATUSES

export const NEWS_CATEGORIES = {
  statement: 'Заявления',
  news: 'Новости',
  initiative: 'Инициативы',
  results: 'Итоги мероприятий',
  interview: 'Интервью и публикации',
  project: 'Обновления проектов',
} as const
export type NewsCategory = keyof typeof NEWS_CATEGORIES

export const REPORT_TYPES = {
  activity: 'Отчёты о деятельности',
  approved: 'Утверждённые инициативы',
  implemented: 'Реализованные проекты',
  current: 'Текущая деятельность',
} as const
export type ReportType = keyof typeof REPORT_TYPES

export const REPORT_TYPE_SINGULAR: Record<ReportType, string> = {
  activity: 'Отчёт о деятельности',
  approved: 'Утверждённая инициатива',
  implemented: 'Реализованный проект',
  current: 'Текущая деятельность',
}

export const toOptions = (map: Record<string, StatusDef | string>) =>
  Object.entries(map).map(([value, def]) => ({ value, label: typeof def === 'string' ? def : def.label }))
