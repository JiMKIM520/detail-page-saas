/**
 * Agent: Page Planner — 재설계 A단계 (docs/plans/image-pipeline-redesign.md).
 * 컴포저 1콜이 서사·블록 선택·카피·이미지 배치를 전부 결정하던 구조(구멍 1·2)를 분리:
 * 승인 스크립트(고객이 확인한 서사) + 이미지 태거 인벤토리(실물 검수)를 입력으로
 * "섹션 순서 · 블록(variantId) · 섹션별 이미지 배정 · 카피 지침"만 결정한 청사진을 낸다.
 * 필러(컴포저)는 이 청사진을 구속 계약으로 슬롯을 채운다.
 */
import { z } from 'zod'
import { anthropicClient, parseJsonResponse, timer, MODELS, extractText } from './utils'
import { catalog } from './templates/blocks'
import { containSlotKeys, getVariant } from './templates/blocks/registry'
import { SCRIPT_TYPE_TO_ARCHETYPES, HERO_STYLE_TO_VARIANTS } from './templates/blocks/canvas'
import { CONTRACTED_IDS } from './blocks-composer'
import { variantTone, estimateHeight, isOffPalette } from './templates/blocks/variant-meta'
import { detectImageScale } from './templates/blocks/image-scale'
import type { AgentResult, ProjectBrief } from './types'

export interface ImageNeed {
  /** 파일명이 되는 안정 id (예: need_hero, need_ingredient_beans) — 영문 스네이크 */
  id: string
  /** 무엇이 찍혀야 하는가 — 한 문장 (예: '생두와 원두가 나란히 놓인 원료 매크로') */
  subject: string
  /** styled=제품 연출 / raw-material=원료·소재 실물 / texture=질감 / usage=사용 장면 / mood=무드 */
  style: 'styled' | 'raw-material' | 'texture' | 'usage' | 'mood'
  /** 제품(패키지)이 프레임에 필요한가 — false면 레퍼런스 없이 순수 생성(원료·소재컷) */
  withProduct: boolean
  /** 생성 대신 업로드 원본 사진을 직접 배치 — 패키지 구성·라벨 등 실물 정확성이 중요한 니즈 (Sprint 9-C) */
  useOriginal?: boolean
  /** 노출 크기 — main(대형 프레임: pro 모델) / support(소형 썸네일·서브컷: 경량 모델) (Sprint 9-D) */
  prominence?: 'main' | 'support'
  /** 목적지 블록 이미지 프레임의 기대 비율 — 생성 aspectRatio로 전달돼 crop을 원천 방지.
   *  variant CSS의 첫 aspect-ratio에서 결정적으로 추론(스탬프는 시스템이, LLM 아님). 기본 3:4. */
  frameRatio?: '3:4' | '4:3' | '16:9' | '1:1'
}

/** variant CSS에서 대표 이미지 프레임 비율을 추론 — 첫 aspect-ratio:W/H 매치 기준.
 *  스타일링컷이 전부 3:4 세로로 생성돼 가로 프레임(배너·와이드)에서 잘리던 구조적 crop의
 *  근본 해소: 니즈가 태어날 때 목적지 프레임 비율을 갖는다. 매치 없거나 이상값이면 3:4(기존 동작). */
export function inferFrameRatio(css: string | undefined): '3:4' | '4:3' | '16:9' | '1:1' {
  const m = String(css ?? '').match(/aspect-ratio:\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/)
  if (!m) return '3:4'
  const w = parseFloat(m[1]); const h = parseFloat(m[2])
  if (!(w > 0) || !(h > 0)) return '3:4'
  const r = w / h
  if (r >= 1.5) return '16:9'
  if (r >= 1.08) return '4:3'
  if (r >= 0.92) return '1:1'
  return '3:4'
}

export interface BlueprintSection {
  order: number
  variantId: string
  /** 이 블록이 담당하는 승인 스크립트 섹션 type — 결정적 매핑 테이블(Sprint 4-B) 검증 기준 */
  scriptType?: string
  /** 씬 번호(1~7) — 7씬 서사 구조에서 이 섹션이 속하는 씬 */
  scene?: number
  /** 이 블록이 다룰 승인 스크립트 내용 요지 (필러의 카피 원천) */
  copyBrief: string
  /** 배정 이미지 (0~2, 제공 풀 URL만) — 인벤토리 모드 */
  imageUrls: string[]
  /** 이 블록이 필요로 하는 이미지 명세 (0~2) — 니즈 모드(Sprint 5, 기획 단계에서 인벤토리 없이) */
  imageNeeds?: ImageNeed[]
}
export interface PageBlueprint {
  sections: BlueprintSection[]
  /** 히어로 선택 근거 — 의미 없는 다양화 방지: 왜 이 히어로 형태인지 데이터로 남긴다 */
  heroRationale?: string
}

export interface PagePlannerInput {
  brief: ProjectBrief
  /** 승인 스크립트 — scripts.content(tone, sections[]) 또는 planning script.json */
  script: { tone?: string; sections: Array<Record<string, unknown>> }
  /** 이미지 인벤토리: URL → 태거 실물 노트(설명·방향·품질) */
  imageNotes: Record<string, string>
  avoidVariants?: string[]
  /** 아트디렉터 무드 키워드 — 히어로 아형 내 변형 선택의 보조 신호 */
  moodKeywords?: string[]
  /** 업로드 원본 사진 파일명 목록 — useOriginal 판단 근거 (Sprint 9-C) */
  uploadedPhotos?: string[]
  /** 결정적 셔플 시드(보통 projectId) — 카탈로그 표본·히어로 후보 순서가 프로젝트마다 달라진다 (Sprint 12).
   *  같은 프로젝트의 재시도는 같은 순서 → 프롬프트 캐시 히트 유지 */
  seed?: string
}

// 상한 초과는 기계적으로 수리 가능한 위반 — 실패 대신 절단(컴포저 수리 패스와 같은 철학)
const blueprintSchema = z.object({
  sections: z.preprocess(
    (v) => (Array.isArray(v) ? v.slice(0, 20) : v),
    z
      .array(
        z.object({
          order: z.number().int().min(0),
          variantId: z.string().min(1),
          scriptType: z.string().optional(),
          scene: z.number().int().min(1).max(7).optional(),
          copyBrief: z.string().min(1),
          imageUrls: z.preprocess(
            (v) => (Array.isArray(v) ? v.slice(0, 3) : v),
            z.array(z.string()).max(3).default([]),
          ),
          imageNeeds: z.preprocess(
            (v) => (Array.isArray(v) ? v.slice(0, 2) : v),
            z
              .array(
                z.object({
                  id: z.string().min(1).regex(/^[a-z0-9_]+$/i),
                  subject: z.string().min(1),
                  style: z.enum(['styled', 'raw-material', 'texture', 'usage', 'mood']),
                  withProduct: z.boolean(),
                  useOriginal: z.boolean().optional(),
                  prominence: z.enum(['main', 'support']).optional(),
                }),
              )
              .max(2)
              .optional(),
          ),
        }),
      )
      .min(14)
      .max(20),
  ),
  heroRationale: z.string().optional(),
})

const SYSTEM_PROMPT = `You are the PAGE PLANNER for a Korean e-commerce detail page system.
You do NOT write copy. You produce a page blueprint that a filler agent will follow verbatim.

Inputs you receive: the client-APPROVED script (narrative sections), a verified image inventory
(each entry describes what is ACTUALLY in the image — trust it), and the block catalog (in this
system prompt). Your job:

1. NARRATIVE: follow the approved script's section order as the spine of the page. Merge script
   sections only when the catalog demands it; SPLIT rich sections into multiple blocks (e.g.
   ingredients → spotlight + grid, usage → steps + tips) so the page reads full and generous.
   Every page starts with one hero-family block and ends with one closing-family block.
   14~20 blocks total — a Korean detail page should feel substantial.
   Scene assignment (CRITICAL): assign a "scene" number (integer 1–7) to EVERY block. Consecutive
   blocks sharing the same scene number form one poster unit — exactly 7 distinct scenes across the
   page, 2–3 blocks each. Standard narrative arc: ①hook(hero) ②problem·promise
   ③ingredient·material ④detail·texture ⑤usage·points ⑥trust(review·cert·spec)
   ⑦purchase(faq·cs·closing) — adapt to the product category while keeping exactly 7 scenes.
   Tone composition (CRITICAL): each scene has ONE tone ('light' or 'dark'). All blocks within a
   scene must use same-tone variants — catalog lines show [dark]/[light] and (~NNNpx) per variant.
   Tone sequence: (a) no 3 consecutive scenes share the same tone; (b) include 1–3 dark scenes
   total (adapt to product mood); (c) first scene follows the category mood (bright/casual → light,
   premium/night-care → dark). Scene tone boundaries create the visual rhythm — adjacent scenes
   should contrast. Height budget: target ~2,000 px per scene (1,600–2,400 acceptable). Sum the
   (~NNNpx) values from the catalog when planning each scene; >2,600 px fatigues, <1,400 px feels
   abrupt. Adjust block count per scene to hit the target.
   Floor is MANDATORY (CRITICAL): 1,600 px is a hard minimum — never plan a scene thinner than
   1,600 px. Fill every scene with 2–3 blocks; a single-block scene is always wrong. If a scene
   falls short, add a block to it rather than collapsing it — keep exactly 7 scenes.
   The catalog (~NNNpx) values ALREADY include the render-time scale-up — sum them as-is and trust
   them. Total page budget: the 7 scene sums must land near 14,000 px and must not exceed 16,800 px.
   If your block list overshoots, REMOVE blocks (or pick shorter variants) — do not compress scenes.
2. BLOCK CHOICE: pick variantIds ONLY from the catalog below. Match each script section's intent
   to the block archetype (story→story/point, 성분→ingredient, 사용법→usage, FAQ→faq, 배송→cs/shipping).
   Do not use the same variant twice. Avoid three consecutive blocks of the same archetype.
   discount 계열은 브리프/스크립트에 실제 가격·할인 정보가 있을 때만 선택하라(없으면 시스템이 제거한다).
3. IMAGES — two modes:
   [INVENTORY MODE] (이미지 인벤토리가 주어짐): assign from inventory ONLY where the image's actual
   content supports the section (읽어라 — 노트가 실물이다). Rules:
   - [세로] images never go to wide full-bleed/panorama blocks.
   - "차선" images only in small/background slots.
   - product-label/누끼 shots fit hero, detail, feature, ingredient — not story/mood backgrounds.
   - Each image at most 1 section (동일 사진 재사용 금지). USE EVERY ok image at least once —
     unused good images are wasted production.
   - Blocks with imageSlots>=2 need at least 1 assigned image or must not be chosen.
   [NEEDS MODE] (인벤토리가 '(이미지 없음)' — 이미지를 아직 만들기 전): imageUrls는 반드시 []로 두고,
   이미지가 필요한 블록마다 imageNeeds를 그 블록의 슬롯 수에 맞게 명세하라(개수 상한 없음 — 아래 슬롯 규칙 우선):
   - id: 영문 snake_case 고유값(파일명이 된다, 예: need_hero_main, need_bean_macro)
   - subject: 무엇이 찍혀야 하는지 구체적 한 문장 — 브리프/스크립트에 명시된 원료·사용법·장면만
     (없는 원료·소품·행위를 지어내지 말 것)
   - style: styled(제품 연출)/raw-material(원료·소재 실물)/texture(질감)/usage(사용 장면)/mood(무드)
   - withProduct: 제품 패키지가 프레임에 필요한가 — 원료·소재·질감컷은 false 권장(라벨 재현 위험 0)
   - useOriginal: 업로드 원본 사진 목록에 그 니즈를 정확히 충족하는 실물 사진이 있으면 true —
     생성하지 않고 원본을 그대로 배치한다(패키지 구성·묶음·라벨·실물 디테일은 원본이 항상 정확).
     true면 subject에 반드시 그 원본의 파일명 키워드를 그대로 포함하라(시스템이 파일명 토큰으로
     매칭한다 — 근거 토큰이 없으면 생성으로 강제 전환된다).
     ⛔ hero 블록의 니즈에는 useOriginal 금지 — 대표컷은 항상 연출 생성컷이다(원본 실사는
     히어로 품질 기준 미달, 시스템이 강제 전환한다).
   - 니즈 수는 그 블록의 이미지 슬롯 수와 일치시켜라(CRITICAL — 3슬롯 지그재그면 니즈 3개,
     4행 리스트면 4개. 일부만 계획하면 빈 프레임이 노출된다). 단, 갤러리 그리드처럼 슬롯이
     '최대 N'(가변)인 블록은 대표 3~4컷이면 충분하다 — 빈 셀은 렌더 시 자동 숨김된다.
     클로징 사진(closing) 블록도 배경/감성 사진 1컷을 반드시 계획하라(사진 없이 텍스트만이면 마무리가 약하다).
   - 페이지 전체 니즈 = 이미지 슬롯을 가진 모든 블록의 슬롯 합(빈 슬롯 0이 목표, CRITICAL).
     "정해진 개수"가 아니라 실제 슬롯 수요만큼 낸다 — 보통 14~20컷, 슬롯이 많은 페이지는 그 이상.
     하단 섹션에 사진이 빠지는 것은 니즈를 슬롯 수보다 적게 냈기 때문이다. 슬롯이 있으면 반드시 니즈를 낸다.
     최소 구성(반드시 포함, 용도 분포):
     ① 히어로 연출 1 (withProduct=true, main) ② 제품 연출 2+ (styled, main)
     ③ 원료/소재 2 (raw-material, support) ④ 텍스처/디테일 2 (texture, support)
     ⑤ 사용 장면 2 (usage — main 1, support 1) ⑥ 무드/배경 1 (mood, support)
     ⑦ 스펙/비교·기타 보조 (support) — 이미지 슬롯 보유 블록이 더 많으면 위 분포를 늘려 전 슬롯을 채운다.
     블록 구성은 이미지 슬롯 보유 블록이 전체의 절반 이상이 되도록 선택하고, 부족하면 이미지 블록을 추가하라.
     ⛔ 이미지 나열형 블록(갤러리 그리드·썸네일 밴드·사진 콜라주 계열)은 페이지당 1개만, 그리고
     서로 인접 배치 금지 — 유사한 연출컷이 8장씩 연속되면 정보 없는 "사진 무더기"가 된다(실사례).
     나열형 블록 앞뒤에는 반드시 텍스트/수치/표 중심 블록을 끼워 서사 리듬을 만들라.
   - prominence: 대형 프레임(히어로·풀블리드·본문 큰 사진)=main / 소형 썸네일·서브컷(원형 아이콘,
     리스트 썸네일, 보조컷)=support — 생성 모델 티어 결정에 쓰인다. 반드시 지정하라.
4. copyBrief: ONE terse Korean sentence (max 80 chars) stating WHAT the filler must say there,
   quoting key facts from the script (numbers, claims). The filler may not invent beyond this.

5. scriptType: for each block, state which script section type it serves (use the script's own type
   string, e.g. "how_to_use"). The system enforces a type→archetype table — choosing a block family
   outside the allowed archetypes for that type will be rejected.
6. HERO CHOICE (meaningful, not rotational): the script's hero section carries heroStyle
   (points/mood/badge) — pick the hero variant from that style's candidate list (given in the user
   prompt). Within the list, choose by the brand's mood keywords and the hero image plan — read the
   variant descriptions and match the brand's personality. Record WHY in top-level "heroRationale"
   (one Korean sentence: 제품 성격→아형→변형 근거). Same-style products SHOULD get similar heroes —
   difference must come from the product, never from novelty.
7. NARRATIVE PREFERENCES (서사·선호 규칙):
   (a) SCENE 7 STRUCTURE (CRITICAL): scene 7 (the final scene) MUST follow this order:
       ① a point/recap-family block re-emphasizing the top selling points (포인트 요약형) THEN
       ② the closing block. FAQ and CS belong in scene 6 — never in scene 7.
   (b) CALLOUT RULE: place 1–2 callout-family blocks at the page's most critical emphasis moments —
       do NOT bury peak emphasis in ordinary body-list blocks.
   (c) DATA → GAUGE/CHART: if the script or brief contains numeric data (성분 함량·함유량·%) choose a
       gauge/chart-type variant for that block. NEVER invent numeric values not present in the input
       (existing no-fabrication constraint, re-confirmed).
   (d) DISPLAY TYPOGRAPHY PER SCENE: each scene must include at least one large-display-typography
       variant (title scale ≥ 3× body — high type-hierarchy contrast). Do not fill a scene with only
       text-dense, low-hierarchy variants.
   (e) COMPARE → CARD VARIANT: when script content is comparative (vs 경쟁사/before-after/원료 비교)
       prefer card-grid compare variants over plain list or text blocks.

Output raw compact JSON only (no prose, no markdown, minimal whitespace):
{"sections":[{"order":0,"variantId":"hero-arch","scriptType":"hero","scene":1,"copyBrief":"...","imageUrls":["https://..."]}]}`

/** 결정적 시드 난수(mulberry32 계열) — Math.random 금지 환경에서도 프로젝트별로 재현 가능 */
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

function seededShuffle<T>(arr: readonly T[], rand: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 카탈로그 표본 — 아키타입별 시드 셔플 후 상한 컷 (Sprint 12).
 *  전체 591종을 등록순으로 나열하면 LLM 위치 편향으로 앞쪽(구형) 변형만 선택되고 뒤쪽 60%의
 *  신규 233종은 사실상 죽은 재고가 된 실사례(동원: 사용 11종 전부 앞 30%). 프로젝트 시드로
 *  아키타입 안에서 셔플·표본화하면 매 프로젝트 다른 부분집합이 앞에 오고, 같은 프로젝트의
 *  재시도는 같은 표본 → 프롬프트 캐시도 유지된다. hero는 사용자 프롬프트의 후보 목록과
 *  어긋나면 안 되므로 상한 없이 전부 싣는다. */
const PER_ARCHETYPE_CAP = 12
const catalogBlockCache = new Map<string, string>()
export function getCatalogBlock(seed: string): string {
  const hit = catalogBlockCache.get(seed)
  if (hit) return hit
  const rand = seededRandom(`catalog:${seed}`)
  const byArch = new Map<string, ReturnType<typeof catalog>>()
  for (const c of catalog()) {
    if (!CONTRACTED_IDS.has(c.id)) continue
    if (isOffPalette(c.id)) continue // 오프팔레트 변형은 LLM 카탈로그에서 제외
    const list = byArch.get(c.archetype) ?? []
    list.push(c)
    byArch.set(c.archetype, list)
  }
  const lines: string[] = []
  for (const arch of [...byArch.keys()].sort()) {
    const pool = seededShuffle(byArch.get(arch)!, rand)
    const picked = arch === 'hero' ? pool : pool.slice(0, PER_ARCHETYPE_CAP)
    for (const c of picked) {
      const cutoutMark = c.imageSlots > 0 && containSlotKeys(c.id).size > 0 ? ' ⛔누끼전용슬롯' : ''
      const tone = variantTone(c.id)
      const height = estimateHeight(c.id, c.archetype)
      lines.push(`- ${c.id} · ${c.archetype} · img${c.imageSlots} · [${tone}] · (~${height}px)${cutoutMark} · ${c.describe}`)
    }
  }
  const block = `블록 카탈로그(variantId · archetype · imageSlots · 톤 · 예상높이 · 설명) — 아키타입별 대표 표본:\n${lines.join('\n')}\n\n⛔누끼전용슬롯 = 이미지 프레임이 장식형(원형·좌대·플롯)이라 배경 없는 단독컷(누끼)만 어울린다.\n이 변형을 고르면 그 블록의 imageNeeds는 반드시 배경 없는 제품/원료 단독컷으로 명세하라 — 배경 있는 실사·원본 사진은 시스템이 제거한다.`
  if (catalogBlockCache.size > 32) catalogBlockCache.clear()
  catalogBlockCache.set(seed, block)
  return block
}

function summarizeScriptSections(sections: Array<Record<string, unknown>>): string {
  return sections
    .map((s, i) => {
      const type = String(s.type ?? s.sectionType ?? 'section')
      const title = String(s.title ?? s.text ?? '').slice(0, 60)
      const body = JSON.stringify(s).replace(/https?:\/\/\S+/g, '').slice(0, 420)
      return `[${i}] type=${type} | ${title}\n${body}`
    })
    .join('\n\n')
}

function buildUserPrompt(input: PagePlannerInput, repairNote?: string): string {
  const imgLines = Object.entries(input.imageNotes)
    .map(([url, note]) => `- ${url}\n    ↳ ${note}`)
    .join('\n')
  const avoid = input.avoidVariants?.length
    ? `\n\nDO NOT USE variants: ${input.avoidVariants.join(', ')}`
    : ''
  // 히어로 아형 후보 — 스크립트 hero 섹션의 heroStyle에 해당하는 목록만 제시(의미 기반 선택)
  const heroSection = input.script.sections.find((s) => String(s.type ?? s.sectionType ?? '') === 'hero')
  const heroStyle = String((heroSection as { heroStyle?: string } | undefined)?.heroStyle ?? '').toLowerCase()
  // 후보 순서도 시드 셔플 (Sprint 12) — 고정 나열은 첫 항목 편향으로 같은 히어로만 반복(hero-icon-rows 3연속 실사례)
  const heroPool = HERO_STYLE_TO_VARIANTS[heroStyle]
  const heroCandidates = heroPool ? seededShuffle(heroPool, seededRandom(`hero:${input.seed ?? input.brief.productName}`)) : undefined
  // 업로드 원본 사진 목록 (Sprint 9-C) — useOriginal 판단 근거
  const photosBlock = input.uploadedPhotos?.length
    ? `\n\n업로드 원본 사진 (useOriginal 후보 — 실물 정확성이 중요한 니즈는 생성 대신 이 원본을 지정):\n${input.uploadedPhotos.map((n) => `- ${n}`).join('\n')}`
    : ''
  const heroBlock = heroCandidates
    ? `\n\nHERO 후보 (스크립트 heroStyle="${heroStyle}" — 이 목록에서만 선택, 무드에 맞게):\n${heroCandidates.join(', ')}\n무드 키워드: ${(input.moodKeywords ?? []).join(', ') || '(없음)'}`
    : input.moodKeywords?.length
      ? `\n\n무드 키워드(히어로 선택 참고): ${input.moodKeywords.join(', ')}`
      : ''
  const repair = repairNote ? `\n\n⚠️ 직전 청사진 검증 실패 — 고쳐서 다시: ${repairNote}` : ''
  return `제품명: ${input.brief.productName}
카테고리: ${input.brief.category} / 플랫폼: ${input.brief.platform}
타겟: ${input.brief.targetAudience}
톤: ${input.script.tone ?? input.brief.styleDirection ?? ''}

승인 스크립트 섹션(서사의 뼈대 — 이 순서를 따르라):
${summarizeScriptSections(input.script.sections)}

이미지 인벤토리(실물 검수 완료 — 노트 기준으로만 배정):
${imgLines || '(이미지 없음)'}${photosBlock}${heroBlock}${avoid}${repair}

위 스크립트 서사에 맞는 페이지 청사진 JSON만 출력하세요.`
}

/** 결정적 청사진 검증+수리 — 수리 가능한 위반(중복·미지 변형·위치)은 고치고, 불가한 것만 issue.
 *  gaps: 매핑 테이블에 없는 스크립트 type — 실패가 아니라 라이브러리 확장 신호(Sprint 4-C). */
function validateBlueprint(
  bp: PageBlueprint,
  allowedUrls: ReadonlySet<string>,
  briefCorpus?: string,
): { issues: string[]; gaps: string[] } {
  const issues: string[] = []
  const gaps: string[] = []
  const arch = (id: string): string => String(catalog().find((c) => c.id === id)?.archetype ?? '')

  // 수리 1: 미지 변형·중복 제거(첫 항목 유지), offPalette 교체, 이미지 풀 이탈 제거
  const seen = new Set<string>()
  const filteredSections: BlueprintSection[] = []
  for (const s of bp.sections) {
    if (!CONTRACTED_IDS.has(s.variantId) || seen.has(s.variantId)) continue
    // offPalette 교체: 같은 아키타입·같은 톤의 온팔레트 변형으로 교체, 불가 시 제거+gaps
    if (isOffPalette(s.variantId)) {
      const ce = catalog().find((c) => c.id === s.variantId)
      const targetArch = ce?.archetype ?? ''
      const targetTone = variantTone(s.variantId)
      const repl = catalog().find(
        (c) =>
          CONTRACTED_IDS.has(c.id) &&
          c.archetype === targetArch &&
          variantTone(c.id) === targetTone &&
          !isOffPalette(c.id) &&
          !seen.has(c.id),
      )
      if (repl) {
        gaps.push(`offPalette 교체: ${s.variantId} → ${repl.id} (${targetArch}/${targetTone})`)
        s.variantId = repl.id
      } else {
        gaps.push(`offPalette 제거: ${s.variantId} — ${targetArch}/${targetTone} 온팔레트 대체 없음`)
        continue
      }
    }
    seen.add(s.variantId)
    s.imageUrls = s.imageUrls.filter((u) => allowedUrls.has(u))
    filteredSections.push(s)
  }
  bp.sections = filteredSections

  // 수리 1b: 브리프에 가격·할인 근거가 없으면 discount 계열 제거 — 조립 단계에서 무근거 가격
  // 차단→가격 공백→블록 드롭으로 이어져 니즈 컷만 고아가 되는 낭비를 기획에서 차단(루미트론 실사례)
  if (briefCorpus && !/\d[\d,.]*\s*(?:원|₩)|\d+\s*%\s*(?:할인|OFF|세일)|타임딜|특가/i.test(briefCorpus)) {
    const before = bp.sections.length
    bp.sections = bp.sections.filter((s) => arch(s.variantId) !== 'discount')
    if (bp.sections.length < before)
      console.warn(`[Page Planner] 가격 근거 없음 — discount 블록 ${before - bp.sections.length}개 제거(니즈 낭비 예방)`)
  }

  // 검증: 스크립트 type → 아키타입 결정적 매핑 테이블 (Sprint 4-B)
  bp.sections.forEach((s, i) => {
    if (!s.scriptType) return
    const key = s.scriptType.trim().toLowerCase()
    const allowed = SCRIPT_TYPE_TO_ARCHETYPES[key]
    if (!allowed) {
      // 미등재 type은 기록만 — 콘텐츠를 실제로 본 플래너의 선택을 존중한다 (강제 폴백은
      // 영양표→범용 블록 같은 품질 후퇴를 만든 실사례). 갭 데이터가 쌓이면 테이블에 등재.
      gaps.push(`${key} (블록 ${i}: ${s.variantId} 선택 유지)`)
      return
    }
    if (!allowed.includes(arch(s.variantId)))
      // 하드 거부는 청사진 전체 폐기(폴백)로 이어져 비용이 이득보다 컸다(실사례 2회) —
      // 테이블은 프롬프트 유도+관측 데이터로 쓰고, 위반은 기록만 한다
      gaps.push(`[불일치] ${key}→${arch(s.variantId)} (허용: ${allowed.join('/')})`)
  })

  // 수리 2: hero/closing이 존재하는데 위치만 틀리면 재배치
  const heroIdx = bp.sections.findIndex((s) => arch(s.variantId) === 'hero')
  if (heroIdx > 0) bp.sections.unshift(...bp.sections.splice(heroIdx, 1))
  const closingIdx = bp.sections.findIndex((s) => arch(s.variantId) === 'closing')
  if (closingIdx >= 0 && closingIdx !== bp.sections.length - 1)
    bp.sections.push(...bp.sections.splice(closingIdx, 1))

  // 니즈 모드(인벤토리 없음) 검증·수리 — id 중복 제거, 총량 20 상한 절단, 최소량 미달은 재시도
  if (allowedUrls.size === 0) {
    const seenIds = new Set<string>()
    // 니즈 상한 = 실제 슬롯 수요(이미지 슬롯 보유 블록의 슬롯 합) — 빈 슬롯 0이 목표.
    // (이전엔 12로 하드캡해 14~40건 수요를 12건만 공급 → 하단 블록 빈 슬롯·빈 섹션이 구조적 발생.)
    // 하한 12(최소 밀도)·상한 28(generate-shots 생성 상한·Vercel 타임아웃 여유).
    const slotDemand = bp.sections.reduce(
      (acc, sec) => acc + (catalog().find((c) => c.id === sec.variantId)?.imageSlots ?? 0),
      0,
    )
    const cap = Math.max(12, Math.min(slotDemand, 28))
    let total = 0
    for (const s of bp.sections) {
      s.imageUrls = []
      if (!s.imageNeeds?.length) continue
      s.imageNeeds = s.imageNeeds.filter((n) => {
        if (seenIds.has(n.id) || total >= cap) return false
        seenIds.add(n.id)
        total++
        return true
      })
    }
    // 슬롯 수요 미달분은 슬롯이 비어있는 블록(슬롯수 > 현재 니즈수)에 직접 귀속해 보충한다
    // (generic 라운드로빈이 아니라 빈 슬롯을 직접 겨냥 — 빈 프레임 방지).
    if (total < cap) {
      const gaps = bp.sections
        .map((sec) => ({ sec, slots: catalog().find((c) => c.id === sec.variantId)?.imageSlots ?? 0, have: sec.imageNeeds?.length ?? 0 }))
        .filter((x) => x.slots > 0 && arch(x.sec.variantId) !== 'hero' && x.have < x.slots)
      let guard = 0
      while (total < cap && gaps.length > 0 && guard < 100) {
        guard++
        const g = gaps[0]
        // 예비 니즈도 귀속 블록의 맥락(아키타입 + 카피 요지)을 피사체로 명세한다 —
        // generic "제품 연출 보조컷"이 원료 행·사용법 스텝에 들어가 내용 무관 이미지가
        // 되던 실사례(동원 INGREDIENTS에 스틱 연출컷, 럽앤 HOW TO USE에 장미 연출컷).
        const gArch = arch(g.sec.variantId)
        const gBrief = String((g.sec as { copyBrief?: string }).copyBrief ?? '').slice(0, 70)
        const spec =
          gArch === 'ingredient'
            ? { subject: `원료 실물 클로즈업 — ${gBrief || '이 블록이 소개하는 핵심 원료'} (제품 패키지 없이 원료 자체)`, style: 'raw-material' as const, withProduct: false }
            : gArch === 'usage'
              ? { subject: `사용 장면 — ${gBrief || '이 스텝의 실제 동작(손·제품 사용)'}`, style: 'usage' as const, withProduct: true }
              : gArch === 'story' || gArch === 'closing'
                ? { subject: `무드/라이프스타일 연출 — ${gBrief || '브랜드 무드'}`, style: 'mood' as const, withProduct: true }
                : { subject: `제품 연출 보조컷 — ${gBrief || '이 블록의 핵심 소구를 뒷받침하는 연출'}`, style: 'styled' as const, withProduct: true }
        ;(g.sec.imageNeeds ??= []).push({
          id: `need_reserve_${total + 1}`,
          ...spec,
          prominence: 'support',
        })
        g.have++
        total++
        if (g.have >= g.slots) gaps.shift()
      }
      console.warn(`[Page Planner] 슬롯수요 ${cap} 대비 미달 — 예비 니즈 보충(빈 슬롯 블록 직접 귀속)`)
    }
    const slotSum = bp.sections.reduce(
      (acc, sec) => acc + (catalog().find((c) => c.id === sec.variantId)?.imageSlots ?? 0),
      0,
    )
    if (slotSum < 12)
      issues.push(`이미지 슬롯 합 ${slotSum}(<12) — 이미지 보유 블록이 부족하다. 텍스트 전용 블록 일부를 이미지 블록으로 교체하라`)

    // 니즈에 목적지 프레임 비율 스탬프(결정적) — variant CSS의 첫 aspect-ratio에서 추론.
    // 생성 단계(shot-prompter→generate-shots)가 이 비율로 컷을 만들어 crop을 원천 차단한다.
    for (const s of bp.sections) {
      if (!s.imageNeeds?.length) continue
      const ratio = inferFrameRatio(getVariant(s.variantId)?.css)
      for (const n of s.imageNeeds) if (!n.frameRatio) n.frameRatio = ratio
    }
  }

  // 수리 3: 씬 결정적 재그룹핑 — 유효 조건 미충족 시 결정적 폴백(니즈 수리와 같은 철학)
  // 유효 조건: 전 섹션 scene 존재 + 비내림차순 + 1~7 범위 + 연속(빠진 번호 없음)
  {
    const n = bp.sections.length
    const allHaveScene = bp.sections.every((s) => typeof s.scene === 'number')
    const isNonDecreasing = bp.sections.every((s, i) => i === 0 || (s.scene ?? 0) >= (bp.sections[i - 1].scene ?? 0))
    const sceneVals = bp.sections.map((s) => s.scene ?? 0)
    const uniqueScenes = [...new Set(sceneVals)].sort((a, b) => a - b)
    const inRange = uniqueScenes.every((v) => v >= 1 && v <= 7)
    const isContiguous =
      uniqueScenes.length > 0 &&
      uniqueScenes[0] === 1 &&
      uniqueScenes.every((v, i) => i === 0 || v === uniqueScenes[i - 1] + 1)
    const isValid = allHaveScene && isNonDecreasing && inRange && isContiguous

    if (!isValid) {
      // n 섹션을 7구간으로 균등 분할 — floor(i*7/n)+1 공식은 n=8..20 전체에서
      // 정확히 7개의 씬 번호를 사용하며 비내림차순을 보장한다.
      // (구 Math.ceil(n/7) 공식은 n=8..12에서 4~6개 씬만 생성하는 결함이 있었음)
      bp.sections.forEach((s, i) => {
        s.scene = Math.min(Math.floor((i * 7) / n) + 1, 7)
      })
      gaps.push('scene 재그룹핑(폴백)')
    }
  }

  // 수리 4 · 5 + 3연속 톤 갭 체크: 씬 컴포지션 수리 (기존 수리 후 실행)
  {
    // 씬별 블록 그룹핑 — repair 3 이후 scene 값은 1~7 보장됨
    const sceneGroups = new Map<number, BlueprintSection[]>()
    for (const s of bp.sections) {
      const sc = s.scene!
      const list = sceneGroups.get(sc) ?? []
      list.push(s)
      sceneGroups.set(sc, list)
    }

    // 수리 4: 씬 내 톤 혼재 수리 — 소수 톤 블록을 동일 아키타입·다수 톤 변형으로 교체 시도
    for (const [sceneNum, blocks] of sceneGroups) {
      const darkCount = blocks.filter((b) => variantTone(b.variantId) === 'dark').length
      const lightCount = blocks.length - darkCount
      if (darkCount === 0 || lightCount === 0) continue // 이미 단일 톤
      const majorTone: 'dark' | 'light' = darkCount >= lightCount ? 'dark' : 'light'
      for (const block of blocks) {
        if (variantTone(block.variantId) === majorTone) continue
        const catalogEntry = catalog().find((c) => c.id === block.variantId)
        if (!catalogEntry) continue
        const targetArch = catalogEntry.archetype
        const replacement = catalog().find(
          (c) =>
            CONTRACTED_IDS.has(c.id) &&
            c.archetype === targetArch &&
            variantTone(c.id) === majorTone &&
            !isOffPalette(c.id) &&
            !seen.has(c.id),
        )
        if (replacement) {
          seen.delete(block.variantId)
          block.variantId = replacement.id
          seen.add(replacement.id)
        } else {
          gaps.push(
            `씬${sceneNum} 톤 혼재: ${block.variantId}(${variantTone(block.variantId)}) → ${targetArch}/${majorTone} 대체 변형 없음`,
          )
        }
      }
    }

    // 수리 5: 씬 높이 예산 수리 — 초과/미달 인접 씬 간 경계 블록 이동(최대 7회)
    const getH = (id: string): number => {
      const e = catalog().find((c) => c.id === id)
      return e ? estimateHeight(id, e.archetype) : 1100
    }
    const sceneSum = (blocks: BlueprintSection[]): number =>
      blocks.reduce((acc, b) => acc + getH(b.variantId), 0)
    const sortedNums = [...sceneGroups.keys()].sort((a, b) => a - b)
    let moves = 0
    for (let i = 0; i < sortedNums.length - 1 && moves < 7; i++) {
      const numA = sortedNums[i]
      const numB = sortedNums[i + 1]
      const blocksA = sceneGroups.get(numA)!
      const blocksB = sceneGroups.get(numB)!
      const sumA = sceneSum(blocksA)
      const sumB = sceneSum(blocksB)
      if (sumA > 2600 && sumB < 1400 && blocksA.length > 1) {
        // 초과 씬의 마지막 블록 → 미달 씬 앞으로
        const moved = blocksA.pop()!
        moved.scene = numB
        blocksB.unshift(moved)
        moves++
      } else if (sumB > 2600 && sumA < 1400 && blocksB.length > 1) {
        // 미달 씬이 인접 초과 씬 첫 블록을 넘겨받음
        const moved = blocksB.shift()!
        moved.scene = numA
        blocksA.push(moved)
        moves++
      }
    }
    // 수리 후에도 위반이면 gaps 기록
    for (const num of sortedNums) {
      const sum = sceneSum(sceneGroups.get(num)!)
      if (sum > 2600) gaps.push(`씬${num} 높이 초과: ~${sum}px(>2,600 — 재기획 권고)`)
      else if (sum < 1400) gaps.push(`씬${num} 높이 미달: ~${sum}px(<1,400 — 재기획 권고)`)
    }

    // 갭 체크: 3연속 동일 톤 씬 — 수리 없음, 재기획 판단 자료
    const sceneTones = sortedNums.map((n) => {
      const blocks = sceneGroups.get(n)!
      const dc = blocks.filter((b) => variantTone(b.variantId) === 'dark').length
      return dc > blocks.length / 2 ? 'dark' : 'light'
    })
    for (let i = 0; i <= sceneTones.length - 3; i++) {
      if (sceneTones[i] === sceneTones[i + 1] && sceneTones[i + 1] === sceneTones[i + 2]) {
        gaps.push(
          `톤 시퀀스 경고: 씬${sortedNums[i]}~씬${sortedNums[i + 2]} 3연속 ${sceneTones[i]} — 재기획 권고`,
        )
      }
    }
  }

  // 갭 체크: 씬7 closing 앞 point/recap류 블록 존재 여부 — 수리 없음, 서사 완결성 관측 데이터
  {
    const scene7 = bp.sections.filter((s) => s.scene === 7)
    const lastIsClosing = scene7.length > 0 && arch(scene7[scene7.length - 1].variantId) === 'closing'
    if (lastIsClosing) {
      const RECAP_ARCHETYPES = new Set(['point', 'recap', 'stats', 'callout', 'feature'])
      const hasRecap = scene7.slice(0, -1).some((s) => RECAP_ARCHETYPES.has(arch(s.variantId)))
      if (!hasRecap)
        gaps.push('씬7 closing 앞 point/recap류 블록 없음 — 셀링포인트 재강조 블록을 closing 직전에 배치 권고')
    }
  }

  // 수리 불가 위반만 재시도 사유로
  if (bp.sections.length < 8) issues.push(`수리 후 블록 ${bp.sections.length}개(<8)`)
  if (!bp.sections.length || arch(bp.sections[0].variantId) !== 'hero') issues.push('hero 계열 블록 없음')
  if (!bp.sections.length || arch(bp.sections[bp.sections.length - 1].variantId) !== 'closing')
    issues.push('closing 계열 블록 없음')
  return { issues, gaps }
}

/**
 * I10 히어로 이미지 임팩트 강제 — 히어로에 사진이 배정되는데 이미지를 작게 쓰는 변형이
 * 뽑혔으면, 같은 heroStyle 풀 안에서 이미지를 크게 쓰는 변형으로 결정적으로 교체한다.
 *
 * 왜 청사진 단계인가: 이 시점의 섹션은 variantId + copyBrief뿐이라 슬롯 데이터가 아직 없다.
 * 컴포저 이후에 교체하면 변형마다 다른 스키마로 슬롯을 재매핑해야 해서 위험하다.
 *
 * 왜 결정적인가: LLM에게 "임팩트 있는 걸 골라라"라고 지시해도, 카탈로그에 이미지 크기 정보가
 * 없어 판단 근거가 없다(히어로 빈약의 근본 원인 — 2026-07-21 4축 진단). 등급을 계산해
 * 코드가 고른다. 풀은 건드리지 않으므로 heroStyle의 의미(points=USP 소구)는 보존된다.
 *
 * points 풀에도 large 등급이 5종 있음을 실측 확인했다 — 풀 확장 없이 해결된다.
 */
function enforceHeroImageImpact(bp: PageBlueprint, input: PagePlannerInput): void {
  const hero = bp.sections[0]
  if (!hero) return
  const heroVariant = getVariant(hero.variantId)
  if (!heroVariant || heroVariant.archetype !== 'hero') return

  // 사진이 배정되지 않는 히어로는 대상 밖 — 텍스트 전용 히어로까지 바꾸면 의도를 훼손한다
  const hasImage = (hero.imageUrls?.length ?? 0) > 0 || (hero.imageNeeds?.length ?? 0) > 0
  if (!hasImage) return

  if (detectImageScale(heroVariant.css, heroVariant.imageSlots) === 'large') return

  const heroSection = input.script.sections.find((s) => String(s.type ?? s.sectionType ?? '') === 'hero')
  const heroStyle = String((heroSection as { heroStyle?: string } | undefined)?.heroStyle ?? '').toLowerCase()
  const pool = HERO_STYLE_TO_VARIANTS[heroStyle] ?? []
  const candidates = pool.filter((id) => {
    if (id === hero.variantId) return false
    const v = getVariant(id)
    if (!v || !CONTRACTED_IDS.has(id) || isOffPalette(id)) return false
    // 슬롯 수가 늘면 채울 이미지가 모자라 빈 프레임이 생긴다 — 현재 이하만 허용
    if (v.imageSlots > Math.max(1, heroVariant.imageSlots)) return false
    return detectImageScale(v.css, v.imageSlots) === 'large'
  })
  if (candidates.length === 0) {
    console.warn(
      `[Page Planner] 히어로 임팩트 교체 불가 — heroStyle="${heroStyle}" 풀에 large 등급 후보 없음 (현행 ${hero.variantId} 유지)`,
    )
    return
  }
  // 시드 결정적 선택 — 같은 프로젝트는 항상 같은 히어로(재시도 간 흔들림 방지)
  const picked = seededShuffle(candidates, seededRandom(`heroimpact:${input.seed ?? input.brief.productName}`))[0]
  console.log(
    `[Page Planner] 히어로 임팩트 교체 — ${hero.variantId}(이미지 작음) → ${picked}(large) · 풀 "${heroStyle}" 후보 ${candidates.length}종`,
  )
  hero.variantId = picked
}

export async function runPagePlanner(input: PagePlannerInput): Promise<AgentResult<PageBlueprint>> {
  const elapsed = timer()
  console.log(`[Page Planner] 시작 — 스크립트 ${input.script.sections.length}섹션 · 이미지 ${Object.keys(input.imageNotes).length}장`)
  const allowedUrls = new Set(Object.keys(input.imageNotes))

  const callOnce = async (repairNote?: string): Promise<PageBlueprint> => {
    // 출력 잘림 재발 이력 3회: 16000(12컷 명세) → 32000(씬 컴포지션+서사 규칙 확장으로 재잘림,
    // shot-prompter 미호출 연쇄의 근본 원인 — 2026-07-20 확정) → 64000. 프롬프트를 늘리면
    // 출력도 늘어난다 — 규칙 추가 시 이 상한과 잘림 치명 처리를 함께 점검할 것.
    const message = await anthropicClient.messages
      .stream({
      // PLANNER_MODEL=opus — 구성 판단 품질 A/B용 선별 업그레이드 스위치(기본 Sonnet 5)
      model: process.env.PLANNER_MODEL === 'opus' ? MODELS.CLAUDE_OPUS : MODELS.CLAUDE_SONNET,
      max_tokens: 64000,
      system: [
        { type: 'text', text: SYSTEM_PROMPT },
        // 시드 표본 카탈로그 — 프로젝트별 상이하지만 같은 프로젝트 재시도는 동일 텍스트 → 캐시 유효
        { type: 'text', text: getCatalogBlock(input.seed ?? input.brief.productName), cache_control: { type: 'ephemeral' } },
      ],
      messages: [{ role: 'user', content: buildUserPrompt(input, repairNote) }],
      })
      .finalMessage()
    // 계측 — 상한을 세 번(16k→32k→64k) 올리면서도 실제 출력량을 한 번도 재지 않았다.
    // 다음 잘림 때 "정말 큰가 / 반복 degeneration인가"를 데이터로 가른다.
    const usage = message.usage as {
      input_tokens: number
      output_tokens: number
      cache_read_input_tokens?: number
      output_tokens_details?: { thinking_tokens?: number }
    }
    console.log(
      `[Page Planner] usage — in:${usage.input_tokens} cacheR:${usage.cache_read_input_tokens ?? 0} out:${usage.output_tokens} think:${usage.output_tokens_details?.thinking_tokens ?? 0} stop:${message.stop_reason}`,
    )
    if (message.stop_reason === 'max_tokens') {
      // 잘린 지점의 형태로 원인을 가른다: 섹션 수가 정상 범위(14~20)인데 잘렸다면 섹션당 출력이
      // 과한 것이고, 수십 개로 불어났다면 모델이 반복에 빠진 것이다 — 처방이 정반대다.
      const partial = extractText(message.content)
      const sectionCount = (partial.match(/"variantId"/g) ?? []).length
      console.warn(
        `[Page Planner] 잘림 진단 — 출력 ${usage.output_tokens}tok · ${partial.length}자 · 섹션 ${sectionCount}개 · 말미 200자: ${partial.slice(-200).replace(/\s+/g, ' ')}`,
      )
      // 잘린 JSON은 파싱 시도조차 무의미 — 치명 처리해 재시도 노트로 간결화를 지시한다
      throw new Error(
        `출력이 max_tokens로 잘림(${usage.output_tokens}tok·섹션 ${sectionCount}개) — copyBrief는 40자, imageNeeds prompt는 60자 이내로 간결하게 줄여 총 출력량을 절반으로 축소할 것`,
      )
    }
    const bp = blueprintSchema.parse(parseJsonResponse<unknown>(extractText(message.content))) as PageBlueprint
    bp.sections.sort((a, b) => a.order - b.order)
    enforceHeroImageImpact(bp, input)
    const { issues, gaps } = validateBlueprint(bp, allowedUrls, JSON.stringify(input.brief))
    // 커버리지 갭(Sprint 4-C) — 실패가 아니라 "어떤 블록 계열을 만들어야 하는가"의 데이터
    if (gaps.length) console.warn(`[Coverage Gap] 매핑 테이블 미등재 스크립트 type: ${gaps.join(' · ')}`)
    if (issues.length) throw new Error(issues.join(' / '))
    return bp
  }

  try {
    // 잘림·검증 실패 모두 확률적 재현(v6: 1차 검증 실패 → 2차 잘림으로 전멸 실사례) — 재시도 2회
    let bp: PageBlueprint | undefined
    let lastNote: string | undefined
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        bp = await callOnce(lastNote)
        break
      } catch (err: unknown) {
        let note = err instanceof Error ? err.message.slice(0, 500) : String(err)
        // JSON 파싱 실패는 대개 문자열 내 개행 — 재시도에 형식 지시를 명시
        if (/JSON/i.test(note)) note += ' — 문자열 안에 개행 금지, 공백 최소화한 한 줄 JSON으로만 출력'
        if (attempt === 2) throw err
        console.warn(`[Page Planner] ${attempt + 1}차 실패 → 재시도:`, note.slice(0, 140))
        lastNote = note
      }
    }
    if (!bp) throw new Error('unreachable')
    if (bp.heroRationale) console.log(`[Page Planner] 히어로 근거 — ${bp.heroRationale.slice(0, 160)}`)
    console.log(`[Page Planner] 완료 (${elapsed()}ms) — ${bp.sections.length}블록: ${bp.sections.map((s) => s.variantId).join(', ')}`)
    return { success: true, data: bp, durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[Page Planner] 실패(청사진 없이 진행):', msg.slice(0, 160))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}
