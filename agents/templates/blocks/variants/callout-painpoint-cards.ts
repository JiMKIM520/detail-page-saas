/** CALLOUT 아키타입: callout-painpoint-cards.
 *  피그마 "문제제기/04" 구조 흡수 재구성.
 *  말풍선 질문 헤드(다크 라운드 박스+세모 꼬리) + 2줄 타이틀(보조+강조) +
 *  전폭 사진 + 점선 도트 + 형광펜 하이라이트 카드 리스트(세모 꼬리) + 강조 박스.
 *  872px 기준 데스크톱 레이아웃. 이미지 없으면 카드 리스트 단독으로 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 말풍선 안 질문 텍스트. 짧을수록 효과적. */
  bubble: z.string().min(1),
  /** 보조 타이틀 (em 허용). 예: "무릎이 불편한데" */
  titleSub: z.string().min(1),
  /** 강조 타이틀 (em 허용). 예: "그냥 참고 계신가요?" */
  titleMain: z.string().min(1),
  /** 섹션 전폭 이미지 (url). 없으면 카드 리스트만 표시. */
  image: z.string().optional(),
  /** 고통 공감 카드 2~4개. */
  items: z
    .array(
      z.object({
        /** 카드 본문 (em/br 허용). 형광펜이 텍스트 뒤에 깔림. */
        text: z.string().min(1),
        /** 형광펜 너비(%). 기본 자동. 브리프에 근거 있을 때만 지정. */
        highlightWidth: z.number().min(20).max(100).optional(),
      }),
    )
    .min(2)
    .max(4),
  /** 카드 아래 요약 설명 (em/br 허용). */
  desc: z.string().optional(),
  /** 강조 박스 안 카피 (em/br 허용). 브리프에 근거 있는 핵심 메시지만. */
  accent: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const calloutPainpointCards = defineBlock<Data>({
  id: 'callout-painpoint-cards',
  archetype: 'callout',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '문제 공감 섹션. 말풍선 질문 헤드(다크 라운드+삼각 꼬리) + 2줄 타이틀 + 전폭 사진(선택) + 형광펜 하이라이트 카드 리스트(2~4개) + 강조 박스. 소비자 페인포인트 열거에 최적.',
  schema,
  css: `
.cpcd{background:var(--bg);color:var(--ink);padding:56px 0 64px;font-family:var(--font-body,'Pretendard',sans-serif)}

/* ── 말풍선 헤드 ── */
.cpcd-bubble-wrap{display:flex;justify-content:center;padding:0 var(--pad-x,56px)}
.cpcd-bubble{position:relative;display:inline-flex;align-items:center;justify-content:center;
  background:var(--ink);color:#fff;
  border-radius:calc(var(--r-scale,1)*999px);
  padding:14px 36px;
  font-size:22px;font-weight:700;line-height:1.3;letter-spacing:-.01em;
  white-space:nowrap}
/* 삼각 꼬리 — CSS clip-path */
.cpcd-bubble::after{content:'';position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);
  width:0;height:0;
  border-left:12px solid transparent;
  border-right:12px solid transparent;
  border-top:18px solid var(--ink)}

/* ── 타이틀 ── */
.cpcd-title-wrap{margin-top:30px;text-align:center;padding:0 var(--pad-x,56px)}
.cpcd-title-sub{font-size:36px;font-weight:500;color:var(--ink);line-height:1.3;letter-spacing:-.01em}
.cpcd-title-sub .em{color:var(--accent)}
.cpcd-title-main{font-size:42px;font-weight:800;color:var(--accent);line-height:1.25;letter-spacing:-.02em;margin-top:4px}
.cpcd-title-main .em{color:var(--ink)}

/* ── 전폭 이미지 ── */
.cpcd-photo-wrap{margin-top:32px;position:relative}
.cpcd-photo{width:100%;aspect-ratio:872/600;object-fit:cover;display:block;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px))}

/* ── 점선 도트 장식 (이미지 없을 때도 표시) ── */
.cpcd-dots{display:flex;flex-direction:column;align-items:center;gap:8px;
  padding:18px 0 14px}
.cpcd-dot{width:10px;height:10px;border-radius:50%}
.cpcd-dot:nth-child(1){background:color-mix(in srgb,var(--ink) 60%,transparent)}
.cpcd-dot:nth-child(2){background:color-mix(in srgb,var(--ink) 40%,transparent)}
.cpcd-dot:nth-child(3){background:color-mix(in srgb,var(--ink) 25%,transparent)}

/* ── 카드 리스트 ── */
.cpcd-list{display:flex;flex-direction:column;gap:16px;padding:0 var(--pad-x,56px)}

.cpcd-card-outer{position:relative}
/* 카드 본체 */
.cpcd-card{position:relative;background:#fff;border-radius:calc(var(--r-scale,1)*16px);
  padding:22px 28px 24px;
  box-shadow:0 4px 18px -6px rgba(0,0,0,.10);
  text-align:center}
/* 형광펜 레이어 — 텍스트 뒤에 깔리는 투명 블록 */
.cpcd-hl{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:var(--hl-w,72%);height:26px;
  background:color-mix(in srgb,var(--accent) 18%,transparent);
  border-radius:calc(var(--r-scale,1)*4px);
  pointer-events:none}
.cpcd-card-text{position:relative;z-index:1;
  font-size:18px;font-weight:500;color:var(--ink);line-height:1.65;word-break:keep-all}
.cpcd-card-text .em{color:var(--accent);font-weight:700}
/* 카드 아래 삼각 꼬리 (배경=카드 흰색) */
.cpcd-tail{position:absolute;bottom:-14px;left:50%;transform:translateX(-50%);
  width:0;height:0;
  border-left:10px solid transparent;
  border-right:10px solid transparent;
  border-top:14px solid #fff;
  filter:drop-shadow(0 3px 3px rgba(0,0,0,.06))}

/* ── 하단 설명 ── */
.cpcd-desc{margin-top:32px;padding:0 var(--pad-x,56px);
  text-align:center;font-size:18px;font-weight:600;line-height:1.7;color:var(--ink-2);word-break:keep-all}
.cpcd-desc .em{color:var(--accent);font-weight:800}

/* ── 강조 박스 ── */
.cpcd-accent-box{margin:18px var(--pad-x,56px) 0;
  background:var(--accent);border-radius:calc(var(--r-scale,1)*8px);
  padding:18px 28px;text-align:center}
.cpcd-accent-box p{font-size:20px;font-weight:700;color:#fff;line-height:1.5;word-break:keep-all}
.cpcd-accent-box .em{color:var(--em-dark,#FFF7EA);font-weight:900}
`,
  render: (d, { esc, richSafe }) => {
    const hasImage = typeof d.image === 'string' && d.image.length > 0

    const cards = d.items
      .map((item) => {
        const hlStyle = item.highlightWidth != null ? ` style="--hl-w:${item.highlightWidth}%"` : ''
        return `
    <div class="cpcd-card-outer">
      <div class="cpcd-card">
        <div class="cpcd-hl"${hlStyle}></div>
        <p class="cpcd-card-text">${richSafe(item.text)}</p>
      </div>
      <div class="cpcd-tail"></div>
    </div>`
      })
      .join('')

    return `
<section class="cpcd">
  <div class="cpcd-bubble-wrap">
    <div class="cpcd-bubble">${esc(d.bubble)}</div>
  </div>
  <div class="cpcd-title-wrap">
    <p class="cpcd-title-sub">${richSafe(d.titleSub)}</p>
    <p class="cpcd-title-main">${richSafe(d.titleMain)}</p>
  </div>
  ${hasImage ? `<div class="cpcd-photo-wrap">${media(d.image, 'cpcd-photo', '문제 공감 이미지')}</div>` : ''}
  <div class="cpcd-dots">
    <div class="cpcd-dot"></div>
    <div class="cpcd-dot"></div>
    <div class="cpcd-dot"></div>
  </div>
  <div class="cpcd-list">${cards}
  </div>
  ${d.desc ? `<p class="cpcd-desc">${richSafe(d.desc)}</p>` : ''}
  ${d.accent ? `<div class="cpcd-accent-box"><p>${richSafe(d.accent)}</p></div>` : ''}
</section>`
  },
})
