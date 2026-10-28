import sharp from 'sharp'

const PALETTES = [
  { bg: '#0a1533', a: '#1a2b5c', b: '#2b3d73', ink: '#ffffff' },
  { bg: '#e8e6df', a: '#d4d0c4', b: '#bdb7a6', ink: '#0d0f14' },
  { bg: '#112047', a: '#22508e', b: '#9aa5c2', ink: '#ffffff' },
  { bg: '#2b3d73', a: '#0a1533', b: '#e6e9f2', ink: '#ffffff' },
  { bg: '#f3f3f0', a: '#dcd9d1', b: '#9c7f4f', ink: '#0d0f14' },
  { bg: '#060c1f', a: '#1a2b5c', b: '#9c7f4f', ink: '#ffffff' },
]

/** Генерирует нейтральную демо-иллюстрацию с явной пометкой «Демо-фото». Реальные фото загружаются через медиатеку. */
export async function demoImage(index: number, label: string, width = 1600, height = 1067) {
  const c = PALETTES[index % PALETTES.length]
  const cols = Array.from({ length: 7 }, (_, i) => {
    const x = 160 + i * 190
    const h = 380 + ((i * 97 + index * 53) % 260)
    return `<rect x="${x}" y="${height - 180 - h}" width="64" height="${h}" fill="${c.a}" opacity="0.85"/>`
  }).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="${c.bg}"/>
    <circle cx="${1180 - index * 90}" cy="${300 + index * 25}" r="150" fill="${c.b}" opacity="0.35"/>
    ${cols}
    <rect x="0" y="${height - 180}" width="${width}" height="2" fill="${c.ink}" opacity="0.25"/>
    <rect x="120" y="${height - 640}" width="${width - 240}" height="14" fill="${c.b}" opacity="0.6"/>
    <text x="64" y="${height - 70}" font-family="Helvetica, Arial, sans-serif" font-size="26" letter-spacing="6" fill="${c.ink}" opacity="0.7">ДЕМО-ФОТО · ${label.toUpperCase()}</text>
  </svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 84 }).toBuffer()
}
