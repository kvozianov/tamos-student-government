/** Сетка календаря на месяц. Чистые функции без зависимостей: используются в календаре событий и в тестах. */

export type MonthKey = { year: number; month: number } // month: 0–11

export type CalendarDay = { key: string; day: number; inMonth: boolean }

const pad = (n: number) => String(n).padStart(2, '0')

export const dayKey = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`

/** День события в часовом поясе школы, в формате YYYY-MM-DD. */
export function dayKeyInZone(iso: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(iso))
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

export function monthOf(key: string): MonthKey {
  const [y, m] = key.split('-').map(Number)
  return { year: y, month: m - 1 }
}

export function shiftMonth({ year, month }: MonthKey, delta: number): MonthKey {
  const total = year * 12 + month + delta
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 }
}

/** Недели месяца с понедельника, с хвостами соседних месяцев: всегда полные строки по 7 дней. */
export function monthGrid({ year, month }: MonthKey): CalendarDay[][] {
  const first = new Date(Date.UTC(year, month, 1))
  const lead = (first.getUTCDay() + 6) % 7 // сколько дней до понедельника
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const cells = Math.ceil((lead + daysInMonth) / 7) * 7
  const weeks: CalendarDay[][] = []
  for (let i = 0; i < cells; i++) {
    const d = new Date(Date.UTC(year, month, 1 - lead + i))
    const day: CalendarDay = { key: dayKey(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), day: d.getUTCDate(), inMonth: d.getUTCMonth() === month }
    if (i % 7 === 0) weeks.push([])
    weeks[weeks.length - 1].push(day)
  }
  return weeks
}
