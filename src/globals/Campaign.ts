import type { GlobalConfig } from 'payload'

import { canManage } from '@/access'
import { editor } from '@/fields/richText'
import { revalidateGlobal } from '@/hooks/revalidate'

export const Campaign: GlobalConfig = {
  slug: 'campaign',
  label: 'Кампания',
  admin: { group: 'Страницы', description: 'Архив предвыборной кампании. Программа берётся из раздела «Обещания».' },
  access: { read: () => true, update: canManage('campaign') },
  hooks: revalidateGlobal,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Заглавие',
          fields: [
            { name: 'title', type: 'text', label: 'Заголовок', required: true, defaultValue: 'Кампания' },
            { name: 'lead', type: 'textarea', label: 'Подзаголовок' },
            { name: 'cover', type: 'upload', relationTo: 'media', label: 'Главное фото кампании' },
            { name: 'isDemo', type: 'checkbox', label: 'Тексты раздела временные', defaultValue: false, admin: { description: 'Над разделом показывается пометка, что тексты будут заменены.' } },
          ],
        },
        {
          label: 'История и цели',
          fields: [
            { name: 'story', type: 'richText', label: 'История кампании', editor },
            {
              name: 'goals',
              type: 'array',
              label: 'Основные идеи и цели',
              labels: { singular: 'Цель', plural: 'Цели' },
              fields: [
                { name: 'title', type: 'text', label: 'Цель', required: true },
                { name: 'text', type: 'textarea', label: 'Пояснение' },
              ],
            },
          ],
        },
        {
          label: 'Программа',
          fields: [
            { name: 'programIntro', type: 'richText', label: 'Вступление к программе', editor },
            {
              name: 'programPromises',
              type: 'relationship',
              relationTo: 'promises',
              hasMany: true,
              label: 'Пункты программы',
              admin: { description: 'Пусто — показываются все опубликованные обещания.' },
            },
            {
              name: 'initiatives',
              type: 'array',
              label: 'Ключевые инициативы',
              labels: { singular: 'Инициатива', plural: 'Инициативы' },
              fields: [
                { name: 'title', type: 'text', label: 'Название', required: true },
                { name: 'text', type: 'textarea', label: 'Описание' },
                { name: 'href', type: 'text', label: 'Ссылка внутри сайта', admin: { placeholder: '/promises/...' } },
              ],
            },
          ],
        },
        {
          label: 'Хроника',
          fields: [
            {
              name: 'timeline',
              type: 'array',
              label: 'События кампании',
              labels: { singular: 'Событие', plural: 'События' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'date', type: 'date', label: 'Дата', required: true, admin: { width: '40%', date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' } } },
                    { name: 'title', type: 'text', label: 'Что произошло', required: true, admin: { width: '60%' } },
                  ],
                },
                { name: 'text', type: 'textarea', label: 'Подробности' },
              ],
            },
            { name: 'albums', type: 'relationship', relationTo: 'albums', hasMany: true, label: 'Фото и видео кампании' },
          ],
        },
        {
          label: 'Команда и итоги',
          fields: [
            { name: 'team', type: 'relationship', relationTo: 'members', hasMany: true, label: 'Команда из состава администрации' },
            {
              name: 'volunteers',
              type: 'array',
              label: 'Другие участники кампании',
              labels: { singular: 'Участник', plural: 'Участники' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', label: 'Имя', required: true, admin: { width: '50%' } },
                    { name: 'role', type: 'text', label: 'Чем помогал', admin: { width: '50%' } },
                  ],
                },
              ],
            },
            { name: 'results', type: 'richText', label: 'Итоги кампании', editor },
            {
              name: 'resultFacts',
              type: 'array',
              label: 'Итоги в цифрах',
              labels: { singular: 'Цифра', plural: 'Цифры' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'value', type: 'text', label: 'Значение', required: true, admin: { width: '30%' } },
                    { name: 'label', type: 'text', label: 'Что это', required: true, admin: { width: '70%' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
