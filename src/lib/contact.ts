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

/** Максимальная длина каждого поля. Длиннее сервер не сохранит, даже если запрос отправлен в обход формы. */
export const CONTACT_MAX_LENGTH = { name: 80, email: 120, grade: 20, topic: 20, subject: 140, message: 4000 } as const satisfies Record<keyof ContactValues, number>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const clip = (value: unknown, key: keyof ContactValues) => (typeof value === 'string' ? value : '').trim().slice(0, CONTACT_MAX_LENGTH[key])

export function validateContact(raw: ContactValues): { ok: true; values: ContactValues } | { ok: false; errors: ContactErrors; values: ContactValues } {
  const values: ContactValues = {
    name: clip(raw.name, 'name'),
    email: clip(raw.email, 'email').toLowerCase(),
    grade: clip(raw.grade, 'grade'),
    topic: Object.hasOwn(MESSAGE_TOPICS, raw.topic) ? raw.topic : 'other',
    subject: clip(raw.subject, 'subject'),
    message: clip(raw.message, 'message'),
  }
  const errors: ContactErrors = {}
  if (values.name.length < 2) errors.name = 'Укажите имя'
  if (!EMAIL.test(values.email)) errors.email = 'Проверьте адрес почты'
  if (values.subject.length < 3) errors.subject = 'Коротко опишите тему'
  if (values.message.length < 10) errors.message = 'Сообщение слишком короткое'
  return Object.keys(errors).length ? { ok: false, errors, values } : { ok: true, values }
}
