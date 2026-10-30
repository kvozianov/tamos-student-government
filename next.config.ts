import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

import { filterRewrites } from './src/lib/filters'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

type Policy = Record<string, string[]>

/**
 * Страницы кэшируются (ISR), поэтому одноразовые nonce здесь не подходят: встроенные скрипты Next.js
 * разрешены через 'unsafe-inline', а всё внешнее перечислено явно.
 * - Файлы медиатеки отдаются через /api/media/file/… с того же домена, даже если лежат в Vercel Blob.
 * - Админка загружает файлы напрямую в Vercel Blob (clientUploads): браузер ходит на vercel.com/api/blob/.
 * - Gravatar — аватар пользователя в админке Payload; YouTube — встроенные видео и их превью.
 */
const basePolicy: Policy = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:', 'https://i.ytimg.com', 'https://www.gravatar.com'],
  'media-src': ["'self'", 'blob:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", 'https://vercel.com/api/blob/'],
  'frame-src': ["'self'", 'https://www.youtube-nocookie.com'],
  'worker-src': ["'self'", 'blob:'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'"],
}

// Режим разработки: React использует eval для отладки, горячая перезагрузка идёт через WebSocket.
const devPolicy: Policy = { 'script-src': ["'unsafe-eval'"], 'connect-src': ['ws:'] }

// Тулбар и комментарии Vercel появляются только на превью-деплоях (список адресов — из документации Vercel).
const vercelToolbarPolicy: Policy = {
  'script-src': ['https://vercel.live'],
  'style-src': ['https://vercel.live'],
  'img-src': ['https://vercel.live', 'https://vercel.com'],
  'font-src': ['https://vercel.live', 'https://assets.vercel.com'],
  'connect-src': ['https://vercel.live', 'wss://ws-us3.pusher.com'],
  'frame-src': ['https://vercel.live'],
}

function buildPolicy(...parts: Policy[]) {
  const merged: Policy = {}
  for (const part of parts) {
    for (const [directive, sources] of Object.entries(part)) merged[directive] = [...(merged[directive] ?? []), ...sources]
  }
  return Object.entries(merged)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}

const contentSecurityPolicy = buildPolicy(
  basePolicy,
  process.env.NODE_ENV === 'development' ? devPolicy : {},
  process.env.VERCEL_ENV === 'preview' ? vercelToolbarPolicy : {},
)

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  // ISR: страница свежая 60 с (revalidate в src/app/(frontend)/layout.tsx), потом посетитель получает копию из кэша,
  // а новая собирается в фоне. Копию старше часа не отдаём: после долгого простоя первый посетитель дождётся
  // свежей сборки, и статусы событий никогда не отстают больше чем на час. Подробнее — README, раздел «Кэш».
  expireTime: 3600,
  poweredByHeader: false,
  // Шрифты для картинок соцсетей (src/lib/og.tsx) читаются с диска во время запроса.
  outputFileTracingIncludes: { '/**': ['./src/assets/fonts/**'] },
  images: {
    // Только файлы медиатеки с нашего домена. Vercel Blob наружу не выходит: плагин хранилища отдаёт файлы
    // через /api/media/file/…, поэтому внешние источники (remotePatterns) оптимизатору картинок не нужны.
    localPatterns: [{ pathname: '/api/media/file/**' }],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async redirects() {
    // Прежние адреса разделов: «Администрация» стала «Командой», «Обещания» — «Программой».
    return [
      { source: '/administration/:path*', destination: '/team/:path*', permanent: true },
      { source: '/promises/:path*', destination: '/programme/:path*', permanent: true },
    ]
  },
  async rewrites() {
    // Фильтры списков ведут на кэшируемые служебные страницы, см. src/lib/filters.ts.
    return { beforeFiles: filterRewrites, afterFiles: [], fallback: [] }
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
