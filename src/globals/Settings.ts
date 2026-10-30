import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/access'
import { linkField, urlField } from '@/fields/common'
import { limitPublicGlobalQueries } from '@/hooks/limit-queries'
import { revalidateGlobal } from '@/hooks/revalidate'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Настройки сайта',
  admin: { group: 'Система', description: 'Название, ссылки, форма Бюро идей и показ демо-материалов. Доступно только администратору.' },
  access: { read: () => true, update: isAdmin },
  hooks: { ...revalidateGlobal, beforeOperation: [limitPublicGlobalQueries] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Общее',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'siteName', type: 'text', label: 'Полное название', required: true, defaultValue: 'Президентская администрация TAMOS', admin: { width: '60%' } },
                { name: 'shortName', type: 'text', label: 'Короткое название', required: true, defaultValue: 'TAMOS', admin: { width: '40%' } },
              ],
            },
            { name: 'descriptor', type: 'text', label: 'Подпись под логотипом', defaultValue: 'Президентская администрация' },
            { name: 'description', type: 'textarea', label: 'Описание сайта для поисковиков и соцсетей', required: true, defaultValue: 'Официальный сайт студенческого самоуправления TAMOS Education: новости, события, выполнение предвыборной программы и команда президента.' },
            { name: 'logo', type: 'upload', relationTo: 'media', label: 'Логотип', admin: { description: 'Если не загружен, используется печать с монограммой.' } },
            { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'Картинка для соцсетей по умолчанию' },
            {
              name: 'ticker',
              type: 'array',
              label: 'Бегущая строка',
              labels: { singular: 'Фраза', plural: 'Фразы' },
              maxRows: 6,
              fields: [
                { name: 'text', type: 'text', label: 'Текст', required: true },
                linkField('href', 'Ссылка', '/events'),
              ],
            },
          ],
        },
        {
          label: 'Бюро идей',
          fields: [
            urlField(
              'ideasFormUrl',
              'Ссылка на Google Forms для подачи идей',
              'Пока поле пустое, на сайте вместо кнопки показывается «Приём заявок скоро откроется».',
            ),
            {
              name: 'ideasFormNote',
              type: 'text',
              label: 'Подсказка рядом с кнопкой',
              defaultValue: 'Форма откроется в новой вкладке. Ответ придёт в течение недели.',
            },
          ],
        },
        {
          label: 'Контакты',
          fields: [
            { name: 'contactEmail', type: 'email', label: 'Почта для связи' },
            { name: 'address', type: 'text', label: 'Адрес или кабинет' },
            {
              name: 'socials',
              type: 'array',
              label: 'Соцсети',
              labels: { singular: 'Соцсеть', plural: 'Соцсети' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      label: 'Площадка',
                      required: true,
                      admin: { width: '40%' },
                      options: [
                        { label: 'Telegram', value: 'telegram' },
                        { label: 'Instagram', value: 'instagram' },
                        { label: 'YouTube', value: 'youtube' },
                        { label: 'TikTok', value: 'tiktok' },
                        { label: 'WhatsApp', value: 'whatsapp' },
                        { label: 'Другое', value: 'other' },
                      ],
                    },
                    { ...urlField('url', 'Ссылка'), required: true, admin: { width: '60%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Демо-материалы',
          fields: [
            {
              name: 'showDemo',
              type: 'checkbox',
              label: 'Показывать демо-материалы на сайте',
              defaultValue: true,
              admin: {
                description:
                  'Демо-записи помечены в каждом разделе галочкой «Демо-материал». Выключите показ, когда опубликуете настоящие материалы, а затем удалите демо командой npm run demo:clear.',
              },
            },
          ],
        },
      ],
    },
  ],
}
