/**
 * Защита формы «Контакты» от потока сообщений. Только для сервера: использует node:crypto.
 *
 * Счётчики не хранятся в памяти — на Vercel каждый запрос может попасть в новый экземпляр функции.
 * Вместо этого в каждом обращении сохраняется ключ отправителя (HMAC от IP с секретом сайта), и перед записью
 * считаем, сколько обращений с этим ключом и всего пришло за последнее время. Сам IP в базе не хранится.
 */
import { createHmac } from 'node:crypto'

export const CONTACT_LIMITS = {
  /** Не больше трёх сообщений с одного адреса за 10 минут. */
  perClient: { max: 3, windowMs: 10 * 60 * 1000 },
  /** Не больше 30 сообщений со всех адресов за час: потолок на случай атаки с множества адресов. */
  global: { max: 30, windowMs: 60 * 60 * 1000 },
} as const

export const RATE_LIMIT_MESSAGES = {
  client: 'Вы отправили несколько сообщений подряд. Попробуйте ещё раз минут через десять или напишите на почту.',
  global: 'Сейчас форма принимает слишком много сообщений. Попробуйте позже или напишите на почту.',
} as const

export type RateLimitVerdict = 'ok' | keyof typeof RATE_LIMIT_MESSAGES

type HeaderSource = { get(name: string): string | null }

/**
 * IP посетителя из заголовков прокси. На Vercel оба заголовка выставляет платформа и подменить их из браузера нельзя.
 * При самостоятельном хостинге перед приложением должен стоять прокси, который их перезаписывает.
 */
export function clientIp(headers: HeaderSource): string | null {
  const real = headers.get('x-real-ip')?.trim()
  if (real) return real
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || null
}

/**
 * Адрес, по которому считается лимит. IPv6 группируется по сети /64: провайдер обычно выдаёт абоненту
 * целую сеть, и перебор адресов внутри неё не должен обходить ограничение.
 */
export function ipBucket(raw: string): string {
  let ip = raw.trim().toLowerCase()
  const bracketed = ip.match(/^\[([^\]]+)\](?::\d+)?$/)
  if (bracketed) ip = bracketed[1]
  if (/^\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?$/.test(ip)) return ip.replace(/:\d+$/, '')
  if (ip.startsWith('::ffff:') && ip.includes('.')) return ip.slice('::ffff:'.length)
  if (!ip.includes(':')) return ip

  ip = ip.split('%')[0]
  let groups: string[]
  if (ip.includes('::')) {
    const [head, tail] = ip.split('::')
    const h = head ? head.split(':') : []
    const t = tail ? tail.split(':') : []
    groups = [...h, ...Array<string>(Math.max(0, 8 - h.length - t.length)).fill('0'), ...t]
  } else {
    groups = ip.split(':')
  }
  return `${groups
    .slice(0, 4)
    .map((g) => (parseInt(g, 16) || 0).toString(16))
    .join(':')}::/64`
}

/** Ключ отправителя для поля clientKey: по нему нельзя восстановить IP, не зная секрета сайта. */
export function clientKey(ip: string | null, secret: string): string {
  return createHmac('sha256', secret)
    .update(`contact:${ip ? ipBucket(ip) : 'unknown'}`)
    .digest('hex')
    .slice(0, 40)
}

/** Решение по числу недавних обращений: от этого отправителя и всего. */
export function rateLimitVerdict(counts: { client: number; global: number }): RateLimitVerdict {
  if (counts.client >= CONTACT_LIMITS.perClient.max) return 'client'
  if (counts.global >= CONTACT_LIMITS.global.max) return 'global'
  return 'ok'
}
