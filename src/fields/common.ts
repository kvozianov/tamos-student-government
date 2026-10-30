import type { Field, TextField, TextFieldSingleValidation } from 'payload'

import { safeHref } from '@/lib/site'
import { slugify } from '@/lib/slugify'

export const slugField = (from = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  label: 'Адрес страницы',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Часть ссылки латиницей. Заполняется автоматически из названия, можно поправить вручную.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data, originalDoc }) => {
        if (typeof value === 'string' && value.trim()) return slugify(value)
        const source = (data?.[from] ?? originalDoc?.[from]) as string | undefined
        return source ? slugify(source) : value
      },
    ],
  },
  validate: ((value) =>
    !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || 'Только латинские буквы, цифры и дефисы') as TextFieldSingleValidation,
})

export const demoField: Field = {
  name: 'isDemo',
  type: 'checkbox',
  label: 'Демо-материал',
  defaultValue: false,
  index: true,
  admin: {
    position: 'sidebar',
    description:
      'Временный пример. На сайте помечается значком «Демо». Если в настройках сайта выключить показ демо-материалов, такие записи скрываются.',
  },
}

export const validateUrl: TextFieldSingleValidation = (value) => {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' || 'Ссылка должна начинаться с https://'
  } catch {
    return 'Введите полный адрес, например https://example.com'
  }
}

export const urlField = (name: string, label: string, description?: string): TextField => ({
  name,
  type: 'text',
  label,
  validate: validateUrl,
  admin: description ? { description } : undefined,
})

/** Ссылка на странице сайта: путь внутри сайта (/events) или полный адрес http(s). */
export const validateLink: TextFieldSingleValidation = (value) =>
  !value || safeHref(value) !== null || 'Укажите путь внутри сайта, например /events, или полный адрес https://…'

export const linkField = (name: string, label: string, placeholder?: string): TextField => ({
  name,
  type: 'text',
  label,
  validate: validateLink,
  admin: { placeholder, description: 'Путь внутри сайта, например /events, или полный адрес https://…' },
})
