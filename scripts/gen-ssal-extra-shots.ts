/**
 * 소금빵 추가 스타일링샷 생성 (디자인 검토 P0/P1 반영):
 *  - cross_section: 소금빵 단면(속살 결+버터층) — 겉바속촉을 시각으로 증명
 *  - plated_morning: 커피와 함께 플레이팅(라이프스타일·따뜻함, 레이아웃 변화용)
 * 누끼 4장을 레퍼런스로 제품 일관성 유지. Gemini Pro, 3:4. styling_real/ 업로드.
 * 사용: env -u ANTHROPIC_API_KEY node_modules/.bin/tsx --env-file=.env.local scripts/gen-ssal-extra-shots.ts
 */
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'
import { generateDesignImage } from '../lib/ai/gemini-image'

const PID = 'c0ff7994-4c13-4bbf-9ddd-d621bcfd5096'
const BUCKET = 'designs'
const NUKKI_DIR = '/Users/jinman/Desktop/Projects/products/detail-page-saas/public/salt-bread'

const SHOTS = [
  {
    filename: 'cross_section.png',
    name: '단면컷',
    prompt: `Premium Korean e-commerce food photography. A freshly baked Korean 소금빵 (salt bread roll) TORN OPEN to reveal the interior — show the airy, glossy, layered crumb with visible buttery sheen and soft pull-apart strands, a small pat of golden butter melting on the torn surface. The golden-brown exterior is dusted with coarse sea salt crystals.
[SETTING] Dark charcoal slate surface, soft directional window light from the left, gentle steam, scattered crumbs and a few salt flakes. Shallow depth of field (f/2.8), 100mm macro feel.
[OUTPUT SPECS] 3:4 vertical. Appetizing, artisanal, magazine-quality. Warm amber tones (#A8682E accent mood).
[NEGATIVE] NO text, NO letters, NO numbers, NO watermark, NO hands, NO plates with logos. Photorealistic only.`,
  },
  {
    filename: 'plated_morning.png',
    name: '플레이팅',
    prompt: `Premium lifestyle food photography for a Korean bakery brand. A golden 소금빵 (salt bread roll with coarse sea salt on top) resting on a small matte ceramic plate, beside a cup of black coffee. Warm morning light, a linen napkin, on a dark moody wooden table.
[SETTING] Cozy artisanal breakfast scene, soft natural light, shallow depth of field, gentle shadows.
[OUTPUT SPECS] 3:4 vertical. Inviting, warm, premium editorial mood. Amber/cream palette.
[NEGATIVE] NO text, NO letters, NO watermark, NO hands, NO brand logos. Photorealistic only.`,
  },
]

async function main(): Promise<void> {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  // 누끼 레퍼런스
  const nukki = ['cutout-01.png','cutout-02.png','cutout-03.png','cutout-04.png']
    .map(f => `${NUKKI_DIR}/${f}`).filter(p => fs.existsSync(p))
  const nukkiB64 = nukki.map(p => fs.readFileSync(p).toString('base64'))
  console.log(`누끼 레퍼런스 ${nukkiB64.length}장`)

  for (const shot of SHOTS) {
    console.log(`\n▶ ${shot.name} (${shot.filename}) 생성...`)
    const t = Date.now()
    try {
      const buf = await generateDesignImage({ prompt: shot.prompt, referenceImages: nukkiB64, aspectRatio: '3:4', model: 'pro' })
      const path = `projects/${PID}/styling_real/${shot.filename}`
      const { error } = await s.storage.from(BUCKET).upload(path, buf, { contentType: 'image/png', upsert: true })
      if (error) throw new Error(error.message)
      const { data } = s.storage.from(BUCKET).getPublicUrl(path)
      console.log(`  ✅ ${(Date.now()-t)/1000}s, ${Math.round(buf.length/1024)}KB → ${data.publicUrl}`)
    } catch (e) {
      console.log(`  ❌ ${(e as Error).message.slice(0,200)}`)
    }
  }
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1) })
