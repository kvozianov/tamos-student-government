/** Связанные документы приходят либо объектом, либо id (если не раскрыты). Берём только раскрытые и опубликованные. */
export function docs<T extends { id: number | string }>(value: unknown): T[] {
  if (!value) return []
  const list = Array.isArray(value) ? value : (value as { docs?: unknown[] }).docs ?? []
  return list.filter((d): d is T => {
    if (!d || typeof d !== 'object') return false
    const status = (d as { _status?: string })._status
    return status === undefined || status === null || status === 'published'
  })
}

export function doc<T extends { id: number | string }>(value: unknown): T | null {
  return value && typeof value === 'object' ? (value as T) : null
}
