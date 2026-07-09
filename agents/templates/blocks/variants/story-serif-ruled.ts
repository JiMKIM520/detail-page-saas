/** STORY 아키타입: story-serif-ruled
 *  원본: 339_제품소개_42.json (와디즈 200섹션 템플릿)
 *  구조: 필 라벨 + 세리프 대형 헤드라인 + 가로선 2중 구획 철학 인용 블록 + 좌이미지/우텍스트 제품 카드
 *  톤: light / 배경: 크림(var(--bg)) / 이미지 없을 때 카드 텍스트 전폭으로 강등(noimg-safe) */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 필 라벨 (예: "brand story") — 영문/한글 모두 허용, 순수 텍스트 */
  label: z.string().min(1),
  /** 세리프 대형 헤드라인 (em,br 허용) */
  headline: z.string().min(1),
  /** 헤드라인 아래 라이트 서브 한 줄 */
  headlineSub: z.string().optional(),
  /** 가로선 구획 위 굵은 인용 문장 (em,br 허용) */
  quoteStrong: z.string().min(1),
  /** 인용 블록 내 본문 (em,br 허용) */
  quoteBody: z.string().min(1),
  /** 가로선 구획 아래 닫힘 문장 (em,br 허용) */
  quoteClose: z.string().optional(),
  /** 제품 카드 이미지 (url) — 없으면 텍스트 전폭으로 강등 */
  cardImage: z.string().optional(),
  /** 제품 카드 제품명/소제목 (순수 텍스트) */
  cardTitle: z.string().min(1),
  /** 제품 카드 설명 (em,br 허용) */
  cardDesc: z.string().min(1),
})
type Data = z.infer<typeof schema>

export const storySerifRuled = defineBlock<Data>({
  id: 'story-serif-ruled',
  archetype: 'story',
  styleTags: ['light', 'editorial', 'warm', 'serif', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '브랜드 스토리 블록. 크림 배경 + 액센트 색 필 라벨 + 세리프 대형 헤드라인 + 가로선 2중 구획 브랜드 철학 인용문 + 하단 좌이미지/우텍스트 제품 소개 카드. 이미지 없으면 텍스트 전폭 카드로 강등(noimg-safe). 식품·반려용품·프리미엄 소비재 브랜드 스토리 섹션.',
  schema,
  css: `
.scth{background:var(--bg);padding:64px var(--pad-x,56px) 72px;text-align:center;color:var(--ink)}

/* ── 필 라벨 ── */
.scth-label{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-lat);font-weight:500;font-size:18px;letter-spacing:.12em;text-transform:uppercase;padding:10px 32px;border-radius:999px;margin-bottom:40px}

/* ── 헤드라인 영역 ── */
.scth-hl-wrap{margin-bottom:56px}
.scth-hl-rule{width:56px;height:2px;background:var(--accent);opacity:.45;margin:0 auto 28px}
.scth-hl{font-family:var(--font-serif);font-weight:700;font-size:clamp(36px,5.5vw,58px);line-height:1.28;color:var(--ink);letter-spacing:-.01em}
.scth-hl .em{color:var(--accent)}
.scth-hl-sub{margin-top:18px;font-size:18px;font-weight:300;color:var(--ink-2);letter-spacing:.01em}

/* ── 인용 블록 (가로선 2중 구획) ── */
.scth-ruled{margin:0 auto 52px;max-width:680px}
.scth-rule{width:100%;height:1px;background:var(--line);margin:0}
.scth-q-strong{padding:28px 0 20px;font-size:clamp(20px,2.8vw,26px);font-weight:700;color:var(--ink);line-height:1.5}
.scth-q-strong .em{color:var(--accent)}
.scth-q-body{font-size:17px;font-weight:400;color:var(--ink-2);line-height:1.85;white-space:pre-line}
.scth-q-body .em{color:var(--accent);font-weight:600}
.scth-q-close{padding:20px 0 28px;font-size:17px;font-weight:400;color:var(--ink-2);line-height:1.75}
.scth-q-close .em{color:var(--accent);font-weight:600}

/* ── 제품 카드 ── */
.scth-card{display:flex;align-items:center;gap:24px;background:var(--paper);border-radius:calc(var(--r-scale,1)*16px);padding:20px;text-align:left;box-shadow:0 4px 18px -8px rgba(0,0,0,.10)}
.scth-card-img{flex:0 0 auto;width:180px;height:192px;border-radius:calc(var(--r-scale,1)*10px);object-fit:cover;background:color-mix(in srgb,var(--accent) 8%,transparent)}
.scth-card-img.ph{display:none!important}
/* noimg-safe: 이미지 없으면 텍스트 전폭 */
.scth-card.no-img .scth-card-body{padding-left:0}
.scth-card-body{flex:1;min-width:0}
.scth-card-title{font-size:20px;font-weight:700;color:var(--accent-d);margin-bottom:10px;line-height:1.35;font-family:var(--font-display)}
.scth-card-desc{font-size:15px;color:var(--ink-2);line-height:1.72}
.scth-card-desc .em{color:var(--accent);font-weight:600}
`,
  render: (d, { esc, richSafe }) => {
    const hasImg =
      typeof d.cardImage === 'string' &&
      /^(https?:\/\/|data:|\/)/.test(d.cardImage.trim())

    return `
<section class="scth">
  <span class="scth-label">${esc(d.label)}</span>

  <div class="scth-hl-wrap">
    <div class="scth-hl-rule"></div>
    <h2 class="scth-hl">${richSafe(d.headline)}</h2>
    ${d.headlineSub ? `<p class="scth-hl-sub">${esc(d.headlineSub)}</p>` : ''}
  </div>

  <div class="scth-ruled">
    <hr class="scth-rule">
    <p class="scth-q-strong">${richSafe(d.quoteStrong)}</p>
    <p class="scth-q-body">${richSafe(d.quoteBody)}</p>
    ${d.quoteClose ? `<p class="scth-q-close">${richSafe(d.quoteClose)}</p>` : ''}
    <hr class="scth-rule">
  </div>

  <div class="scth-card${hasImg ? '' : ' no-img'}">
    ${hasImg ? media(d.cardImage, 'scth-card-img', d.cardTitle) : ''}
    <div class="scth-card-body">
      <p class="scth-card-title">${esc(d.cardTitle)}</p>
      <p class="scth-card-desc">${richSafe(d.cardDesc)}</p>
    </div>
  </div>
</section>`
  },
})
