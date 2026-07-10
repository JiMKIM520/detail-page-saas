/** FAQ 아키타입: faq-side-portrait-oval.
 *  피그마 "FAQ 문의 구성 페이지_10" 구조를 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 좌측 불투명 크림(--paper) 텍스트 패널 + 우측 고정 폭 인물 이미지 컬럼 분리.
 *  레이아웃: 2-컬럼 flex. 좌측=브랜드+Q&A, 우측=portrait img (침범 없음).
 *  하단 대형 타원형 그레이 도형 위 인물 컷아웃 장식.
 *  noimg-safe: 이미지 부재 시 우측 컬럼을 배경 채우기 사각형으로 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, attr } from '../shared'

const schema = z.object({
  /** 브랜드 레이블 앞 부분 (예: "brand") */
  brandLeft: z.string().min(1).optional(),
  /** 브랜드 레이블 뒤 부분 (예: "name") — 두 단어 사이 공백 장식 포함 */
  brandRight: z.string().min(1).optional(),
  /** Q 섹션 — 질문 텍스트 (em, br 허용) */
  question: z.string().min(1),
  /** 질문 보조 힌트 (예: "(예시 질문입니다.)") — 선택 */
  questionNote: z.string().optional(),
  /** A 섹션 — 짧은 강조 답변 헤드라인 (em, br 허용; 예: "당연합니다.") */
  answerHead: z.string().min(1),
  /** A 섹션 — 본문 상세 설명 (em, br 허용) */
  answerBody: z.string().min(1),
  /** 우측 전폭 세로 오버랩 인물/제품 이미지 URL */
  portraitImage: z.string().optional(),
  /** 하단 타원 위에 올라가는 인물 컷아웃 이미지 URL (누끼/PNG 권장) */
  cutoutImage: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const faqSidePortraitOval = defineBlock<Data>({
  id: 'faq-side-portrait-oval',
  archetype: 'faq',
  styleTags: ['light', 'warm', 'editorial', 'single-qa', 'portrait-overlap', 'noimg-safe', 'template'],
  imageSlots: 2,
  describe:
    'FAQ 단일 Q&A 크림 배경 + 우측 세로 인물 이미지 오버랩. 좌측에 브랜드명·대형 Q 레터·수평선·질문·구분선·답변 수직 스택, 우측 전폭 세로 사진이 텍스트 영역 위로 오버랩, 하단 대형 타원 그레이 도형+인물 컷아웃 장식. 라이트 크림 톤. 뷰티·코스메틱·식품 단건 FAQ.',
  schema,
  css: `
/* faq-side-portrait-oval — 접두사 fyka-
 * 구조: 2-컬럼 flex. 좌측=불투명 크림 패널(텍스트), 우측=고정 폭 이미지 컬럼.
 * 이미지가 텍스트 레이어로 절대 침범하지 않음(스크림 불필요). */
.fyka{
  display:flex;
  align-items:stretch;
  background:var(--paper);
  overflow:hidden;
  min-height:580px;
  max-width:872px;
  word-break:keep-all;
  overflow-wrap:break-word;
  position:relative;
}

/* ── 좌측 텍스트 패널 — 불투명 크림, 이미지와 완전 분리 ── */
.fyka-left{
  flex:0 0 52%;
  min-width:0;
  background:var(--paper);
  padding:48px var(--pad-x,48px) 240px;
  position:relative;
  z-index:2;
  display:flex;
  flex-direction:column;
}

/* 브랜드 레이블 */
.fyka-brand{
  display:flex;
  align-items:baseline;
  gap:18px;
  margin-bottom:32px;
  font-family:var(--font-body);
  font-size:17px;
  font-weight:300;
  letter-spacing:.22em;
  color:var(--brand,#715209);
  text-transform:lowercase;
}
.fyka-brand-sep{
  display:inline-block;
  width:1px;
  height:14px;
  background:var(--brand,#715209);
  opacity:.5;
  vertical-align:middle;
}

/* Q 블록 */
.fyka-q-block{flex-shrink:0}
.fyka-q-letter{
  display:block;
  font-family:var(--font-display);
  font-weight:900;
  font-size:clamp(52px,10vw,80px);
  line-height:1;
  color:var(--brand,#715209);
  margin-bottom:8px;
}
.fyka-q-rule{
  display:block;
  width:100%;
  max-width:300px;
  height:2px;
  background:var(--brand,#715209);
  opacity:.3;
  margin-bottom:18px;
}
.fyka-question{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(19px,4vw,28px);
  line-height:1.38;
  color:var(--ink,#1a1a1a);
  margin-bottom:6px;
}
.fyka-question .em{color:var(--accent)}
.fyka-q-note{
  font-size:13px;
  color:var(--ink-muted,rgba(26,26,26,.55));
  margin-top:6px;
}

/* Q/A 구분선 */
.fyka-divider{
  display:block;
  width:100%;
  max-width:400px;
  height:1px;
  background:var(--ink,#1a1a1a);
  opacity:.12;
  margin:22px 0;
  flex-shrink:0;
}

/* A 블록 */
.fyka-a-head{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(17px,3.6vw,24px);
  line-height:1.32;
  color:var(--ink,#1a1a1a);
  margin-bottom:14px;
}
.fyka-a-head .em{color:var(--accent)}
.fyka-a-body{
  font-family:var(--font-body);
  font-size:clamp(13px,2.8vw,15px);
  font-weight:300;
  line-height:1.9;
  color:var(--ink-muted,rgba(26,26,26,.72));
}
.fyka-a-body .em{color:var(--accent);font-weight:600}

/* ── 우측 이미지 컬럼 — 고정 폭, 텍스트 영역과 완전 분리 ── */
.fyka-right{
  flex:1 1 auto;
  min-width:0;
  position:relative;
  overflow:hidden;
}
.fyka-portrait{
  position:absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:top center;
  display:block;
}
/* 이미지 없을 때 강등 패널 */
.fyka-portrait.ph{
  background:color-mix(in srgb,var(--accent,#b5860d) 8%,var(--paper));
}

/* ── 하단 타원 + 컷아웃 — 섹션 전체 기준 절대 배치 ── */
.fyka-oval-zone{
  position:absolute;
  bottom:0;
  left:0;
  width:100%;
  height:220px;
  z-index:3;
  pointer-events:none;
  overflow:hidden;
}
.fyka-oval-bg{
  position:absolute;
  bottom:0;
  left:50%;
  transform:translateX(-50%);
  width:116%;
  height:100%;
  background:var(--muted,#dfdfdf);
  border-radius:999px 999px 0 0;
  opacity:.55;
}
.fyka-cutout{
  position:absolute;
  bottom:0;
  left:50%;
  transform:translateX(-50%);
  width:auto;
  height:210px;
  object-fit:contain;
  object-position:bottom center;
  display:block;
  z-index:1;
}
.fyka-cutout.ph{
  position:absolute;
  bottom:0;
  left:50%;
  transform:translateX(-50%);
  width:180px;
  height:160px;
  background:rgba(0,0,0,.06);
  border-radius:calc(var(--r-scale,1)*12px);
  border:2px dashed rgba(0,0,0,.12);
  z-index:1;
}
`,
  render: (d, { esc, richSafe }) => {
    const brandLeft = esc(d.brandLeft ?? 'brand')
    const brandRight = esc(d.brandRight ?? 'name')

    // 우측 이미지 컬럼 — 없으면 .ph 강등
    const portraitEl = d.portraitImage
      ? `<img class="fyka-portrait" src="${attr(d.portraitImage)}" alt="제품/인물 이미지">`
      : `<div class="fyka-portrait ph"></div>`

    // 컷아웃 이미지 — 없으면 .ph placeholder
    const cutoutEl = d.cutoutImage
      ? `<img class="fyka-cutout" src="${attr(d.cutoutImage)}" alt="인물 컷아웃">`
      : `<div class="fyka-cutout ph"></div>`

    return `
<section class="fyka">

  <!-- 좌측 불투명 크림 텍스트 패널 -->
  <div class="fyka-left">
    <!-- 브랜드 레이블 -->
    <div class="fyka-brand">
      <span>${brandLeft}</span>
      <span class="fyka-brand-sep"></span>
      <span>${brandRight}</span>
    </div>

    <!-- Q 블록 -->
    <div class="fyka-q-block">
      <span class="fyka-q-letter">Q</span>
      <span class="fyka-q-rule"></span>
      <p class="fyka-question">${richSafe(d.question)}</p>
      ${d.questionNote ? `<p class="fyka-q-note">${esc(d.questionNote)}</p>` : ''}
    </div>

    <!-- 구분선 -->
    <span class="fyka-divider"></span>

    <!-- A 블록 -->
    <div class="fyka-a-block">
      <p class="fyka-a-head">${richSafe(d.answerHead)}</p>
      <p class="fyka-a-body">${richSafe(d.answerBody)}</p>
    </div>
  </div>

  <!-- 우측 이미지 컬럼 (텍스트 영역 침범 없음) -->
  <div class="fyka-right">
    ${portraitEl}
  </div>

  <!-- 하단 타원 도형 + 인물 컷아웃 장식 (섹션 전체 기준) -->
  <div class="fyka-oval-zone">
    <div class="fyka-oval-bg"></div>
    ${cutoutEl}
  </div>

</section>`
  },
})
