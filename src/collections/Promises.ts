import type { CollectionConfig } from 'payload'

import { canManage, isAdmin, publishedOrStaff } from '@/access'
import { demoField, slugField, urlField } from '@/fields/common'
import { editor } from '@/fields/richText'
import { revalidateCollection } from '@/hooks/revalidate'
import { PROMISE_STATUSES, toOptions } from '@/lib/status'
import { previewUrl } from '@/lib/site'

export const Promises: CollectionConfig = {
  slug: 'promises',
  labels: { singular: 'Пункт программы', plural: 'Программа' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['number', 'title', 'category', 'status', 'deadline', '_status', 'isDemo'],
    group: 'Программа',
    listSearchableFields: ['title', 'summary'],
    preview: (doc) => previewUrl('promises', doc?.slug as string | undefined),
  },
  defaultSort: 'order',
  versions: { drafts: true, maxPerDoc: 50 },
  access: { read: publishedOrStaff, create: canManage('promises'), update: canManage('promises'), delete: isAdmin },
  hooks: {
    ...revalidateCollection,
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        if (operation === 'create' || (originalDoc && originalDoc.status !== data.status)) {
          data.statusUpdatedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Обещание',
          fields: [
            { name: 'title', type: 'text', label: 'Формулировка обещания', required: true },
            { name: 'summary', type: 'textarea', label: 'Краткое описание', required: true, maxLength: 400 },
            {
              type: 'row',
              fields: [
                { name: 'category', type: 'relationship', relationTo: 'categories', label: 'Тема', required: true, admin: { width: '50%' } },
                {
                  name: 'source',
                  type: 'text',
                  label: 'Где обещано',
                  admin: { width: '50%', placeholder: 'Предвыборная программа, пункт 3' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'number',
                  type: 'number',
                  label: 'Номер в программе',
                  min: 1,
                  admin: { width: '25%', description: 'Как в документе программы.' },
                },
                {
                  name: 'deadline',
                  type: 'text',
                  label: 'Планируемые сроки',
                  admin: { width: '75%', placeholder: 'Середина II четверти' },
                },
              ],
            },
            { name: 'details', type: 'richText', label: 'Ход реализации подробно', editor },
          ],
        },
        {
          label: 'История обновлений',
          fields: [
            {
              name: 'updates',
              type: 'array',
              label: 'Обновления',
              labels: { singular: 'Обновление', plural: 'Обновления' },
              admin: { description: 'Каждое изменение статуса записывайте с датой и объяснением. Так история остаётся честной.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'date', type: 'date', label: 'Дата', required: true, admin: { width: '40%', date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' } } },
                    { name: 'status', type: 'select', label: 'Статус', options: toOptions(PROMISE_STATUSES), admin: { width: '60%' } },
                  ],
                },
                { name: 'text', type: 'textarea', label: 'Что произошло', required: true },
                { name: 'attachments', type: 'upload', relationTo: 'documents', hasMany: true, label: 'Документы' },
              ],
            },
          ],
        },
        {
          label: 'Подтверждения',
          fields: [
            { name: 'evidenceDocuments', type: 'upload', relationTo: 'documents', hasMany: true, label: 'Документы' },
            { name: 'evidenceMedia', type: 'upload', relationTo: 'media', hasMany: true, label: 'Фотографии' },
            {
              name: 'evidenceLinks',
              type: 'array',
              label: 'Ссылки',
              labels: { singular: 'Ссылка', plural: 'Ссылки' },
              fields: [
                { name: 'label', type: 'text', label: 'Подпись', required: true },
                urlField('url', 'Адрес'),
              ],
            },
          ],
        },
        {
          label: 'Связи',
          description: 'Связи заполняются со стороны событий, новостей и отчётов: отметьте это обещание там.',
          fields: [
            { name: 'eventsJoin', type: 'join', collection: 'events', on: 'relatedPromises', label: 'События', admin: { allowCreate: false } },
            { name: 'reportsJoin', type: 'join', collection: 'reports', on: 'relatedPromises', label: 'Отчёты', admin: { allowCreate: false } },
            { name: 'newsJoin', type: 'join', collection: 'news', on: 'relatedPromises', label: 'Новости', admin: { allowCreate: false } },
          ],
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      enumName: 'promise_status',
      label: 'Текущий статус',
      required: true,
      defaultValue: 'planned',
      index: true,
      options: toOptions(PROMISE_STATUSES),
      admin: { position: 'sidebar' },
    },
    {
      name: 'statusUpdatedAt',
      type: 'date',
      label: 'Статус изменён',
      admin: { position: 'sidebar', readOnly: true, date: { displayFormat: 'd MMMM yyyy' } },
    },
    {
      name: 'isNew',
      type: 'checkbox',
      label: 'Новый пункт программы',
      admin: { position: 'sidebar', description: 'На сайте рядом с обещанием появится пометка «Новый пункт».' },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Порядок в списке',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Меньше — выше.' },
    },
    slugField(),
    demoField,
  ],
}
