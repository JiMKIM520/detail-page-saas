/** 주어진 변형 id들을 JSON Schema 기반 샘플 데이터로 렌더(크래시 테스트 + 시각검증용 HTML).
 *  사용: tsx scripts/preview-all.ts <ids.json> <outDir> [imgUrl]  */
import { writeFileSync, readFileSync } from 'node:fs'
import { z } from 'zod'
import { getVariant, renderPage, deriveTokens } from '../agents/templates/blocks'

const idsFile = process.argv[2]
const OUT = process.argv[3]
const IMG = process.argv[4] || 'http://localhost:8899/heroimg.png'
const ids: string[] = JSON.parse(readFileSync(idsFile, 'utf8'))
const tokens = deriveTokens('cobalt-premium', undefined, { tintBackground: false })

// 이미지 URL 슬롯만 정확히 매칭(텍스트 필드 logo/emoji/brand 등 오탐 방지).
const isImageKey = (k: string): boolean =>
  /(image|photo|thumbnail|thumb|avatar|picture|cover|wreath|leaf|ornament|illust|sticker|graphic|mockup|device)/i.test(k) ||
  ['img', 'bg', 'banner', 'visual', 'heroimage', 'tl', 'tr', 'bl', 'br'].includes(k.toLowerCase())

function sample(node: any, key = '', idx = 0): any {
  if (!node || typeof node !== 'object') return '샘플'
  if (node.enum && Array.isArray(node.enum)) return node.enum[idx % node.enum.length]
  if (node.anyOf) return sample(node.anyOf.find((x: any) => x && x.type !== 'null') || node.anyOf[0], key)
  if (node.oneOf) return sample(node.oneOf[0], key)
  const t = node.type
  if (t === 'object' || node.properties) {
    const o: Record<string, any> = {}
    const props = node.properties || {}
    for (const k of Object.keys(props)) o[k] = sample(props[k], k, idx)
    return o
  }
  if (t === 'array') {
    let n = Math.min(node.maxItems ?? 4, 5)
    n = Math.max(n, node.minItems ?? 1) || 4
    return Array.from({ length: n }, (_, i) => sample(node.items || {}, key, i))
  }
  if (t === 'boolean') return false
  if (t === 'integer' || t === 'number') {
    const min = node.minimum ?? 1
    const max = node.maximum ?? 5
    return Math.min(Math.max(3, min), max)
  }
  // string
  if (typeof node.maxLength === 'number' && node.maxLength <= 3) return String((idx % 9) + 1)
  if (/emoji/i.test(key)) return ['😊', '😍', '🤩', '😄', '🥰'][idx % 5]
  if (isImageKey(key)) return IMG
  if (/title|headline|name|heading|question|^q$/i.test(key)) return idx ? `핵심 가치를 전하는 제목 ${idx + 1}` : '핵심 가치를 전하는 제목'
  if (/desc|text|lead|quote|closer|answer|body|sub|^a$/i.test(key)) return '제품의 특징과 장점을 설명하는 문장입니다.'
  if (/unit/i.test(key)) return '%'
  if (/label|tag|eyebrow|kicker|brand|badge|pill|caption|cta|when/i.test(key)) return idx ? `라벨 ${idx + 1}` : '라벨'
  if (/value|score|rate|percent|amount|price/i.test(key)) return ['1,200', '4.9', '98', '50'][idx % 4]
  return '샘플 텍스트'
}

const results: Array<{ id: string; ok: boolean; error?: string }> = []
for (const id of ids) {
  try {
    const v = getVariant(id)
    if (!v) { results.push({ id, ok: false, error: 'not registered' }); continue }
    const js = z.toJSONSchema(v.schema as any)
    const data = sample(js)
    const { html } = renderPage({ meta: { product: '테스트 제품', category: '반려동물', styleDirection: 'premium' }, tokens, blocks: [{ variantId: id, data }] })
    writeFileSync(`${OUT}/preview-${id}.html`, html)
    results.push({ id, ok: true })
  } catch (e) {
    results.push({ id, ok: false, error: (e as Error).message?.slice(0, 200) })
  }
}
writeFileSync(`${OUT}/_render-results.json`, JSON.stringify(results, null, 2))
const fail = results.filter((r) => !r.ok)
console.log(`렌더 ${results.length}개 — 성공 ${results.length - fail.length} / 실패 ${fail.length}`)
fail.forEach((f) => console.log(`  ✗ ${f.id}: ${f.error}`))
