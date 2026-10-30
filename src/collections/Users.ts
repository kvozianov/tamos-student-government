import { APIError, Forbidden, ValidationError, type CollectionConfig, type PayloadRequest } from 'payload'

import { SECTIONS, isAdmin, isAdminField, isAdminUser } from '@/access'
import { passwordProblem } from '@/lib/password'

const selfOrAdmin = ({ req }: { req: { user?: unknown } }) => {
  const user = req.user as { id: number | string; role?: string } | undefined
  if (!user) return false
  if (isAdminUser(user)) return true
  return { id: { equals: user.id } }
}

/**
 * Ошибка поля формы. Текст продублирован в message: в продакшен-сборке Payload может не узнать класс ошибки
 * (он бывает из другого бандла) и тогда отдаёт клиенту только message без привязки к полю.
 */
const fieldError = (path: string, message: string) => {
  const error = new ValidationError({ collection: 'users', errors: [{ path, message }] })
  error.message = message
  return error
}

const countAdmins = async (req: PayloadRequest) =>
  (await req.payload.count({ collection: 'users', where: { role: { equals: 'admin' } }, overrideAccess: true, req })).totalDocs

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
    // Снимать блокировку после неудачных входов может только администратор.
    unlock: isAdmin,
  },
  hooks: {
    beforeOperation: [
      ({ operation, req }) => {
        // Восстановление пароля по почте отключено: почтового сервиса нет, и Payload писал бы ссылку для сброса
        // в логи сервера. Адреса закрыты и в src/proxy.ts; здесь — на случай другого написания адреса.
        if (operation === 'forgotPassword' || operation === 'resetPassword') throw new Forbidden(req.t)
      },
    ],
    beforeValidate: [
      ({ data }) => {
        // Пароль проверяется при создании пользователя и при каждой смене: в панели, через API и в скриптах.
        const password = (data as { password?: unknown } | undefined)?.password
        if (typeof password === 'string' && password) {
          const problem = passwordProblem(password)
          if (problem) throw fieldError('password', problem)
        }
        return data
      },
    ],
    beforeChange: [
      async ({ req, operation, data, originalDoc }) => {
        // Первый зарегистрированный пользователь всегда становится администратором.
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true, req })
          if (totalDocs === 0) {
            data.role = 'admin'
            data.sections = []
          }
        }
        // Без администратора панелью некому управлять: последнего нельзя перевести в редакторы.
        if (operation === 'update' && originalDoc?.role === 'admin' && data.role && data.role !== 'admin' && (await countAdmins(req)) <= 1) {
          throw fieldError('role', 'Это единственный администратор. Сначала назначьте администратором другого пользователя.')
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        if (req.user && String(req.user.id) === String(id)) {
          throw new APIError('Нельзя удалить собственную учётную запись.', 403, null, true)
        }
        const target = await req.payload.findByID({ collection: 'users', id, depth: 0, overrideAccess: true, req, disableErrors: true })
        if (target?.role === 'admin' && (await countAdmins(req)) <= 1) {
          throw new APIError('Нельзя удалить единственного администратора.', 403, null, true)
        }
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
