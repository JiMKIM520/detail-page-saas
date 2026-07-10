/** CS 아키타입: cs-slogan-info-table
 *  피그마 173_FAQ_문의_구성_페이지_5 흡수.
 *  상단 다크(brand) 대형 채용 슬로건 블록 + 하단 흰 배경 정보행 테이블(다크 뱃지 레이블 + 인라인 값).
 *  채용공고·입사지원·모집안내 등 CS 정보 전달 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'

// ── 정보행 아이템 스키마 (레이블 + 주값 + 선택 보조설명) ─────────────────
const rowSchema = z.object({
  label: z.string().min(1),          // 뱃지 안 레이블 (예: 모집기간)
  value: z.string().min(1),          // 인라인 주값 (em 허용)
  sub: z.string().optional(),        // 보조 설명 한 줄 (순수 텍스트)
})

const schema = z.object({
  slogan: z.string().min(1),         // 다크 히어로 대형 슬로건 (em,br 허용)
  logoText: z.string().optional(),   // 히어로 우상단 로고/브랜드명 텍스트
  contact: z.string().optional(),    // 하단 연락처 (tel / url 등, 순수 텍스트)
  rows: z
    .array(rowSchema)
    .min(2)
    .max(9),
})
type Data = z.infer<typeof schema>

export const csSloganInfoTable = defineBlock<Data>({
  id: 'cs-slogan-info-table',
  archetype: 'cs',
  styleTags: ['dark', 'editorial', 'recruit', 'info-table'],
  imageSlots: 0,
  describe:
    '채용공고형 CS 레이아웃. 다크(brand) 배경 대형 슬로건 히어로 블록 위에 우상단 로고텍스트, 하단 흰 배경에 다크 뱃지 레이블+인라인 값 정보행을 수직 나열. 채용·모집·운영안내 정보 전달에 적합.',
  schema,
  css: `
.cecx{background:var(--paper,#ffffff);font-family:var(--font-body)}

/* ── 다크 히어로 블록 ── */
.cecx-hero{
  position:relative;
  background:var(--brand,#2e2d2d);
  padding:60px var(--pad-x,56px) 56px;
  overflow:hidden;
}
.cecx-hero::after{
  content:'';
  position:absolute;
  inset:0;
  background:radial-gradient(ellipse 70% 80% at 80% 20%,rgba(255,255,255,.04) 0%,transparent 60%);
  pointer-events:none;
}
.cecx-logo{
  position:absolute;
  top:28px;
  right:var(--pad-x,56px);
  font-family:var(--font-display);
  font-size:15px;
  font-weight:600;
  letter-spacing:.08em;
  color:rgba(255,255,255,.55);
  text-transform:uppercase;
  z-index:1;
}
.cecx-slogan{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(44px,7vw,82px);
  line-height:1.12;
  color:#ffffff;
  letter-spacing:-.02em;
  max-width:780px;
  position:relative;
  z-index:1;
}
.cecx .em{color:var(--em-dark,#FFF7EA)}

/* ── 정보 테이블 영역 ── */
.cecx-table{
  padding:48px var(--pad-x,56px) 20px;
  display:flex;
  flex-direction:column;
  gap:0;
}
.cecx-row{
  display:flex;
  align-items:flex-start;
  gap:40px;
  padding:20px 0;
  border-bottom:1px solid var(--line,#e8e8e8);
}
.cecx-row:first-child{border-top:1px solid var(--line,#e8e8e8)}

/* 뱃지 레이블 */
.cecx-badge{
  flex:0 0 88px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  height:30px;
  background:var(--brand,#2e2d2d);
  border-radius:calc(var(--r-scale,1)*4px);
  padding:0 10px;
  white-space:nowrap;
}
.cecx-badge-text{
  font-size:13px;
  font-weight:700;
  color:#ffffff;
  letter-spacing:.04em;
}

/* 값 영역 */
.cecx-val-wrap{
  flex:1;
  display:flex;
  flex-direction:column;
  gap:5px;
  padding-top:3px;
}
.cecx-val{
  font-size:17px;
  font-weight:700;
  color:var(--ink,#111111);
  line-height:1.45;
}
.cecx-val .em{color:var(--accent);font-weight:800}
.cecx-sub{
  font-size:13px;
  font-weight:400;
  color:var(--muted,#5a5a5a);
  line-height:1.55;
}

/* ── 연락처 푸터 ── */
.cecx-contact{
  padding:20px var(--pad-x,56px) 44px;
  font-size:13px;
  color:var(--muted,#5a5a5a);
  line-height:1.7;
  white-space:pre-line;
}
`,
  render: (d, { esc, richSafe }) => `
<section class="cecx">
  <div class="cecx-hero">
    ${d.logoText ? `<span class="cecx-logo">${esc(d.logoText)}</span>` : ''}
    <h2 class="cecx-slogan">${richSafe(d.slogan)}</h2>
  </div>
  <div class="cecx-table">
    ${d.rows.map(row => `
    <div class="cecx-row">
      <span class="cecx-badge"><span class="cecx-badge-text">${esc(row.label)}</span></span>
      <div class="cecx-val-wrap">
        <span class="cecx-val">${richSafe(row.value)}</span>
        ${row.sub ? `<span class="cecx-sub">${esc(row.sub)}</span>` : ''}
      </div>
    </div>`).join('')}
  </div>
  ${d.contact ? `<p class="cecx-contact">${esc(d.contact)}</p>` : ''}
</section>`,
})
