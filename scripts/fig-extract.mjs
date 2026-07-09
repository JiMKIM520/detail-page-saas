/**
 * .fig 로컬 디코더 — Figma API 없이 fig-kiwi 파일에서 프레임 구조 JSON 추출.
 * 사용: 1) unzip <파일>.fig에서 canvas.fig 추출  2) node scripts/fig-extract.mjs <canvas.fig> <출력디렉터리>
 * 의존성: npm i -D kiwi-schema (zstd는 node:zlib 내장). 포맷: 8B 'fig-kiwi' + u32 버전 + [u32 길이+청크]*
 *   chunk0=스키마(deflate-raw), chunk1=데이터(zstd). Sprint 8에서 1420종(2.9GB) 검증 완료.
 */
import fs from 'node:fs'
import zlib from 'node:zlib'
import * as kiwi from 'kiwi-schema'

const buf = fs.readFileSync(process.argv[2] ?? 'canvas.fig')
let off = 12
const chunks = []
while (off < buf.length) { const s = buf.readUInt32LE(off); off += 4; chunks.push(buf.subarray(off, off + s)); off += s }
const schema = kiwi.compileSchema(kiwi.decodeBinarySchema(zlib.inflateRawSync(chunks[0])))
const msg = schema.decodeMessage(zlib.zstdDecompressSync(chunks[1]))
const nodes = msg.nodeChanges

const gid = (g) => g.sessionID + ':' + g.localID
const byId = new Map(nodes.map((n) => [gid(n.guid), n]))
const children = new Map()
for (const n of nodes) {
  if (!n.parentIndex) continue
  const p = gid(n.parentIndex.guid)
  if (!children.has(p)) children.set(p, [])
  children.get(p).push(n)
}
for (const arr of children.values()) arr.sort((a, b) => String(a.parentIndex.position).localeCompare(String(b.parentIndex.position)))

const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
function fillOf(n) {
  const p = (n.fillPaints ?? []).find((x) => x.visible !== false)
  if (!p) return undefined
  if (p.type === 'SOLID') return hex(p.color) + (p.opacity != null && p.opacity < 1 ? '@' + p.opacity.toFixed(2) : '')
  if (p.type === 'IMAGE') return 'IMG'
  if (String(p.type).includes('GRADIENT')) return 'GRADIENT'
  return p.type
}

function serialize(n, px, py, depth, out, budget) {
  if (out.length >= budget.max) { budget.truncated = true; return }
  const x = Math.round(px + (n.transform?.m02 ?? 0))
  const y = Math.round(py + (n.transform?.m12 ?? 0))
  const w = Math.round(n.size?.x ?? 0)
  const h = Math.round(n.size?.y ?? 0)
  const e = { t: n.type, n: n.name?.slice(0, 40), x, y, w, h, d: depth }
  const f = fillOf(n)
  if (f) e.fill = f
  const cr = n.cornerRadius ?? n.rectangleTopLeftCornerRadius
  if (cr) e.r = Math.round(cr)
  if (n.type === 'TEXT') {
    e.chars = (n.textData?.characters ?? '').slice(0, 120)
    e.fs = n.fontSize
    e.font = n.fontName?.family
    e.fw = n.fontName?.style
    if (n.textAlignHorizontal && n.textAlignHorizontal !== 'LEFT') e.align = n.textAlignHorizontal
  }
  if (n.visible === false) e.hidden = true
  out.push(e)
  for (const c of children.get(gid(n.guid)) ?? []) serialize(c, x, y, depth + 1, out, budget)
}

const canvasIds = new Set(nodes.filter((n) => n.type === 'CANVAS').map((n) => gid(n.guid)))
const tops = nodes.filter((n) => (n.type === 'FRAME' || n.type === 'SYMBOL') && n.parentIndex && canvasIds.has(gid(n.parentIndex.guid)) && n.visible !== false)
fs.mkdirSync(process.argv[3] ?? 'frames', { recursive: true })
const index = []
tops.forEach((top, i) => {
  const out = []
  const budget = { max: 450, truncated: false }
  serialize(top, 0, 0, 0, out, budget)
  const texts = out.filter((e) => e.t === 'TEXT').length
  const imgs = out.filter((e) => e.fill === 'IMG').length
  const safe = (top.name ?? 'frame').replace(/[^가-힣a-zA-Z0-9_-]/g, '_').slice(0, 40)
  const file = String(i).padStart(3, '0') + '_' + safe + '.json'
  fs.writeFileSync(((process.argv[3] ?? 'frames') + '/') + file, JSON.stringify({ name: top.name, w: Math.round(top.size?.x ?? 0), h: Math.round(top.size?.y ?? 0), truncated: budget.truncated, nodes: out }, null, 0))
  index.push({ file, name: top.name, w: Math.round(top.size?.x ?? 0), h: Math.round(top.size?.y ?? 0), nodeCount: out.length, texts, imgs, truncated: budget.truncated })
})
fs.writeFileSync(((process.argv[3] ?? 'frames') + '/_index.json'), JSON.stringify(index, null, 1))
console.log('추출 완료 —', tops.length, '프레임 → frames/*.json')
const big = index.filter((e) => e.truncated).length
console.log('절단(450노드+):', big, '| 평균 노드:', Math.round(index.reduce((s, e) => s + e.nodeCount, 0) / index.length))
