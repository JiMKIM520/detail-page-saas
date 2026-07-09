/** STORY 아키타입: story-cause-flow
 *  피그마 202_문제공감_02 패턴 흡수.
 *  짙은 다크 배경 + 타이틀 → 원인 이미지 위에 올리브/크림 2색 텍스트박스 인과 레이어 →
 *  화살표 연결 3단계 플로우 카드 → 2열 증상 이미지 카드 → 인용 블록 → 전폭 하단 이미지.
 *  다크 배경 전체: .em 스코프 오버라이드(--em-dark) 필수. 이미지 없이도 붕괴하지 않는 noimg-safe 강등 구현.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  /** 상단 소제목 (em 허용) */
  eyebrow: z.string().min(1),
  /** 메인 타이틀 (em,br 허용) */
  title: z.string().min(1),

  /** 원인 이미지 (url) — 없으면 올리브 틴트 패널로 강등 */
  causeImage: z.string().optional(),
  /** 인과 레이어: 강한 라벨 (em 허용) — 예: "과도한 피지 & 각질" */
  causeLabel: z.string().min(1),
  /** 인과 레이어: 약한 라벨 (em 허용) — 예: "두피 환경 불균형" */
  causeSubLabel: z.string().min(1),

  /** 화살표 연결 플로우 카드 2~3단계 */
  steps: z
    .array(
      z.object({
        num: z.string().min(1),  // "01" "02" "03"
        label: z.string().min(1), // 단계 이름 (em 허용)
      }),
    )
    .min(2)
    .max(3),

  /** 플로우 아래 결과 카피 (em,br 허용) */
  resultHeadline: z.string().min(1),
  /** 결과 카피 보조 (em 허용) */
  resultSub: z.string().optional(),

  /** 2열 증상 카드 (이미지+캡션) — 정확히 2개 */
  symptomCards: z
    .array(
      z.object({
        image: z.string().optional(), // (url)
        caption: z.string().min(1),   // 증상 이름
      }),
    )
    .length(2),

  /** 인용문 (em 허용) */
  quote: z.string().min(1),
  /** 인용문 보조 설명 (em,br 허용) */
  quoteDesc: z.string().optional(),

  /** 전폭 하단 이미지 (url) */
  bottomImage: z.string().optional(),
})

type Data = z.infer<typeof schema>

// ── variant ───────────────────────────────────────────────────────────────────

export const storyCauseFlow = defineBlock<Data>({
  id: 'story-cause-flow',
  archetype: 'story',
  styleTags: ['dark', 'editorial', 'problem', 'noimg-safe'],
  imageSlots: 4, // causeImage + 2×symptomCards + bottomImage
  describe:
    '문제 원인→결과 스토리. 짙은 올리브 다크 배경 + 대제목 → 원인 이미지 위에 올리브·크림 2색 인과 텍스트박스 레이어 → 번호형 플로우 카드(화살표 연결) → 2열 증상 이미지 카드 → 인용 블록 → 전폭 하단 이미지. 뷰티/헤어/스킨 문제공감 섹션에 적합.',
  schema,
  css: `
/* ── root scope ─────────────────────────────────────────── */
.soxx{background:var(--brand,#485234);color:var(--bg,#ebeadd);padding:0;overflow:hidden}
/* dark 섹션 전체: em 강조색 오버라이드 */
.soxx .em{color:var(--em-dark,#FFF7EA)}

/* ── 타이틀 영역 ────────────────────────────────────────── */
.soxx-hd{padding:64px var(--pad-x,56px) 48px}
.soxx-eyebrow{font-size:18px;font-weight:600;letter-spacing:.08em;color:var(--accent,#acae77);margin-bottom:14px;text-transform:none}
.soxx-title{font-family:var(--font-display);font-size:clamp(36px,5vw,56px);font-weight:800;line-height:1.15;color:var(--bg,#ebeadd)}

/* ── 원인 이미지 + 인과 레이어 ───────────────────────────── */
.soxx-cause{position:relative;margin:0 var(--pad-x,56px);border-radius:calc(var(--r-scale,1)*16px);overflow:hidden}
.soxx-cause-img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:inherit;display:block}
/* 이미지 없을 때 강등: 올리브 틴트 패널 */
.soxx-cause-img.ph{display:block!important;background:color-mix(in srgb,var(--accent,#acae77) 22%,var(--brand,#485234));aspect-ratio:16/9;border-radius:inherit}
.soxx-cause-labels{display:flex;flex-direction:column;gap:0}
.soxx-cause-strong{
  background:var(--accent,#acae77);
  color:#000;
  font-size:clamp(22px,3.5vw,34px);
  font-weight:700;
  text-align:center;
  padding:14px var(--pad-x,56px);
  line-height:1.3;
}
.soxx-cause-soft{
  background:color-mix(in srgb,var(--accent,#acae77) 48%,var(--bg,#ebeadd));
  color:#000;
  font-size:clamp(20px,3vw,30px);
  font-weight:400;
  text-align:center;
  padding:13px var(--pad-x,56px);
  line-height:1.3;
}

/* ── 플로우 카드 ─────────────────────────────────────────── */
.soxx-flow{padding:40px var(--pad-x,56px) 0;display:flex;flex-direction:column;align-items:center;gap:0}
.soxx-flow-cards{display:flex;align-items:center;gap:10px;width:100%}
.soxx-flow-card{
  flex:1;
  background:rgba(24,29,26,.80);
  border-radius:calc(var(--r-scale,1)*20px);
  padding:22px 12px;
  text-align:center;
}
.soxx-flow-num{font-size:clamp(20px,3vw,28px);font-weight:600;color:var(--accent,#acae77);line-height:1.1;margin-bottom:8px}
.soxx-flow-label{font-size:clamp(16px,2.5vw,22px);font-weight:500;color:rgba(255,255,255,.80);line-height:1.3}
.soxx-flow-label .em{color:var(--em-dark,#FFF7EA)}
/* 화살표 SVG */
.soxx-arrow{flex:0 0 28px;width:28px;color:var(--accent,#acae77);opacity:.75}

/* ── 결과 카피 ───────────────────────────────────────────── */
.soxx-result{padding:40px var(--pad-x,56px) 0;text-align:center}
.soxx-result-hl{font-family:var(--font-display);font-size:clamp(26px,4vw,44px);font-weight:600;line-height:1.4;color:var(--accent,#acae77)}
.soxx-result-hl .em{color:var(--em-dark,#FFF7EA)}
.soxx-result-sub{margin-top:10px;font-size:clamp(18px,2.5vw,30px);font-weight:400;color:var(--accent,#acae77);line-height:1.45}
.soxx-result-sub .em{color:var(--em-dark,#FFF7EA)}

/* ── 증상 카드 2열 ───────────────────────────────────────── */
.soxx-symptoms{padding:36px var(--pad-x,56px) 0;display:grid;grid-template-columns:1fr 1fr;gap:14px}
.soxx-symp-card{
  position:relative;
  border-radius:calc(var(--r-scale,1)*12px);
  overflow:hidden;
  background:#000;
  aspect-ratio:3/4;
}
.soxx-symp-img{
  width:100%;height:100%;
  object-fit:cover;
  display:block;
  border-radius:inherit;
  var(--shape-photo, calc(var(--r-scale,1)*12px));
}
/* noimg-safe: 이미지 없을 때 어두운 패널 */
.soxx-symp-img.ph{display:block!important;background:color-mix(in srgb,var(--brand,#485234) 80%,#000);width:100%;height:100%;border-radius:inherit}
.soxx-symp-cap{
  position:absolute;bottom:0;left:0;right:0;
  background:rgba(24,29,26,.70);
  padding:14px 12px;
  text-align:center;
  font-size:clamp(16px,2.2vw,24px);
  font-weight:600;
  color:#fff;
  line-height:1.2;
}

/* ── 구분선 + 인용 ───────────────────────────────────────── */
.soxx-quote-wrap{padding:44px var(--pad-x,56px) 0;text-align:center}
.soxx-divider{width:60%;margin:0 auto 28px;height:1px;background:color-mix(in srgb,var(--bg,#ebeadd) 25%,transparent)}
.soxx-dot-accent{
  display:flex;justify-content:center;margin-bottom:22px;
}
.soxx-dot-accent span{
  display:block;width:4px;background:var(--accent,#acae77);
  border-radius:999px;
}
.soxx-quote{
  font-family:var(--font-display);
  font-size:clamp(28px,4.5vw,52px);
  font-weight:600;
  color:var(--accent,#acae77);
  line-height:1.35;
}
.soxx-quote .em{color:var(--em-dark,#FFF7EA)}
.soxx-quote-desc{
  margin-top:18px;
  font-size:clamp(18px,2.4vw,32px);
  font-weight:500;
  color:var(--bg,#ebeadd);
  line-height:1.6;
}
.soxx-quote-desc .em{color:var(--em-dark,#FFF7EA)}

/* ── 전폭 하단 이미지 ────────────────────────────────────── */
.soxx-bottom{margin-top:44px;width:100%;overflow:hidden;var(--shape-photo, 0px)}
.soxx-bottom-img{width:100%;display:block;aspect-ratio:16/7;object-fit:cover}
/* noimg-safe: 하단 이미지 없으면 완전 숨김 */
.soxx-bottom--empty{display:none}
`,
  render: (d, { esc, richSafe, icon }) => {
    // 화살표 SVG (인라인)
    const arrowSvg = `<svg class="soxx-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`

    // 플로우 카드들 (화살표 사이 삽입)
    const flowCards = d.steps
      .map((s, i) => {
        const card = `<div class="soxx-flow-card">
        <div class="soxx-flow-num">${esc(s.num)}</div>
        <div class="soxx-flow-label">${richSafe(s.label)}</div>
      </div>`
        return i < d.steps.length - 1 ? card + arrowSvg : card
      })
      .join('')

    // 증상 카드 2장
    const symptomCards = d.symptomCards
      .map(
        (c) => `
      <div class="soxx-symp-card">
        ${media(c.image, 'soxx-symp-img', c.caption)}
        <div class="soxx-symp-cap">${esc(c.caption)}</div>
      </div>`,
      )
      .join('')

    // 하단 이미지
    const hasBottom =
      typeof d.bottomImage === 'string' &&
      /^(https?:\/\/|data:|\/)/.test(d.bottomImage.trim())
    const bottomSection = hasBottom
      ? `<div class="soxx-bottom">${media(d.bottomImage, 'soxx-bottom-img', '하단 이미지')}</div>`
      : '<div class="soxx-bottom--empty"></div>'

    return `
<section class="soxx">

  <!-- 타이틀 -->
  <div class="soxx-hd">
    <p class="soxx-eyebrow">${richSafe(d.eyebrow)}</p>
    <h2 class="soxx-title">${richSafe(d.title)}</h2>
  </div>

  <!-- 원인 이미지 + 인과 레이어 -->
  <div class="soxx-cause-wrap" style="margin:0 var(--pad-x,56px)">
    <div class="soxx-cause">
      ${media(d.causeImage, 'soxx-cause-img', '원인 이미지')}
    </div>
    <div class="soxx-cause-labels">
      <div class="soxx-cause-strong">${richSafe(d.causeLabel)}</div>
      <div class="soxx-cause-soft">${richSafe(d.causeSubLabel)}</div>
    </div>
  </div>

  <!-- 플로우 카드 -->
  <div class="soxx-flow">
    <div class="soxx-flow-cards">${flowCards}</div>
  </div>

  <!-- 결과 카피 -->
  <div class="soxx-result">
    <p class="soxx-result-hl">${richSafe(d.resultHeadline)}</p>
    ${d.resultSub ? `<p class="soxx-result-sub">${richSafe(d.resultSub)}</p>` : ''}
  </div>

  <!-- 증상 카드 2열 -->
  <div class="soxx-symptoms">${symptomCards}</div>

  <!-- 인용 블록 -->
  <div class="soxx-quote-wrap">
    <div class="soxx-divider"></div>
    <div class="soxx-dot-accent">
      <span style="height:56px"></span>
    </div>
    <blockquote class="soxx-quote">${richSafe(d.quote)}</blockquote>
    ${d.quoteDesc ? `<p class="soxx-quote-desc">${richSafe(d.quoteDesc)}</p>` : ''}
  </div>

  <!-- 전폭 하단 이미지 -->
  ${bottomSection}

</section>`
  },
})
