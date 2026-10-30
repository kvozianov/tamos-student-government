import type { CollectionConfig } from 'payload'

import { canManage, isAdmin, publishedOrStaff } from '@/access'
import { demoField, slugField, urlField } from '@/fields/common'
import { editor } from '@/fields/richText'
import { limitPublicQueries } from '@/hooks/limit-queries'
import { revalidateCollection } from '@/hooks/revalidate'
import { NEWS_CATEGORIES, toOptions } from '@/lib/status'
import { previewUrl } from '@/lib/site'

export const News: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'Новость', plural: 'Новости' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status', 'isDemo'],
    group: 'Медиа',
    listSearchableFields: ['title', 'excerpt'],
    preview: (doc) => previewUrl('news', doc?.slug as string | undefined),
  },
  defaultSort: '-publishedAt',
  versions: { drafts: true, maxPerDoc: 30 },
  access: { read: publishedOrStaff, create: canManage('news'), update: canManage('news'), delete: isAdmin },
  hooks: { ...revalidateCollection, beforeOperation: [limitPublicQueries] },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'select',
          label: 'Рубрика',
          required: true,
          defaultValue: 'news',
          options: toOptions(NEWS_CATEGORIES),
          admin: { width: '50%' },
        },
        {
          name: 'publishedAt',
          type: 'date',
          label: 'Дата публикации',
          required: true,
          defaultValue: () => new Date().toISOString(),
          admin: { width: '50%', date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMMM yyyy, HH:mm' } },
        },
      ],
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Краткое описание',
      required: true,
      maxLength: 320,
      admin: { description: 'Два-три предложения для списка новостей и соцсетей.' },
    },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Обложка' },
    { name: 'content', type: 'richText', label: 'Текст материала', editor },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true, label: 'Фотографии к материалу' },
    urlField('videoUrl', 'Видео', 'Ссылка на YouTube. Видео встроится в конец материала.'),
    {
      type: 'collapsible',
      label: 'Связанные материалы',
      admin: { initCollapsed: true },
      fields: [
        { name: 'relatedEvents', type: 'relationship', relationTo: 'events', hasMany: true, label: 'События' },
        { name: 'relatedPromises', type: 'relationship', relationTo: 'promises', hasMany: true, label: 'Обещания' },
        { name: 'relatedIdeas', type: 'relationship', relationTo: 'ideas', hasMany: true, label: 'Проекты Бюро идей' },
      ],
    },
    slugField(),
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Главная новость',
      admin: { position: 'sidebar', description: 'Показывается крупно на главной странице.' },
    },
    demoField,
  ],
}
