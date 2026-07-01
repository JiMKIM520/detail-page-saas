/** DETAIL 아키타입: detail-spec-illustration-callout.
 *  [끝판왕] 내용전개 #9 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 배경(--paper) + 위아래 chevron 전환 장식 + 중앙 정렬 헤드라인 + 본문 +
 *  제품 일러스트 이미지 + 절대배치 수치 오버레이 콜아웃(대형 숫자+단위, accent 색, 손그림 언더라인 SVG).
 *  단일 특장점(내구성/스펙 수치) 강조 서사형 블록. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 chevron 장식 배경색 — 이전 섹션 배경과 맞춤 (hex/rgb/토큰 문자열, 기본 var(--bg)) */
  chevronColor: z.string().optional(),
  /** 메인 헤드라인 (em, br 허용 — accent 강조 어절) */
  title: z.string().min(1),
  /** 본문 설명 (em 허용, 첫 강조 구절 <span class="em"> 가능) */
  body: z.string().min(1),
  /** 제품 일러스트 이미지 URL */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
  /** 콜아웃 수치 (예: "150") */
  calloutValue: z.string().min(1),
  /** 콜아웃 단위 (예: "kg") */
  calloutUnit: z.string().min(1),
  /** 콜아웃 레이블 — 수치 위 소제목 (예: "내하중 최대") */
  calloutLabel: z.string().min(1),
  /** 하단 chevron 표시 여부 (기본 true) */
  showBottomChevron: z.boolean().optional(),
})
type Data = z.infer<typeof schema>

export const detailSpecIllustrationCallout = defineBlock<Data>({
  id: 'detail-spec-illustration-callout',
  archetype: 'detail' as any,
  styleTags: ['light', 'spec', 'illustration', 'callout', 'narrative', 'template'],
  imageSlots: 1,
  describe:
    '단일 특장점 내구성/스펙 강조(밝은 배경). 위아래 chevron 전환 장식 + 중앙 헤드라인(accent 강조) + 본문 + 제품 일러스트 이미지 + 수치 오버레이 콜아웃(대형 숫자+단위, accent색, 손그림 언더라인). 내구성·하중·크기 등 단일 수치를 임팩트 있게 보여줄 때 사용.',
  schema,
  css: `
/* detail-spec-illustration-callout — 접두사 dsic- */
.dsic{
  background:var(--paper);
  color:var(--ink);
  padding:0;
  overflow:hidden;
  position:relative;
  text-align:center;
}

/* ── 위 chevron 전환 장식 (이전 섹션에서 내려오는 삼각형) ── */
.dsic-chevron-top{
  width:100%;
  height:0;
  border-left:50vw solid transparent;
  border-right:50vw solid transparent;
  /* border-top color는 인라인 style로 chevronColor 주입 */
  border-top-width:52px;
  border-top-style:solid;
}

/* ── 텍스트 영역 ── */
.dsic-text{
  padding:52px 40px 40px;
}

/* 메인 헤드라인 — 밝은 배경이므로 .em은 전역 accent-d 유지 */
.dsic-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(30px,6.2vw,46px);
  line-height:1.22;
  letter-spacing:-.02em;
  color:var(--ink);
  margin-bottom:24px;
}
/* 밝은 배경 위 em: accent-d 가 충분한 대비 확보 */
.dsic-title .em{color:var(--accent-d)}

/* 본문 */
.dsic-body{
  font-family:var(--font-body);
  font-size:15px;
  line-height:1.8;
  color:var(--muted);
  letter-spacing:-.01em;
  max-width:560px;
  margin:0 auto;
}
.dsic-body .em{
  color:var(--accent-d);
  font-weight:700;
}

/* ── 일러스트 + 콜아웃 래퍼 ── */
.dsic-illus-wrap{
  position:relative;
  margin:36px auto 0;
  /* 이미지를 가득 채우되 좌우 여백 남김 */
  width:calc(100% - 40px);
  max-width:700px;
}

/* 제품 이미지 */
.dsic-img{
  width:100%;
  aspect-ratio:4/3;
  object-fit:contain;
  display:block;
}
.dsic-img.ph{
  width:100%;
  aspect-ratio:4/3;
  border:2px dashed var(--line);
  background:rgba(0,0,0,.03);
  color:var(--muted);
}

/* ── 수치 오버레이 콜아웃 (절대 배치) ── */
.dsic-callout{
  position:absolute;
  /* 이미지 중앙 상단 1/3 지점 */
  top:14%;
  left:50%;
  transform:translateX(-50%);
  text-align:center;
  pointer-events:none;
}

/* 콜아웃 레이블 (수치 위 소제목) */
.dsic-callout-label{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(15px,2.4vw,19px);
  letter-spacing:.02em;
  color:var(--accent-d);
  margin-bottom:2px;
  display:block;
}

/* 대형 수치+단위 행 */
.dsic-callout-value-row{
  display:flex;
  align-items:baseline;
  justify-content:center;
  gap:2px;
  position:relative;
}

.dsic-callout-value{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(52px,10vw,80px);
  line-height:1;
  letter-spacing:-.03em;
  color:var(--accent-d);
}

.dsic-callout-unit{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(26px,5vw,40px);
  line-height:1;
  letter-spacing:-.02em;
  color:var(--accent-d);
}

/* 손그림 느낌 언더라인 SVG 장식 */
.dsic-callout-underline{
  display:block;
  width:90%;
  max-width:200px;
  height:14px;
  margin:4px auto 0;
  opacity:.55;
}

/* ── 아래 chevron 전환 장식 (다음 섹션으로 이어지는 삼각형) ── */
.dsic-chevron-bottom{
  margin-top:36px;
  width:100%;
  height:0;
  border-left:50vw solid transparent;
  border-right:50vw solid transparent;
  border-bottom-width:52px;
  border-bottom-style:solid;
}
`,
  render: (d, { esc, richSafe }) => {
    const chevronColor = d.chevronColor ?? 'var(--bg)'
    const showBottom = d.showBottomChevron !== false

    // 손그림 언더라인 — inline SVG, accent-d 색으로 rough 곡선 근사
    const underlineSvg = `<svg class="dsic-callout-underline" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
  <path d="M4 10 C30 4, 60 13, 100 8 C140 3, 170 12, 196 7" fill="none" stroke="var(--accent-d)" stroke-width="3.5" stroke-linecap="round"/>
</svg>`

    return `
<section class="dsic">
  <!-- 상단 chevron: 이전 섹션 배경색을 이어받아 삼각형으로 전환 -->
  <div class="dsic-chevron-top" style="border-top-color:${esc(chevronColor)}" aria-hidden="true"></div>

  <!-- 헤드라인 + 본문 -->
  <div class="dsic-text">
    <h2 class="dsic-title">${richSafe(d.title)}</h2>
    <p class="dsic-body">${richSafe(d.body)}</p>
  </div>

  <!-- 제품 일러스트 + 수치 콜아웃 -->
  <div class="dsic-illus-wrap">
    ${media(d.image, 'dsic-img', esc(d.imageAlt ?? '제품 일러스트'))}
    <div class="dsic-callout">
      <span class="dsic-callout-label">${esc(d.calloutLabel)}</span>
      <div class="dsic-callout-value-row">
        <span class="dsic-callout-value">${esc(d.calloutValue)}</span><span class="dsic-callout-unit">${esc(d.calloutUnit)}</span>
      </div>
      ${underlineSvg}
    </div>
  </div>

  <!-- 하단 chevron: 다음 섹션 배경색으로 전환 -->
  ${showBottom ? `<div class="dsic-chevron-bottom" style="border-bottom-color:${esc(chevronColor)}" aria-hidden="true"></div>` : ''}
</section>`
  },
})
