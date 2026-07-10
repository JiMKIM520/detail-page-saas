/** STATS 아키타입: stats-bottle-stat-rail
 *  피그마 063_포인트_구성_페이지_36 흡수.
 *  그라데이션 다크 배경 + 좌상단 헤드라인 텍스트 블록 + 중앙 세로형 제품 목업 이미지 +
 *  우측 수직 스탯 레일(수치 그라데이션 + 라벨). 뷰티/스킨케어 임상 수치 강조에 최적. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const statItemSchema = z.object({
  value: z.string().min(1),              // 수치 (em 허용) — 예: "-5.47%"
  label: z.string().min(1),             // 수치 설명 — 예: "가로모공 개선효과"
})

const schema = z.object({
  eyebrow: z.string().optional(),        // 작은 상단 카피 (라이트 웨이트)
  title: z.string().min(1),             // 메인 헤드라인 (em,br 허용) — 굵은 세미볼드
  desc: z.string().optional(),           // 보조 설명 (순수 텍스트)
  image: z.string().optional(),          // 세로형 제품 목업 이미지 (url) — 없을 때 강등
  stats: z.array(statItemSchema).min(2).max(6), // 우측 수직 스탯 레일 항목
  sourceLine: z.string().optional(),     // 브리프 근거 있을 때만 — 예: "*임상 시험 결과 (n=30)"
})
type Data = z.infer<typeof schema>

export const statsBottleStatRail = defineBlock<Data>({
  id: 'stats-bottle-stat-rail',
  archetype: 'stats',
  // noimg-safe: 제품 이미지 없을 때 중앙 컬럼 축소 + 스탯 레일이 헤드라인 우측으로 이동하는 2컬럼 강등
  styleTags: ['dark', 'beauty', 'clinical', 'premium', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '다크 그라데이션 배경 + 좌상단 헤드라인(eyebrow+title+desc) + 중앙 세로형 제품 목업 + 우측 수직 스탯 레일(수치 그라데이션+라벨). 뷰티/스킨케어 임상 수치를 보틀 옆에 시각적으로 배열. 제품 이미지 없을 때 2컬럼 강등(noimg-safe).',
  schema,
  css: `
.stit{
  position:relative;
  background:linear-gradient(145deg,#0d0d12 0%,#1a1228 45%,#0e1520 100%);
  color:#fff;
  padding:64px var(--pad-x,56px) 72px;
  overflow:hidden;
}
/* 배경 글로우 장식 — CSS only */
.stit::before{
  content:'';
  position:absolute;
  inset:0;
  background:
    radial-gradient(ellipse 55% 40% at 38% 60%,rgba(130,80,220,.18) 0%,transparent 70%),
    radial-gradient(ellipse 40% 55% at 70% 30%,rgba(60,140,255,.12) 0%,transparent 65%);
  pointer-events:none;
}
/* 3컬럼 레이아웃: 텍스트 | 이미지 | 스탯 레일 */
.stit-layout{
  position:relative;
  display:grid;
  grid-template-columns:1fr auto 1fr;
  gap:0 32px;
  align-items:center;
  min-height:480px;
}
/* 이미지 없는 강등: 2컬럼 */
.stit-layout.noimg{
  grid-template-columns:1fr 1fr;
  gap:0 48px;
}
/* ── 좌측 텍스트 블록 ── */
.stit-text{
  align-self:flex-start;
  padding-top:16px;
  position:relative;
  z-index:1;
}
.stit-eyebrow{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:18px;
  font-weight:300;
  color:rgba(255,255,255,.65);
  margin-bottom:14px;
  letter-spacing:.02em;
}
.stit-title{
  font-family:var(--font-display),'Pretendard',sans-serif;
  font-size:42px;
  font-weight:700;
  line-height:1.28;
  color:#fff;
  word-break:keep-all;
}
.stit .em{
  /* 다크 섹션 richSafe 스코프 오버라이드 — 규약 필수 */
  color:var(--em-dark,#FFF7EA);
}
.stit-desc{
  margin-top:20px;
  font-size:16px;
  font-weight:300;
  color:rgba(220,220,230,.9);
  line-height:1.72;
}
/* 텍스트 블록이 이미지와 겹치는 영역에서 가독성 보장: 우측에 스크림 */
.stit-text::after{
  content:'';
  position:absolute;
  inset:0;
  right:-32px;
  background:linear-gradient(90deg,rgba(13,13,18,.85) 60%,transparent 100%);
  pointer-events:none;
  z-index:-1;
}
/* ── 중앙 제품 이미지 컬럼 ── */
.stit-img-col{
  width:220px;
  display:flex;
  align-items:center;
  justify-content:center;
}
.stit-img-frame{
  width:220px;
  height:500px;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*28px));
  overflow:hidden;
  background:rgba(255,255,255,.04);
}
.stit-img-frame img{
  width:100%;
  height:100%;
  object-fit:contain;
  object-position:center;
}
/* noimg-safe: 이미지 컬럼 전체 숨김 */
.stit-layout.noimg .stit-img-col{
  display:none;
}
/* ── 우측 스탯 레일 ── */
.stit-rail{
  display:flex;
  flex-direction:column;
  gap:28px;
  align-self:center;
}
.stit-stat{
  display:flex;
  flex-direction:column;
  gap:6px;
}
/* 수치 — 그라데이션 텍스트 */
.stit-val{
  font-family:var(--font-display),'Pretendard',sans-serif;
  font-size:52px;
  font-weight:700;
  line-height:1.05;
  letter-spacing:-.02em;
  /* 그라데이션 텍스트 */
  background:linear-gradient(90deg,#a78bfa 0%,#60a5fa 60%,#93c5fd 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
}
.stit-lbl{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:17px;
  font-weight:300;
  color:rgba(255,255,255,.8);
  letter-spacing:.01em;
}
/* 구분선 — 스탯 항목 사이 */
.stit-stat+.stit-stat{
  border-top:1px solid rgba(255,255,255,.1);
  padding-top:28px;
  margin-top:-28px;
}
/* 출처 라인 */
.stit-source{
  position:relative;
  margin-top:32px;
  font-size:13px;
  color:rgba(255,255,255,.35);
  text-align:right;
  letter-spacing:.01em;
}
`,
  render: (d, { esc, richSafe }) => {
    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())
    const layoutCls = hasImg ? 'stit-layout' : 'stit-layout noimg'

    const statsHtml = d.stats
      .map(
        (s) => `
        <div class="stit-stat">
          <span class="stit-val">${richSafe(s.value)}</span>
          <span class="stit-lbl">${esc(s.label)}</span>
        </div>`,
      )
      .join('')

    return `
<section class="stit">
  <div class="${layoutCls}">
    <div class="stit-text">
      ${d.eyebrow ? `<p class="stit-eyebrow">${esc(d.eyebrow)}</p>` : ''}
      <h2 class="stit-title">${richSafe(d.title)}</h2>
      ${d.desc ? `<p class="stit-desc">${esc(d.desc)}</p>` : ''}
    </div>
    <div class="stit-img-col">
      <div class="stit-img-frame">
        ${media(d.image, '', '제품 이미지')}
      </div>
    </div>
    <div class="stit-rail">
      ${statsHtml}
    </div>
  </div>
  ${d.sourceLine ? `<p class="stit-source">${esc(d.sourceLine)}</p>` : ''}
</section>`
  },
})
