import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** Иконка для домашнего экрана iOS: печать TAMOS на тёмно-синем. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1b42' }}>
        <div style={{ width: 140, height: 140, borderRadius: 999, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 114, height: 114, borderRadius: 999, border: '2px solid rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 70, fontFamily: 'serif' }}>T</div>
        </div>
      </div>
    ),
    size,
  )
}
