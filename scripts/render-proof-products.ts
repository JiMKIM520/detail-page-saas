/**
 * 증명 — 에이전트가 생성한 슬롯 카피(granola.json/hwangtae.json)를 식품 템플릿에 넣어 렌더.
 * 이미지는 Gemini 크레딧 소진으로 플레이스홀더(브랜드 그라데이션). 레이아웃+에이전트 카피 조합 증명용.
 * 사용: env -u ANTHROPIC_API_KEY node_modules/.bin/tsx scripts/render-proof-products.ts
 */
import fs from 'fs'
import { renderFoodDetail, type FoodDetailData } from './food-template'

const PRODUCTS = [
  { key: 'granola', tokens: { primary: '#6B4E2E', accent: '#C97B3A', cream: '#F7F1E6', ink: '#241C14' } },
  { key: 'hwangtae', tokens: { primary: '#3E5060', accent: '#C0392B', cream: '#F2F4F5', ink: '#1C2128' } },
]

for (const p of PRODUCTS) {
  const copy = JSON.parse(fs.readFileSync(`/tmp/food-proof/${p.key}.json`, 'utf8'))
  const data: FoodDetailData = {
    ...copy,
    tokens: p.tokens,
    images: { hero: '', sensory: '', howToEat: [], lineup: [] }, // 크레딧 소진 → 플레이스홀더
  }
  fs.writeFileSync(`/tmp/food-proof/${p.key}.html`, renderFoodDetail(data))
  console.log(`✅ /tmp/food-proof/${p.key}.html (${copy.brand} ${copy.product})`)
}
