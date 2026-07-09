/** CERT 아키타입: cert-orbit-ring
 *  피그마 226_제품특징_13 흡수 — 그라디언트 박스 키워드 타이틀 + 원형 링 배경에 제품 사진 센터 배치 +
 *  5개 인증 체크 레이블 방사형 분산(오비트 구성). 이미지 부재 시 링만 남는 강등 렌더(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const certSchema = z.object({
  /** 제품 카테고리/소재 키워드 (예: "고함량 퓨어 비타민C") — 그라디언트 박스 위 타이틀 */
  keyword: z.string().min(1),
  /** 제품명 — 그라디언트 박스 내부 흰 텍스트 (em 허용) */
  name: z.string().min(1),
  /** 핵심 부제 카피 (예: "2주 만에 경험하는 투명 광채 피부") */
  tagline: z.string().optional(),
  /** 제품 사진 URL — 없으면 링만 렌더(noimg-safe) */
  image: z.string().optional(),
  /** 인증 레이블 3~6개. label=짧은 인증명, icon(optional)=아이콘 이름 */
  certs: z
    .array(
      z.object({
        label: z.string().min(1),
        icon: z.string().optional(), // ICON_NAMES 중 하나, 기본 'check'
      }),
    )
    .min(3)
    .max(6),
})
type CertOrbitData = z.infer<typeof certSchema>

/** 방사형 각도 프리셋 — 배지 수(3~6)별로 상단 중심에서 시계 방향 배치
 *  원점(0°)=12시, 시계방향 증가. 뱃지는 오비트 링 바깥에 살짝 걸쳐 배치. */
const ANGLE_PRESETS: Record<number, number[]> = {
  3: [-30, 90, 210],
  4: [-45, 45, 135, 225],
  5: [-72, 0, 72, 144, 216],
  6: [-60, 0, 60, 120, 180, 240],
}

export const certOrbitRing = defineBlock<CertOrbitData>({
  id: 'cert-orbit-ring',
  archetype: 'cert',
  styleTags: ['light', 'orbital', 'beauty', 'premium', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '인증 오비트 블록. 그라디언트 강조 박스 키워드 타이틀 + 원형 링 위에 제품 사진 센터 배치 + 3~6개 인증 뱃지 방사형 분산. 뷰티/식품 신뢰 구간 섹션. 이미지 없이도 링+뱃지만으로 렌더 가능.',
  schema: certSchema,
  css: `
.ctil{position:relative;padding:64px var(--pad-x,56px) 72px;background:var(--bg);text-align:center;overflow:hidden}

/* ── 타이틀 영역 ── */
.ctil-kw{font-family:var(--font-display);font-weight:600;font-size:clamp(28px,3.6vw,44px);color:var(--ink);letter-spacing:-.02em;line-height:1.15}
.ctil-namebox{position:relative;display:inline-block;margin-top:10px;padding:14px 40px 16px;border-radius:calc(var(--r-scale,1)*14px);background:linear-gradient(120deg,var(--accent-d),var(--accent));overflow:hidden}
.ctil-namebox::before{content:'';position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.08) 0%,rgba(255,255,255,0) 60%);pointer-events:none}
.ctil-name{font-family:var(--font-display);font-weight:800;font-size:clamp(32px,4.2vw,52px);color:#fff;letter-spacing:-.02em;line-height:1.18;position:relative}
.ctil-name .em{color:rgba(255,255,255,.85);font-weight:800}
.ctil-tagline{margin-top:18px;font-size:clamp(15px,1.6vw,19px);font-weight:400;color:var(--ink-2);line-height:1.6}

/* ── 오비트 영역 ── */
.ctil-orbit-wrap{position:relative;width:520px;height:520px;margin:44px auto 0;overflow:visible}

/* 원형 링 SVG */
.ctil-ring{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}

/* 제품 사진 — 링 중앙에 원형 마스크로 배치 */
.ctil-photo-frame{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:52%;height:52%;border-radius:50%;overflow:hidden;background:color-mix(in srgb,var(--accent) 6%,var(--paper))}
.ctil-photo-frame img,.ctil-photo-frame .ph{width:100%;height:100%;object-fit:cover}
/* noimg-safe: 이미지 없으면 사진 프레임을 숨기고 링만 표시 */
.ctil-photo-frame:has(.ph){display:none}

/* 인증 뱃지 — JS 없이 CSS custom property + 인라인 style로 위치 */
.ctil-badge{position:absolute;display:flex;flex-direction:column;align-items:center;gap:5px;transform:translate(-50%,-50%);width:max-content;max-width:88px;text-align:center}
.ctil-badge-icon{width:28px;height:28px;color:var(--accent);flex-shrink:0}
.ctil-badge-icon svg{width:100%;height:100%}
.ctil-badge-label{font-family:var(--font-display);font-weight:700;font-size:12px;line-height:1.3;color:var(--accent-d);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:88px}
`,
  render: (d, { esc, richSafe, icon }) => {
    const count = Math.min(Math.max(d.certs.length, 3), 6)
    const angles = ANGLE_PRESETS[count] ?? ANGLE_PRESETS[5]

    // 오비트 반지름(px, 260px = 520/2 wrap 기준). 뱃지 중심 = 링 위(r=50%)
    const R = 50 // % 기준
    const badges = d.certs
      .slice(0, count)
      .map((c, i) => {
        const deg = angles[i] ?? i * (360 / count) - 90
        const rad = ((deg - 90) * Math.PI) / 180
        const cx = 50 + R * Math.cos(rad)
        const cy = 50 + R * Math.sin(rad)
        const iconName = c.icon && c.icon.length > 0 ? c.icon : 'check'
        return `<div class="ctil-badge" style="left:${cx.toFixed(2)}%;top:${cy.toFixed(2)}%;">
  <span class="ctil-badge-icon">${icon(iconName)}</span>
  <span class="ctil-badge-label">${esc(c.label)}</span>
</div>`
      })
      .join('\n')

    return `
<section class="ctil">
  <div class="wm"></div>

  <p class="ctil-kw">${esc(d.keyword)}</p>
  <div class="ctil-namebox">
    <span class="ctil-name">${richSafe(d.name)}</span>
  </div>
  ${d.tagline ? `<p class="ctil-tagline">${esc(d.tagline)}</p>` : ''}

  <div class="ctil-orbit-wrap">
    <svg class="ctil-ring" viewBox="0 0 520 520" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <!-- 외곽 링 -->
      <circle cx="260" cy="260" r="246" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="6 5" opacity=".35"/>
      <!-- 내부 링 (뱃지 앵커 라인) -->
      <circle cx="260" cy="260" r="220" stroke="var(--accent)" stroke-width="2" opacity=".55"/>
      <!-- 장식 점 (12시 방향) -->
      <circle cx="260" cy="40" r="5" fill="var(--accent)" opacity=".7"/>
    </svg>

    <div class="ctil-photo-frame">${media(d.image, '', '제품 사진')}</div>

    ${badges}
  </div>
</section>`
  },
})
