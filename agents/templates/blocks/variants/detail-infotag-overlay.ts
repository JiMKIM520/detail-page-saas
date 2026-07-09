/** DETAIL 아키타입: detail-infotag-overlay
 *  원본: 183_제품정보_06 (제품정보/06)
 *  라운드 배지 서브타이틀 + 구분선 + 대형 헤드라인 + 설명 → 전체폭 제품 이미지 위
 *  6개 검정 레이블 태그를 SVG 라인으로 연결한 인포그래픽 오버레이.
 *  noimg-safe: 이미지 없을 때 태그를 그리드로 강등 렌더. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const tagSchema = z.object({
  label: z.string().min(1),
  /** 태그의 앵커 위치: 0~100 % 단위 (left, top). 이미지 위 절대 배치용. */
  left: z.number().min(0).max(100).default(50),
  top: z.number().min(0).max(100).default(50),
  /** 태그에서 라인이 뻗어나가는 방향: 'left' | 'right'. 기본 'right'. */
  lineDir: z.enum(['left', 'right']).default('right'),
})

const schema = z.object({
  badge: z.string().optional(),       // 라운드 배지 텍스트 (순수 텍스트)
  title: z.string().min(1),           // 대형 헤드라인 (em,br)
  desc: z.string().optional(),        // 본문 설명 (em,br)
  image: z.string().optional(),       // 제품 사진 (url)
  tags: z.array(tagSchema).min(2).max(6),  // 인포그래픽 레이블 태그 (2~6개)
})
type Data = z.infer<typeof schema>

export const detailInfotagOverlay = defineBlock<Data>({
  id: 'detail-infotag-overlay',
  archetype: 'detail',
  styleTags: ['light', 'editorial', 'infographic', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '제품 이미지 위 인포그래픽 태그 오버레이. 라운드 배지 서브타이틀 + 구분선 + 대형 헤드라인 + 전체폭 사진에 검정 레이블 태그 2~6개를 SVG 라인으로 연결. 이미지 없으면 태그를 그리드 리스트로 강등. 제품 부위별 특징 직접 표기(캐리어·가전·뷰티 기기 등).',
  schema,
  css: `
/* ── 섹션 래퍼 ─────────────────────────────────────────────── */
.dezc{background:var(--bg);padding-bottom:64px}

/* ── 타이틀 영역 ────────────────────────────────────────────── */
.dezc-hd{padding:56px var(--pad-x,56px) 48px;text-align:center}
.dezc-badge-wrap{display:inline-block;border:2px solid var(--ink);border-radius:999px;padding:10px 32px;margin-bottom:20px}
.dezc-badge{font-family:var(--font-display);font-size:18px;font-weight:600;color:var(--ink);letter-spacing:.04em}
.dezc-rule{width:100%;height:1px;background:var(--line);margin-bottom:28px;border:none}
.dezc-title{font-family:var(--font-display);font-weight:800;font-size:clamp(36px,5.5vw,64px);line-height:1.18;color:var(--ink);letter-spacing:-.02em}
.dezc-title .em{color:var(--accent-d)}
.dezc-desc{margin-top:18px;font-size:clamp(15px,1.8vw,20px);font-weight:400;color:var(--ink-2);line-height:1.7;max-width:680px;margin-left:auto;margin-right:auto}
.dezc-desc .em{color:var(--accent-d);font-weight:700}

/* ── 사진 오버레이 영역 ─────────────────────────────────────── */
.dezc-photo-zone{position:relative;width:100%;user-select:none}
.dezc-img-wrap{position:relative;width:100%;aspect-ratio:860/645}
.dezc-img-wrap img,.dezc-img-wrap .ph{width:100%;height:100%;object-fit:cover;border-radius:var(--shape-photo,0)}
/* 이미지 위 SVG 레이어 (라인) */
.dezc-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
/* 개별 태그 절대 배치 */
.dezc-tag-abs{position:absolute;transform:translate(-50%,-50%)}
.dezc-tag{display:inline-block;background:var(--ink);color:#fff;font-family:var(--font-body),'Pretendard',sans-serif;font-size:clamp(12px,1.5vw,16px);font-weight:500;line-height:1;padding:9px 18px;border-radius:calc(var(--r-scale,1)*4px);white-space:nowrap;letter-spacing:.01em}

/* ── noimg-safe 강등 레이아웃 (이미지 없을 때) ─────────────── */
.dezc-tag-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px 20px;padding:0 var(--pad-x,56px)}
.dezc-tag-grid-item{display:flex;align-items:center;gap:12px;background:var(--paper);border-radius:calc(var(--r-scale,1)*10px);padding:16px 20px}
.dezc-tag-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);flex-shrink:0}
.dezc-tag-text{font-size:15px;font-weight:600;color:var(--ink)}
`,
  render: (d, { esc, richSafe }) => {
    // 이미지 존재 여부로 풀 오버레이 vs 그리드 강등 분기
    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())

    // 태그별 SVG 라인: 태그 중심에서 이미지 방향으로 짧은 선 + 수평 연결선
    // lineDir='right' → 태그 오른쪽 끝에서 오른쪽으로, 'left' → 왼쪽으로
    // 라인 길이는 CSS % 기반 absolute — SVG viewBox 100×100 단위로 맞춤
    const svgLines = hasImg
      ? d.tags
          .map((t) => {
            const lx = t.left
            const ly = t.top
            // 화살표 없는 단순 2-세그먼트 꺾임선 (L자형)
            // 태그 중심 → 수직 30px(%) 이동 → 이미지 에지 방향으로 수평
            const dx = t.lineDir === 'right' ? 8 : -8  // 수평 돌출 길이 (% 단위)
            const midX = lx + dx * 0.5
            return `<polyline points="${lx},${ly} ${midX},${ly}" stroke="#fff" stroke-width="0.8" stroke-dasharray="none" fill="none" opacity="0.9"/>
<polyline points="${lx},${ly} ${midX},${ly}" stroke="#111" stroke-width="0.5" fill="none" opacity="0.6"/>`
          })
          .join('\n')
      : ''

    const overlayTags = hasImg
      ? d.tags
          .map(
            (t) => `
<div class="dezc-tag-abs" style="left:${t.left}%;top:${t.top}%">
  <span class="dezc-tag">${esc(t.label)}</span>
</div>`,
          )
          .join('')
      : ''

    const gridTags = !hasImg
      ? d.tags
          .map(
            (t) => `
<div class="dezc-tag-grid-item">
  <span class="dezc-tag-dot"></span>
  <span class="dezc-tag-text">${esc(t.label)}</span>
</div>`,
          )
          .join('')
      : ''

    return `
<section class="dezc">
  <div class="dezc-hd">
    ${d.badge ? `<div class="dezc-badge-wrap"><span class="dezc-badge">${esc(d.badge)}</span></div>` : ''}
    <hr class="dezc-rule">
    <h2 class="dezc-title">${richSafe(d.title)}</h2>
    ${d.desc ? `<p class="dezc-desc">${richSafe(d.desc)}</p>` : ''}
  </div>

  ${
    hasImg
      ? `<div class="dezc-photo-zone">
    <div class="dezc-img-wrap">
      ${media(d.image, '', '제품 이미지')}
      <svg class="dezc-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        ${svgLines}
      </svg>
      ${overlayTags}
    </div>
  </div>`
      : `<div class="dezc-tag-grid">${gridTags}
  </div>`
  }
</section>`
  },
})
