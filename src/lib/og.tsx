import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }

const fonts = async () => {
  const dir = join(process.cwd(), 'src/assets/fonts')
  const [serif, cyrillic, latin] = await Promise.all(
    ['Oranienbaum-Regular.ttf', 'golos-text-cyrillic-500.woff', 'golos-text-latin-500.woff'].map((f) => readFile(join(dir, f))),
  )
  return [
    { name: 'Oranienbaum', data: serif, weight: 400 as const, style: 'normal' as const },
    { name: 'Golos', data: cyrillic, weight: 500 as const, style: 'normal' as const },
    { name: 'Golos', data: latin, weight: 500 as const, style: 'normal' as const },
  ]
}

/** Карточка для соцсетей в фирменном стиле: печать, раздел капсом и заголовок крупной антиквой. */
export async function ogCard({ eyebrow, title, footer = 'Президентская администрация TAMOS' }: { eyebrow: string; title: string; footer?: string }) {
  const size = title.length > 70 ? 58 : title.length > 40 ? 72 : 92
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff', padding: '64px 72px', fontFamily: 'Golos', color: '#111827', borderTop: '14px solid #0345bf' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, border: '2px solid #0b1b42', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 58, height: 58, borderRadius: 999, border: '1px solid #0b1b42', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Oranienbaum', fontSize: 34, color: '#0b1b42' }}>T</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'Oranienbaum', fontSize: 40, letterSpacing: 6, color: '#0b1b42' }}>TAMOS</span>
            <span style={{ fontSize: 16, letterSpacing: 3, textTransform: 'uppercase', color: '#4f5666' }}>{footer}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 22, letterSpacing: 4, textTransform: 'uppercase', color: '#0345bf', marginBottom: 18 }}>{eyebrow}</span>
          <span style={{ fontFamily: 'Oranienbaum', fontSize: size, lineHeight: 1.02, maxWidth: 1040 }}>{title}</span>
        </div>
        <div style={{ display: 'flex', height: 6, width: 160, background: '#e1251b' }} />
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  )
}
