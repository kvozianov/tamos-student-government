import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField } from '@/access'
import { MESSAGE_TOPICS } from '@/lib/contact'

/**
 * Обращения с формы на странице «Контакты». Через REST API создать запись нельзя: форма пишет
 * в базу серверным действием после проверки (src/app/(frontend)/contact/actions.ts).
 */
export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: 'Обращение', plural: 'Обращения' },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'name', 'topic', 'status', 'createdAt'],
    group: 'Обратная связь',
    description: 'Сообщения с формы на странице «Контакты». Отметьте статус, когда ответите.',
    listSearchableFields: ['subject', 'name', 'email', 'message'],
  },
  defaultSort: '-createdAt',
  access: { read: isAdmin, create: () => false, update: isAdmin, delete: isAdmin },
  fields: [
    { name: 'subject', type: 'text', label: 'Тема', required: true, maxLength: 140 },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Имя', required: true, maxLength: 80, admin: { width: '50%' } },
        { name: 'email', type: 'email', label: 'Почта для ответа', required: true, admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'grade', type: 'text', label: 'Класс', maxLength: 20, admin: { width: '50%' } },
        {
          name: 'topic',
          type: 'select',
          label: 'Раздел',
          required: true,
          defaultValue: 'question',
          options: Object.entries(MESSAGE_TOPICS).map(([value, label]) => ({ value, label })),
          admin: { width: '50%' },
        },
      ],
    },
    { name: 'message', type: 'textarea', label: 'Сообщение', required: true, maxLength: 4000 },
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'Новое', value: 'new' },
        { label: 'В работе', value: 'in_progress' },
        { label: 'Отвечено', value: 'answered' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'note', type: 'textarea', label: 'Заметка администрации', admin: { position: 'sidebar' } },
    {
      // Ключ отправителя для ограничения частоты (src/lib/contact-guard.ts): HMAC от IP, сам адрес не хранится.
      // Пишет его только серверное действие формы, в панели поле скрыто.
      name: 'clientKey',
      type: 'text',
      index: true,
      access: { read: isAdminField, create: () => false, update: () => false },
      admin: { hidden: true },
    },
  ],
}
