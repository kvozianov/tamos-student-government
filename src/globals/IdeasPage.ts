import type { GlobalConfig } from 'payload'

import { canManage } from '@/access'
import { editor } from '@/fields/richText'
import { limitPublicGlobalQueries } from '@/hooks/limit-queries'
import { revalidateGlobal } from '@/hooks/revalidate'

export const IdeasPage: GlobalConfig = {
  slug: 'ideas-page',
  label: 'Страница Бюро идей',
  admin: { group: 'Страницы', description: 'Ссылка на Google Forms задаётся в «Настройках сайта».' },
  access: { read: () => true, update: canManage('ideas') },
  hooks: { ...revalidateGlobal, beforeOperation: [limitPublicGlobalQueries] },
  fields: [
    { name: 'lead', type: 'textarea', label: 'Главная мысль', required: true },
    { name: 'about', type: 'richText', label: 'О Бюро идей', editor },
    {
      name: 'principles',
      type: 'array',
      label: 'Принципы работы',
      labels: { singular: 'Принцип', plural: 'Принципы' },
      fields: [
        { name: 'title', type: 'text', label: 'Принцип', required: true },
        { name: 'text', type: 'textarea', label: 'Пояснение' },
      ],
    },
    {
      name: 'steps',
      type: 'array',
      label: 'Как это работает',
      labels: { singular: 'Шаг', plural: 'Шаги' },
      minRows: 2,
      fields: [
        { name: 'title', type: 'text', label: 'Шаг', required: true },
        { name: 'text', type: 'textarea', label: 'Что происходит' },
      ],
    },
    { name: 'ctaTitle', type: 'text', label: 'Заголовок призыва', defaultValue: 'Есть идея для школы?' },
    { name: 'ctaText', type: 'textarea', label: 'Текст призыва' },
  ],
}
