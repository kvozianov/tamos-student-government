import type { GlobalConfig } from 'payload'

import { canManage } from '@/access'
import { editor } from '@/fields/richText'
import { revalidateGlobal } from '@/hooks/revalidate'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Главная страница',
  admin: { group: 'Страницы', description: 'Тексты первого экрана и обращения. Новости, события и обещания подтягиваются автоматически.' },
  access: { read: () => true, update: canManage('home') },
  hooks: revalidateGlobal,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Первый экран',
          fields: [
            { name: 'heroEyebrow', type: 'text', label: 'Надзаголовок', defaultValue: 'Президент TAMOS' },
            { name: 'heroSlogan', type: 'textarea', label: 'Слоган или краткое обращение', maxLength: 220 },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Фото первого экрана',
              admin: { description: 'Горизонтальное фото президента. Если не загружено, используется официальный портрет из раздела «Администрация».' },
            },
            { name: 'heroCta', type: 'text', label: 'Текст кнопки', defaultValue: 'О президенте и администрации' },
          ],
        },
        {
          label: 'Обращение',
          fields: [
            { name: 'addressTitle', type: 'text', label: 'Заголовок', defaultValue: 'Обращение президента' },
            { name: 'address', type: 'richText', label: 'Текст обращения', editor },
          ],
        },
        {
          label: 'Подписи секций',
          fields: [
            { name: 'promisesLead', type: 'textarea', label: 'Вступление к блоку «Наши обязательства»' },
            { name: 'ideasLead', type: 'textarea', label: 'Вступление к блоку «Бюро идей»' },
            { name: 'resultsLead', type: 'textarea', label: 'Вступление к блоку «Результаты»' },
          ],
        },
      ],
    },
  ],
}
