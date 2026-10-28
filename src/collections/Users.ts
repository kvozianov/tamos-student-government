import type { CollectionConfig } from 'payload'

import { SECTIONS, isAdmin, isAdminField, isAdminUser } from '@/access'

const selfOrAdmin = ({ req }: { req: { user?: unknown } }) => {
  const user = req.user as { id: number | string; role?: string } | undefined
  if (!user) return false
  if (isAdminUser(user)) return true
  return { id: { equals: user.id } }
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Пользователь', plural: 'Пользователи' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Система',
    description: 'Доступ к панели управления. Администратор управляет всем, редактор работает только в выданных разделах.',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 60 * 60 * 12,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    create: isAdmin,
    read: selfOrAdmin,
    update: selfOrAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ req, operation, data }) => {
        // Первый зарегистрированный пользователь всегда становится администратором.
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true, req })
          if (totalDocs === 0) {
            data.role = 'admin'
            data.sections = []
          }
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Имя и фамилия', required: true },
    {
      name: 'role',
      type: 'select',
      label: 'Роль',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: [
        { label: 'Администратор', value: 'admin' },
        { label: 'Редактор', value: 'editor' },
      ],
      access: { update: isAdminField },
      admin: { position: 'sidebar', description: 'Менять роль может только администратор.' },
    },
    {
      name: 'sections',
      type: 'select',
      label: 'Разделы редактора',
      hasMany: true,
      saveToJWT: true,
      options: Object.entries(SECTIONS).map(([value, label]) => ({ value, label })),
      access: { update: isAdminField },
      admin: {
        position: 'sidebar',
        condition: (data) => data?.role === 'editor',
        description: 'Редактор может создавать и править материалы только в этих разделах. Удаляет материалы администратор.',
      },
    },
  ],
}
