/** CERT 아키타입: cert-list-badges
 *  출처: 피그마 "인증서/08" (860px 모바일 → 872px 데스크톱 재구성)
 *  구조: 섹션 헤더(아이콘+강조 제목) + 인증 3행 리스트(좌 사진+우 텍스트) + 각 행 좌측 동심원 뱃지 오버랩.
 *  동심원 뱃지: 인라인 SVG (외곽 흰 링 → 중간 스트로크 링 → 내부 액센트 채움 원 + 위쪽 호 텍스트 + 중앙 핵심 값).
 *  수치·후기성 콘텐츠 슬롯(certNumber, badgeValue)은 optional — 브리프에 근거가 있을 때만 입력.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const certItemSchema = z.object({
  heading: z.string().min(1),              // 인증명 헤드라인 (em 허용)
  body: z.string().min(1),                // 인증 설명 본문 (em 허용)
  certNumber: z.string().optional(),      // 인증 번호/코드 — 브리프에 근거 있을 때만
  image: z.string().optional(),           // 인증서 사진 (url)
  badgeArcTop: z.string().optional(),     // 뱃지 바깥 호 상단 텍스트 (짧게, 예: "무첨가 인증")
  badgeArcBottom: z.string().optional(),  // 뱃지 중간 호 하단 텍스트 (짧게, 예: "유해성분 ZERO")
  badgeValue: z.string().optional(),      // 뱃지 중심 핵심 값 — 브리프에 근거 있을 때만 (예: "0.00", "無")
})

const schema = z.object({
  eyebrow: z.string().optional(),         // 상단 소제목 (예: "엄격하게 검증된 안전성")
  title: z.string().min(1),              // 섹션 대제목 (em, br 허용)
  items: z.array(certItemSchema).min(2).max(4),
})
type Data = z.infer<typeof schema>

/** 동심원 뱃지 SVG 생성.
 *  레이어 구조 (피그마 원본 충실 재현):
 *   1. 라인3 — 흰 채움 외곽 원 (r=88)
 *   2. 라인2 — 스트로크 전용 링 (r=79)
 *   3. 라인1 — 액센트 채움 내부 원 (r=46)
 *   4. 상단 호 텍스트 (larc) — 중간 링 위쪽에 호를 따라 배치
 *   5. 하단 호 텍스트 (barc) — 외곽·중간 링 사이 하단에 배치
 *   6. 중심 핵심 값 텍스트 (val)
 */
function concentric(arcTop: string, arcBottom: string, val: string): string {
  // 반원 호 path (위쪽): radius=73, 중심 (90,90)
  //   M 90-73,90 → 오른쪽 반호
  const topArcD = 'M17,90 A73,73 0 0,1 163,90'
  // 반원 호 path (아래쪽): radius=85, 중간 링 바깥 하단
  const botArcD = 'M12,90 A78,78 0 0,0 168,90'
  // 폰트 크기 적응 (짧은 텍스트일수록 크게)
  const fs = (s: string, base: number, budget: number): number =>
    Math.max(7, Math.min(base, Math.floor(budget / Math.max(1, s.length))))
  const fsTop = fs(arcTop, 13, 90)
  const fsBot = fs(arcBottom, 11, 100)
  const fsVal = fs(val, 22, 52)

  return `<svg class="clbd-badge-svg" viewBox="0 0 180 180" aria-hidden="true">
  <defs>
    <path id="clbd-arc-top" d="${topArcD}"/>
    <path id="clbd-arc-bot" d="${botArcD}"/>
  </defs>
  <!-- 라인3: 흰 채움 외곽 원 -->
  <circle cx="90" cy="90" r="88" fill="var(--bg,#fff)" stroke="none"/>
  <!-- 라인2: 중간 스트로크 링 -->
  <circle cx="90" cy="90" r="79" fill="none" stroke="var(--accent)" stroke-width="1.6" opacity=".55"/>
  <!-- 라인1: 액센트 채움 내부 원 -->
  <circle cx="90" cy="90" r="46" fill="var(--accent)"/>
  <!-- 상단 호 텍스트 (중간 링 위) -->
  ${arcTop ? `<text font-family="var(--font-body,'Pretendard',sans-serif)" font-size="${fsTop}" font-weight="600" fill="var(--accent)" letter-spacing="1.2">
    <textPath href="#clbd-arc-top" startOffset="50%" text-anchor="middle">${arcTop}</textPath>
  </text>` : ''}
  <!-- 하단 호 텍스트 (외곽 링 하단) -->
  ${arcBottom ? `<text font-family="var(--font-body,'Pretendard',sans-serif)" font-size="${fsBot}" font-weight="600" fill="var(--accent)" letter-spacing="1">
    <textPath href="#clbd-arc-bot" startOffset="50%" text-anchor="middle">${arcBottom}</textPath>
  </text>` : ''}
  <!-- 중심 핵심 값 -->
  ${val ? `<text x="90" y="${val.length > 3 ? '95' : '98'}" text-anchor="middle" dominant-baseline="middle"
    font-family="var(--font-display,'Pretendard',sans-serif)" font-size="${fsVal}"
    font-weight="800" fill="#fff">${val}</text>` : ''}
</svg>`
}

export const certListBadges = defineBlock<Data>({
  id: 'cert-list-badges',
  archetype: 'cert',
  styleTags: ['light', 'clean', 'trust', 'noimg-safe'],
  imageSlots: 3,
  describe:
    '인증 3행 리스트 + 동심원 뱃지 오버랩. 각 행: 좌측 인증서 사진 + 우측 인증명·설명·인증번호, 사진 좌하단에 동심원 뱃지(흰 외링·스트로크 중링·액센트 내원+호 텍스트+중심값)가 오버랩. 유해성분 불검출·피부자극·경구독성 등 다항목 안전 인증 어필에 적합. 라이트 배경.',
  schema,
  css: `
/* ── 섹션 래퍼 ── */
.clbd{background:var(--bg);padding:64px var(--pad-x,56px) 72px;color:var(--ink)}

/* ── 헤더 ── */
.clbd-hd{text-align:center;margin-bottom:52px}
.clbd-eyebrow{display:inline-block;font-size:15px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:18px}
.clbd-title{font-size:clamp(28px,3.6vw,40px);font-weight:700;line-height:1.3;color:var(--ink);word-break:keep-all}
.clbd-title .em{color:var(--accent)}

/* ── 리스트 ── */
.clbd-list{display:flex;flex-direction:column;gap:40px}

/* ── 행 ── */
.clbd-row{display:flex;align-items:center;gap:36px;padding:28px 24px;background:var(--paper);border-radius:calc(var(--r-scale,1)*16px);box-shadow:0 6px 24px -8px rgba(0,0,0,.09)}

/* ── 사진 프레임 ── */
.clbd-photo-wrap{position:relative;flex:0 0 260px;width:260px}
.clbd-photo{width:260px;height:200px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px));display:block}
.clbd-photo.ph{height:200px;background:color-mix(in srgb,var(--accent) 8%,transparent)}

/* ── 동심원 뱃지 ── */
.clbd-badge{position:absolute;left:-44px;bottom:-44px;width:130px;height:130px;pointer-events:none}
.clbd-badge-svg{width:100%;height:100%;filter:drop-shadow(0 3px 8px rgba(0,0,0,.16))}

/* ── 텍스트 블록 ── */
.clbd-body{flex:1;min-width:0;padding-left:8px}
.clbd-heading{font-size:clamp(18px,2.2vw,24px);font-weight:700;color:var(--ink);line-height:1.35;margin-bottom:12px}
.clbd-heading .em{color:var(--accent)}
.clbd-body-text{font-size:clamp(14px,1.6vw,16px);color:var(--ink-2);line-height:1.75;margin-bottom:10px;word-break:keep-all}
.clbd-body-text .em{color:var(--accent);font-weight:700}
.clbd-cert-num{font-size:13px;color:var(--muted);font-weight:400;letter-spacing:.04em}

/* ── noimg 강등: 사진 영역 없애고 텍스트만 ── */
.clbd-row--noimg{padding-left:36px}
.clbd-row--noimg .clbd-body{padding-left:0}
`,
  render: (d, { esc, richSafe }) => {
    // 전 행에 이미지가 있을 때만 사진+뱃지 레이아웃 사용 (하나라도 없으면 텍스트 전용으로 강등)
    const withImgs = d.items.every((it) => typeof it.image === 'string' && it.image.length > 0)

    const rows = d.items
      .map((it) => {
        const arcTop = it.badgeArcTop ?? ''
        const arcBottom = it.badgeArcBottom ?? ''
        const val = it.badgeValue ?? ''
        const showBadge = withImgs && (arcTop || arcBottom || val)

        const photoBlock = withImgs
          ? `<div class="clbd-photo-wrap">
          ${media(it.image, 'clbd-photo', esc(it.heading))}
          ${showBadge ? `<div class="clbd-badge">${concentric(esc(arcTop), esc(arcBottom), esc(val))}</div>` : ''}
        </div>`
          : ''

        return `<div class="clbd-row${withImgs ? '' : ' clbd-row--noimg'}">
        ${photoBlock}
        <div class="clbd-body">
          <p class="clbd-heading">${richSafe(it.heading)}</p>
          <p class="clbd-body-text">${richSafe(it.body)}</p>
          ${it.certNumber ? `<p class="clbd-cert-num">${esc(it.certNumber)}</p>` : ''}
        </div>
      </div>`
      })
      .join('\n      ')

    return `
<section class="clbd">
  <div class="clbd-hd">
    ${d.eyebrow ? `<span class="clbd-eyebrow">${esc(d.eyebrow)}</span>` : ''}
    <h2 class="clbd-title">${richSafe(d.title)}</h2>
  </div>
  <div class="clbd-list">
    ${rows}
  </div>
</section>`
  },
})
