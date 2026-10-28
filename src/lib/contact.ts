/** Проверка формы «Контакты». Чистая функция: используется в серверном действии и в тестах. */

export const MESSAGE_TOPICS = {
  question: 'Вопрос администрации',
  idea: 'Предложение',
  event: 'Мероприятия',
  complaint: 'Проблема в школе',
  other: 'Другое',
} as const
export type MessageTopic = keyof typeof MESSAGE_TOPICS

export type ContactValues = { name: string; email: string; grade: string; topic: MessageTopic | string; subject: string; message: string }
export type ContactErrors = Partial<Record<keyof ContactValues | 'form', string>>
export type ContactState = { status: 'idle' | 'ok' | 'error'; errors?: ContactErrors; values?: ContactValues }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateContact(raw: ContactValues): { ok: true; values: ContactValues } | { ok: false; errors: ContactErrors; values: ContactValues } {
  const values: ContactValues = {
    name: raw.name.trim().slice(0, 80),
    email: raw.email.trim().toLowerCase().slice(0, 120),
    grade: raw.grade.trim().slice(0, 20),
    topic: raw.topic in MESSAGE_TOPICS ? raw.topic : 'other',
    subject: raw.subject.trim().slice(0, 140),
    message: raw.message.trim().slice(0, 4000),
  }
  const errors: ContactErrors = {}
  if (values.name.length < 2) errors.name = 'Укажите имя'
  if (!EMAIL.test(values.email)) errors.email = 'Проверьте адрес почты'
  if (values.subject.length < 3) errors.subject = 'Коротко опишите тему'
  if (values.message.length < 10) errors.message = 'Сообщение слишком короткое'
  return Object.keys(errors).length ? { ok: false, errors, values } : { ok: true, values }
}
