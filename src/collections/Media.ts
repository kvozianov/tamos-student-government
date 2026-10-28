import type { CollectionConfig } from 'payload'
import path from 'path'

import { isAdmin, isStaff } from '@/access'
import { demoField } from '@/fields/common'
import { revalidateCollection } from '@/hooks/revalidate'

const webp = { format: 'webp' as const, options: { quality: 80 } }

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Фото или видео', plural: 'Медиатека' },
  admin: {
    group: 'Файлы',
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
    description: 'Фотографии и видео для новостей, событий, галереи и страниц. JPG, PNG, WebP, AVIF, MP4, WebM, MOV.',
  },
  access: { read: () => true, create: isStaff, update: isStaff, delete: isAdmin },
  hooks: revalidateCollection,
  upload: {
    staticDir: path.resolve(process.cwd(), 'media'),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'],
    focalPoint: true,
    crop: true,
    adminThumbnail: 'thumbnail',
    imageSizes: [
      { name: 'thumbnail', width: 480, formatOptions: webp },
      { name: 'card', width: 960, formatOptions: webp },
      { name: 'wide', width: 1920, formatOptions: webp },
      { name: 'og', width: 1200, height: 630, position: 'centre', formatOptions: { format: 'jpeg', options: { quality: 82 } } },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Описание изображения',
      required: true,
      admin: { description: 'Что изображено. Нужно незрячим посетителям и поисковикам.' },
    },
    { name: 'caption', type: 'text', label: 'Подпись' },
    { name: 'credit', type: 'text', label: 'Автор фото' },
    demoField,
  ],
}
