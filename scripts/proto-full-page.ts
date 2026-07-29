/**
 * 전체 페이지 자유 설계 프로토타입 (Phase 3 실험 — 파이프라인 비침습)
 * 동원 청사진(7씬)을 씬 단위로 자유 HTML/CSS 설계 — 스타일 언어 A/B 각 1벌.
 * 실행: npx tsx --env-file=.env.local scripts/proto-full-page.ts A  (또는 B)
 */
import { anthropicClient, extractText, MODELS } from '../agents/utils'
import { createServiceClient } from '../lib/supabase/service'
import { getStyleLanguage } from '../agents/templates/blocks/style-languages'
import { FONT_WHITELIST } from '../agents/templates/blocks/shared'
import * as fs from 'fs'


const STYLE_BIBLES: Record<string, string> = {
  A: `STYLE LANGUAGE "EDITORIAL SPLIT" — apply consistently to EVERY scene:
- Light editorial base; large LEFT-ALIGNED display type; generous asymmetric whitespace.
- Images bleed to one edge or sit in soft arch/rounded masks; type may overlap image edges.
- Oversized outline latin word (product-related: TUNA, STICK, FRESH…) as background graphic — max 1 per scene, low contrast.
- Lists as hairline-ruled editorial rows (numbered 01/02…), NEVER uniform rounded cards.
- Accent color used surgically: one highlight sweep, thin rules, small pills.`,
  B: `STYLE LANGUAGE "TYPE-AS-GRAPHIC" — apply consistently to EVERY scene:
- Bold zone splits (dark panel vs light panel, diagonal cuts allowed) — the layout IS the graphic.
- Headline typography as the hero element: oversized, mixed fill/outline, partial accent coloring, & symbols.
- Circular badges (stat/claim) overlapping image corners; zigzag/staggered list rhythm with dot markers.
- Images in strong geometric frames (arch, circle, offset rectangle) with hard shadows or borders.
- High tonal drama between scenes: alternate dark and light zones decisively.`,
}

const SYSTEM_BASE = `You are a senior Korean e-commerce art director DESIGNING one scene (scroll unit)
of a long vertical detail page from scratch. Not a template — a bespoke composition for THIS content.

HARD CONSTRAINTS:
- Output exactly ONE <style> tag + ONE <section class="{NS}"> — nothing else, no markdown fences.
- Every selector MUST be prefixed .{NS} (scene namespace).
- Width 872px fixed. Scene height 1600~2400px (this is scene {N} of 7 in one page).
- Colors/fonts ONLY via: var(--bg) var(--paper) var(--ink) var(--ink-2) var(--brand) var(--accent)
  var(--font-display) var(--font-body) var(--font-serif). Tints via color-mix() allowed.
- Use the provided images meaningfully (object-fit ok, creative crop/mask ok, no distortion,
  never repeat one image twice). If an image does not fit the copy, omit it rather than force it.
- Copy: refine the provided copyBrief into final Korean copy — NEVER invent facts, numbers,
  certifications not present in the briefs. Emphasis via color/weight, not emoji.
- OVERLAP SAFETY (CRITICAL): text must NEVER collide with other text. Any text over an image
  needs a guaranteed-contrast zone (scrim/panel/solid area). Check your layout mentally at 872px.
- TONE: this scene must be {TONE} (page rhythm alternates; previous scene was {PREV_TONE}).
- Flow: the scene must read top→bottom naturally; no dead empty bands over 200px.`

async function main(): Promise<void> {
  // 사용법: proto-full-page.ts <projectId> <styleLanguageId> <label>
  const PROJECT = process.argv[2]
  const styleId = process.argv[3]
  const styleKey = process.argv[4] ?? styleId
  if (!PROJECT || !styleId) throw new Error('사용법: <projectId> <styleLanguageId> <label>')
  const lang = getStyleLanguage(styleId)
  const bible = lang?.bible ?? STYLE_BIBLES[styleId.toUpperCase()]
  if (!bible) throw new Error('알 수 없는 스타일: ' + styleId)

  const svc = createServiceClient()
  const load = async (name: string): Promise<Record<string, unknown>> => {
    const { data } = await svc.storage.from('designs').download(`projects/${PROJECT}/planning/${name}`)
    if (!data) throw new Error(`${name} 없음`)
    return JSON.parse(await data.text())
  }
  const bp = (await load('blueprint.json')) as { sections: Array<{ scene?: number; variantId: string; copyBrief: string; imageUrls: string[]; imageNeeds?: Array<{ id: string; subject: string; withProduct: boolean }> }> }
  const sg = (await load('style-guide.json')) as Record<string, never>

  // 씬별 그룹핑 + 이미지 URL 구성(imageUrls 우선, 없으면 imageNeeds id → styling_real 퍼블릭 URL)
  const { data: shotFiles } = await svc.storage.from('designs').list(`projects/${PROJECT}/styling_real`, { limit: 100 })
  const shotSet = new Set((shotFiles ?? []).map((f) => f.name))
  const pub = (p: string): string => svc.storage.from('designs').getPublicUrl(p).data.publicUrl
  const scenes = new Map<number, { briefs: string[]; images: string[] }>()
  for (const s of bp.sections) {
    const n = s.scene ?? 1
    const g = scenes.get(n) ?? { briefs: [], images: [] }
    g.briefs.push(s.copyBrief)
    for (const u of s.imageUrls ?? []) if (!g.images.includes(u)) g.images.push(u)
    for (const need of s.imageNeeds ?? []) {
      const f = `${need.id}.png`
      if (shotSet.has(f)) { const u = pub(`projects/${PROJECT}/styling_real/${f}`); if (!g.images.includes(u)) g.images.push(u) }
    }
    scenes.set(n, g)
  }

  // 씬 톤 계획 — 교차 리듬(§3.2 준수: 다크 1~3, 3연속 동일 금지)
  const TONES: Record<number, string> = { 1: 'dark', 2: 'light', 3: 'light', 4: 'dark', 5: 'light', 6: 'light', 7: 'dark' }

  const parts: string[] = []
  for (let n = 1; n <= 7; n++) {
    const g = scenes.get(n)
    if (!g) continue
    const ns = `sd${styleKey.toLowerCase()}${n}`
    const system = SYSTEM_BASE.replaceAll('{NS}', ns).replace('{N}', String(n)).replace('{TONE}', TONES[n]).replace('{PREV_TONE}', TONES[n - 1] ?? '(first scene)') + '\n\n' + bible
    const user = `제품: ${(sg as any).brand?.name ?? PROJECT} (브랜드 무드: ${((sg as any).brand?.moodKeywords ?? []).join(', ')})
SCENE ${n}/7 콘텐츠(각 항목은 이 씬이 다뤄야 할 승인된 내용 요지):
${g.briefs.map((b, i) => `${i + 1}. ${b}`).join('\n')}

사용 가능 이미지(이 씬 전용, 반복 금지):
${g.images.slice(0, 5).map((u, i) => `[img${i}] ${u}`).join('\n') || '(없음 — 타이포·그래픽 중심으로 설계)'}

Output the final <style> + <section class="${ns}"> now.`

    console.log(`[full-${styleKey}] 씬 ${n}/7 생성…`)
    const msg = await anthropicClient.messages.create({
      model: MODELS.CLAUDE_OPUS, max_tokens: 9000, system, messages: [{ role: 'user', content: user }],
    })
    parts.push(extractText(msg.content).replace(/^```html?\n?|```$/g, '').trim())
  }

  const gfParams: string[] = []
  for (const f of [(sg as any).typography?.headlineFont, (sg as any).typography?.storyFont]) {
    if (!f) continue
    const entry = FONT_WHITELIST[String(f).toLowerCase()]
    if (entry?.gf) gfParams.push('family=' + entry.gf)
    else gfParams.push('family=' + String(f).trim().replace(/ /g, '+') + ':wght@400;700')
  }
  const fontLinks = gfParams.length ? `<link href="https://fonts.googleapis.com/css2?${gfParams.join('&')}&display=swap" rel="stylesheet">` : ''
  const colors = (sg as Record<string, Record<string, string>>).colors
  const typo = (sg as Record<string, Record<string, string>>).typography
  const doc = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=872">
${fontLinks}
<style>:root{--bg:${colors.surface1};--paper:#ffffff;--ink:${colors.textDark};--ink-2:${colors.textDark}CC;--brand:${colors.primary};--accent:${colors.accent};--font-display:'${typo.headlineFont}',sans-serif;--font-body:'Pretendard Variable',Pretendard,-apple-system,sans-serif;--font-serif:'${typo.storyFont}',serif}
body{margin:0;width:872px;font-family:var(--font-body)}</style></head><body>
${parts.join('\n')}
</body></html>`
  fs.writeFileSync(`/tmp/full-proto-${styleKey}.html`, doc)
  console.log(`[full-${styleKey}] 완료 — /tmp/full-proto-${styleKey}.html (씬 ${parts.length}개)`)
}

main().catch((e) => { console.error('실패:', e.message); process.exit(1) })
