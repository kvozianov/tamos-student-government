import { postgresAdapter } from '@payloadcms/db-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { ru } from '@payloadcms/translations/languages/ru'
import path from 'path'
import { accessOperation, buildConfig, headersWithCors } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Albums } from './collections/Albums'
import { Categories } from './collections/Categories'
import { Documents } from './collections/Documents'
import { Events } from './collections/Events'
import { Ideas } from './collections/Ideas'
import { Media } from './collections/Media'
import { Messages } from './collections/Messages'
import { Members } from './collections/Members'
import { News } from './collections/News'
import { Promises } from './collections/Promises'
import { Reports } from './collections/Reports'
import { Users } from './collections/Users'
import { editor } from './fields/richText'
import { Campaign } from './globals/Campaign'
import { Home } from './globals/Home'
import { IdeasPage } from './globals/IdeasPage'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const serverURL = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '')

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    // Без Gravatar: панель не обращается к внешним сервисам, и CSP не нужно их разрешать.
    avatar: 'default',
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' — TAMOS',
      description: 'Панель управления сайтом президентской администрации TAMOS',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' }],
    },
    components: {
      graphics: { Logo: '/components/admin/Logo#Logo', Icon: '/components/admin/Logo#Icon' },
      beforeDashboard: ['/components/admin/Welcome#Welcome'],
      afterLogin: ['/components/admin/LoginNote#LoginNote'],
    },
    dateFormat: 'd MMMM yyyy, HH:mm',
    theme: 'light',
    timezones: {
      supportedTimezones: [
        { label: 'Алматы, Астана (UTC+5)', value: 'Asia/Almaty' },
        { label: 'Актобе, Атырау (UTC+5)', value: 'Asia/Aqtobe' },
        { label: 'Москва (UTC+3)', value: 'Europe/Moscow' },
      ],
      defaultTimezone: process.env.NEXT_PUBLIC_SITE_TIMEZONE || 'Asia/Almaty',
    },
  },
  i18n: { supportedLanguages: { ru }, fallbackLanguage: 'ru' },
  collections: [News, Events, Promises, Categories, Ideas, Reports, Albums, Members, Media, Documents, Messages, Users],
  globals: [Home, IdeasPage, Campaign, Settings],
  endpoints: [
    {
      // Замена стандартного /api/access: карта прав и полей схемы только для вошедших в панель.
      // Пользовательские эндпоинты Payload проверяет раньше встроенных.
      path: '/access',
      method: 'get',
      handler: async (req) => {
        const headers = headersWithCors({ headers: new Headers(), req })
        if (!req.user) return Response.json({ message: 'Not Found' }, { headers, status: 404 })
        return Response.json(await accessOperation({ req }), { headers })
      },
    },
  ],
  editor,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  graphQL: { disable: true },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  upload: { limits: { fileSize: 200 * 1024 * 1024 } },
  cors: serverURL ? [serverURL] : [],
  csrf: serverURL ? [serverURL] : [],
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      // поля плагина есть в схеме всегда, чтобы локальная база и продакшен с Blob совпадали
      alwaysInsertFields: true,
      collections: { media: true, documents: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
      clientUploads: true,
    }),
  ],
})
