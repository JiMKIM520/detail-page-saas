/**
 * 증명용 — 식품 슬롯 템플릿에 넣을 신규 제품 2종 스타일링샷 생성(Gemini Pro).
 * 그래놀라(단맛/아침) + 황태채(짭짤/건어물) — 전혀 다른 식품으로 템플릿 일반화 증명.
 * 사용: env -u ANTHROPIC_API_KEY node_modules/.bin/tsx --env-file=.env.local scripts/gen-proof-shots.ts
 */
import { createClient } from '@supabase/supabase-js'
import { generateDesignImage } from '../lib/ai/gemini-image'

const BUCKET = 'designs'
const NEG = '[NEGATIVE] NO text, NO letters, NO Korean characters, NO watermark, NO hands, NO brand logos. Photorealistic only, premium Korean e-commerce food photography, 3:4 vertical.'

const SHOTS = [
  // 그래놀라
  { key: 'granola', file: 'hero.png', prompt: `A premium bowl of handmade granola clusters with oats, almonds, pumpkin seeds, dried cranberries, drizzled honey, served with creamy yogurt, on a warm wooden table, soft morning window light, shallow depth of field. ${NEG}` },
  { key: 'granola', file: 'sensory.png', prompt: `Extreme macro close-up of crunchy granola clusters — toasted oats, whole almonds, golden honey glaze, dried fruit, scattered, dramatic side light on dark slate. ${NEG}` },
  { key: 'granola', file: 'life.png', prompt: `Lifestyle breakfast scene: a glass jar of granola, a ceramic bowl with granola and milk, a wooden spoon, linen napkin, warm cozy morning light on a wooden table. ${NEG}` },
  // 황태채
  { key: 'hwangtae', file: 'hero.png', prompt: `Premium Korean dried pollack shreds (hwangtae-chae), pale golden fluffy fibers piled in a rustic ceramic bowl, on a warm wooden table, soft natural light, shallow depth of field, appetizing. ${NEG}` },
  { key: 'hwangtae', file: 'sensory.png', prompt: `Extreme macro close-up of dried pollack (hwangtae) texture — soft golden fibers, natural strands, dramatic warm side light on dark slate surface. ${NEG}` },
  { key: 'hwangtae', file: 'life.png', prompt: `Korean home table scene: a bowl of hot hwangtae-guk (dried pollack soup) with green onion and egg, a small dish of seasoned dried pollack, rustic Korean tableware, warm light. ${NEG}` },
]

async function main(): Promise<void> {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  for (const shot of SHOTS) {
    const t = Date.now()
    try {
      const buf = await generateDesignImage({ prompt: shot.prompt, referenceImages: [], aspectRatio: '3:4', model: 'pro' })
      const path = `proof/${shot.key}/${shot.file}`
      const { error } = await s.storage.from(BUCKET).upload(path, buf, { contentType: 'image/png', upsert: true })
      if (error) throw new Error(error.message)
      const { data } = s.storage.from(BUCKET).getPublicUrl(path)
      console.log(`✅ ${shot.key}/${shot.file} (${((Date.now() - t) / 1000).toFixed(0)}s) ${data.publicUrl}`)
    } catch (e) {
      console.log(`❌ ${shot.key}/${shot.file}: ${(e as Error).message.slice(0, 160)}`)
    }
  }
  console.log('DONE')
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1) })
