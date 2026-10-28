import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

import { filterRewrites } from './src/lib/filters'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const securityHeaders = [
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
  // Шрифты для картинок соцсетей (src/lib/og.tsx) читаются с диска во время запроса.
  outputFileTracingIncludes: { '/**': ['./src/assets/fonts/**'] },
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }],
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
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
