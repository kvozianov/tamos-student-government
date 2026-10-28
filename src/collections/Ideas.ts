import type { CollectionConfig } from 'payload'

import { canManage, isAdmin, publishedOrStaff } from '@/access'
import { demoField, slugField } from '@/fields/common'
import { editor } from '@/fields/richText'
import { revalidateCollection } from '@/hooks/revalidate'
import { IDEA_STATUSES, toOptions } from '@/lib/status'
import { previewUrl } from '@/lib/site'

export const Ideas: CollectionConfig = {
  slug: 'ideas',
  labels: { singular: 'Проект Бюро идей', plural: 'Бюро идей: проекты' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', '_status', 'isDemo'],
    group: 'Деятельность',
    preview: (doc) => previewUrl('ideas', doc?.slug as string | undefined),
  },
  defaultSort: '-submittedAt',
  versions: { drafts: true, maxPerDoc: 30 },
  access: { read: publishedOrStaff, create: canManage('ideas'), update: canManage('ideas'), delete: isAdmin },
  hooks: revalidateCollection,
  fields: [
    { name: 'title', type: 'text', label: 'Название проекта', required: true },
    { name: 'summary', type: 'textarea', label: 'Краткое описание', required: true, maxLength: 360 },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Изображение' },
    {
      type: 'row',
      fields: [
        { name: 'author', type: 'text', label: 'Автор или команда', required: true, admin: { width: '50%' } },
        {
          name: 'submittedAt',
          type: 'date',
          label: 'Идея подана',
          admin: { width: '50%', date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' } },
        },
      ],
    },
    { name: 'result', type: 'textarea', label: 'Результат', admin: { description: 'Чем закончилась работа или чего удалось добиться на текущем этапе.' } },
    { name: 'content', type: 'richText', label: 'История проекта', editor },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true, label: 'Фотографии' },
    {
      type: 'collapsible',
      label: 'Связанные материалы',
      admin: { initCollapsed: true },
      fields: [
        { name: 'relatedEvents', type: 'relationship', relationTo: 'events', hasMany: true, label: 'События' },
        { name: 'relatedPromises', type: 'relationship', relationTo: 'promises', hasMany: true, label: 'Обещания' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      enumName: 'idea_status',
      label: 'Этап',
      required: true,
      defaultValue: 'submitted',
      options: toOptions(IDEA_STATUSES),
      admin: { position: 'sidebar' },
    },
    slugField(),
    demoField,
  ],
}
