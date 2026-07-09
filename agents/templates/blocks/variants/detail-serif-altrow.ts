/** DETAIL 아키타입: detail-serif-altrow.
 *  피그마 "250_제품특징_16" 흡수 재구성.
 *  풀블리드 상단 커버 이미지 → 영문 세리프 'detail point' 레이블 →
 *  번호형 좌우 교차 행(홀수: 이미지 왼쪽+텍스트 오른쪽, 짝수: 텍스트 왼쪽+이미지 오른쪽) 2~4행.
 *  NanumMyeongjo 세리프 제목 + Abhaya Libre / var(--font-lat) 번호 레이블 장치. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  /** 상단 풀블리드 커버 이미지 (url). 없으면 커버 행 자체를 생략해 붕괴 방지. */
  cover: z.string().optional(),
  /** 섹션 레이블 — 기본 "detail point". (em) 허용. */
  label: z.string().min(1).optional(),
  /** 교차 행 목록. 각 행: 이미지(optional) + 번호 레이블(optional, 기본 01./02.…) + 제목 + 본문. */
  rows: z
    .array(
      z.object({
        image: z.string().optional(),       // 절반 영역 커버 이미지 (url)
        num: z.string().optional(),         // 번호 레이블 (기본 "01." …)
        heading: z.string().min(1),         // 세리프 소제목
        body: z.string().min(1),            // Pretendard 본문 (em 허용)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const detailSerifAltrow = defineBlock<Data>({
  id: 'detail-serif-altrow',
  archetype: 'detail',
  // noimg-safe: 개별 행의 이미지가 없으면 이미지 영역을 접어 텍스트 단독 행으로 강등 렌더
  styleTags: ['light', 'editorial', 'serif', 'altrow', 'noimg-safe'],
  imageSlots: 4,  // cover 1 + 행 최대 3 이미지
  describe:
    '제품 상세 특징 에디토리얼. 풀블리드 커버 사진 + 세리프 "detail point" 레이블 + 번호형 좌우 교차 행(홀수=이미지왼/텍스트우, 짝수=텍스트왼/이미지우) 2~4행. NanumMyeongjo 제목·Abhaya Libre 번호·Pretendard 본문 혼용. 패션·생활·식품 프리미엄 서술형 섹션.',
  schema,
  css: `
.dsa{background:var(--bg);color:var(--ink)}
/* ── 커버 이미지 ── */
.dsa-cover{width:100%;aspect-ratio:860/800;overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,var(--paper))}
.dsa-cover img,.dsa-cover .ph{width:100%;height:100%;object-fit:cover;border-radius:var(--shape-photo,0%)}
/* ── 레이블 영역 ── */
.dsa-label-wrap{padding:38px var(--pad-x,56px) 18px;border-bottom:1px solid var(--line);margin:0 var(--pad-x,56px)}
.dsa-label-wrap-inner{display:flex;align-items:flex-end;gap:0}
.dsa-label{font-family:var(--font-lat),'Abhaya Libre',serif;font-weight:700;font-size:clamp(42px,6vw,70px);line-height:1;color:var(--accent);letter-spacing:.01em}
.dsa-label .em{color:var(--accent-d)}
/* ── 교차 행 목록 ── */
.dsa-rows{padding:0 var(--pad-x,56px)}
.dsa-row{display:flex;align-items:stretch;gap:0;min-height:420px;border-bottom:1px solid var(--line)}
.dsa-row:last-child{border-bottom:none}
/* 이미지 절반 */
.dsa-img-half{flex:0 0 50%;width:50%;overflow:hidden;background:color-mix(in srgb,var(--accent) 6%,var(--paper))}
.dsa-img-half img,.dsa-img-half .ph{width:100%;height:100%;object-fit:cover;border-radius:var(--shape-photo,calc(var(--r-scale,1)*0px));display:block}
/* 짝수 행: 이미지 오른쪽 — flex-direction:row-reverse */
.dsa-row.rev{flex-direction:row-reverse}
/* 텍스트 절반 */
.dsa-txt-half{flex:1;display:flex;align-items:center;justify-content:center;padding:40px 28px}
.dsa-txt-inner{width:100%;max-width:300px;text-align:center}
/* 번호 */
.dsa-num{font-family:var(--font-lat),'Abhaya Libre',serif;font-weight:700;font-size:clamp(32px,4.5vw,50px);color:var(--accent);line-height:1;display:block;margin-bottom:6px}
/* 세리프 소제목 */
.dsa-heading{font-family:'Nanum Myeongjo','NanumMyeongjo',var(--font-serif),serif;font-weight:700;font-size:clamp(22px,3vw,36px);color:var(--accent);line-height:1.25;margin-bottom:0}
/* 가로 구분선 */
.dsa-rule{width:80px;height:2px;background:var(--accent);margin:14px auto}
/* 본문 */
.dsa-body{font-family:var(--font-body),'Pretendard',sans-serif;font-size:clamp(14px,1.6vw,17px);color:var(--ink-2);line-height:1.75;font-weight:400}
.dsa-body .em{color:var(--accent-d);font-weight:600}
/* 이미지 없는 행: 텍스트 단독 전폭 강등 */
.dsa-row.noimg .dsa-txt-half{flex:1;padding:40px var(--pad-x,56px)}
.dsa-row.noimg .dsa-txt-inner{max-width:520px;text-align:center}
`,
  render: (d, { esc, richSafe }) => {
    // 커버: url 있을 때만 렌더 (noimg-safe)
    const coverHtml = d.cover
      ? `<div class="dsa-cover">${media(d.cover, '', '제품 대표 이미지')}</div>`
      : ''

    const rowsHtml = d.rows
      .map((row, i) => {
        const hasImg = typeof row.image === 'string' && row.image.length > 0
        const isEven = i % 2 === 1   // 짝수 행(0-indexed 1,3): 텍스트 왼 / 이미지 오른
        const numLabel = esc(row.num ?? `${pad2(i + 1)}.`)

        const textBlock = `
      <div class="dsa-txt-half">
        <div class="dsa-txt-inner">
          <span class="dsa-num">${numLabel}</span>
          <h3 class="dsa-heading">${esc(row.heading)}</h3>
          <div class="dsa-rule"></div>
          <p class="dsa-body">${richSafe(row.body)}</p>
        </div>
      </div>`

        if (!hasImg) {
          // 이미지 없음 → 텍스트 단독 전폭 행 (noimg-safe 강등)
          return `
    <div class="dsa-row noimg">${textBlock}
    </div>`
        }

        const imgBlock = `
      <div class="dsa-img-half">${media(row.image, '', `${esc(row.heading)} 이미지`)}</div>`

        // 홀수(i=0,2): 이미지 왼 + 텍스트 오른 / 짝수(i=1,3): 텍스트 왼 + 이미지 오른 (rev)
        return `
    <div class="dsa-row${isEven ? ' rev' : ''}">${imgBlock}${textBlock}
    </div>`
      })
      .join('')

    return `
<section class="dsa">
  ${coverHtml}
  <div class="dsa-label-wrap">
    <p class="dsa-label">${richSafe(d.label ?? 'detail point')}</p>
  </div>
  <div class="dsa-rows">${rowsHtml}
  </div>
</section>`
  },
})
