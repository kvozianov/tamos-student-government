'use server'

import { headers } from 'next/headers'

import { getClient } from '@/lib/data'
import { validateContact, type ContactState, type MessageTopic } from '@/lib/contact'

/** Обращение с формы «Контакты»: проверка, защита от ботов и запись в коллекцию messages. */
export async function sendMessage(_prev: ContactState, form: FormData): Promise<ContactState> {
  // Ловушки для ботов: скрытое поле должно остаться пустым, а форма — провисеть на странице хотя бы 3 секунды.
  const startedAt = Number(form.get('startedAt'))
  if (form.get('website') || !startedAt || Date.now() - startedAt < 3000) return { status: 'ok' }

  const result = validateContact({
    name: String(form.get('name') ?? ''),
    email: String(form.get('email') ?? ''),
    grade: String(form.get('grade') ?? ''),
    topic: String(form.get('topic') ?? ''),
    subject: String(form.get('subject') ?? ''),
    message: String(form.get('message') ?? ''),
  })
  if (!result.ok) return { status: 'error', errors: result.errors, values: result.values }

  const payload = await getClient()
  try {
    await payload.create({
      collection: 'messages',
      overrideAccess: true,
      data: { ...result.values, topic: result.values.topic as MessageTopic, status: 'new' },
    })
  } catch (err) {
    const h = await headers()
    payload.logger.error({ err, ip: h.get('x-forwarded-for') }, 'Не удалось сохранить обращение')
    return { status: 'error', errors: { form: 'Не получилось отправить. Попробуйте ещё раз или напишите на почту.' }, values: result.values }
  }
  return { status: 'ok' }
}

