/**
 * 소금빵 페이지를 따뜻한 템플릿 팔레트(sand-luxury)로 재렌더.
 * 기존 컴포저 결과(page-spec.json)의 블록·카피·이미지는 그대로, 토큰만 교체(API 호출 없음).
 * 실행: node_modules/.bin/tsx scripts/blocks-saltbread-rerender.ts → /tmp/spike/sb2/page-warm.html
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { renderPage, sandLuxury, type PageSpec } from '../agents/templates/blocks/index'

const spec = JSON.parse(readFileSync('/tmp/spike/sb2/page-spec.json', 'utf8')) as PageSpec
const warm: PageSpec = { ...spec, tokens: sandLuxury }
const out = renderPage(warm)
writeFileSync('/tmp/spike/sb2/page-warm.html', out.html)
console.log('blocks:', out.usedVariants.length, '/ accent:', sandLuxury.accent, '/ len:', out.html.length)
console.log('→ /tmp/spike/sb2/page-warm.html')
