/** HERO 아키타입: hero-badge-keypoint
 *  피그마 048_인트로_13 패턴 재구성:
 *  상단 그라디언트 타이틀 영역(타원형 브랜드 뱃지 + 대형 제목 + 서브카피 + 컬러 해시태그 pill 3종)
 *  + 하단 전체 배경 이미지 + 이미지 위 3열 번호형 키포인트 배너.
 *  이미지 없을 때: 이미지 영역을 accent tint 패널로 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brandName: z.string().min(1),                      // 타원 뱃지 안 브랜드명 (순수 텍스트)
  title: z.string().min(1),                          // 대형 제목 (em,br)
  subcopy: z.string().min(1),                        // 제목 아래 서브카피 (em,br)
  pills: z
    .array(z.object({ label: z.string().min(1) }))
    .min(2)
    .max(4),                                         // 컬러 해시태그 pill (2~4개)
  image: z.string().optional(),                      // 제품 전경 이미지 (url)
  keypoints: z
    .array(
      z.object({
        num: z.string().min(1).optional(),           // 번호 표시 (기본 01/02/03)
        label: z.string().min(1),                    // 키포인트 굵은 라벨 (em,br)
        desc: z.string().min(1),                     // 키포인트 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),                                         // 번호형 키포인트 (2~4열)
})
type Data = z.infer<typeof schema>

// pill 색상 순환 — 피그마 원색 그대로 hardcode 대신 accent 기반 토큰 계열 + 두 보완색 지정
const PILL_COLORS = [
  'var(--accent)',
  'color-mix(in srgb,var(--accent) 55%,#74c1e8)',
  'color-mix(in srgb,var(--accent) 40%,#d09de9)',
  'color-mix(in srgb,var(--accent) 60%,#86d47c)',
] as const

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const heroBadgeKeypoint = defineBlock<Data>({
  id: 'hero-badge-keypoint',
  archetype: 'hero',
  // noimg-safe: 이미지 없을 때 이미지 영역을 accent tint 패널로 강등 — 배너는 그 위에 유지
  styleTags: ['light', 'warm', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '히어로 — 타원 브랜드 뱃지 + 대형 중앙 제목 + 서브카피 + 컬러 pill 해시태그 3종(상단 그라디언트 타이틀 영역) + 하단 전체 제품 배경 이미지 + 이미지 위 3열 번호형 키포인트 배너. 식품·육아·생활용품 라이트 톤에 최적. 이미지 없으면 accent tint 패널로 강등(noimg-safe).',
  schema,
  css: `
/* ─── HLDQ 접두 블록 ─── */
.hldq{position:relative;background:var(--bg);color:var(--ink);overflow:hidden}

/* 타이틀 영역 — 그라디언트 배경 */
.hldq-top{
  padding:52px var(--pad-x,56px) 48px;
  background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 28%,var(--bg)) 0%,var(--bg) 100%);
  text-align:center;
  display:flex;flex-direction:column;align-items:center;gap:0
}

/* 타원형 브랜드 뱃지 */
.hldq-badge{
  display:inline-flex;align-items:center;justify-content:center;
  width:200px;height:82px;
  background:color-mix(in srgb,var(--accent) 22%,var(--bg));
  border:2px solid color-mix(in srgb,var(--accent) 50%,transparent);
  border-radius:50%;        /* 타원: 고정값 예외 */
  margin-bottom:28px;
  overflow:hidden
}
.hldq-badge-text{
  font-family:var(--font-display);font-weight:700;font-size:22px;
  color:var(--ink);letter-spacing:.02em;line-height:1
}

/* 대형 제목 */
.hldq-title{
  font-family:var(--font-display);font-weight:800;
  font-size:clamp(52px,8vw,96px);
  color:var(--ink);line-height:1.08;letter-spacing:-.02em;
  margin-bottom:18px
}
.hldq-title .em{color:var(--accent-d)}

/* 서브카피 */
.hldq-sub{
  font-family:var(--font-body);font-weight:500;
  font-size:clamp(16px,2.2vw,20px);
  color:var(--ink-2);line-height:1.65;
  max-width:560px;margin-bottom:28px
}
.hldq-sub .em{color:var(--accent-d);font-weight:700}

/* 컬러 pill 해시태그 */
.hldq-pills{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
.hldq-pill{
  display:inline-flex;align-items:center;padding:10px 22px;
  border-radius:999px;      /* pill: 고정값 예외 */
  font-family:var(--font-display);font-weight:700;font-size:15px;
  color:var(--ink);line-height:1;white-space:nowrap
}

/* 제품 이미지 영역 */
.hldq-img-wrap{
  position:relative;width:100%;
  min-height:420px;
  background:color-mix(in srgb,var(--accent) 12%,var(--bg))
}
.hldq-img{
  width:100%;height:480px;
  object-fit:cover;
  border-radius:var(--shape-photo, 0px);
  display:block
}
/* noimg-safe 강등: .ph는 전역에서 display:none — min-height로 공간 확보 */
.hldq-img.ph{display:none!important}

/* 이미지 스크림 — 배너 가독성 보장 */
.hldq-scrim{
  position:absolute;bottom:0;left:0;right:0;
  height:68%;
  background:linear-gradient(0deg,rgba(30,20,10,.72) 0%,transparent 100%);
  pointer-events:none
}

/* 3열 번호형 키포인트 배너 — 이미지 위 오버레이 */
.hldq-banner{
  position:absolute;bottom:0;left:0;right:0;
  display:grid;grid-template-columns:repeat(var(--hldq-cols,3),1fr);
  padding:0 var(--pad-x,56px) 28px;gap:0
}
.hldq-kp{
  display:flex;flex-direction:column;align-items:center;
  padding:12px 8px 0;
  border-right:1px solid rgba(255,255,255,.18)
}
.hldq-kp:last-child{border-right:none}

/* 번호 원 */
.hldq-num{
  width:52px;height:52px;
  border-radius:999px;        /* 원: 고정값 예외 */
  background:rgba(255,255,255,.14);
  border:1.5px solid rgba(255,255,255,.38);
  display:flex;align-items:center;justify-content:center;
  font-family:var(--font-display);font-weight:600;font-size:18px;
  color:var(--accent);line-height:1;
  margin-bottom:10px
}

/* 번호 아래 구분선 */
.hldq-kp-div{
  width:38px;height:1px;
  background:rgba(255,255,255,.35);
  margin-bottom:10px
}

/* 키포인트 라벨 */
.hldq-kp-label{
  font-family:var(--font-display);font-weight:700;
  font-size:clamp(14px,1.8vw,18px);
  color:#fff;text-align:center;line-height:1.25;margin-bottom:6px
}
.hldq-kp-label .em{color:var(--accent)}

/* 키포인트 설명 */
.hldq-kp-desc{
  font-family:var(--font-body);font-weight:400;
  font-size:clamp(12px,1.4vw,15px);
  color:rgba(255,255,255,.78);text-align:center;line-height:1.55
}
.hldq-kp-desc .em{color:var(--accent);font-weight:600}

/* 다크 오버레이 위 .em 오버라이드 (richSafe 스코프) */
.hldq .hldq-banner .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe }) => {
    const cols = Math.min(Math.max(d.keypoints.length, 2), 4)
    const pillsHtml = d.pills
      .map(
        (p, i) =>
          `<span class="hldq-pill" style="background:${PILL_COLORS[i % PILL_COLORS.length]}">${esc(p.label)}</span>`,
      )
      .join('\n        ')

    const keypointsHtml = d.keypoints
      .map(
        (kp, i) => `
      <div class="hldq-kp">
        <div class="hldq-num">${esc(kp.num ?? pad2(i + 1))}</div>
        <div class="hldq-kp-div"></div>
        <div class="hldq-kp-label">${richSafe(kp.label)}</div>
        <div class="hldq-kp-desc">${richSafe(kp.desc)}</div>
      </div>`,
      )
      .join('')

    return `
<section class="hldq">
  <!-- 상단 그라디언트 타이틀 영역 -->
  <div class="hldq-top">
    <div class="hldq-badge">
      <span class="hldq-badge-text">${esc(d.brandName)}</span>
    </div>
    <h2 class="hldq-title">${richSafe(d.title)}</h2>
    <p class="hldq-sub">${richSafe(d.subcopy)}</p>
    <div class="hldq-pills">
      ${pillsHtml}
    </div>
  </div>

  <!-- 하단 제품 이미지 + 키포인트 배너 -->
  <div class="hldq-img-wrap">
    ${media(d.image, 'hldq-img', '제품 대표 이미지')}
    <div class="hldq-scrim"></div>
    <div class="hldq-banner" style="--hldq-cols:${cols}">
      ${keypointsHtml}
    </div>
  </div>
</section>`
  },
})
