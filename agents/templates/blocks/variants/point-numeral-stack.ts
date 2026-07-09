/** POINT 아키타입: point-numeral-stack.
 *  피그마 126_포인트_03 흡수 — 번호형 포인트 3섹션 수직 적층 재구성.
 *  각 섹션: 대형 액센트 넘버 + 소제목 + 굵은 헤드라인 + 설명 → 2장 오프셋 스택 사진
 *  → 브랜드 배경 위 frosted-pill 체크리스트 → 전체 너비 3열 스탯 배너.
 *  noimg-safe: 이미지 전무 시 사진 프레임 패널을 숨겨 레이아웃 붕괴 없음. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/* ── 섹션 1개 스키마 ── */
const sectionSchema = z.object({
  number: z.string().min(1),               // "01" / "02" / "03" — 대형 표시
  kicker: z.string().min(1),               // 소제목 한 줄 (em 허용)
  headline: z.string().min(1),             // 2줄 굵은 헤드라인 (em,br)
  desc: z.string().optional(),             // 헤드라인 아래 muted 설명 (순수 텍스트)
  imageA: z.string().optional(),           // 첫 번째 오프셋 사진 (url)
  imageB: z.string().optional(),           // 두 번째 오프셋 사진 (url, 반대 방향 오프셋)
  pills: z                                 // frosted-pill 체크리스트 (2~4개)
    .array(z.string().min(1))
    .min(2)
    .max(4),
  stats: z                                 // 하단 3열 스탯 배너 (정확히 3개)
    .array(
      z.object({
        value: z.string().min(1),          // 수치 강조 (예: "60분")
        label: z.string().min(1),          // 수치 설명 (예: "연속 사용")
      }),
    )
    .length(3),
})

const schema = z.object({
  sections: z.array(sectionSchema).min(1).max(3),
})
type Data = z.infer<typeof schema>

export const pointNumeralStack = defineBlock<Data>({
  id: 'point-numeral-stack',
  archetype: 'point',
  styleTags: ['light', 'structured', 'longform', 'noimg-safe'],
  imageSlots: 6,   // 최대 3섹션 × 사진 2장
  describe:
    '번호형 포인트 1~3섹션 수직 적층. 각 섹션: 대형 액센트 순번(01/02/03) + 소제목 + 굵은 헤드라인 + 2장 오프셋 스택 사진 + 브랜드 배경 frosted-pill 체크리스트 + 전폭 3열 스탯 배너. 전자제품·가전·생활용품 멀티포인트 롱폼에 적합.',
  schema,
  css: `
.pns{background:var(--bg);color:var(--ink)}
.pns-section{background:var(--bg);padding-bottom:0}
/* ── 타이틀 영역 ── */
.pns-hd{padding:64px var(--pad-x,56px) 0;text-align:center}
.pns-num{font-family:var(--font-display);font-weight:500;font-size:clamp(72px,12vw,120px);color:var(--accent);line-height:1;letter-spacing:-.04em;margin-bottom:8px}
.pns-kicker{font-family:var(--font-body);font-weight:500;font-size:18px;color:var(--ink-2);margin-bottom:10px}
.pns-kicker .em{color:var(--accent);font-weight:700}
.pns-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(36px,6vw,60px);color:var(--ink);line-height:1.18;letter-spacing:-.03em;margin-bottom:14px}
.pns-headline .em{color:var(--accent)}
.pns-desc{font-size:16px;color:var(--muted);font-weight:500;line-height:1.6}
/* ── 오프셋 스택 사진 ── */
.pns-photos{position:relative;padding:36px var(--pad-x,56px) 0;display:flex;flex-direction:column;gap:0}
.pns-img-a{width:100%;aspect-ratio:16/9;border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,transparent)}
.pns-img-a img,.pns-img-a .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
.pns-img-b{width:100%;aspect-ratio:16/9;border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));overflow:hidden;background:color-mix(in srgb,var(--accent) 6%,transparent);margin-top:10px;transform:translateX(16px)}
.pns-img-b img,.pns-img-b .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
/* noimg-safe: 둘 다 없으면 사진 래퍼 숨김 */
.pns-photos.no-img{display:none}
/* ── frosted-pill 체크리스트 ── */
.pns-feat{background:var(--brand);padding:40px var(--pad-x,56px) 36px;margin-top:24px}
.pns-feat .em{color:var(--em-dark,#FFF7EA)}
.pns-feat-title{font-family:var(--font-display);font-weight:800;font-size:clamp(24px,4.5vw,42px);color:#fff;line-height:1.25;margin-bottom:24px;letter-spacing:-.025em}
.pns-pills{display:flex;flex-direction:column;gap:10px}
.pns-pill{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.16);backdrop-filter:blur(4px);border-radius:999px;padding:10px 20px;max-width:100%}
.pns-pill-check{width:22px;height:22px;flex-shrink:0;color:var(--accent)}
.pns-pill-check svg{width:100%;height:100%;stroke:var(--accent)}
.pns-pill-text{font-size:16px;font-weight:600;color:#fff;line-height:1.4;word-break:keep-all}
/* ── 3열 스탯 배너 ── */
.pns-banner{background:var(--accent);padding:28px 0;display:grid;grid-template-columns:1fr 1fr 1fr;position:relative}
.pns-banner-cell{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px 12px;position:relative}
.pns-banner-cell+.pns-banner-cell::before{content:'';position:absolute;left:0;top:20%;height:60%;width:1px;background:rgba(255,255,255,0.35)}
.pns-bval{font-family:var(--font-display);font-weight:800;font-size:clamp(20px,3.5vw,32px);color:#fff;line-height:1.1;text-align:center}
.pns-blbl{font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);text-align:center;line-height:1.35}
/* ── 섹션 구분선 ── */
.pns-sep{height:1px;background:var(--line);margin:0 var(--pad-x,56px)}
`,
  render: (d, { esc, richSafe, icon }) => {
    const sections = d.sections
      .map((s, idx) => {
        const hasImgA = typeof s.imageA === 'string' && s.imageA.length > 0
        const hasImgB = typeof s.imageB === 'string' && s.imageB.length > 0
        const noImg = !hasImgA && !hasImgB

        const photoBlock = `
<div class="pns-photos${noImg ? ' no-img' : ''}">
  <div class="pns-img-a">${media(s.imageA, '', '포인트 이미지 A')}</div>
  <div class="pns-img-b">${media(s.imageB, '', '포인트 이미지 B')}</div>
</div>`

        const pillsHtml = s.pills
          .map(
            (p) => `
      <div class="pns-pill">
        <span class="pns-pill-check">${icon('check')}</span>
        <span class="pns-pill-text">${esc(p)}</span>
      </div>`,
          )
          .join('')

        const statsHtml = s.stats
          .map(
            (st) => `
      <div class="pns-banner-cell">
        <span class="pns-bval">${esc(st.value)}</span>
        <span class="pns-blbl">${esc(st.label)}</span>
      </div>`,
          )
          .join('')

        const sep = idx < d.sections.length - 1 ? '<div class="pns-sep"></div>' : ''

        return `
<div class="pns-section">
  <div class="pns-hd">
    <div class="pns-num">${esc(s.number)}</div>
    <p class="pns-kicker">${richSafe(s.kicker)}</p>
    <h2 class="pns-headline">${richSafe(s.headline)}</h2>
    ${s.desc ? `<p class="pns-desc">${esc(s.desc)}</p>` : ''}
  </div>
  ${photoBlock}
  <div class="pns-feat">
    <div class="pns-pills">${pillsHtml}
    </div>
  </div>
  <div class="pns-banner">${statsHtml}
  </div>
  ${sep}
</div>`
      })
      .join('')

    return `<section class="pns">${sections}
</section>`
  },
})
