import { SITE_TIMEZONE } from './site'

const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('ru-RU', { timeZone: SITE_TIMEZONE, ...options })

const dateLong = fmt({ day: 'numeric', month: 'long', year: 'numeric' })
const dateNoYear = fmt({ day: 'numeric', month: 'long' })
const time = fmt({ hour: '2-digit', minute: '2-digit' })
const weekday = fmt({ weekday: 'long' })
const monthShort = fmt({ month: 'short' })
const dayNum = fmt({ day: 'numeric' })
const yearNum = fmt({ year: 'numeric' })
const monthYear = fmt({ month: 'long', year: 'numeric' })

const clean = (s: string) => s.replace(/\s?г\.$/, '').replace(/\.$/, '')

export const toDate = (value: string | Date) => (value instanceof Date ? value : new Date(value))

export function formatDate(value?: string | null, { withYear = true } = {}) {
  if (!value) return ''
  const d = toDate(value)
  if (!withYear) return dateNoYear.format(d)
  return clean(dateLong.format(d))
}

export function formatTime(value?: string | null) {
  return value ? time.format(toDate(value)) : ''
}

export function formatDateTime(value?: string | null) {
  if (!value) return ''
  return `${formatDate(value)}, ${formatTime(value)}`
}

export function formatWeekday(value?: string | null) {
  if (!value) return ''
  const w = weekday.format(toDate(value))
  return w.charAt(0).toUpperCase() + w.slice(1)
}

export function dateParts(value: string) {
  const d = toDate(value)
  return {
    day: dayNum.format(d),
    month: clean(monthShort.format(d)),
    year: yearNum.format(d).replace(/\D/g, ''),
  }
}

export function formatMonthYear(value?: string | null) {
  if (!value) return ''
  const s = clean(monthYear.format(toDate(value)))
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function formatPeriod(start?: string | null, end?: string | null, label?: string | null) {
  if (label) return label
  if (start && end) return `${formatDate(start)} — ${formatDate(end)}`
  if (start) return `с ${formatDate(start)}`
  if (end) return `по ${formatDate(end)}`
  return ''
}

export function plural(n: number, forms: [string, string, string]) {
  const n10 = n % 10
  const n100 = n % 100
  if (n10 === 1 && n100 !== 11) return forms[0]
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1]
  return forms[2]
}

export function formatFileSize(bytes?: number | null) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} МБ`
}
