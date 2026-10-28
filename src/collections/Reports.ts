import type { CollectionConfig } from 'payload'

import { canManage, isAdmin, publishedOrStaff } from '@/access'
import { demoField, slugField } from '@/fields/common'
import { editor } from '@/fields/richText'
import { revalidateCollection } from '@/hooks/revalidate'
import { REPORT_TYPES, toOptions } from '@/lib/status'
import { previewUrl } from '@/lib/site'

const dayOnly = { pickerAppearance: 'dayOnly' as const, displayFormat: 'd MMMM yyyy' }

export const Reports: CollectionConfig = {
  slug: 'reports',
  labels: { singular: 'Отчёт', plural: 'Отчётность' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'publishedAt', '_status', 'isDemo'],
    group: 'Деятельность',
    preview: (doc) => previewUrl('reports', doc?.slug as string | undefined),
  },
  defaultSort: '-publishedAt',
  versions: { drafts: true, maxPerDoc: 30 },
  access: { read: publishedOrStaff, create: canManage('reports'), update: canManage('reports'), delete: isAdmin },
  hooks: revalidateCollection,
  fields: [
    { name: 'title', type: 'text', label: 'Название', required: true },
    {
      type: 'row',
      fields: [
        { name: 'type', type: 'select', label: 'Тип', required: true, defaultValue: 'activity', options: toOptions(REPORT_TYPES), admin: { width: '50%' } },
        { name: 'publishedAt', type: 'date', label: 'Дата публикации', required: true, defaultValue: () => new Date().toISOString(), admin: { width: '50%', date: dayOnly } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'periodStart', type: 'date', label: 'Отчётный период: с', admin: { width: '33%', date: dayOnly } },
        { name: 'periodEnd', type: 'date', label: 'по', admin: { width: '33%', date: dayOnly } },
        { name: 'periodLabel', type: 'text', label: 'Период словами', admin: { width: '34%', placeholder: 'Сентябрь — октябрь 2026' } },
      ],
    },
    { name: 'summary', type: 'textarea', label: 'Краткое резюме', required: true, maxLength: 600 },
    {
      name: 'keyFacts',
      type: 'array',
      label: 'Ключевые цифры',
      labels: { singular: 'Цифра', plural: 'Ключевые цифры' },
      admin: { description: 'Только проверяемые цифры. Показываются в отчёте и в блоке «Результаты» на главной.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'text', label: 'Значение', required: true, admin: { width: '30%', placeholder: '23' } },
            { name: 'label', type: 'text', label: 'Что это', required: true, admin: { width: '70%', placeholder: 'предложения пришло в ящик за две недели' } },
          ],
        },
      ],
    },
    { name: 'content', type: 'richText', label: 'Подробное содержание', editor },
    { name: 'documents', type: 'upload', relationTo: 'documents', hasMany: true, label: 'Прикреплённые документы' },
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true, label: 'Изображения' },
    {
      type: 'collapsible',
      label: 'Связанные материалы',
      fields: [
        { name: 'relatedPromises', type: 'relationship', relationTo: 'promises', hasMany: true, label: 'Обещания' },
        { name: 'relatedEvents', type: 'relationship', relationTo: 'events', hasMany: true, label: 'События' },
        { name: 'relatedIdeas', type: 'relationship', relationTo: 'ideas', hasMany: true, label: 'Проекты Бюро идей' },
      ],
    },
    slugField(),
    demoField,
  ],
}
