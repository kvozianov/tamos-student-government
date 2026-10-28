import type { CollectionConfig } from 'payload'

import { canManage, isAdmin } from '@/access'
import { slugField } from '@/fields/common'
import { revalidateCollection } from '@/hooks/revalidate'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Тема', plural: 'Темы обещаний' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'order'], group: 'Программа' },
  defaultSort: 'order',
  access: { read: () => true, create: canManage('categories'), update: canManage('categories'), delete: isAdmin },
  hooks: revalidateCollection,
  fields: [
    { name: 'title', type: 'text', label: 'Название', required: true },
    { name: 'description', type: 'textarea', label: 'Описание' },
    { name: 'order', type: 'number', label: 'Порядок', defaultValue: 0, admin: { position: 'sidebar' } },
    slugField(),
  ],
}
