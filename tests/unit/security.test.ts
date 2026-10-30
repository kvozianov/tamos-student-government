import { describe, expect, it } from 'vitest'

import { PUBLIC_QUERY_LIMITS, clampQueryArgs, limitPublicQueries } from '@/hooks/limit-queries'
import { jsonLdHtml } from '@/lib/json-ld'
import { passwordProblem } from '@/lib/password'
import { safeHref } from '@/lib/site'
import { validateLink } from '@/fields/common'

describe('CMS link fields', () => {
  it('allows site paths and http(s) addresses only', () => {
    expect(safeHref('/events')).toBe('/events')
    expect(safeHref('/programme?status=done#filters')).toBe('/programme?status=done#filters')
    expect(safeHref('https://example.com/a')).toBe('https://example.com/a')
    expect(safeHref('http://example.com')).toBe('http://example.com')
    for (const bad of ['javascript:alert(1)', '//evil.example', '/\\evil.example', 'events', '/a b', 'data:text/html,x', 'mailto:a@b.c', ' /events']) {
      expect(safeHref(bad)).toBeNull()
    }
    expect(safeHref(null)).toBeNull()
  })

  it('validates the field in the admin panel', () => {
    const validate = validateLink as unknown as (value: string | null | undefined) => true | string
    expect(validate('')).toBe(true)
    expect(validate('/news')).toBe(true)
    expect(validate('JavaScript:alert(1)')).toMatch(/путь внутри сайта/)
  })
})

describe('JSON-LD escaping', () => {
  it('cannot close the script tag and still parses to the same data', () => {
    const data = { name: '</script><script>alert(1)</script> & co \u2028\u2029' }
    const html = jsonLdHtml(data)
    expect(html).not.toMatch(/[<>&\u2028\u2029]/)
    expect(JSON.parse(html)).toEqual(data)
  })
})

describe('password policy', () => {
  it('requires at least 12 characters', () => {
    expect(passwordProblem('short-pass1')).toMatch(/12/)
    expect(passwordProblem('long-enough-pass')).toBeNull()
  })
})

describe('public query limits', () => {
  const { maxLimit, maxDepth } = PUBLIC_QUERY_LIMITS

  it('clamps limit, pagination, depth and join limits', () => {
    expect(clampQueryArgs({ limit: 0 }).limit).toBe(maxLimit)
    expect(clampQueryArgs({ limit: 5000 }).limit).toBe(maxLimit)
    expect(clampQueryArgs({ limit: -1 }).limit).toBe(maxLimit)
    expect(clampQueryArgs({ limit: 12 }).limit).toBe(12)
    expect(clampQueryArgs({} as { limit?: number }).limit).toBeUndefined()
    expect(clampQueryArgs({ pagination: false }).pagination).toBe(true)
    expect(clampQueryArgs({ depth: 10 }).depth).toBe(maxDepth)
    expect(clampQueryArgs({ depth: 1 }).depth).toBe(1)
    expect(clampQueryArgs({ joins: { newsJoin: { limit: 0 }, off: false } }).joins).toEqual({ newsJoin: { limit: maxLimit }, off: false })
  })

  it('only touches anonymous REST reads', () => {
    type HookArgs = Parameters<typeof limitPublicQueries>[0]
    const run = (req: object, operation = 'read') =>
      limitPublicQueries({ args: { limit: 0, depth: 10 }, operation, req } as unknown as HookArgs) as { limit: number; depth: number }

    expect(run({ payloadAPI: 'REST' })).toEqual({ limit: maxLimit, depth: maxDepth })
    expect(run({ payloadAPI: 'local' })).toEqual({ limit: 0, depth: 10 })
    expect(run({ payloadAPI: 'REST', user: { id: 1 } })).toEqual({ limit: 0, depth: 10 })
    expect(run({ payloadAPI: 'REST' }, 'update')).toEqual({ limit: 0, depth: 10 })
  })
})
