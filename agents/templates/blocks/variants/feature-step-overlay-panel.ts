/** FEATURE 아키타입: feature-step-overlay-panel.
 *  225_제품특징_12 패턴 흡수 — 클론 아님.
 *  시그니처: 그라디언트 배경 + 인라인 컬러박스 키워드 타이틀(제품명을 브랜드색 박스로 강조) +
 *  메커니즘 부제 → 제품 풀블리드 이미지 위에 좌측 3단계 Step 리스트가 직접 오버레이.
 *  각 Step: 번호 라벨(브랜드색) + KR 핵심어 + EN 부제 한 줄 + 설명 카피.
 *  이미지 없을 때: 스텝 리스트를 세로 스택으로 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const stepSchema = z.object({
  /** Step 번호 라벨 (예: "Step 01.") — 없으면 "Step 0N." 자동 생성 */
  label: z.string().optional(),
  /** KR 핵심 단어 (강조 대형, em 허용 — 예: "항균") */
  keyword: z.string().min(1),
  /** EN 서브 단어 (소형, 예: "Anti-fungal") */
  keywordEn: z.string().optional(),
  /** 단계 설명 카피 (em/br 허용) */
  desc: z.string().min(1),
})

const schema = z.object({
  /** 소제목 eyebrow (예: "2,190일간 연구했습니다.") */
  eyebrow: z.string().optional(),
  /** 컬러박스 앞 수식어 라인 (br 허용, 예: "두피 속 뿌리부터<br>다시 세우는") */
  preTitle: z.string().min(1),
  /** 컬러박스 안 키워드 — 강조 제품명 또는 핵심어 */
  boxKeyword: z.string().min(1),
  /** 타이틀 아래 메커니즘 부제 (em 허용, 예: "[균 억제 + 장벽 재건 + 수분 잠금] 3단계 메커니즘") */
  mechanism: z.string().optional(),
  /** 제품 이미지 URL (풀블리드, 세로 패널) */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
  /** Step 리스트 (2~4개) */
  steps: z
    .array(stepSchema)
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const featureStepOverlayPanel = defineBlock<Data>({
  id: 'feature-step-overlay-panel',
  archetype: 'feature',
  /** noimg-safe: 이미지 없으면 패널 배경을 제거하고 스텝을 세로 카드 스택으로 강등 */
  styleTags: ['mixed', 'gradient', 'overlay', 'step', 'product', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '제품 특징(스텝 오버레이 패널). 그라디언트 배경 + 인라인 컬러박스 키워드 타이틀 + 메커니즘 부제 → 제품 사진 풀블리드 패널 위에 좌측 2~4단계 Step 리스트 직접 오버레이. 각 Step에 번호·KR 핵심어·EN 부제·설명 카피 배치. 이미지 없을 시 세로 스텝 카드 강등(noimg-safe).',
  schema,
  css: `
/* feature-step-overlay-panel — 접두사 frhl- */
.frhl{
  padding:52px 0 0;
  background:linear-gradient(160deg, color-mix(in srgb,var(--accent) 9%,var(--bg)) 0%, var(--bg) 55%);
  color:var(--ink);
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* ── 타이틀 영역 ── */
.frhl-head{padding:0 var(--pad-x,56px) 32px}

.frhl-eyebrow{
  font-family:var(--font-body);
  font-size:17px;
  font-weight:500;
  color:var(--ink-2);
  margin-bottom:14px;
  letter-spacing:.01em;
}

.frhl-pretitle{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(32px,5.8vw,46px);
  line-height:1.18;
  letter-spacing:-.025em;
  color:var(--accent);
  margin-bottom:4px;
}

/* 인라인 컬러박스 키워드 */
.frhl-box{
  display:inline-block;
  background:var(--accent);
  color:var(--bg);
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(34px,6.2vw,52px);
  line-height:1.1;
  letter-spacing:-.03em;
  padding:4px 14px 6px;
  border-radius:calc(var(--r-scale,1)*6px);
  margin-top:2px;
}

.frhl-mechanism{
  margin-top:18px;
  font-family:var(--font-body);
  font-size:17px;
  font-weight:400;
  color:var(--ink-2);
  line-height:1.55;
}
.frhl-mechanism .em{color:var(--accent);font-weight:700}

/* ── 제품 패널 (이미지+오버레이) ── */
.frhl-panel{
  position:relative;
  width:100%;
  /* 이미지가 있을 때의 패널 높이 — step 리스트가 충분히 들어오도록 */
  min-height:480px;
  overflow:hidden;
}

/* 제품 풀블리드 이미지 */
.frhl-img{
  width:100%;
  height:100%;
  min-height:480px;
  object-fit:cover;
  object-position:center top;
  display:block;
  border-radius:var(--shape-photo, 0px);
}
.frhl-img.ph{display:none}

/* 이미지 없을 때 패널 높이 초기화 */
.frhl-panel.frhl-noimg{min-height:0;background:transparent}

/* 오버레이 그라디언트 — 이미지 위에 좌측 텍스트 가독성 확보 (스크림 강화) */
.frhl-overlay{
  position:absolute;
  inset:0;
  background:linear-gradient(90deg,
    rgba(0,0,0,.82) 0%,
    rgba(0,0,0,.68) 38%,
    rgba(0,0,0,.28) 62%,
    rgba(0,0,0,.0) 78%
  );
  pointer-events:none;
}

/* ── Step 리스트 (오버레이 모드) ── */
.frhl-steps{
  position:absolute;
  top:0; left:0; bottom:0;
  width:46%;
  max-width:340px;
  padding:36px var(--pad-x,56px) 36px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:0;
}

/* ── Step 리스트 (강등 모드: 이미지 없음) ── */
.frhl-steps-stack{
  display:flex;
  flex-direction:column;
  gap:0;
  padding:28px var(--pad-x,56px) 52px;
}

/* 개별 Step 행 */
.frhl-step{
  padding:20px 0;
  position:relative;
}
/* 구분선 — 마지막 제외 */
.frhl-step:not(:last-child)::after{
  content:'';
  display:block;
  position:absolute;
  bottom:0; left:28px; right:0;
  height:1px;
  background:rgba(255,255,255,.22);
}
/* 강등 모드 구분선은 잉크 라인 */
.frhl-steps-stack .frhl-step:not(:last-child)::after{
  background:var(--line);
  left:0;
}

/* Step 번호 라벨 */
.frhl-step-label{
  font-family:var(--font-display);
  font-weight:600;
  font-size:14px;
  letter-spacing:.05em;
  color:var(--accent);
  margin-bottom:8px;
}

/* KR+EN 키워드 행 */
.frhl-step-kw-row{
  display:flex;
  align-items:baseline;
  gap:8px;
  margin-bottom:6px;
}
.frhl-step-kw{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(22px,4vw,28px);
  line-height:1.1;
  letter-spacing:-.02em;
  color:var(--accent);
}
.frhl-step-kw .em{color:var(--accent);font-weight:800}
.frhl-step-en{
  font-family:var(--font-lat,'Cormorant Garamond',serif);
  font-weight:400;
  font-size:14px;
  color:rgba(255,255,255,.6);
  letter-spacing:.02em;
  line-height:1.3;
}

/* 설명 카피 */
.frhl-step-desc{
  font-family:var(--font-body);
  font-size:14px;
  font-weight:400;
  line-height:1.7;
  color:rgba(255,255,255,.8);
}
.frhl-step-desc .em{color:var(--accent);font-weight:700}

/* 강등 모드 — 텍스트 색상 재매핑 */
.frhl-steps-stack .frhl-step-en{color:var(--muted)}
.frhl-steps-stack .frhl-step-desc{color:var(--ink-2)}
.frhl-steps-stack .frhl-step-kw{color:var(--accent)}

/* 다크 배경(브랜드색 배경) 위 richSafe em 스코프 오버라이드 */
.frhl-panel .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => {
    const hasImg =
      typeof d.image === 'string' &&
      /^(https?:\/\/|data:|\/)/.test(d.image.trim())

    const stepItems = d.steps
      .map((s, i) => {
        const label = s.label ?? `Step ${pad2(i + 1)}.`
        return `
<div class="frhl-step">
  <div class="frhl-step-label">${esc(label)}</div>
  <div class="frhl-step-kw-row">
    <span class="frhl-step-kw">${richSafe(s.keyword)}</span>
    ${s.keywordEn ? `<span class="frhl-step-en">${esc(s.keywordEn)}</span>` : ''}
  </div>
  <div class="frhl-step-desc">${richSafe(s.desc)}</div>
</div>`
      })
      .join('')

    return `
<section class="frhl">
  <div class="frhl-head">
    ${d.eyebrow ? `<p class="frhl-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <div class="frhl-pretitle">${richSafe(d.preTitle)}</div>
    <div class="frhl-box">${esc(d.boxKeyword)}</div>
    ${d.mechanism ? `<p class="frhl-mechanism">${richSafe(d.mechanism)}</p>` : ''}
  </div>

  ${hasImg
    ? `<div class="frhl-panel">
    ${media(d.image, 'frhl-img', esc(d.imageAlt ?? '제품 이미지'))}
    <div class="frhl-overlay" aria-hidden="true"></div>
    <div class="frhl-steps" role="list">
      ${stepItems}
    </div>
  </div>`
    : `<div class="frhl-panel frhl-noimg">
    <div class="frhl-steps-stack" role="list">
      ${stepItems}
    </div>
  </div>`}
</section>`
  },
})
