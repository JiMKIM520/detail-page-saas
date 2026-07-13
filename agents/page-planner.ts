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
import { containSlotKeys } from './templates/blocks/registry'
import { SCRIPT_TYPE_TO_ARCHETYPES, HERO_STYLE_TO_VARIANTS } from './templates/blocks/canvas'
import { CONTRACTED_IDS } from './blocks-composer'
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
}

export interface BlueprintSection {
  order: number
  variantId: string
  /** 이 블록이 담당하는 승인 스크립트 섹션 type — 결정적 매핑 테이블(Sprint 4-B) 검증 기준 */
  scriptType?: string
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
      .min(8)
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
   - Each image at most 2 sections. USE EVERY ok image at least once when a fitting section exists —
     unused good images are wasted production.
   - Blocks with imageSlots>=2 need at least 1 assigned image or must not be chosen.
   [NEEDS MODE] (인벤토리가 '(이미지 없음)' — 이미지를 아직 만들기 전): imageUrls는 반드시 []로 두고,
   이미지가 필요한 블록마다 imageNeeds(0~2)를 명세하라:
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
     4행 리스트면 4개. 일부만 계획하면 빈 프레임이 노출된다).
   - 표준 12컷 패키지(CRITICAL — 페이지 전체 니즈는 정확히 12개, 용도 분포를 따르라):
     ① 히어로 연출 1 (withProduct=true, main) ② 제품 연출 2 (styled, main)
     ③ 원료/소재 2 (raw-material, support) ④ 텍스처/디테일 2 (texture, support)
     ⑤ 사용 장면 2 (usage — main 1, support 1) ⑥ 무드/배경 1 (mood, support)
     ⑦ 스펙/비교 보조 1 (support) ⑧ 예비 1 (카테고리 특성 보완, support)
     블록 구성은 이 12컷을 전부 소화해야 한다 — 이미지 슬롯 보유 블록이 전체의 절반 이상
     (슬롯 합 10 이상)이 되도록 선택하고, 부족하면 이미지 블록을 추가하라.
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

Output raw compact JSON only (no prose, no markdown, minimal whitespace):
{"sections":[{"order":0,"variantId":"hero-arch","scriptType":"hero","copyBrief":"...","imageUrls":["https://..."]}]}`

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
      lines.push(`- ${c.id} · ${c.archetype} · img${c.imageSlots}${cutoutMark} · ${c.describe}`)
    }
  }
  const block = `블록 카탈로그(variantId · archetype · imageSlots · 설명) — 아키타입별 대표 표본:\n${lines.join('\n')}\n\n⛔누끼전용슬롯 = 이미지 프레임이 장식형(원형·좌대·플롯)이라 배경 없는 단독컷(누끼)만 어울린다.\n이 변형을 고르면 그 블록의 imageNeeds는 반드시 배경 없는 제품/원료 단독컷으로 명세하라 — 배경 있는 실사·원본 사진은 시스템이 제거한다.`
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

  // 수리 1: 미지 변형·중복 제거(첫 항목 유지), 이미지 풀 이탈 제거
  const seen = new Set<string>()
  bp.sections = bp.sections.filter((s) => {
    if (!CONTRACTED_IDS.has(s.variantId) || seen.has(s.variantId)) return false
    seen.add(s.variantId)
    s.imageUrls = s.imageUrls.filter((u) => allowedUrls.has(u))
    return true
  })

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
    let total = 0
    for (const s of bp.sections) {
      s.imageUrls = []
      if (!s.imageNeeds?.length) continue
      s.imageNeeds = s.imageNeeds.filter((n) => {
        if (seenIds.has(n.id) || total >= 12) return false
        seenIds.add(n.id)
        total++
        return true
      })
    }
    // 표준 12컷 패키지 — 공급을 고정해 제품별 컷 수 편차·활용 저조를 구조적으로 제거 (±1 완충)
    if (total < 11) issues.push(`이미지 니즈 ${total}개 — 표준 패키지는 12컷이다. 용도 분포에 맞춰 부족분을 명세하라`)
    const slotSum = bp.sections.reduce(
      (acc, sec) => acc + (catalog().find((c) => c.id === sec.variantId)?.imageSlots ?? 0),
      0,
    )
    if (slotSum < 10)
      issues.push(`이미지 슬롯 합 ${slotSum}(<10) — 이미지 보유 블록이 부족하다. 텍스트 전용 블록 일부를 이미지 블록으로 교체하라`)
  }

  // 수리 불가 위반만 재시도 사유로
  if (bp.sections.length < 8) issues.push(`수리 후 블록 ${bp.sections.length}개(<8)`)
  if (!bp.sections.length || arch(bp.sections[0].variantId) !== 'hero') issues.push('hero 계열 블록 없음')
  if (!bp.sections.length || arch(bp.sections[bp.sections.length - 1].variantId) !== 'closing')
    issues.push('closing 계열 블록 없음')
  return { issues, gaps }
}

export async function runPagePlanner(input: PagePlannerInput): Promise<AgentResult<PageBlueprint>> {
  const elapsed = timer()
  console.log(`[Page Planner] 시작 — 스크립트 ${input.script.sections.length}섹션 · 이미지 ${Object.keys(input.imageNotes).length}장`)
  const allowedUrls = new Set(Object.keys(input.imageNotes))

  const callOnce = async (repairNote?: string): Promise<PageBlueprint> => {
    // 12컷 상세 명세로 출력이 16000을 초과(잘림 → JSON 손상 → 청사진 폴백 실사례) —
    // 컴포저와 동일하게 32000+스트리밍(S5는 동일 JSON에 ~30k 토큰, 논스트리밍은 SDK가 거부)
    const message = await anthropicClient.messages
      .stream({
      model: MODELS.CLAUDE_SONNET,
      max_tokens: 32000,
      system: [
        { type: 'text', text: SYSTEM_PROMPT },
        // 시드 표본 카탈로그 — 프로젝트별 상이하지만 같은 프로젝트 재시도는 동일 텍스트 → 캐시 유효
        { type: 'text', text: getCatalogBlock(input.seed ?? input.brief.productName), cache_control: { type: 'ephemeral' } },
      ],
      messages: [{ role: 'user', content: buildUserPrompt(input, repairNote) }],
      })
      .finalMessage()
    if (message.stop_reason === 'max_tokens')
      console.warn('[Page Planner] ⚠ 출력이 max_tokens로 잘림 — JSON 불완전')
    const bp = blueprintSchema.parse(parseJsonResponse<unknown>(extractText(message.content))) as PageBlueprint
    bp.sections.sort((a, b) => a.order - b.order)
    const { issues, gaps } = validateBlueprint(bp, allowedUrls, JSON.stringify(input.brief))
    // 커버리지 갭(Sprint 4-C) — 실패가 아니라 "어떤 블록 계열을 만들어야 하는가"의 데이터
    if (gaps.length) console.warn(`[Coverage Gap] 매핑 테이블 미등재 스크립트 type: ${gaps.join(' · ')}`)
    if (issues.length) throw new Error(issues.join(' / '))
    return bp
  }

  try {
    let bp: PageBlueprint
    try {
      bp = await callOnce()
    } catch (firstErr: unknown) {
      let note = firstErr instanceof Error ? firstErr.message.slice(0, 500) : String(firstErr)
      // JSON 파싱 실패는 대개 문자열 내 개행 — 재시도에 형식 지시를 명시
      if (/JSON/i.test(note)) note += ' — 문자열 안에 개행 금지, 공백 최소화한 한 줄 JSON으로만 출력'
      console.warn('[Page Planner] 1차 검증 실패 → 재시도:', note.slice(0, 140))
      bp = await callOnce(note)
    }
    if (bp.heroRationale) console.log(`[Page Planner] 히어로 근거 — ${bp.heroRationale.slice(0, 160)}`)
    console.log(`[Page Planner] 완료 (${elapsed()}ms) — ${bp.sections.length}블록: ${bp.sections.map((s) => s.variantId).join(', ')}`)
    return { success: true, data: bp, durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[Page Planner] 실패(청사진 없이 진행):', msg.slice(0, 160))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}
