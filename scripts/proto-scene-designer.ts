/**
 * 씬 디자이너 프로토타입 (검증용 — 파이프라인 비침습, design-system.md Phase 3 실험)
 * 가설: 인상 결정 씬(히어로)을 블록 조합이 아니라 콘텐츠 맞춤 자유 HTML/CSS로 설계하면
 * "템플릿 조립" 천장을 넘는가. Claude Design의 공개 방법론(디자인 플랜 → 셀프 크리틱 →
 * 코드 2패스)을 재현하되, 우리 통제(토큰 강제·네임스페이스·872px 규격)를 얹는다.
 * 실행: npx tsx --env-file=.env.local scripts/proto-scene-designer.ts
 */
import { anthropicClient, extractText, MODELS } from '../agents/utils'
import { createServiceClient } from '../lib/supabase/service'
import * as fs from 'fs'

const PROJECT = 'ba59d5e1-99a4-43b5-9780-944f767a4988' // 동원

const SYSTEM = `You are a senior Korean e-commerce art director who DESIGNS layouts from scratch —
you are NOT assembling templates. You produce one <section> of production-quality HTML+CSS.

METHOD (2-pass, do both internally, output only the final code):
PASS 1 — DESIGN PLAN: decide a composition concept specific to THIS product and copy: spatial
structure (asymmetry? overlap? diagonal flow? oversized type? image bleeding?), scale contrast,
where the eye lands 1st/2nd/3rd. Reject your first idea if it looks like a generic AI layout
(centered headline + uniform rounded cards + evenly spaced checklist = BANNED as a default).
PASS 2 — SELF-CRITIQUE then FINAL CODE: check the plan against the constraints, then write it.

HARD CONSTRAINTS:
- Output exactly ONE <style> tag + ONE <section class="sdx"> — nothing else, no markdown fences.
- All selectors MUST be prefixed .sdx (namespace isolation).
- Page width 872px fixed. Section height 1400~1900px (a hero scene of a long vertical page).
- Use ONLY these CSS custom properties for color/font (they are provided at runtime):
  var(--bg) var(--paper) var(--ink) var(--ink-2) var(--brand) var(--accent)
  var(--font-display) var(--font-body) var(--font-serif)
  You may derive tints via color-mix(in srgb, var(--brand) N%, white/black/transparent).
- The provided <img> URL must appear as the dominant visual (object-fit allowed, creative
  cropping/masking encouraged — but no distortion).
- Korean copy provided must be used verbatim (you may split lines with <br>). No new claims.
- No external assets, no webfont imports (font vars resolve at runtime), no JS.
- Type quality: display sizes 56~92px for the main line, clear hierarchy, letter-spacing tuned.
- Composition quality bar: at least TWO of — layered overlap (image under/over type), oversized
  typographic element as graphic, asymmetric grid, diagonal/rotated accent, generous dramatic
  whitespace. It must NOT read as a template.`

async function main(): Promise<void> {
  const svc = createServiceClient()
  const { data: sgBlob } = await svc.storage.from('designs').download(`projects/${PROJECT}/planning/style-guide.json`)
  if (!sgBlob) throw new Error('스타일가이드 없음')
  const sg = JSON.parse(await sgBlob.text())

  // 현 초안 히어로에 쓰인 고양이 연출컷 재사용 (need_hero 계열)
  const { data: shots } = await svc.storage.from('designs').list(`projects/${PROJECT}/styling_real`, { limit: 100 })
  const heroShot = (shots ?? []).find((f) => /hero/i.test(f.name))?.name
  if (!heroShot) throw new Error('히어로 컷 없음')
  const { data: pub } = svc.storage.from('designs').getPublicUrl(`projects/${PROJECT}/styling_real/${heroShot}`)
  const imgUrl = pub.publicUrl

  const copy = {
    eyebrow: '뉴트리플랜',
    sub: '동원이 만든 100% 휴먼그레이드 간식 · 뉴트리 스틱 참치',
    headline: '집사도 탐나는 그 한 스틱',
    points: ['사람도 먹을 수 있는 100% 휴먼그레이드 원료', '보존료·조미료·겔화제 무첨가', '동원F&B 창원공장 직접 제조', '나트륨 0.1% 이하 설계'],
  }

  const CONCEPTS = [
    'Concept A — EDITORIAL SPLIT: 대형 세로 조판. 이미지가 한쪽으로 블리드하고 초대형 타이포가 이미지를 침범(overlap). 체크포인트는 카드가 아니라 조판된 목록으로.',
    'Concept B — TYPE-AS-GRAPHIC: 헤드라인 자체를 그래픽 요소로 (초대형·부분 accent·회전 또는 아웃라인 혼용). 이미지는 마스킹/프레이밍으로 조형적으로. 다크·라이트 존의 대담한 분할.',
  ]

  for (let i = 0; i < CONCEPTS.length; i++) {
    const user = `제품: 뉴트리 스틱 [참치] — 반려묘 습식 간식 스틱 (브랜드: 동원 뉴트리플랜)
브랜드 무드: ${(sg.brand?.moodKeywords ?? []).join(', ')} / 형태 언어: ${sg.shapeLanguage}
${CONCEPTS[i]}

카피(그대로 사용):
- eyebrow: ${copy.eyebrow}
- sub: ${copy.sub}
- headline: ${copy.headline}
- points: ${copy.points.join(' | ')}

이미지(지배적 비주얼로 사용): ${imgUrl}

Output the final <style> + <section class="sdx"> now.`

    console.log(`[proto] 컨셉 ${i === 0 ? 'A' : 'B'} 생성 중…`)
    const msg = await anthropicClient.messages.create({
      model: MODELS.CLAUDE_OPUS,
      max_tokens: 8000,
      system: SYSTEM,
      messages: [{ role: 'user', content: user }],
    })
    const html = extractText(msg.content).replace(/^```html?\n?|```$/g, '').trim()

    // 신규 스타일가이드 색·폰트를 토큰으로 매핑한 완전한 문서로 래핑
    const doc = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=872">
<link href="https://fonts.googleapis.com/css2?family=Jua&family=Gowun+Batang:wght@400;700&display=swap" rel="stylesheet">
<style>
:root{--bg:${sg.colors.surface1};--paper:#ffffff;--ink:${sg.colors.textDark};--ink-2:${sg.colors.textDark}CC;
--brand:${sg.colors.primary};--accent:${sg.colors.accent};
--font-display:'${sg.typography.headlineFont}',sans-serif;--font-body:'Pretendard Variable',Pretendard,sans-serif;--font-serif:'${sg.typography.storyFont}',serif}
@font-face{font-family:'Pretendard Variable';src:local('Pretendard')}
body{margin:0;width:872px;font-family:var(--font-body)}
</style></head><body>
${html}
</body></html>`
    fs.writeFileSync(`/tmp/scene-proto-${i === 0 ? 'A' : 'B'}.html`, doc)
    console.log(`[proto] 저장: /tmp/scene-proto-${i === 0 ? 'A' : 'B'}.html (${html.length} chars)`)
  }
}

main().catch((e) => { console.error('[proto] 실패:', e.message); process.exit(1) })
