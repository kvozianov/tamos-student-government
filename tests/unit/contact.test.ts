import { describe, expect, it } from 'vitest'

import { validateContact } from '@/lib/contact'

const valid = { name: 'Алия', email: 'Aliya@Example.com ', grade: '10B', topic: 'idea', subject: 'Кружок робототехники', message: 'Предлагаю открыть кружок по пятницам.' }

describe('contact form validation', () => {
  it('accepts a complete message and normalises the email', () => {
    const res = validateContact(valid)
    expect(res.ok).toBe(true)
    expect(res.values.email).toBe('aliya@example.com')
  })

  it('reports every invalid field', () => {
    const res = validateContact({ ...valid, name: ' ', email: 'not-an-email', subject: 'a', message: 'short' })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(Object.keys(res.errors).sort()).toEqual(['email', 'message', 'name', 'subject'])
  })

  it('falls back to "other" for an unknown topic', () => {
    expect(validateContact({ ...valid, topic: 'hack' }).values.topic).toBe('other')
  })
})
