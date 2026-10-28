import { describe, expect, it } from 'vitest'

import { compareUpcoming, effectiveEventStatus, eventPhase, shouldShowCountdown } from '@/lib/events'

type Timing = Parameters<typeof eventPhase>[0]

const NOW = Date.parse('2026-11-01T06:00:00Z')
const DAY = 24 * 60 * 60 * 1000
const at = (offset: number) => new Date(NOW + offset).toISOString()

describe('event phase and status', () => {
  it('keeps a tentative date without countdown', () => {
    const ev: Timing = { status: 'approved', dateConfirmed: false, startsAt: at(3 * DAY), endsAt: null }
    expect(eventPhase(ev, NOW)).toBe('tentative')
    expect(shouldShowCountdown(ev, NOW)).toBe(false)
    expect(effectiveEventStatus(ev, NOW)).toBe('approved')
  })

  it('becomes "soon" two weeks before a confirmed date', () => {
    const ev: Timing = { status: 'date_confirmed', dateConfirmed: true, startsAt: at(10 * DAY), endsAt: null }
    expect(effectiveEventStatus(ev, NOW)).toBe('soon')
    expect(shouldShowCountdown(ev, NOW)).toBe(true)
  })

  it('stays "date confirmed" when the event is further away', () => {
    const ev: Timing = { status: 'date_confirmed', dateConfirmed: true, startsAt: at(30 * DAY), endsAt: null }
    expect(effectiveEventStatus(ev, NOW)).toBe('date_confirmed')
  })

  it('completes itself after the end time', () => {
    const ev: Timing = { status: 'soon', dateConfirmed: true, startsAt: at(-DAY), endsAt: at(-DAY + 2 * 60 * 60 * 1000) }
    expect(eventPhase(ev, NOW)).toBe('past')
    expect(effectiveEventStatus(ev, NOW)).toBe('completed')
  })

  it('never overrides a cancelled event', () => {
    const ev: Timing = { status: 'cancelled', dateConfirmed: true, startsAt: at(2 * DAY), endsAt: null }
    expect(effectiveEventStatus(ev, NOW)).toBe('cancelled')
    expect(shouldShowCountdown(ev, NOW)).toBe(false)
  })

  it('sorts confirmed dates first, then tentative, then undated', () => {
    const undated: Timing = { status: 'idea', dateConfirmed: false, startsAt: null, endsAt: null }
    const tentative: Timing = { status: 'approved', dateConfirmed: false, startsAt: at(DAY), endsAt: null }
    const confirmed: Timing = { status: 'date_confirmed', dateConfirmed: true, startsAt: at(5 * DAY), endsAt: null }
    expect([undated, tentative, confirmed].sort(compareUpcoming)).toEqual([confirmed, tentative, undated])
  })
})
