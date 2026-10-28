import type { CollectionConfig } from 'payload'

import { canManage, isAdmin } from '@/access'
import { demoField, slugField } from '@/fields/common'
import { editor } from '@/fields/richText'
import { revalidateCollection } from '@/hooks/revalidate'
import { previewUrl } from '@/lib/site'
import { parseSignature } from '@/lib/signature'

const validateSignature = (value: string | null | undefined): true | string => {
  if (!value) return true
  return parseSignature(value) ? true : 'Не нашлось ни одного контура <path>. Вставьте SVG-код подписи целиком.'
}

export const Members: CollectionConfig = {
  slug: 'members',
  labels: { singular: 'Член команды', plural: 'Команда' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'position', 'isPresident', 'isVicePresident', 'active', 'order', 'isDemo'],
    group: 'Команда',
    preview: (doc) => previewUrl('administration', doc?.slug as string | undefined),
  },
  defaultSort: 'order',
  access: {
    read: ({ req }) => (req.user ? true : { active: { equals: true } }),
    create: canManage('members'),
    update: canManage('members'),
    delete: isAdmin,
  },
  hooks: {
    ...revalidateCollection,
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        // Президент и вице-президент могут быть только одни: снимаем отметку с предыдущего.
        for (const flag of ['isPresident', 'isVicePresident'] as const) {
          if (data[flag] && !originalDoc?.[flag]) {
            await req.payload.update({
              collection: 'members',
              where: { and: [{ [flag]: { equals: true } }, ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : [])] },
              data: { [flag]: false },
              overrideAccess: true,
              req,
            })
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Имя и фамилия', required: true, admin: { width: '50%' } },
        { name: 'position', type: 'text', label: 'Должность', required: true, admin: { width: '50%' } },
      ],
    },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Официальная фотография', admin: { description: 'Лучше вертикальный портрет 4:5.' } },
    { name: 'area', type: 'text', label: 'Направление ответственности' },
    { name: 'shortBio', type: 'textarea', label: 'Краткая справка', maxLength: 420 },
    { name: 'bio', type: 'richText', label: 'Биография и опыт', editor },
    {
      name: 'responsibilities',
      type: 'array',
      label: 'Обязанности',
      labels: { singular: 'Обязанность', plural: 'Обязанности' },
      fields: [{ name: 'text', type: 'text', label: 'Обязанность', required: true }],
    },
    {
      name: 'projects',
      type: 'relationship',
      relationTo: ['events', 'promises', 'ideas'],
      hasMany: true,
      label: 'Проекты и направления работы',
    },
    {
      type: 'collapsible',
      label: 'Руководство',
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'isPresident',
              type: 'checkbox',
              label: 'Это президент',
              admin: { width: '50%', description: 'Президент показывается на первом экране главной страницы.' },
            },
            {
              name: 'isVicePresident',
              type: 'checkbox',
              label: 'Это вице-президент',
              admin: { width: '50%', description: 'Вице-президент показывается крупно на главной и в разделе «Администрация».' },
            },
          ],
        },
        {
          name: 'priorities',
          type: 'array',
          label: 'Приоритеты',
          labels: { singular: 'Приоритет', plural: 'Приоритеты' },
          admin: { condition: (data) => Boolean(data?.isPresident || data?.isVicePresident) },
          fields: [
            { name: 'title', type: 'text', label: 'Направление', required: true },
            { name: 'text', type: 'textarea', label: 'Пояснение' },
          ],
        },
        {
          name: 'signatureSvg',
          type: 'textarea',
          label: 'Подпись (SVG-код)',
          validate: validateSignature,
          admin: {
            condition: (data) => Boolean(data?.isPresident || data?.isVicePresident),
            description:
              'Отсканируйте подпись, переведите в SVG (например, в Illustrator или Figma) и вставьте код целиком. Сайт анимирует отрисовку контуров. Пусто — используется временная подпись.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', label: 'Почта', admin: { width: '50%' } },
        { name: 'telegram', type: 'text', label: 'Telegram', admin: { width: '50%', placeholder: '@username' } },
      ],
    },
    { name: 'order', type: 'number', label: 'Порядок', defaultValue: 100, admin: { position: 'sidebar', description: 'Меньше — выше.' } },
    { name: 'active', type: 'checkbox', label: 'Показывать на сайте', defaultValue: true, admin: { position: 'sidebar' } },
    slugField('name'),
    demoField,
  ],
}
