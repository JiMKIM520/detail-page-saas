/** SHIPPING 아키타입: shipping-coldchain-steps
 *  원본: 350_배송교환반품_12.json
 *  구조: 라운드 배지 + 대형 타이틀 + 큰 라운드 제품사진 → STEP 원형 배지(amber)·세로선 연결 4단계 프로세스 리스트 → 크림 경고 강조박스
 *  톤: light / 접두: sbis */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  badge: z.string().min(1),                          // 상단 라운드 배지 레이블 (순수 텍스트)
  title: z.string().min(1),                          // 대형 타이틀 (em,br 허용)
  subtitle: z.string().optional(),                   // 타이틀 아래 보조 한 줄
  image: z.string().optional(),                      // 제품 대표 사진 (url)
  steps: z
    .array(
      z.object({
        label: z.string().min(1),                    // 단계 제목 (em 허용)
        text: z.string().min(1),                     // 단계 설명 (순수 텍스트)
      }),
    )
    .min(2)
    .max(6),
  guarantee: z.string().optional(),                  // 하단 보증 강조 문구 (em,br 허용) — 브리프 근거 시만
  guaranteeIcon: z.boolean().optional(),             // 하단 박스에 아이콘 뱃지 표시 여부
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const shippingColdchainSteps = defineBlock<Data>({
  id: 'shipping-coldchain-steps',
  archetype: 'shipping',
  styleTags: ['light', 'warm', 'food', 'process', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '콜드체인·배송 프로세스 블록. 상단 컬러 라운드 배지 + 대형 타이틀 + 큰 라운드 제품사진(이미지 없으면 생략) → amber 원형 STEP 번호 배지와 세로선으로 연결된 2~6단계 세로 프로세스 리스트 → 크림 경고/보증 강조박스. 식품 신선 배송·온도 관리·당일 출고 흐름에 적합.',
  schema,
  css: `
.sbis{background:var(--bg);padding:64px var(--pad-x,56px) 72px;color:var(--ink)}

/* ── 헤더 영역 ── */
.sbis-hd{text-align:center;margin-bottom:36px}
.sbis-badge{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:500;font-size:22px;line-height:1;padding:13px 32px;border-radius:999px;margin-bottom:22px;letter-spacing:.01em}
.sbis-title{font-family:var(--font-display);font-weight:700;font-size:52px;line-height:1.18;color:var(--accent-d);letter-spacing:-.02em;margin-bottom:12px}
.sbis-title .em{color:var(--accent)}
.sbis-sub{font-size:20px;font-weight:500;color:var(--ink-2)}

/* ── 제품 사진 ── */
.sbis-photo-wrap{margin:0 auto 48px;width:100%}
.sbis-photo{width:100%;aspect-ratio:740/800;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*40px));display:block}

/* ── 스텝 리스트 ── */
.sbis-steps{position:relative;display:flex;flex-direction:column;gap:0}
/* 세로 연결선: 첫 배지 중심~마지막 배지 중심 */
.sbis-steps::before{content:'';position:absolute;left:54px;top:55px;bottom:55px;width:2px;background:color-mix(in srgb,var(--accent) 28%,transparent);pointer-events:none}
.sbis-step{display:flex;align-items:flex-start;gap:24px;padding:16px 0;position:relative;z-index:1}
.sbis-num{flex:0 0 110px;width:110px;height:110px;border-radius:50%;background:#ffd153;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;box-shadow:0 6px 18px -8px rgba(93,61,9,.35)}
.sbis-num-step{font-family:var(--font-display);font-weight:600;font-size:17px;color:#3d2009;line-height:1;letter-spacing:.04em;text-transform:uppercase}
.sbis-num-n{font-family:var(--font-display);font-weight:700;font-size:32px;color:#3d2009;line-height:1.1}
.sbis-body{flex:1;padding-top:14px}
.sbis-step-label{font-size:24px;font-weight:700;color:var(--ink);line-height:1.35;margin-bottom:6px}
.sbis-step-label .em{color:var(--accent-d)}
.sbis-step-text{font-size:18px;color:var(--ink-2);line-height:1.6}

/* ── 보증 강조박스 ── */
.sbis-guarantee{margin-top:44px;background:#ffe08b;border-radius:calc(var(--r-scale,1)*14px);padding:32px 36px 32px 32px;display:flex;align-items:flex-start;gap:18px}
.sbis-gicon{flex:0 0 44px;width:44px;height:44px;color:#563613;opacity:.85}
.sbis-gtext{font-size:20px;font-weight:500;color:#563613;line-height:1.65;text-align:left}
.sbis-gtext .em{font-weight:800;color:#3d2009}
`,
  render: (d, { esc, richSafe, icon }) => {
    const hasImage = typeof d.image === 'string' && d.image.length > 0

    const stepsHtml = d.steps
      .map(
        (s, i) => `
    <div class="sbis-step">
      <div class="sbis-num" aria-label="STEP ${pad2(i + 1)}">
        <span class="sbis-num-step">step</span>
        <span class="sbis-num-n">${pad2(i + 1)}</span>
      </div>
      <div class="sbis-body">
        <div class="sbis-step-label">${richSafe(s.label)}</div>
        <div class="sbis-step-text">${esc(s.text)}</div>
      </div>
    </div>`,
      )
      .join('')

    const guaranteeHtml = d.guarantee
      ? `
    <div class="sbis-guarantee" role="note">
      ${d.guaranteeIcon !== false ? `<span class="sbis-gicon">${icon('shield')}</span>` : ''}
      <p class="sbis-gtext">${richSafe(d.guarantee)}</p>
    </div>`
      : ''

    return `
<section class="sbis">
  <div class="sbis-hd">
    <div class="sbis-badge">${esc(d.badge)}</div>
    <h2 class="sbis-title disp">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="sbis-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  ${hasImage ? `<div class="sbis-photo-wrap">${media(d.image, 'sbis-photo', '배송 제품 사진')}</div>` : ''}
  <div class="sbis-steps">
    ${stepsHtml}
  </div>
  ${guaranteeHtml}
</section>`
  },
})
