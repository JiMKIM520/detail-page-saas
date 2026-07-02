/** CS 아키타입: cs-contact-banner.
 *  [끝판왕] CS 구성 #2 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 투존 — 상단 accent 그라디언트 헤더(좌측 이미지 + 영문 eyebrow + 한글 대제목)
 *  / 하단 다크(--ink) 연락처 존(인트로 문구 + 전화·영업시간 display label-value 쌍 + 주의 bullet 목록). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 영문 소제목 (eyebrow, 예: "Customer Inquiry Notice") */
  eyebrow: z.string().min(1),
  /** 한글 대제목 (예: "고객 문의 안내", em/br 허용) */
  title: z.string().min(1),
  /** 헤더 좌측 이미지 URL (선택) */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
  /** 다크 존 인트로 문구 (em 허용, 선택) */
  intro: z.string().optional(),
  /** 전화·영업시간 등 display 쌍 (1~3개) */
  contacts: z
    .array(
      z.object({
        /** 라벨 (예: "전화번호", "영업시간") */
        label: z.string().min(1),
        /** 값 (예: "02-1234-1234", "09:00 ~ 17:00") */
        value: z.string().min(1),
      }),
    )
    .min(1)
    .max(3),
  /** 주의·안내 bullet 문구 (선택, 1~4개) */
  notes: z.array(z.string().min(1)).max(4).optional(),
})
type Data = z.infer<typeof schema>

export const csContactBanner = defineBlock<Data>({
  id: 'cs-contact-banner',
  archetype: 'cs',
  styleTags: ['dark', 'accent', 'cs', 'contact', 'twozone'],
  imageSlots: 1,
  describe:
    'CS 고객 문의 안내 투존 배너. 상단: accent 그라디언트 헤더(좌측 이미지 + 영문 eyebrow + 한글 대제목). 하단: 다크(--ink) 배경 + 인트로 문구 + 전화·영업시간 display label-value 쌍(1~3개) + 주의 bullet 목록.',
  schema,
  css: `
/* cs-contact-banner — 접두사 ccb- */

/* ── 전체 래퍼 ── */
.ccb{overflow:hidden}

/* ── 상단: accent 그라디언트 헤더 ── */
.ccb-header{
  background:linear-gradient(135deg,var(--accent-d) 0%,var(--accent) 100%);
  padding:40px 36px 44px;
  display:flex;
  align-items:center;
  gap:28px;
}

/* 좌측 이미지 */
.ccb-img{
  width:160px;
  height:160px;
  object-fit:cover;
  border-radius:8px;
  flex-shrink:0;
}
.ccb-img.ph{
  width:160px;
  height:160px;
  flex-shrink:0;
  border-radius:8px;
  border:2px dashed rgba(255,255,255,.35);
  background:rgba(255,255,255,.12);
  color:rgba(255,255,255,.55);
  font-size:13px;
}

/* 우측 텍스트 */
.ccb-text{flex:1;min-width:0}
.ccb-eyebrow{
  font-family:var(--font-body);
  font-size:14px;
  font-weight:400;
  letter-spacing:.08em;
  color:rgba(255,255,255,.82);
  margin-bottom:10px;
}
.ccb-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(30px,6.2vw,48px);
  line-height:1.18;
  letter-spacing:-.025em;
  color:#fff;
}
/* 다크 배경 위 — .em은 밝은 accent(화이트에 가까운 틴트)로 override */
.ccb-title .em{color:rgba(255,255,255,.75)}

/* ── 하단: 다크 연락처 존 ── */
.ccb-body{
  background:var(--ink);
  padding:44px 36px 48px;
  text-align:center;
}

/* 인트로 */
.ccb-intro{
  font-family:var(--font-body);
  font-size:15px;
  line-height:1.8;
  color:rgba(255,255,255,.72);
  margin-bottom:32px;
  letter-spacing:-.005em;
}
.ccb-intro .em{
  color:var(--accent);
  font-weight:700;
}

/* display 쌍 목록 */
.ccb-contacts{
  display:flex;
  flex-direction:column;
  gap:10px;
  margin-bottom:28px;
}
.ccb-row{
  display:flex;
  align-items:baseline;
  justify-content:center;
  gap:14px;
}
.ccb-label{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(18px,3.6vw,24px);
  color:var(--accent);
  letter-spacing:-.01em;
  white-space:nowrap;
}
.ccb-value{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(20px,4.2vw,30px);
  color:#fff;
  letter-spacing:-.015em;
}

/* 구분선 */
.ccb-divider{
  border:none;
  border-top:1px solid rgba(255,255,255,.12);
  margin:0 0 20px;
}

/* 주의 bullet 목록 */
.ccb-notes{
  list-style:none;
  display:flex;
  flex-direction:column;
  gap:6px;
}
.ccb-note{
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.7;
  color:rgba(255,255,255,.52);
  display:flex;
  align-items:flex-start;
  justify-content:center;
  gap:6px;
}
.ccb-note::before{
  content:'•';
  flex-shrink:0;
  color:rgba(255,255,255,.4);
}
`,
  render: (d, { esc, richSafe }) => {
    const contactsHtml = d.contacts
      .map(
        (c) =>
          `<div class="ccb-row"><span class="ccb-label">${esc(c.label)}</span><span class="ccb-value">${esc(c.value)}</span></div>`,
      )
      .join('')

    const notesHtml =
      d.notes && d.notes.length
        ? `<hr class="ccb-divider"><ul class="ccb-notes">${d.notes.map((n) => `<li class="ccb-note">${esc(n)}</li>`).join('')}</ul>`
        : ''

    return `
<section class="ccb">
  <div class="ccb-header">
    ${media(d.image, 'ccb-img', esc(d.imageAlt ?? '고객센터 이미지'))}
    <div class="ccb-text">
      <p class="ccb-eyebrow">${esc(d.eyebrow)}</p>
      <h2 class="ccb-title">${richSafe(d.title)}</h2>
    </div>
  </div>
  <div class="ccb-body">
    ${d.intro ? `<p class="ccb-intro">${richSafe(d.intro)}</p>` : ''}
    <div class="ccb-contacts">${contactsHtml}</div>
    ${notesHtml}
  </div>
</section>`
  },
})
