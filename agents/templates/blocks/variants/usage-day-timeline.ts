/** USAGE 아키타입: usage-day-timeline.
 *  346_사용방법_07 패턴 재구성.
 *  라운드 라벨 + 대형 타이틀 + 제품 이미지 + DAY별 번호/세로선 타임라인 카드(4단계) + 하단 안내.
 *  핵심 장치: 카드 좌측 대형 강조 번호를 세로선으로 분리해 전환 단계를 타임라인으로 읽히게 함. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  label: z.string().min(1).optional(),      // 라운드 박스 영문 레이블 (기본 "HOW TO USE")
  title: z.string().min(1),                  // 대형 한글 타이틀 (em,br)
  subtitle: z.string().min(1).optional(),    // 타이틀 아래 서브 카피
  image: z.string().optional(),              // 제품 이미지 (url)
  days: z
    .array(
      z.object({
        period: z.string().min(1),           // 기간 레이블 ("DAY 1-2" 등)
        name: z.string().min(1),             // 단계 이름 ("시작하는 날" 등)
        ratio: z.string().min(1),            // 비율/핵심 정보 (em,br)
        desc: z.string().min(1),             // 단계 설명
      }),
    )
    .min(2)
    .max(6),
  notice: z.string().min(1).optional(),      // 하단 안내 텍스트 (em,br)
  noticeIcon: z.string().min(1).optional(),  // 안내 아이콘 이름 (ICON_NAMES)
})
type Data = z.infer<typeof schema>

export const usageDayTimeline = defineBlock<Data>({
  id: 'usage-day-timeline',
  archetype: 'usage',
  styleTags: ['light', 'warm', 'timeline', 'howto', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '사용법(DAY 타임라인). 라운드 영문 레이블 + 대형 한글 타이틀 + 제품 이미지(라운드 직사각) + DAY별 번호·세로선 분리 카드(2~6단계) + 하단 안내. 전환·입문·단계별 가이드에 적합. 라이트 웜 배경.',
  schema,
  css: `
.udt{background:var(--bg);color:var(--ink);padding:60px 0 56px}
.udt-head{text-align:center;padding:0 var(--pad-x,56px) 0}
.udt-label-wrap{display:inline-block;margin-bottom:20px}
.udt-label{
  display:inline-block;
  background:var(--accent);
  color:#fff;
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(16px,2vw,22px);
  letter-spacing:.08em;
  padding:10px 32px;
  border-radius:calc(var(--r-scale,1)*999px);
}
.udt-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(40px,6vw,72px);
  color:var(--accent-d);
  line-height:1.08;
  letter-spacing:-.02em;
  margin-bottom:16px;
}
.udt-title .em{color:var(--ink)}
.udt-sub{
  font-size:clamp(15px,1.6vw,18px);
  font-weight:500;
  color:var(--ink-2);
  line-height:1.6;
}
/* 제품 이미지 */
.udt-img-wrap{margin:36px var(--pad-x,56px) 0}
.udt-img-frame{
  width:100%;
  aspect-ratio:740/560;
  border-radius:var(--shape-photo,calc(var(--r-scale,1)*40px));
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 12%,var(--bg));
}
.udt-img-frame img,.udt-img-frame .ph{
  width:100%;height:100%;object-fit:cover;border-radius:inherit;
}
/* noimg-safe: 이미지 없으면 프레임 자체를 숨긴다 */
.udt-img-wrap.udt--no-img{display:none}
/* 타임라인 카드 */
.udt-days{margin:32px var(--pad-x,56px) 0;display:flex;flex-direction:column;gap:12px}
.udt-card{
  display:flex;
  align-items:stretch;
  background:var(--paper);
  border-radius:calc(var(--r-scale,1)*20px);
  overflow:hidden;
  box-shadow:0 2px 8px rgba(0,0,0,.06);
}
/* 좌측: 대형 번호 */
.udt-num-col{
  flex:0 0 80px;
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
}
.udt-num{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(44px,5.5vw,62px);
  color:var(--accent);
  line-height:1;
  letter-spacing:-.02em;
  position:relative;
  z-index:1;
}
/* 세로선 divider */
.udt-vline{
  position:absolute;
  right:0;top:16px;bottom:16px;width:2px;
  background:var(--line);
}
/* 우측 본문 */
.udt-content{
  flex:1;
  padding:20px 22px;
}
.udt-period-row{
  display:flex;
  align-items:center;
  gap:0;
  margin-bottom:10px;
}
.udt-period-chip{
  display:inline-flex;
  align-items:center;
  gap:0;
  border-radius:calc(var(--r-scale,1)*4px);
  overflow:hidden;
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-weight:600;
  font-size:clamp(13px,1.4vw,15px);
}
.udt-period-a{
  background:var(--accent);
  color:#fff;
  padding:5px 12px;
}
.udt-period-b{
  background:color-mix(in srgb,var(--accent) 18%,var(--paper));
  color:var(--ink);
  padding:5px 12px;
}
.udt-ratio{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-weight:700;
  font-size:clamp(14px,1.6vw,17px);
  color:var(--ink);
  line-height:1.4;
  margin-bottom:6px;
}
.udt-ratio .em{color:var(--accent-d);font-weight:800}
.udt-desc{
  font-size:clamp(13px,1.4vw,15px);
  color:var(--ink-2);
  line-height:1.65;
  font-weight:400;
}
/* 하단 안내 */
.udt-notice{
  margin:28px var(--pad-x,56px) 0;
  display:flex;
  align-items:flex-start;
  gap:12px;
  padding:20px 24px;
  background:color-mix(in srgb,var(--accent) 8%,var(--bg));
  border-radius:calc(var(--r-scale,1)*14px);
}
.udt-notice-icon{
  flex:0 0 32px;
  width:32px;height:32px;
  color:var(--accent-d);
  margin-top:1px;
}
.udt-notice-icon svg{width:100%;height:100%}
.udt-notice-text{
  font-size:clamp(13px,1.5vw,16px);
  color:var(--ink);
  line-height:1.65;
  font-weight:400;
}
.udt-notice-text .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe, icon }) => {
    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())
    return `
<section class="udt">
  <div class="udt-head">
    <div class="udt-label-wrap">
      <span class="udt-label">${esc(d.label ?? 'HOW TO USE')}</span>
    </div>
    <h2 class="udt-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="udt-sub">${esc(d.subtitle)}</p>` : ''}
  </div>

  <div class="udt-img-wrap${hasImg ? '' : ' udt--no-img'}">
    <div class="udt-img-frame">${media(d.image, '', '제품 이미지')}</div>
  </div>

  <div class="udt-days">
    ${d.days
      .map(
        (day, i) => `
    <div class="udt-card">
      <div class="udt-num-col">
        <span class="udt-num">${pad2(i + 1)}</span>
        <span class="udt-vline" aria-hidden="true"></span>
      </div>
      <div class="udt-content">
        <div class="udt-period-row">
          <span class="udt-period-chip">
            <span class="udt-period-a">${esc(day.period)}</span>
            <span class="udt-period-b">${esc(day.name)}</span>
          </span>
        </div>
        <div class="udt-ratio">${richSafe(day.ratio)}</div>
        <div class="udt-desc">${esc(day.desc)}</div>
      </div>
    </div>`,
      )
      .join('')}
  </div>

  ${
    d.notice
      ? `<div class="udt-notice">
    ${d.noticeIcon ? `<span class="udt-notice-icon" aria-hidden="true">${icon(d.noticeIcon)}</span>` : ''}
    <p class="udt-notice-text">${richSafe(d.notice)}</p>
  </div>`
      : ''
  }
</section>`
  },
})
