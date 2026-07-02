/** FAQ 아키타입: faq-editorial-split.
 *  [끝판왕] FAQ 문의 구성 #10 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 두 톤 수직 분할 패널(좌 크림·우 다크) + 브랜드 사이드바(수직 회전 텍스트) +
 *  단일 Q&A 쌍(대형 Q 레터 + 수평선 + 질문 헤드 / 구분선 / 답변 헤드 + 본문) +
 *  에디토리얼 히어로 이미지(우 패널 풀블리드) + 원형 인물 이미지(패널 경계 블리드). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, attr } from '../shared'

const schema = z.object({
  /** 좌 사이드바 브랜드 레이블 상단 (예: "brand") */
  brandTop: z.string().min(1).optional(),
  /** 좌 사이드바 브랜드 레이블 하단 (예: "name") */
  brandBottom: z.string().min(1).optional(),
  /** Q 섹션 — 질문 텍스트 (em, br 허용) */
  question: z.string().min(1),
  /** 질문 보조 레이블 — 소괄호 힌트 등 선택 (예: "(예시 질문입니다.)") */
  questionNote: z.string().optional(),
  /** A 섹션 — 짧은 답변 강조 헤드라인 (em, br 허용; 예: "당연합니다.") */
  answerHead: z.string().min(1),
  /** A 섹션 — 본문 상세 설명 (em, br 허용) */
  answerBody: z.string().min(1),
  /** 우 패널 배경에 깔리는 히어로 이미지(인물·제품) URL */
  heroImage: z.string().optional(),
  /** 패널 경계에 블리드되는 원형 인물/제품 이미지 URL */
  circleImage: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const faqEditorialSplit = defineBlock<Data>({
  id: 'faq-editorial-split',
  archetype: 'faq',
  styleTags: ['editorial', 'split', 'dark', 'premium', 'single-qa', 'template'],
  imageSlots: 2,
  describe:
    'FAQ 단일 Q&A 에디토리얼 스플릿. 좌(크림) + 우(다크) 수직 2분할 패널, 좌에 수직 회전 브랜드 레이블, 우에 풀블리드 히어로 이미지 위 대형 Q 레터+수평선+질문/구분선/답변 오버레이, 패널 경계에 원형 인물 이미지 블리드. 코스메틱·패션·프리미엄 단건 FAQ.',
  schema,
  css: `
/* faq-editorial-split — 접두사 fes- */
.fes{position:relative;display:flex;min-height:560px;word-break:keep-all;overflow-wrap:break-word;overflow:hidden}

/* 좌 사이드바 — 크림/페이퍼 톤 */
.fes-side{
  position:relative;
  flex:0 0 28%;
  background:var(--paper);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  padding:48px 0;
  z-index:2;
}
/* 수직 회전 브랜드 레이블 */
.fes-brand{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:10px;
  writing-mode:vertical-rl;
  transform:rotate(180deg);
  font-family:var(--font-body);
  font-size:13px;
  letter-spacing:.18em;
  color:var(--ink);
  text-transform:lowercase;
  line-height:1;
}
.fes-brand-sep{
  width:1px;
  height:28px;
  background:var(--ink);
  display:block;
  align-self:center;
  writing-mode:horizontal-tb;
  transform:none;
}

/* 우 다크 패널 */
.fes-main{
  position:relative;
  flex:1 1 0;
  background:var(--ink);
  overflow:hidden;
  display:flex;
  flex-direction:column;
  justify-content:flex-start;
  z-index:1;
}

/* 히어로 배경 이미지 — 풀블리드, Q 영역 위로 깔림 */
.fes-hero{
  position:absolute;
  inset:0;
  width:100%;
  height:60%;
  object-fit:cover;
  object-position:top center;
  display:block;
  opacity:.75;
}
.fes-hero.ph{
  position:absolute;
  inset:0;
  width:100%;
  height:60%;
  background:rgba(255,255,255,.06);
  border:none;
}

/* Q 블록 */
.fes-q{
  position:relative;
  z-index:2;
  padding:36px 32px 28px;
  text-align:right;
}
.fes-q-marker{
  display:flex;
  align-items:center;
  gap:10px;
  justify-content:flex-start;
  margin-bottom:14px;
}
.fes-q-letter{
  font-family:var(--font-display);
  font-weight:900;
  font-size:clamp(40px,8vw,58px);
  color:#fff;
  line-height:1;
}
.fes-q-rule{
  flex:1;
  height:2px;
  background:rgba(255,255,255,.55);
}
.fes-question{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(18px,4.2vw,26px);
  line-height:1.35;
  color:#fff;
  text-align:right;
}
.fes-question .em{color:var(--accent)}
.fes-q-note{
  margin-top:8px;
  font-size:13px;
  color:rgba(255,255,255,.55);
  text-align:right;
}

/* Q/A 구분선 */
.fes-divider{
  position:relative;
  z-index:2;
  margin:0 32px;
  height:1px;
  background:rgba(255,255,255,.25);
}

/* A 블록 */
.fes-a{
  position:relative;
  z-index:2;
  padding:28px 32px 44px;
  text-align:right;
  background:rgba(0,0,0,.38);
}
.fes-a-head{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(20px,4.6vw,28px);
  color:#fff;
  line-height:1.3;
  margin-bottom:14px;
}
.fes-a-head .em{color:var(--accent)}
.fes-a-body{
  font-family:var(--font-body);
  font-size:15px;
  line-height:1.85;
  color:rgba(255,255,255,.72);
  text-align:right;
}
.fes-a-body .em{color:var(--accent);font-weight:700}

/* 원형 블리드 이미지 — 패널 경계(하단 좌측) 절대 배치 */
.fes-circle{
  position:absolute;
  bottom:-24px;
  left:-36%;
  width:72%;
  aspect-ratio:1/1;
  border-radius:50%;
  object-fit:cover;
  object-position:top center;
  display:block;
  z-index:10;
  box-shadow:0 8px 32px rgba(0,0,0,.28);
}
.fes-circle.ph{
  position:absolute;
  bottom:-24px;
  left:-36%;
  width:72%;
  aspect-ratio:1/1;
  border-radius:50%;
  z-index:10;
  background:rgba(255,255,255,.08);
  border:2px dashed rgba(255,255,255,.2);
}
`,
  render: (d, { esc, richSafe }) => {
    const brandTop = esc(d.brandTop ?? 'brand')
    const brandBottom = esc(d.brandBottom ?? 'name')

    const heroImg = d.heroImage
      ? `<img class="fes-hero" src="${attr(d.heroImage)}" alt="배경 이미지">`
      : `<div class="fes-hero ph"></div>`

    const circleImg = d.circleImage
      ? `<img class="fes-circle" src="${attr(d.circleImage)}" alt="제품/인물 이미지">`
      : `<div class="fes-circle ph"></div>`

    return `
<section class="fes">
  <!-- 좌 사이드바 (크림/페이퍼) -->
  <div class="fes-side">
    <div class="fes-brand">
      <span>${brandTop}</span>
      <span class="fes-brand-sep"></span>
      <span>${brandBottom}</span>
    </div>
    ${circleImg}
  </div>

  <!-- 우 다크 패널 -->
  <div class="fes-main">
    ${heroImg}

    <!-- Q 블록 -->
    <div class="fes-q">
      <div class="fes-q-marker">
        <span class="fes-q-letter">Q</span>
        <span class="fes-q-rule"></span>
      </div>
      <p class="fes-question">${richSafe(d.question)}</p>
      ${d.questionNote ? `<p class="fes-q-note">${esc(d.questionNote)}</p>` : ''}
    </div>

    <div class="fes-divider"></div>

    <!-- A 블록 -->
    <div class="fes-a">
      <p class="fes-a-head">${richSafe(d.answerHead)}</p>
      <p class="fes-a-body">${richSafe(d.answerBody)}</p>
    </div>
  </div>
</section>`
  },
})
