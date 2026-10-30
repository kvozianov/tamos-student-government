import type { CollectionConfig } from 'payload'

import { canManage, isAdmin, publishedOrStaff } from '@/access'
import { demoField, slugField, urlField } from '@/fields/common'
import { limitPublicQueries } from '@/hooks/limit-queries'
import { revalidateCollection } from '@/hooks/revalidate'
import { previewUrl } from '@/lib/site'

export const Albums: CollectionConfig = {
  slug: 'albums',
  labels: { singular: 'Альбом', plural: 'Галерея' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'event', '_status', 'isDemo'],
    group: 'Медиа',
    preview: (doc) => previewUrl('gallery', doc?.slug as string | undefined),
  },
  defaultSort: '-date',
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: publishedOrStaff, create: canManage('albums'), update: canManage('albums'), delete: isAdmin },
  hooks: { ...revalidateCollection, beforeOperation: [limitPublicQueries] },
  fields: [
    { name: 'title', type: 'text', label: 'Название альбома', required: true },
    {
      type: 'row',
      fields: [
        { name: 'date', type: 'date', label: 'Дата мероприятия', required: true, admin: { width: '50%', date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' } } },
        { name: 'event', type: 'relationship', relationTo: 'events', label: 'Событие', admin: { width: '50%' } },
      ],
    },
    { name: 'description', type: 'textarea', label: 'Описание' },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Обложка', admin: { description: 'Если не выбрать, обложкой станет первое фото.' } },
    {
      name: 'items',
      type: 'array',
      label: 'Фото и видео',
      labels: { singular: 'Материал', plural: 'Материалы' },
      fields: [
        {
          name: 'kind',
          type: 'radio',
          label: 'Тип',
          defaultValue: 'media',
          options: [
            { label: 'Файл из медиатеки (фото или видео)', value: 'media' },
            { label: 'Видео на YouTube', value: 'youtube' },
          ],
          admin: { layout: 'horizontal' },
        },
        { name: 'media', type: 'upload', relationTo: 'media', label: 'Файл', admin: { condition: (_, sibling) => sibling?.kind !== 'youtube' } },
        { ...urlField('youtubeUrl', 'Ссылка на YouTube'), admin: { condition: (_, sibling) => sibling?.kind === 'youtube' } },
        { name: 'caption', type: 'text', label: 'Подпись' },
      ],
    },
    slugField(),
    demoField,
  ],
}
