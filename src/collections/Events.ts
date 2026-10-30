import type { CollectionConfig, DateFieldValidation } from 'payload'

import { canManage, isAdmin, publishedOrStaff } from '@/access'
import { demoField, slugField, urlField } from '@/fields/common'
import { editor } from '@/fields/richText'
import { limitPublicQueries } from '@/hooks/limit-queries'
import { revalidateCollection } from '@/hooks/revalidate'
import { EVENT_STATUSES, toOptions } from '@/lib/status'
import { previewUrl } from '@/lib/site'

const dayAndTime = { pickerAppearance: 'dayAndTime' as const, displayFormat: 'd MMMM yyyy, HH:mm' }
const dayOnly = { pickerAppearance: 'dayOnly' as const, displayFormat: 'd MMMM yyyy' }

const requireWhenConfirmed: DateFieldValidation = (value, { siblingData }) => {
  const data = siblingData as { dateConfirmed?: boolean }
  if (data?.dateConfirmed && !value) return 'Укажите дату и время начала: дата отмечена как утверждённая'
  return true
}

const endAfterStart: DateFieldValidation = (value, { siblingData }) => {
  const data = siblingData as { startsAt?: string }
  if (value && data?.startsAt && new Date(value) <= new Date(data.startsAt)) return 'Окончание должно быть позже начала'
  return true
}

export const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Событие', plural: 'События' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'startsAt', 'dateConfirmed', '_status', 'isDemo'],
    group: 'Деятельность',
    listSearchableFields: ['title', 'summary'],
    preview: (doc) => previewUrl('events', doc?.slug as string | undefined),
  },
  defaultSort: 'startsAt',
  versions: { drafts: true, maxPerDoc: 30 },
  access: { read: publishedOrStaff, create: canManage('events'), update: canManage('events'), delete: isAdmin },
  hooks: {
    ...revalidateCollection,
    beforeOperation: [limitPublicQueries],
    beforeChange: [
      ({ data }) => {
        // Статус «Дата утверждена» всегда означает утверждённую дату.
        if (data.status === 'date_confirmed') data.dateConfirmed = true
        return data
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Основное',
          fields: [
            { name: 'title', type: 'text', label: 'Название', required: true },
            { name: 'summary', type: 'textarea', label: 'Краткое описание', required: true, maxLength: 360 },
            { name: 'cover', type: 'upload', relationTo: 'media', label: 'Обложка' },
            {
              type: 'row',
              fields: [
                { name: 'place', type: 'text', label: 'Место проведения', admin: { width: '50%' } },
                { name: 'audience', type: 'text', label: 'Для кого', admin: { width: '50%', placeholder: '7–11 классы, 120 мест' } },
              ],
            },
            { name: 'description', type: 'richText', label: 'Полное описание', editor },
          ],
        },
        {
          label: 'Дата и регистрация',
          description:
            'Обратный отсчёт появляется на сайте только когда отмечено «Дата утверждена» и указано время начала. Предварительная дата показывается без таймера.',
          fields: [
            {
              name: 'dateConfirmed',
              type: 'checkbox',
              label: 'Дата утверждена официально',
              defaultValue: false,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'startsAt',
                  type: 'date',
                  label: 'Начало',
                  index: true,
                  timezone: true,
                  validate: requireWhenConfirmed,
                  admin: { width: '50%', date: dayAndTime, description: 'Если дата не утверждена, это предварительная дата.' },
                },
                { name: 'endsAt', type: 'date', label: 'Окончание', timezone: true, validate: endAfterStart, admin: { width: '50%', date: dayAndTime } },
              ],
            },
            {
              name: 'tentativeLabel',
              type: 'text',
              label: 'Предварительный срок словами',
              admin: {
                placeholder: 'Конец ноября',
                description: 'Показывается вместо даты, пока дата не утверждена. Например «Вторая половина ноября».',
              },
            },
            {
              name: 'registration',
              type: 'group',
              label: 'Регистрация участников',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'opensAt', type: 'date', label: 'Открывается', admin: { width: '50%', date: dayOnly } },
                    { name: 'closesAt', type: 'date', label: 'Закрывается', admin: { width: '50%', date: dayOnly } },
                  ],
                },
                urlField('url', 'Ссылка на форму регистрации'),
                { name: 'note', type: 'textarea', label: 'Условия участия' },
              ],
            },
          ],
        },
        {
          label: 'Программа и материалы',
          fields: [
            {
              name: 'program',
              type: 'array',
              label: 'Программа',
              labels: { singular: 'Пункт', plural: 'Пункты программы' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'time', type: 'text', label: 'Время', admin: { width: '25%', placeholder: '16:00' } },
                    { name: 'title', type: 'text', label: 'Что происходит', required: true, admin: { width: '75%' } },
                  ],
                },
                { name: 'description', type: 'textarea', label: 'Подробности' },
              ],
            },
            {
              name: 'organizers',
              type: 'relationship',
              relationTo: 'members',
              hasMany: true,
              label: 'Организаторы из администрации',
            },
            { name: 'organizersNote', type: 'text', label: 'Другие организаторы и партнёры' },
            {
              name: 'reference',
              type: 'group',
              label: 'Референс формата',
              admin: { description: 'Откуда взята идея: видео, блогер, другая школа.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'author', type: 'text', label: 'Автор', admin: { width: '50%' } },
                    { name: 'platform', type: 'text', label: 'Площадка', admin: { width: '50%', placeholder: 'YouTube' } },
                  ],
                },
                { name: 'title', type: 'text', label: 'Название материала' },
                urlField('url', 'Ссылка', 'Если это ролик YouTube, он встроится на страницу события.'),
                { name: 'note', type: 'textarea', label: 'Что берём из референса' },
              ],
            },
            { name: 'materials', type: 'upload', relationTo: 'documents', hasMany: true, label: 'Документы' },
          ],
        },
        {
          label: 'Обновления',
          fields: [
            {
              name: 'updates',
              type: 'array',
              label: 'Ход подготовки',
              labels: { singular: 'Обновление', plural: 'Обновления' },
              admin: { description: 'Каждое изменение подготовки с датой. На сайте показываются от новых к старым.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'date', type: 'date', label: 'Дата', required: true, admin: { width: '40%', date: dayOnly } },
                    { name: 'status', type: 'select', label: 'Статус на эту дату', options: toOptions(EVENT_STATUSES), admin: { width: '60%' } },
                  ],
                },
                { name: 'text', type: 'textarea', label: 'Что произошло', required: true },
              ],
            },
          ],
        },
        {
          label: 'Связи',
          fields: [
            { name: 'relatedPromises', type: 'relationship', relationTo: 'promises', hasMany: true, label: 'Связанные обещания' },
            {
              name: 'newsJoin',
              type: 'join',
              collection: 'news',
              on: 'relatedEvents',
              label: 'Новости об этом событии',
              admin: { allowCreate: false },
            },
            { name: 'reportsJoin', type: 'join', collection: 'reports', on: 'relatedEvents', label: 'Отчёты', admin: { allowCreate: false } },
            { name: 'albumsJoin', type: 'join', collection: 'albums', on: 'event', label: 'Фотоальбомы', admin: { allowCreate: false } },
          ],
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      enumName: 'event_status',
      label: 'Статус подготовки',
      required: true,
      defaultValue: 'idea',
      index: true,
      options: toOptions(EVENT_STATUSES),
      admin: {
        position: 'sidebar',
        description: '«Скоро состоится» и «Завершено» также выставляются на сайте автоматически по утверждённой дате.',
      },
    },
    slugField(),
    demoField,
  ],
}
