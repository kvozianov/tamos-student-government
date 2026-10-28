import type { CollectionConfig } from 'payload'
import path from 'path'

import { isAdmin, isStaff } from '@/access'
import { demoField } from '@/fields/common'
import { revalidateCollection } from '@/hooks/revalidate'

export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Документ', plural: 'Документы' },
  admin: {
    group: 'Файлы',
    useAsTitle: 'title',
    defaultColumns: ['title', 'filename', 'filesize', 'updatedAt'],
    description: 'PDF, Word, Excel и PowerPoint для отчётов, обещаний и событий.',
  },
  access: { read: () => true, create: isStaff, update: isStaff, delete: isAdmin },
  hooks: revalidateCollection,
  upload: {
    staticDir: path.resolve(process.cwd(), 'documents'),
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
    ],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Название документа', required: true },
    { name: 'description', type: 'textarea', label: 'Краткое описание' },
    demoField,
  ],
}
