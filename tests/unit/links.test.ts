import { describe, expect, it } from 'vitest'

import { isFilteredListHref } from '@/lib/filters'
import { plural } from '@/lib/format'
import { safePath } from '@/lib/site'
import { slugify } from '@/lib/slugify'

describe('links and text helpers', () => {
  it('detects list URLs that are served through cached filter pages', () => {
    expect(isFilteredListHref('/programme?status=done#filters')).toBe(true)
    expect(isFilteredListHref('/events?status=soon')).toBe(true)
    expect(isFilteredListHref('/events')).toBe(false)
    expect(isFilteredListHref('/news/some-article')).toBe(false)
  })

  it('only allows internal preview redirects', () => {
    expect(safePath('/news/hello')).toBe('/news/hello')
    expect(safePath('//evil.example')).toBe('/')
    expect(safePath('https://evil.example')).toBe('/')
    expect(safePath(null)).toBe('/')
  })

  it('transliterates Russian and Kazakh titles into slugs', () => {
    expect(slugify('Прятки по всему зданию')).toBe('pryatki-po-vsemu-zdaniyu')
    expect(slugify('Қазақ тілі апталығы!')).toBe('kazak-tili-aptalygy')
  })

  it('picks the right Russian plural form', () => {
    const forms: [string, string, string] = ['событие', 'события', 'событий']
    expect([1, 3, 5, 11, 21, 22, 25].map((n) => plural(n, forms))).toEqual(['событие', 'события', 'событий', 'событий', 'событие', 'события', 'событий'])
  })
})
