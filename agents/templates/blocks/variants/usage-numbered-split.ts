/** USAGE 아키타입: usage-numbered-split.
 *  피그마 131_사용방법_03 패턴 흡수 재구성.
 *  특징: 대형 ExtraBold 번호(01.~04.) + 강조박스 한글 타이틀 헤더 + 4단계 지그재그
 *  홀수 스텝 = 사각 이미지 패널 왼쪽/텍스트 오른쪽,
 *  짝수 스텝 = 텍스트 왼쪽/필 이미지 패널 오른쪽.
 *  noimg-safe: 이미지 전무 시 이미지 패널을 걷어내고 번호+텍스트 세트만 수직 나열로 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  /** 상단 대형 영문 레이블 (muted, 장식용). 기본 "HOW TO USE" */
  tagline: z.string().optional(),
  /** 강조박스 안에 들어가는 한국어 대제목 (em,br) */
  title: z.string().min(1),
  /** 타이틀 아래 부제 */
  subtitle: z.string().optional(),
  /** 2~4단계. 홀수 인덱스(0,2)=이미지 좌, 짝수 인덱스(1,3)=이미지 우 */
  steps: z
    .array(
      z.object({
        /** 단계명 레이블 (기본 "바닥 청소" 형태의 짧은 명칭) */
        label: z.string().min(1),
        /** 단계 설명 (em,br) */
        text: z.string().min(1),
        /** 단계 이미지 (url). 없으면 noimg-safe 강등 */
        image: z.string().optional(),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const usageNumberedSplit = defineBlock<Data>({
  id: 'usage-numbered-split',
  archetype: 'usage',
  styleTags: ['light', 'template', 'howto', 'zigzag', 'numbered', 'noimg-safe'],
  imageSlots: 4,
  describe:
    '사용법(번호+지그재그). 라이트 회색 배경 + 영문 장식 레이블 + 강조박스 한글 대제목 + 4단계 L/R 사각 이미지 패널·ExtraBold 번호·레이블·설명 교차 배치. 홀수=이미지 좌, 짝수=이미지 우. 이미지 전무 시 번호+텍스트 수직 강등.',
  schema,
  css: `
.ucdx{background:var(--paper,#f2f2f2);color:var(--ink);padding:60px 0 64px}
/* ── 헤더 ── */
.ucdx-hd{text-align:center;padding:0 var(--pad-x,56px) 48px}
.ucdx-tag{font-family:var(--font-lat,'Cormorant Garamond',serif);font-weight:600;font-size:22px;color:var(--muted);letter-spacing:.18em;text-transform:uppercase;line-height:1;margin-bottom:16px}
.ucdx-title-wrap{display:inline-block;position:relative}
.ucdx-title-box{
  display:inline-block;
  background:var(--accent);
  padding:6px 24px 10px;
  font-family:var(--font-display);font-weight:800;font-size:52px;
  color:var(--ink);line-height:1.12;letter-spacing:-.02em;
  border-radius:calc(var(--r-scale,1)*6px);
}
.ucdx-title-box .em{color:var(--bg,#fff)}
.ucdx-sub{margin-top:18px;font-size:17px;font-weight:500;color:var(--ink-2);line-height:1.65}
/* ── 스텝 리스트 ── */
.ucdx-steps{display:flex;flex-direction:column;gap:0}
/* ── 단일 스텝 (이미지 있음) ── */
.ucdx-step{display:flex;align-items:stretch;min-height:440px}
/* 홀수(기본): 이미지 왼쪽 */
.ucdx-img-wrap{flex:0 0 52.3%;width:52.3%;overflow:hidden;
  border-radius:0;
}
/* 이미지 패널 — 홀수는 왼쪽 귀퉁이만 라운드 없음(전체 사각), 짝수는 오른쪽 */
.ucdx-img-wrap img,.ucdx-img-wrap .ph{
  width:100%;height:100%;object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*4px));
  display:block;
}
/* 짝수 스텝: row-reverse */
.ucdx-step.rev{flex-direction:row-reverse}
/* 텍스트 세트 */
.ucdx-body{flex:1;display:flex;flex-direction:column;justify-content:center;padding:40px var(--pad-x,56px) 40px 48px}
.ucdx-step.rev .ucdx-body{padding:40px 48px 40px var(--pad-x,56px)}
.ucdx-num{
  font-family:var(--font-display);font-weight:900;font-size:72px;
  color:var(--accent-d,#020846);line-height:1;letter-spacing:-.03em;
  margin-bottom:6px;
}
.ucdx-label{font-family:var(--font-display);font-weight:800;font-size:36px;color:var(--ink);line-height:1.2;margin-bottom:12px}
.ucdx-text{font-size:16px;font-weight:500;color:var(--ink-2);line-height:1.78}
.ucdx-text .em{color:var(--accent);font-weight:700}
/* ── noimg-safe 강등: 스텝들이 flex-col + 번호+텍스트 수직 스택 ── */
.ucdx-step--noimg{
  flex-direction:column;min-height:auto;
  padding:32px var(--pad-x,56px);border-top:1px solid var(--line);
}
.ucdx-step--noimg:first-child{border-top:none}
.ucdx-step--noimg .ucdx-body{padding:0;flex-direction:row;align-items:flex-start;gap:28px}
.ucdx-step--noimg .ucdx-num{font-size:52px;flex:0 0 72px;margin-bottom:0}
.ucdx-step--noimg .ucdx-label-block{flex:1}
`,
  render: (d, { esc, richSafe }) => {
    // 전 스텝 이미지 존재 여부 — 하나라도 없으면 텍스트 전용 강등
    const withImgs = d.steps.every((s) => typeof s.image === 'string' && s.image.length > 0)

    const stepHtml = d.steps
      .map((s, i) => {
        const num = `${pad2(i + 1)}.`
        const isEven = i % 2 === 1 // 0-indexed: index 1,3 = 짝수 스텝(원본 02,04)

        if (!withImgs) {
          // 강등 레이아웃: 번호 + 레이블 + 설명 수직 정렬
          return `
  <div class="ucdx-step ucdx-step--noimg">
    <div class="ucdx-body">
      <span class="ucdx-num">${esc(num)}</span>
      <div class="ucdx-label-block">
        <p class="ucdx-label">${esc(s.label)}</p>
        <p class="ucdx-text">${richSafe(s.text)}</p>
      </div>
    </div>
  </div>`
        }

        // 풀 레이아웃: 이미지 패널 + 텍스트 세트
        const imgPanel = `<div class="ucdx-img-wrap">${media(s.image, '', `${esc(s.label)} 이미지`)}</div>`
        const textPanel = `<div class="ucdx-body">
      <p class="ucdx-num">${esc(num)}</p>
      <p class="ucdx-label">${esc(s.label)}</p>
      <p class="ucdx-text">${richSafe(s.text)}</p>
    </div>`

        return `
  <div class="ucdx-step${isEven ? ' rev' : ''}">
    ${imgPanel}
    ${textPanel}
  </div>`
      })
      .join('')

    return `
<section class="ucdx">
  <div class="ucdx-hd">
    <p class="ucdx-tag">${esc(d.tagline ?? 'HOW TO USE')}</p>
    <div class="ucdx-title-wrap">
      <span class="ucdx-title-box">${richSafe(d.title)}</span>
    </div>
    ${d.subtitle ? `<p class="ucdx-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="ucdx-steps">${stepHtml}
  </div>
</section>`
  },
})
