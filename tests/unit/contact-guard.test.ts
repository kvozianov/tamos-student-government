import { describe, expect, it } from 'vitest'

import { CONTACT_MAX_LENGTH, validateContact } from '@/lib/contact'
import { CONTACT_LIMITS, clientIp, clientKey, ipBucket, rateLimitVerdict } from '@/lib/contact-guard'

const headers = (values: Record<string, string>) => ({ get: (name: string) => values[name] ?? null })

describe('contact form rate limit', () => {
  it('takes the client IP from proxy headers', () => {
    expect(clientIp(headers({ 'x-real-ip': '203.0.113.7', 'x-forwarded-for': '198.51.100.1' }))).toBe('203.0.113.7')
    expect(clientIp(headers({ 'x-forwarded-for': ' 198.51.100.1 , 10.0.0.1' }))).toBe('198.51.100.1')
    expect(clientIp(headers({}))).toBeNull()
  })

  it('groups IPv6 addresses by /64 and strips ports and IPv4 mapping', () => {
    expect(ipBucket('2001:db8:1:2:aaaa::1')).toBe('2001:db8:1:2::/64')
    expect(ipBucket('2001:DB8:1:2:ffff:ffff:ffff:ffff')).toBe('2001:db8:1:2::/64')
    expect(ipBucket('2001:db8::1')).toBe('2001:db8:0:0::/64')
    expect(ipBucket('[2001:db8:1:2::5]:443')).toBe('2001:db8:1:2::/64')
    expect(ipBucket('::ffff:203.0.113.7')).toBe('203.0.113.7')
    expect(ipBucket('203.0.113.7:51234')).toBe('203.0.113.7')
  })

  it('stores a keyed hash instead of the address', () => {
    const key = clientKey('203.0.113.7', 'secret-a')
    expect(key).toMatch(/^[0-9a-f]{40}$/)
    expect(key).not.toContain('203')
    expect(clientKey('203.0.113.7', 'secret-a')).toBe(key)
    expect(clientKey('203.0.113.8', 'secret-a')).not.toBe(key)
    expect(clientKey('203.0.113.7', 'secret-b')).not.toBe(key)
    expect(clientKey('2001:db8:1:2::1', 'secret-a')).toBe(clientKey('2001:db8:1:2::ffff', 'secret-a'))
    expect(clientKey(null, 'secret-a')).toMatch(/^[0-9a-f]{40}$/)
  })

  it('refuses the fourth message from one client and any message above the global ceiling', () => {
    const perClient = CONTACT_LIMITS.perClient.max
    const global = CONTACT_LIMITS.global.max
    expect(perClient).toBe(3)
    expect(rateLimitVerdict({ client: 0, global: 0 })).toBe('ok')
    expect(rateLimitVerdict({ client: perClient - 1, global: 5 })).toBe('ok')
    expect(rateLimitVerdict({ client: perClient, global: 5 })).toBe('client')
    expect(rateLimitVerdict({ client: 0, global: global - 1 })).toBe('ok')
    expect(rateLimitVerdict({ client: 0, global })).toBe('global')
  })
})

describe('contact form field limits', () => {
  const valid = { name: 'Алия', email: 'aliya@example.com', grade: '10B', topic: 'idea', subject: 'Кружок робототехники', message: 'Предлагаю открыть кружок по пятницам.' }

  it('clips every field to its maximum length', () => {
    const long = (n: number) => 'я'.repeat(n + 50)
    const res = validateContact({ ...valid, name: long(80), grade: long(20), subject: long(140), message: long(4000), email: `${'a'.repeat(200)}@example.com` })
    for (const key of ['name', 'grade', 'subject', 'message', 'email'] as const) {
      expect(res.values[key].length).toBeLessThanOrEqual(CONTACT_MAX_LENGTH[key])
    }
  })

  it('does not accept inherited object keys as a topic', () => {
    expect(validateContact({ ...valid, topic: 'toString' }).values.topic).toBe('other')
    expect(validateContact({ ...valid, topic: '__proto__' }).values.topic).toBe('other')
  })
})
