import { describe, expect, it } from 'vitest'

import { dayKeyInZone, monthGrid, shiftMonth } from '@/lib/calendar'

describe('calendar grid', () => {
  it('starts weeks on Monday and fills whole rows', () => {
    // 1 November 2026 is a Sunday
    const weeks = monthGrid({ year: 2026, month: 10 })
    expect(weeks[0][0].key).toBe('2026-10-26')
    expect(weeks[0][6]).toEqual({ key: '2026-11-01', day: 1, inMonth: true })
    expect(weeks.every((w) => w.length === 7)).toBe(true)
    expect(weeks.flat().filter((d) => d.inMonth)).toHaveLength(30)
  })

  it('handles February in a leap year', () => {
    const days = monthGrid({ year: 2028, month: 1 }).flat().filter((d) => d.inMonth)
    expect(days.at(-1)?.key).toBe('2028-02-29')
  })

  it('moves across year boundaries', () => {
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 })
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 })
  })

  it('places a late-evening UTC time on the next day in Almaty', () => {
    expect(dayKeyInZone('2026-11-12T20:30:00Z', 'Asia/Almaty')).toBe('2026-11-13')
  })
})
