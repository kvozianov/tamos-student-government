/**
 * Превращает скан подписи в SVG из центральных линий штрихов, чтобы сайт мог «написать» её пером.
 *
 *   node scripts/trace-signature.mjs scripts/assets/signature-source.webp src/seed/signature.svg
 *
 * Шаги: бинаризация → утончение до скелета (Zhang–Suen) → граф штрихов → удаление коротких отростков →
 * склейка линий на пересечениях по направлению → сглаживание в кривые Безье → порядок «как пишут».
 */
import fs from 'node:fs'
import sharp from 'sharp'

const [input = 'scripts/assets/signature-source.webp', output = 'src/seed/signature.svg'] = process.argv.slice(2)

const { data, info } = await sharp(input).flatten({ background: '#ffffff' }).greyscale().blur(1.2).raw().toBuffer({ resolveWithObject: true })
const W = info.width
const H = info.height
const ink = new Uint8Array(W * H)
for (let i = 0; i < data.length; i++) ink[i] = data[i] < 140 ? 1 : 0
const inkCount = ink.reduce((a, b) => a + b, 0)

/* ---------- 1. Скелет ---------- */
const sk = ink.slice()
const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : sk[y * W + x])
const ring = (x, y) => [at(x, y - 1), at(x + 1, y - 1), at(x + 1, y), at(x + 1, y + 1), at(x, y + 1), at(x - 1, y + 1), at(x - 1, y), at(x - 1, y - 1)]
let changed = true
while (changed) {
  changed = false
  for (const step of [0, 1]) {
    const del = []
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        if (!sk[y * W + x]) continue
        const [p2, p3, p4, p5, p6, p7, p8, p9] = ring(x, y)
        const b = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9
        if (b < 2 || b > 6) continue
        const seq = [p2, p3, p4, p5, p6, p7, p8, p9, p2]
        let a = 0
        for (let k = 0; k < 8; k++) if (!seq[k] && seq[k + 1]) a++
        if (a !== 1) continue
        if (step === 0 ? p2 * p4 * p6 || p4 * p6 * p8 : p2 * p4 * p8 || p2 * p6 * p8) continue
        del.push(y * W + x)
      }
    }
    if (del.length) {
      changed = true
      for (const i of del) sk[i] = 0
    }
  }
}
// Убираем «ступеньки»: пиксель лишний, если его 4-соседи уже соединены по диагонали.
for (let y = 1; y < H - 1; y++) {
  for (let x = 1; x < W - 1; x++) {
    if (!sk[y * W + x]) continue
    const n = at(x, y - 1), e = at(x + 1, y), s = at(x, y + 1), w = at(x - 1, y)
    if ((n && e && !at(x - 1, y + 1)) || (e && s && !at(x - 1, y - 1)) || (s && w && !at(x + 1, y - 1)) || (w && n && !at(x + 1, y + 1))) {
      const [p2, p3, p4, p5, p6, p7, p8, p9] = ring(x, y)
      const seq = [p2, p3, p4, p5, p6, p7, p8, p9, p2]
      let a = 0
      for (let k = 0; k < 8; k++) if (!seq[k] && seq[k + 1]) a++
      if (a === 1) sk[y * W + x] = 0
    }
  }
}
let skCount = 0
for (const v of sk) skCount += v
const thickness = inkCount / Math.max(1, skCount)

// Маленькие изолированные пятна (точки после инициалов) превращаем в точку и убираем из скелета.
const dotPoints = []
{
  const seen = new Uint8Array(W * H)
  for (let i = 0; i < W * H; i++) {
    if (!sk[i] || seen[i]) continue
    const comp = []
    const stack = [i]
    seen[i] = 1
    while (stack.length) {
      const p = stack.pop()
      comp.push(p)
      const x = p % W, y = (p / W) | 0
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const q = (y + dy) * W + x + dx
          if ((dx || dy) && at(x + dx, y + dy) && !seen[q]) {
            seen[q] = 1
            stack.push(q)
          }
        }
    }
    if (comp.length <= thickness * 1.6) {
      dotPoints.push([comp.reduce((a, p) => a + (p % W), 0) / comp.length, comp.reduce((a, p) => a + ((p / W) | 0), 0) / comp.length])
      for (const p of comp) sk[p] = 0
    }
  }
}

/* ---------- 2. Граф: узлы (концы и развилки) и рёбра между ними ---------- */
// Диагональ считаем связью, только если у двух пикселей нет общего прямого соседа: так «ступеньки»
// на наклонных линиях не превращаются в ложные развилки.
const adj = (i) => {
  const x = i % W, y = (i / W) | 0
  const out = []
  for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) if (at(x + dx, y + dy)) out.push((y + dy) * W + x + dx)
  for (const [dx, dy] of [[1, -1], [1, 1], [-1, 1], [-1, -1]]) {
    if (at(x + dx, y + dy) && !at(x + dx, y) && !at(x, y + dy)) out.push((y + dy) * W + x + dx)
  }
  return out
}
const pt = (i) => [i % W, (i / W) | 0]
const deg = new Uint8Array(W * H)
const skPixels = []
for (let i = 0; i < W * H; i++) if (sk[i]) {
  skPixels.push(i)
  deg[i] = adj(i).length
}
const isNode = (i) => deg[i] !== 2

// соседние пиксели-развилки объединяем в один узел
const parent = new Map()
const find = (i) => {
  let r = i
  while (parent.has(r) && parent.get(r) !== r) r = parent.get(r)
  return r
}
for (const i of skPixels) if (isNode(i)) parent.set(i, i)
for (const i of skPixels) {
  if (deg[i] < 3) continue
  for (const q of adj(i)) if (deg[q] >= 3) parent.set(find(q), find(i))
}

let edges = []
const visited = new Uint8Array(W * H)
for (const n of skPixels) {
  if (!isNode(n)) continue
  for (const first of adj(n)) {
    if (isNode(first)) {
      if (find(first) !== find(n) && n < first) edges.push({ a: find(n), b: find(first), pts: [pt(n), pt(first)] })
      continue
    }
    if (visited[first]) continue
    const pts = [pt(n), pt(first)]
    let prev = n, cur = first
    while (!isNode(cur)) {
      visited[cur] = 1
      const next = adj(cur).find((q) => q !== prev)
      if (next === undefined) break
      prev = cur
      cur = next
      pts.push(pt(cur))
      if (visited[cur] && !isNode(cur)) break
    }
    edges.push({ a: find(n), b: isNode(cur) ? find(cur) : -1, pts })
  }
}
// замкнутые петли без развилок (буквы «о»)
for (const i of skPixels) {
  if (visited[i] || isNode(i)) continue
  const pts = [pt(i)]
  visited[i] = 1
  let prev = -1, cur = i
  for (;;) {
    const next = adj(cur).find((q) => q !== prev && !visited[q])
    if (next === undefined) break
    visited[next] = 1
    pts.push(pt(next))
    prev = cur
    cur = next
  }
  pts.push(pts[0])
  edges.push({ a: -1, b: -1, pts, loop: true })
}
// одиночные точки и крошечные пятна (точки после инициалов)
const dots = []
for (const i of skPixels) if (deg[i] === 0) dots.push(pt(i))

const len = (pts) => pts.reduce((s, p, k) => (k ? s + Math.hypot(p[0] - pts[k - 1][0], p[1] - pts[k - 1][1]) : 0), 0)

/* ---------- 3. Удаляем короткие отростки скелета ---------- */
const degree = () => {
  const d = new Map()
  for (const e of edges) for (const n of [e.a, e.b]) if (n >= 0) d.set(n, (d.get(n) ?? 0) + 1)
  return d
}
const SPUR = thickness * 2.2
for (let pass = 0; pass < 3; pass++) {
  const d = degree()
  edges = edges.filter((e) => {
    if (e.loop) return true
    const da = d.get(e.a) ?? 0, db = d.get(e.b) ?? 0
    const spur = (da === 1 && db >= 3) || (db === 1 && da >= 3)
    return !(spur && len(e.pts) < SPUR)
  })
}

/* ---------- 4. Склейка на развилках: продолжаем линию туда, куда она шла ---------- */
const dirAt = (e, end) => {
  const pts = end === 'a' ? e.pts : [...e.pts].reverse()
  const o = pts[0]
  let k = 1
  while (k < pts.length - 1 && Math.hypot(pts[k][0] - o[0], pts[k][1] - o[1]) < thickness * 3) k++
  const v = [pts[k][0] - o[0], pts[k][1] - o[1]]
  const m = Math.hypot(...v) || 1
  return [v[0] / m, v[1] / m]
}
const ends = new Map()
edges.forEach((e, idx) => {
  if (e.loop) return
  for (const end of ['a', 'b']) {
    const n = e[end]
    if (n < 0) continue
    if (!ends.has(n)) ends.set(n, [])
    ends.get(n).push({ idx, end, dir: dirAt(e, end) })
  }
})
const partner = new Map()
for (const list of ends.values()) {
  const pairs = []
  for (let i = 0; i < list.length; i++)
    for (let j = i + 1; j < list.length; j++) {
      if (list[i].idx === list[j].idx) continue
      const dot = list[i].dir[0] * list[j].dir[0] + list[i].dir[1] * list[j].dir[1]
      pairs.push({ i, j, dot })
    }
  pairs.sort((p, q) => p.dot - q.dot)
  const used = new Set()
  for (const p of pairs) {
    if (p.dot > -0.45 || used.has(p.i) || used.has(p.j)) continue
    used.add(p.i)
    used.add(p.j)
    const A = list[p.i], B = list[p.j]
    partner.set(`${A.idx}${A.end}`, B)
    partner.set(`${B.idx}${B.end}`, A)
  }
}
const usedEdge = new Set()
const strokes = []
const orient = (e, fromEnd) => (fromEnd === 'a' ? e.pts : [...e.pts].reverse())
const startAt = (idx, end) => {
  const pts = []
  let curIdx = idx, curEnd = end
  while (curIdx !== undefined && !usedEdge.has(curIdx)) {
    usedEdge.add(curIdx)
    const seg = orient(edges[curIdx], curEnd)
    pts.push(...(pts.length ? seg.slice(1) : seg))
    const exitEnd = curEnd === 'a' ? 'b' : 'a'
    const next = partner.get(`${curIdx}${exitEnd}`)
    if (!next) break
    curIdx = next.idx
    curEnd = next.end
  }
  return pts
}
edges.forEach((e, idx) => {
  if (e.loop || usedEdge.has(idx)) return
  for (const end of ['a', 'b']) if (!partner.has(`${idx}${end}`) && !usedEdge.has(idx)) strokes.push(startAt(idx, end))
})
edges.forEach((e, idx) => {
  if (usedEdge.has(idx)) return
  if (e.loop) {
    usedEdge.add(idx)
    strokes.push(e.pts)
  } else strokes.push(startAt(idx, 'a'))
})

/* ---------- 5. Сглаживание и упрощение ---------- */
function smooth(pts, r = 3) {
  if (pts.length < 2 * r + 2) return pts
  return pts.map((p, k) => {
    if (k === 0 || k === pts.length - 1) return p
    let sx = 0, sy = 0, c = 0
    for (let j = Math.max(0, k - r); j <= Math.min(pts.length - 1, k + r); j++) {
      sx += pts[j][0]
      sy += pts[j][1]
      c++
    }
    return [sx / c, sy / c]
  })
}
function rdp(pts, eps) {
  if (pts.length < 3) return pts
  const [a, b] = [pts[0], pts[pts.length - 1]]
  let max = 0, at = 0
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const L = Math.hypot(dx, dy)
  for (let k = 1; k < pts.length - 1; k++) {
    // у замкнутого штриха концы совпадают: меряем расстояние до точки, а не до прямой
    const d = L < 1 ? Math.hypot(pts[k][0] - a[0], pts[k][1] - a[1]) : Math.abs(dy * pts[k][0] - dx * pts[k][1] + b[0] * a[1] - b[1] * a[0]) / L
    if (d > max) {
      max = d
      at = k
    }
  }
  if (max <= eps) return [a, b]
  return [...rdp(pts.slice(0, at + 1), eps).slice(0, -1), ...rdp(pts.slice(at), eps)]
}
const f = (n) => Number(n.toFixed(1))
function toPath(pts) {
  if (pts.length === 2) return `M${f(pts[0][0])} ${f(pts[0][1])}L${f(pts[1][0])} ${f(pts[1][1])}`
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let k = 0; k < pts.length - 1; k++) {
    const p0 = pts[k - 1] ?? pts[k], p1 = pts[k], p2 = pts[k + 1], p3 = pts[k + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`
  }
  return d
}

/* ---------- 6. Порядок «как пишут»: слева направо, длинный росчерк — последним ---------- */
for (const d of [...dots, ...dotPoints]) strokes.push([d, [d[0] + 0.5, d[1]]])
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
const prepared = strokes
  .filter((s) => s.length === 2 || len(s) > thickness * 1.2)
  .map((s) => {
    let pts = rdp(smooth(s), 0.9)
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1])
    for (const p of pts) {
      minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1])
    }
    const span = Math.max(...xs) - Math.min(...xs)
    const vspan = Math.max(...ys) - Math.min(...ys)
    const [s0, s1] = [pts[0], pts[pts.length - 1]]
    // горизонтальные штрихи ведём слева направо, вертикальные — сверху вниз
    if (span >= vspan ? s0[0] > s1[0] : s0[1] > s1[1]) pts = pts.reverse()
    return { pts, minX: Math.min(...xs), span }
  })
const fullWidth = maxX - minX
prepared.sort((a, b) => {
  const fa = a.span > fullWidth * 0.55 ? 1 : 0, fb = b.span > fullWidth * 0.55 ? 1 : 0
  return fa - fb || a.minX - b.minX
})

const pad = thickness * 2
const vb = [minX - pad, minY - pad, fullWidth + pad * 2, maxY - minY + pad * 2].map(f)
const sw = f(thickness * 0.9)
const paths = prepared.map((s) => `  <path d="${toPath(s.pts)}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`)
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}">\n${paths.join('\n')}\n</svg>\n`
fs.writeFileSync(output, svg)
const ts = `// Сгенерировано scripts/trace-signature.mjs из ${input}. Не редактировать вручную.
import type { SignatureShape } from './signature'

export const DEFAULT_SIGNATURE: SignatureShape = ${JSON.stringify({ viewBox: vb.join(' '), paths: prepared.map((st) => ({ d: toPath(st.pts), filled: false, strokeWidth: sw })) }, null, 2)}
`
fs.writeFileSync('src/lib/signature-default.ts', ts)
console.log(`Готово: ${output}. Штрихов: ${prepared.length}, толщина ${sw}, область ${vb.join(' ')}`)
