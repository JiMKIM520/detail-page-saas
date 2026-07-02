/** STATS 아키타입(템플릿 충실 재현): stats-satisfaction-bars.
 *  [끝판왕] 포인트 구성 #28 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 웜 베이지 배경 + 대형 선언형 헤드라인 + 중앙 제품 이미지
 *  + 레이블·진행바·퍼센트 수치 행 반복(satisfaction-bar-row) + 식물 장식 오버레이. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, attr } from '../shared'

const schema = z.object({
  /** 대형 선언형 헤드라인 — em으로 강조 어절, br 허용 */
  title: z.string().min(1),
  /** 보조 서브카피 (선택) */
  subtitle: z.string().optional(),
  /** 중앙 제품 이미지 URL (선택 — 없으면 placeholder) */
  image: z.string().optional(),
  /** 이미지 alt 텍스트 */
  imageAlt: z.string().optional(),
  /** 만족도 바 행 (2~5개) */
  bars: z
    .array(
      z.object({
        /** 항목 레이블 ([제품명] 수분감 만족도 등, br·em 허용) */
        label: z.string().min(1),
        /** 진행률 0~100 (표시용 수치; 바 너비에 반영) */
        value: z.number().int().min(0).max(100),
        /** 표시할 텍스트 (기본 `${value}%`; 예 "100%", "4.9/5") */
        display: z.string().optional(),
      }),
    )
    .min(2)
    .max(5),
  /** 하단 보조 문구 (선택, em 허용) */
  caption: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const statsSatisfactionBars = defineBlock<Data>({
  id: 'stats-satisfaction-bars',
  archetype: 'stats',
  styleTags: ['warm', 'nature', 'satisfaction', 'bar-chart', 'stats', 'template'],
  imageSlots: 1,
  describe:
    '고객 만족도 바 차트. 웜 베이지 배경 + 선언형 대형 헤드라인(em 강조) + 중앙 제품 이미지 + 레이블·채움 진행바·퍼센트 수치 행 반복(2~5개) + 식물 장식 오버레이. 뷰티·식품 리뷰/신뢰 섹션.',
  schema,
  css: `
/* stats-satisfaction-bars — 접두사 ssb- */
.ssb{position:relative;background:var(--paper);padding:60px 40px 64px;overflow:hidden;word-break:keep-all;overflow-wrap:break-word}

/* ── 식물 장식 오버레이 (인라인 SVG 근사; 픽셀 클론 아님) ── */
.ssb-deco{position:absolute;pointer-events:none;z-index:0}
.ssb-deco-tr{top:-18px;right:-24px;width:180px;height:200px;opacity:.55}
.ssb-deco-bl{bottom:-12px;left:-20px;width:140px;height:160px;opacity:.45;transform:scaleX(-1) rotate(-20deg)}

/* ── 헤드라인 ── */
.ssb-hd{position:relative;z-index:1;text-align:center;margin-bottom:32px}
.ssb-title{font-family:var(--font-display);font-weight:800;font-size:clamp(28px,7vw,44px);line-height:1.22;letter-spacing:-.02em;color:var(--ink)}
.ssb-title .em{color:var(--accent-d)}
.ssb-sub{margin-top:10px;font-family:var(--font-body);font-size:15px;color:var(--muted);line-height:1.6}

/* ── 제품 이미지 ── */
.ssb-fig{position:relative;z-index:1;margin:0 auto 34px;width:220px;height:260px;border-radius:12px;overflow:hidden}
.ssb-img{width:100%;height:100%;object-fit:cover;display:block;border-radius:12px}
.ssb-img.ph{width:100%;height:100%;border-radius:12px}

/* ── 만족도 바 목록 ── */
.ssb-bars{position:relative;z-index:1;display:flex;flex-direction:column;gap:18px}

/* 단일 행 */
.ssb-row{display:flex;flex-direction:column;gap:6px}
.ssb-row-top{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.ssb-label{font-family:var(--font-body);font-size:14px;font-weight:600;color:var(--ink);line-height:1.4;flex:1}
.ssb-label .em{color:var(--accent-d);font-weight:700}
.ssb-pct{font-family:var(--font-display);font-weight:800;font-size:18px;color:var(--accent-d);white-space:nowrap;flex-shrink:0}

/* 진행바 트랙 */
.ssb-track{width:100%;height:10px;background:var(--line);border-radius:999px;overflow:hidden}
.ssb-fill{height:100%;border-radius:999px;background:var(--accent-d);transition:width .4s cubic-bezier(.4,0,.2,1)}

/* ── 하단 캡션 ── */
.ssb-caption{position:relative;z-index:1;margin-top:28px;text-align:center;font-family:var(--font-body);font-size:13px;color:var(--muted);line-height:1.6}
.ssb-caption .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    /* 식물 장식 SVG — 픽셀 클론 금지, 유칼립투스 가지 근사 패턴 */
    const leafSvgTR = `<svg class="ssb-deco ssb-deco-tr" viewBox="0 0 180 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M160 10 Q130 60 100 90 Q70 120 40 170" stroke="var(--accent-d)" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".5"/>
  <ellipse cx="152" cy="22" rx="22" ry="12" fill="var(--accent-d)" opacity=".22" transform="rotate(-30 152 22)"/>
  <ellipse cx="138" cy="44" rx="20" ry="10" fill="var(--accent-d)" opacity=".2" transform="rotate(-20 138 44)"/>
  <ellipse cx="120" cy="66" rx="22" ry="11" fill="var(--accent-d)" opacity=".18" transform="rotate(-15 120 66)"/>
  <ellipse cx="100" cy="90" rx="20" ry="10" fill="var(--accent-d)" opacity=".16" transform="rotate(-10 100 90)"/>
  <ellipse cx="82" cy="112" rx="18" ry="9" fill="var(--accent-d)" opacity=".14" transform="rotate(-5 82 112)"/>
  <ellipse cx="60" cy="136" rx="17" ry="8" fill="var(--accent-d)" opacity=".12" transform="rotate(5 60 136)"/>
</svg>`

    const leafSvgBL = `<svg class="ssb-deco ssb-deco-bl" viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M20 150 Q50 110 80 80 Q110 50 130 10" stroke="var(--accent-d)" stroke-width="2" stroke-linecap="round" fill="none" opacity=".45"/>
  <ellipse cx="30" cy="138" rx="18" ry="10" fill="var(--accent-d)" opacity=".18" transform="rotate(30 30 138)"/>
  <ellipse cx="50" cy="118" rx="18" ry="9" fill="var(--accent-d)" opacity=".16" transform="rotate(20 50 118)"/>
  <ellipse cx="70" cy="98" rx="17" ry="9" fill="var(--accent-d)" opacity=".14" transform="rotate(12 70 98)"/>
  <ellipse cx="90" cy="72" rx="16" ry="8" fill="var(--accent-d)" opacity=".12" transform="rotate(5 90 72)"/>
</svg>`

    const bars = d.bars
      .map((b) => {
        const displayText = esc(b.display ?? `${b.value}%`)
        const fillWidth = Math.min(100, Math.max(0, b.value))
        return `
    <div class="ssb-row">
      <div class="ssb-row-top">
        <span class="ssb-label">${richSafe(b.label)}</span>
        <span class="ssb-pct">${displayText}</span>
      </div>
      <div class="ssb-track">
        <div class="ssb-fill" style="width:${fillWidth}%"></div>
      </div>
    </div>`
      })
      .join('')

    const imgHtml = d.image
      ? `<img class="ssb-img" src="${attr(d.image)}" alt="${attr(d.imageAlt ?? '제품 이미지')}">`
      : `<div class="ssb-img ph">${esc(d.imageAlt ?? '제품 이미지')}</div>`

    return `
<section class="ssb">
  ${leafSvgTR}
  ${leafSvgBL}
  <div class="ssb-hd">
    <h2 class="ssb-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="ssb-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="ssb-fig">
    ${imgHtml}
  </div>
  <div class="ssb-bars">
    ${bars}
  </div>
  ${d.caption ? `<p class="ssb-caption">${richSafe(d.caption)}</p>` : ''}
</section>`
  },
})
