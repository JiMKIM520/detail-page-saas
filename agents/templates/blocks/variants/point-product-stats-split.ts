/** POINT 아키타입: point-product-stats-split.
 *  [끝판왕] 포인트 구성 #37 패턴을 토큰 기반으로 재구성(클론 아님).
 *  레이아웃: 상단 풀폭 헤더(eyebrow + title + subtitle) → 하단 좌우 스플릿(좌 ~50% 제품 이미지 / 우 수직 스탯 리스트).
 *  수치 신뢰도·임팩트 전달형 — 스킨케어·헬스·기능성 식품 상세페이지 최적. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 eyebrow 소카피 (선택, 예: "텍스트를 입력하세요.") */
  eyebrow: z.string().optional(),
  /** 상단 대제목 (em, br 허용, 예: "상품 장점을 설명해보세요.") */
  title: z.string().min(1),
  /** 상단 서브카피 (선택) */
  subtitle: z.string().optional(),
  /** 좌측 대형 제품 이미지 URL */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
  /** 우측 수치 스탯 (3~5개). value: "-20.8%" 형식, label: 짧은 효과 설명 */
  stats: z
    .array(
      z.object({
        /** 수치 문자열 (예: "-20.8%", "+3.2배", "98%"). 부호 포함 권장. */
        value: z.string().min(1),
        /** 짧은 라벨 (예: "모공면적 개선효과") */
        label: z.string().min(1),
      }),
    )
    .min(3)
    .max(5),
})
type Data = z.infer<typeof schema>

export const pointProductStatsSplit = defineBlock<Data>({
  id: 'point-product-stats-split',
  archetype: 'point',
  styleTags: ['dark', 'stats', 'split', 'skincare', 'premium', 'template'],
  imageSlots: 1,
  describe:
    '포인트 제품+수치 스플릿. 다크(--ink) 배경 + 풀폭 상단 헤더(eyebrow·title·subtitle) + 하단 좌측 대형 제품 이미지(~50%) + 우측 signed 수치 스탯 3~5개 수직 리스트(큰 타이포+라벨+구분선). 임상/기능성 수치 신뢰도 전달형.',
  schema,
  css: `
/* point-product-stats-split — 접두사 ppss- */
.ppss{background:var(--ink);color:#fff;word-break:keep-all;overflow-wrap:break-word}
/* 상단 풀폭 헤더 */
.ppss-hd{padding:36px 40px 24px}
.ppss-eyebrow{font-family:var(--font-body);font-size:13px;font-weight:400;color:rgba(255,255,255,.50);letter-spacing:.01em;margin-bottom:8px}
.ppss-title{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,5vw,32px);line-height:1.26;letter-spacing:-.02em;color:#fff}
.ppss-title .em{color:var(--accent)}
.ppss-subtitle{margin-top:10px;font-family:var(--font-body);font-size:13px;line-height:1.65;color:rgba(255,255,255,.46)}
/* 하단 좌우 스플릿 */
.ppss-body{display:flex;flex-direction:row;align-items:stretch;min-height:480px}
/* 좌: 제품 이미지 ~50% */
.ppss-img-wrap{flex:0 0 50%;overflow:hidden}
.ppss-img{width:100%;height:100%;object-fit:cover;display:block}
.ppss-img.ph{width:100%;height:100%;min-height:480px;border:2px dashed rgba(255,255,255,.15);background:rgba(255,255,255,.04);color:rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;font-size:12px}
/* 우: 스탯 리스트 */
.ppss-stats{flex:1 1 auto;display:flex;flex-direction:column;justify-content:center;padding:20px 28px 28px 24px;gap:0}
.ppss-stat{padding:15px 0;border-top:1px solid rgba(255,255,255,.1)}
.ppss-stat:last-child{border-bottom:1px solid rgba(255,255,255,.1)}
/* 수치 — 음수(감소=개선 신호): 커머스 danger red 하드코딩 허용 */
.ppss-value{font-family:var(--font-display);font-weight:800;font-size:clamp(24px,5vw,36px);line-height:1.1;letter-spacing:-.025em;color:#C0392B}
/* 양수 수치는 accent override */
.ppss-value.pos{color:var(--accent)}
/* 부호 없는 중립 수치 */
.ppss-value.neutral{color:#F0EBE3}
/* 라벨 */
.ppss-label{margin-top:5px;font-family:var(--font-body);font-size:12px;line-height:1.5;color:rgba(255,255,255,.46);letter-spacing:.01em}
`,
  render: (d, { esc, richSafe }) => {
    const statsHtml = d.stats
      .map((s) => {
        const trimmed = s.value.trimStart()
        const valClass = trimmed.startsWith('+')
          ? 'ppss-value pos'
          : trimmed.startsWith('-')
            ? 'ppss-value'
            : 'ppss-value neutral'
        return `
    <div class="ppss-stat">
      <div class="${valClass}">${esc(s.value)}</div>
      <div class="ppss-label">${esc(s.label)}</div>
    </div>`
      })
      .join('')

    return `
<section class="ppss">
  <div class="ppss-hd">
    ${d.eyebrow ? `<p class="ppss-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="ppss-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="ppss-subtitle">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="ppss-body">
    <div class="ppss-img-wrap">
      ${media(d.image, 'ppss-img', esc(d.imageAlt ?? '제품 이미지'))}
    </div>
    <div class="ppss-stats">
      ${statsHtml}
    </div>
  </div>
</section>`
  },
})
