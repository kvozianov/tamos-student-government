'use server'

import { headers } from 'next/headers'

import { getClient } from '@/lib/data'
import { validateContact, type ContactState, type MessageTopic } from '@/lib/contact'
import { CONTACT_LIMITS, RATE_LIMIT_MESSAGES, clientIp, clientKey, rateLimitVerdict } from '@/lib/contact-guard'

const SEND_FAILED = 'Не получилось отправить. Попробуйте ещё раз или напишите на почту.'

/** Обращение с формы «Контакты»: проверка, защита от ботов и потока сообщений, запись в коллекцию messages. */
export async function sendMessage(_prev: ContactState, form: FormData): Promise<ContactState> {
  const text = (name: string) => {
    const value = form.get(name)
    return typeof value === 'string' ? value : ''
  }
  const result = validateContact({
    name: text('name'),
    email: text('email'),
    grade: text('grade'),
    topic: text('topic'),
    subject: text('subject'),
    message: text('message'),
  })
  if (!result.ok) return { status: 'error', errors: result.errors, values: result.values }

  // Ловушки для простых ботов: скрытое поле должно остаться пустым, а форма — провисеть на странице хотя бы 3 секунды.
  // Бот получает обычный ответ об успехе, но в базу ничего не пишется. Время ставит браузер, поэтому это только
  // дополнительный сигнал: от целенаправленной отправки защищает ограничение частоты ниже.
  const startedAt = Number(text('startedAt'))
  if (text('website') || !startedAt || Date.now() - startedAt < 3000) return { status: 'ok' }

  const payload = await getClient()
  const key = clientKey(clientIp(await headers()), payload.secret)
  const since = (ms: number) => new Date(Date.now() - ms).toISOString()

  try {
    const [fromClient, total] = await Promise.all([
      payload.count({
        collection: 'messages',
        overrideAccess: true,
        where: { and: [{ clientKey: { equals: key } }, { createdAt: { greater_than: since(CONTACT_LIMITS.perClient.windowMs) } }] },
      }),
      payload.count({ collection: 'messages', overrideAccess: true, where: { createdAt: { greater_than: since(CONTACT_LIMITS.global.windowMs) } } }),
    ])
    const verdict = rateLimitVerdict({ client: fromClient.totalDocs, global: total.totalDocs })
    if (verdict !== 'ok') {
      payload.logger.warn({ clientKey: key, verdict }, 'Форма обращений: превышен лимит')
      return { status: 'error', errors: { form: RATE_LIMIT_MESSAGES[verdict] }, values: result.values }
    }

    await payload.create({
      collection: 'messages',
      overrideAccess: true,
      data: { ...result.values, topic: result.values.topic as MessageTopic, status: 'new', clientKey: key },
    })
  } catch (err) {
    payload.logger.error({ err, clientKey: key }, 'Не удалось сохранить обращение')
    return { status: 'error', errors: { form: SEND_FAILED }, values: result.values }
  }
  return { status: 'ok' }
}
