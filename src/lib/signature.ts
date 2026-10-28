export type SignatureShape = {
  viewBox: string
  paths: { d: string; filled: boolean; strokeWidth?: number }[]
}

/**
 * Разбирает SVG-код подписи из CMS. Берём только атрибуты d у <path> и viewBox,
 * поэтому скрипты и посторонняя разметка из вставленного кода на сайт не попадают.
 */
export function parseSignature(svg: string | null | undefined): SignatureShape | null {
  if (!svg) return null
  const viewBoxMatch = svg.match(/viewBox\s*=\s*["']([\d.\s,-]+)["']/i)
  let viewBox = viewBoxMatch?.[1]?.trim()
  if (!viewBox) {
    const w = svg.match(/\bwidth\s*=\s*["']([\d.]+)/i)?.[1]
    const h = svg.match(/\bheight\s*=\s*["']([\d.]+)/i)?.[1]
    if (w && h) viewBox = `0 0 ${w} ${h}`
  }
  const paths: SignatureShape['paths'] = []
  const re = /<path\b([^>]*)>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(svg))) {
    const attrs = m[1]
    const d = attrs.match(/\sd\s*=\s*["']([^"']+)["']/i)?.[1]
    if (!d || !/^[\sMmLlHhVvCcSsQqTtAaZz\d.,eE+-]+$/.test(d)) continue
    const fill = attrs.match(/\sfill\s*=\s*["']([^"']+)["']/i)?.[1]
    const style = attrs.match(/\sstyle\s*=\s*["']([^"']+)["']/i)?.[1] ?? ''
    const styleFill = style.match(/fill\s*:\s*([^;]+)/i)?.[1]?.trim()
    const effectiveFill = (fill ?? styleFill ?? 'black').toLowerCase()
    const sw = Number(attrs.match(/\sstroke-width\s*=\s*["']([\d.]+)/i)?.[1] ?? style.match(/stroke-width\s*:\s*([\d.]+)/i)?.[1])
    paths.push({ d, filled: effectiveFill !== 'none' && effectiveFill !== 'transparent', ...(sw > 0 ? { strokeWidth: sw } : {}) })
  }
  if (!paths.length || !viewBox) return null
  return { viewBox, paths }
}

/**
 * Приблизительная длина контура SVG (команды M, L, H, V, C, S, Q, T, A, Z; абсолютные и относительные).
 * Нужна, чтобы анимировать отрисовку по реальной длине линии: без этого браузеры по-разному
 * округляют условную длину и обрезают концы штрихов.
 */
export function svgPathLength(d: string): number {
  const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g) ?? []
  let i = 0
  let cmd = ''
  let x = 0, y = 0, sx = 0, sy = 0, cx = 0, cy = 0
  let total = 0
  const num = () => Number.parseFloat(tokens[i++] ?? '0')
  const seg = (pts: [number, number][]) => {
    for (let k = 1; k < pts.length; k++) total += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1])
  }
  const cubic = (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => {
    const pts: [number, number][] = []
    for (let t = 0; t <= 1.0001; t += 1 / 24) {
      const u = 1 - t
      pts.push([u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3])
    }
    seg(pts)
  }
  while (i < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[i])) cmd = tokens[i++]
    const rel = cmd === cmd.toLowerCase()
    const ox = rel ? x : 0, oy = rel ? y : 0
    switch (cmd.toUpperCase()) {
      case 'M': {
        x = num() + ox
        y = num() + oy
        sx = x
        sy = y
        cx = x
        cy = y
        cmd = rel ? 'l' : 'L'
        break
      }
      case 'L': {
        const nx = num() + ox, ny = num() + oy
        seg([[x, y], [nx, ny]])
        x = cx = nx
        y = cy = ny
        break
      }
      case 'H': {
        const nx = num() + ox
        seg([[x, y], [nx, y]])
        x = cx = nx
        break
      }
      case 'V': {
        const ny = num() + oy
        seg([[x, y], [x, ny]])
        y = cy = ny
        break
      }
      case 'C': {
        const x1 = num() + ox, y1 = num() + oy, x2 = num() + ox, y2 = num() + oy, nx = num() + ox, ny = num() + oy
        cubic(x, y, x1, y1, x2, y2, nx, ny)
        cx = x2
        cy = y2
        x = nx
        y = ny
        break
      }
      case 'S': {
        const x1 = 2 * x - cx, y1 = 2 * y - cy
        const x2 = num() + ox, y2 = num() + oy, nx = num() + ox, ny = num() + oy
        cubic(x, y, x1, y1, x2, y2, nx, ny)
        cx = x2
        cy = y2
        x = nx
        y = ny
        break
      }
      case 'Q': {
        const qx = num() + ox, qy = num() + oy, nx = num() + ox, ny = num() + oy
        cubic(x, y, x + (2 / 3) * (qx - x), y + (2 / 3) * (qy - y), nx + (2 / 3) * (qx - nx), ny + (2 / 3) * (qy - ny), nx, ny)
        cx = qx
        cy = qy
        x = nx
        y = ny
        break
      }
      case 'T': {
        const qx = 2 * x - cx, qy = 2 * y - cy
        const nx = num() + ox, ny = num() + oy
        cubic(x, y, x + (2 / 3) * (qx - x), y + (2 / 3) * (qy - y), nx + (2 / 3) * (qx - nx), ny + (2 / 3) * (qy - ny), nx, ny)
        cx = qx
        cy = qy
        x = nx
        y = ny
        break
      }
      case 'A': {
        const rx = num(), ry = num()
        num()
        num()
        num()
        const nx = num() + ox, ny = num() + oy
        const chord = Math.hypot(nx - x, ny - y)
        total += Math.max(chord, Math.min(Math.PI * Math.max(rx, ry), chord * 1.6))
        x = cx = nx
        y = cy = ny
        break
      }
      case 'Z': {
        seg([[x, y], [sx, sy]])
        x = cx = sx
        y = cy = sy
        break
      }
      default:
        i++
    }
  }
  return total
}
