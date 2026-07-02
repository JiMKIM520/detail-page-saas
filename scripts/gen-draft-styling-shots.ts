/** 4개 테스트 프로젝트의 스타일링샷(연출컷) 생성 — 누끼/제품컷을 레퍼런스로 Gemini 합성.
 *  파이프라인 표준 경로(buildShotPrompt + generateDesignImage)를 사용, designs(public) 버킷 업로드.
 *  실행: env -u ANTHROPIC_API_KEY node_modules/.bin/tsx --env-file=.env.local scripts/gen-draft-styling-shots.ts */
import { createClient } from '@supabase/supabase-js'
import { buildShotPrompt } from '../agents/styling-shots'
import { generateDesignImage } from '../lib/ai/gemini-image'
import type { StylingShot } from '../agents/types'

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
})

/** 카테고리별 3컷 — composition/surface/props/lighting/camera/mood */
const SHOTS_BY_COMPANY: Record<string, StylingShot[]> = {
  '코코댕': [
    { name: '홈 라이프스타일', filename: 'lifestyle-home.png', composition: 'product resting on a linen cloth on a warm wooden floor, a fluffy small dog paw gently reaching toward it from the side', surface: 'warm oak wood floor with soft beige linen', props: ['soft beige linen cloth', 'small ceramic dog bowl in blurred background'], lighting: 'soft morning window light from the left', camera: '45-degree angle, shallow depth of field', mood: 'cozy, tender, everyday home moment with a beloved pet' },
    { name: '급여 장면', filename: 'feeding-hand.png', composition: 'a human hand holding the snack stick toward camera, blurred cozy living room behind', surface: 'blurred warm living room', props: ['knitted blanket edge in background'], lighting: 'natural afternoon light', camera: 'eye-level close shot, product in sharp focus', mood: 'caring, warm, trust between owner and pet' },
    { name: '텍스처 클로즈업', filename: 'texture-close.png', composition: 'the snack placed on a small wooden board, extreme close-up showing surface texture', surface: 'small round wooden serving board', props: ['scattered coconut flakes'], lighting: 'soft diffused daylight', camera: 'macro close-up, top-down 30 degrees', mood: 'natural, wholesome, appetizing' },
  ],
  '대관령 황태이야기': [
    { name: '아침 식탁', filename: 'breakfast-table.png', composition: 'stick sachet leaning against a white bowl of warm soup on a neat breakfast table', surface: 'light gray stone table', props: ['white ceramic bowl with steam', 'linen napkin', 'wooden spoon'], lighting: 'bright clean morning light', camera: '45-degree angle, medium shot', mood: 'healthy, honest, clean start of the day' },
    { name: '과립 텍스처', filename: 'granule-texture.png', composition: 'granules poured out from the sachet onto a ceramic dish, close-up on texture', surface: 'matte white ceramic dish on stone', props: ['scattered granules trail'], lighting: 'soft side window light', camera: 'macro, shallow depth', mood: 'pure, artisanal, appetizing umami' },
    { name: '밥 위 토핑', filename: 'topping-rice.png', composition: 'granules being sprinkled from the sachet over a bowl of steaming white rice, hand holding the sachet mid-pour', surface: 'warm wooden dining table', props: ['bowl of steaming white rice', 'wooden chopsticks resting'], lighting: 'soft warm daylight', camera: '45-degree close shot on the bowl', mood: 'homely, savory, effortless daily protein' },
  ],
  '주식회사 럽앤다이브': [
    { name: '핸드 어플라이', filename: 'hand-apply.png', composition: 'elegant hands applying cream, the tube held in one hand, summer light across skin', surface: 'soft-focus bright interior', props: ['thin gold ring on finger'], lighting: 'airy bright summer window light', camera: 'close-up on hands, tube label readable', mood: 'fresh, elegant, sensorial summer skincare' },
    { name: '욕실 미니멀 선반', filename: 'bath-shelf.png', composition: 'tube standing on a minimal stone shelf with a small green stem in a glass vase', surface: 'travertine stone shelf', props: ['glass bud vase with single green stem', 'folded white towel edge'], lighting: 'diffused bright bathroom light', camera: 'straight-on eye level, generous negative space', mood: 'clean, editorial, quiet luxury' },
    { name: '여름 창가 무드', filename: 'summer-window.png', composition: 'tube lying on a linen sheet with sharp summer shadow patterns of leaves across it', surface: 'white-beige linen fabric', props: ['soft leaf shadows'], lighting: 'hard directional summer sunlight creating leaf shadows', camera: 'top-down flat lay', mood: 'breezy, aromatic, seasonal editorial' },
  ],
  '모모스커피': [
    { name: '브루잉 장면', filename: 'brewing.png', composition: 'coffee bag standing beside a pour-over dripper mid-brew, steam and bloom visible', surface: 'dark walnut cafe counter', props: ['glass dripper and server', 'gooseneck kettle partially visible'], lighting: 'warm cafe window light', camera: '45-degree medium shot, bag label visible', mood: 'craft, specialty coffee ritual, artisan pride' },
    { name: '원두 클로즈업', filename: 'beans-close.png', composition: 'roasted beans spilling from the open bag onto the counter, bag in soft focus behind', surface: 'warm walnut wood', props: ['scattered glossy roasted beans'], lighting: 'low warm side light emphasizing bean sheen', camera: 'macro close-up', mood: 'rich, aromatic, premium roast' },
    { name: '카페 테이블 무드', filename: 'cafe-table.png', composition: 'coffee bag beside a filled ceramic cup on a small cafe table, morning scene', surface: 'round marble cafe table', props: ['ceramic cup with fresh coffee', 'folded newspaper edge'], lighting: 'gentle morning light through cafe window', camera: 'eye level, relaxed composition', mood: 'busan specialty cafe morning, inviting' },
  ],
}

const CATEGORY_META: Record<string, string> = {
  '코코댕': 'food', '대관령 황태이야기': 'food', '주식회사 럽앤다이브': 'beauty', '모모스커피': 'food',
}

void (async () => {
  const { data: projs } = await s.from('projects').select('id,company_name,category').order('created_at')
  for (const p of projs ?? []) {
    const norm = (x: string) => x.replace(/\s+/g, '')
    const key = Object.keys(SHOTS_BY_COMPANY).find((k) => norm(k) === norm(p.company_name))
    const shots = key ? SHOTS_BY_COMPANY[key] : undefined
    if (!shots) continue
    const { data: files } = await s.from('intake_files').select('*').eq('project_id', p.id).eq('file_type', 'product_photo')
    const refs: string[] = []
    for (const f of (files ?? []).slice(0, 2)) {
      const { data } = await s.storage.from('intake-files').download(f.storage_path)
      if (data) refs.push(Buffer.from(await data.arrayBuffer()).toString('base64'))
    }
    if (!refs.length) { console.log(`✗ ${p.company_name}: 레퍼런스 없음`); continue }
    const { data: existing } = await s.storage.from('designs').list(`drafts-styling/${p.id}`)
    const have = new Set((existing ?? []).map((f) => f.name))
    console.log(`\n── ${p.company_name}: 레퍼런스 ${refs.length}장, ${shots.length}컷 생성`)
    for (const shot of shots) {
      if (have.has(shot.filename)) { console.log(`  ↷ ${shot.name} — 존재, 스킵`); continue }
      const t = Date.now()
      try {
        const prompt = buildShotPrompt(shot, [], { category: CATEGORY_META[key!], aspectRatio: '3:4' })
        const buf = await generateDesignImage({ prompt, referenceImages: refs, aspectRatio: '3:4', model: 'pro' })
        const path = `drafts-styling/${p.id}/${shot.filename}`
        const { error } = await s.storage.from('designs').upload(path, buf, { contentType: 'image/png', upsert: true })
        if (error) throw new Error(error.message)
        const { data: pub } = s.storage.from('designs').getPublicUrl(path)
        console.log(`  ✓ ${shot.name} (${Math.round((Date.now() - t) / 1000)}s) → ${pub.publicUrl.slice(0, 90)}…`)
      } catch (e) {
        console.log(`  ✗ ${shot.name}: ${(e as Error).message.slice(0, 140)}`)
      }
    }
  }
  console.log('\n완료')
})()
