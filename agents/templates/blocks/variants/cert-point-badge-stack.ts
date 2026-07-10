/** CERT 아키타입: cert-point-badge-stack
 *  연핑크 배경 + 2행 헤드라인(라이트/세미볼드) + 초대형 연색 워터마크 텍스트 +
 *  좌측 오각형 뱃지 Point 번호 세로 목록 + 우측 3단 적층 인증카드 이미지.
 *  출처: 056_포인트_구성_페이지_31 (카테고리: 포인트, 860×1308px)
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  headLight: z.string().min(1),           // 상단 라이트 헤드라인 (em,br) — 예: "안심하고 사용하세요"
  headBold: z.string().min(1),            // 하단 세미볼드 헤드라인 (em,br) — 예: "피부과 테스트 완료 성분"
  desc: z.string().optional(),            // 헤드 아래 본문 설명
  watermark: z.string().optional(),       // 배경 초대형 워터마크 텍스트 (영문 대문자 권장)
  points: z
    .array(
      z.object({
        label: z.string().min(1),         // "Point 01" 등 뱃지 라벨
        title: z.string().min(1),         // 한글 효과명 (em 허용)
        sub: z.string().optional(),       // 영문 부제 (선택)
      }),
    )
    .min(2)
    .max(5),
  // 3단 적층 인증 카드 이미지 (우측 스택). noimg-safe: 이미지 없어도 카드 틀 유지
  cardImage1: z.string().optional(),      // (url) 상단 인증카드
  cardImage2: z.string().optional(),      // (url) 중간 인증카드 (메인 — 가장 크게)
  cardImage3: z.string().optional(),      // (url) 하단 인증카드
})
type Data = z.infer<typeof schema>

export const certPointBadgeStack = defineBlock<Data>({
  id: 'cert-point-badge-stack',
  archetype: 'cert',
  styleTags: ['light', 'warm', 'beauty', 'noimg-safe'],
  imageSlots: 3,
  describe:
    '연핑크 배경 인증/포인트 블록. 초대형 워터마크 배경 + 2행 헤드(라이트+세미볼드) + 좌측 오각형 뱃지 Point 번호 목록 + 우측 3단 적층 인증카드 이미지. 뷰티·스킨케어 성분·인증 강조 섹션에 적합. 이미지 없을 때도 카드 프레임 유지(noimg-safe).',
  schema,
  css: `
.crps{position:relative;background:var(--crps-bg,#ffeff1);padding:60px var(--pad-x,56px) 72px;overflow:hidden;color:var(--ink)}
/* 배경 워터마크 */
.crps-wm{
  position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  font-family:var(--font-display);font-weight:900;font-size:clamp(52px,9vw,95px);
  color:#ffdfd7;white-space:nowrap;letter-spacing:.02em;
  pointer-events:none;user-select:none;line-height:1;z-index:-1
}
/* 헤드 */
.crps-hd{position:relative;z-index:1;max-width:640px}
.crps-h-light{
  font-family:var(--font-display);font-weight:300;
  font-size:clamp(28px,4.2vw,48px);line-height:1.2;color:var(--ink)
}
.crps-h-bold{
  font-family:var(--font-display);font-weight:700;
  font-size:clamp(28px,4.2vw,48px);line-height:1.2;color:var(--ink);margin-top:2px
}
.crps-h-bold .em,.crps-h-light .em{color:var(--accent)}
.crps-desc{
  margin-top:18px;font-size:17px;font-weight:400;line-height:1.72;
  color:var(--ink-2);max-width:600px
}
/* 바디 레이아웃 */
.crps-body{
  position:relative;z-index:1;
  display:flex;align-items:flex-start;gap:32px;margin-top:44px
}
/* 좌측 포인트 목록 */
.crps-points{flex:0 0 44%;display:flex;flex-direction:column;gap:32px}
.crps-point{display:flex;flex-direction:column;gap:6px}
/* 오각형 뱃지 */
.crps-badge-row{display:flex;align-items:center;gap:12px}
.crps-polygon{flex:0 0 auto;width:88px;height:40px;position:relative}
.crps-polygon svg{width:100%;height:100%}
.crps-badge-txt{
  position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-family:var(--font-display);font-weight:400;font-size:15px;
  color:var(--accent);letter-spacing:.04em;white-space:nowrap
}
.crps-pt-title{
  font-family:var(--font-display);font-weight:600;font-size:clamp(18px,2.4vw,26px);
  color:var(--accent);line-height:1.25;padding-left:2px
}
.crps-pt-title .em{color:var(--accent-d)}
.crps-pt-sub{font-size:14px;font-weight:400;color:var(--muted);padding-left:2px;letter-spacing:.01em}
.crps-divider{width:100%;height:1px;background:color-mix(in srgb,var(--accent) 20%,transparent);margin-top:4px}
/* 우측 적층 카드 */
.crps-stack{flex:1;position:relative;min-height:480px}
/* 카드 3개를 겹쳐 쌓기 — 중간 카드(메인)가 가장 크고 앞으로 */
.crps-card{
  position:absolute;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));
  overflow:hidden;box-shadow:0 12px 32px -8px rgba(80,20,20,.13)
}
.crps-card-top{
  top:0;right:0;width:82%;aspect-ratio:16/9;
  background:color-mix(in srgb,var(--accent) 8%,#fff)
}
.crps-card-mid{
  top:22%;left:0;width:100%;aspect-ratio:4/3;z-index:2;
  background:color-mix(in srgb,var(--accent) 12%,#fff);
  box-shadow:0 20px 48px -12px rgba(80,20,20,.22)
}
.crps-card-bot{
  bottom:0;right:0;width:76%;aspect-ratio:16/9;
  background:color-mix(in srgb,var(--accent) 6%,#fff)
}
.crps-card img,.crps-card .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block}
/* noimg-safe: .ph는 baseCss에서 display:none!important — 카드 틀 자체가 배경색으로 노출되어 붕괴 없음 */
`,
  render: (d, { esc, richSafe }) => {
    const wm = d.watermark ?? 'CERTIFIED QUALITY'

    const pointsHtml = d.points
      .map(
        (p, i) => `
    <div class="crps-point">
      <div class="crps-badge-row">
        <div class="crps-polygon">
          <!-- 오각형 SVG (Pentagon) — 색은 연핑크 테마 고정, 스트로크만 accent -->
          <svg viewBox="0 0 88 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon
              points="10,2 78,2 86,20 78,38 10,38 2,20"
              fill="color-mix(in srgb,var(--accent) 14%,transparent)"
              stroke="color-mix(in srgb,var(--accent) 45%,transparent)"
              stroke-width="1.4"
            />
          </svg>
          <span class="crps-badge-txt">${esc(p.label ?? `Point ${String(i + 1).padStart(2, '0')}`)}</span>
        </div>
      </div>
      <div class="crps-pt-title">${richSafe(p.title)}</div>
      ${p.sub ? `<div class="crps-pt-sub">${esc(p.sub)}</div>` : ''}
      ${i < d.points.length - 1 ? '<div class="crps-divider"></div>' : ''}
    </div>`,
      )
      .join('')

    return `
<section class="crps">
  <div class="crps-wm" aria-hidden="true">${esc(wm)}</div>
  <div class="crps-hd">
    <div class="crps-h-light">${richSafe(d.headLight)}</div>
    <div class="crps-h-bold">${richSafe(d.headBold)}</div>
    ${d.desc ? `<p class="crps-desc">${esc(d.desc)}</p>` : ''}
  </div>
  <div class="crps-body">
    <div class="crps-points">${pointsHtml}
    </div>
    <div class="crps-stack">
      <div class="crps-card crps-card-top">${media(d.cardImage1, '', '인증 마크 1')}</div>
      <div class="crps-card crps-card-mid">${media(d.cardImage2, '', '인증 마크 2')}</div>
      <div class="crps-card crps-card-bot">${media(d.cardImage3, '', '인증 마크 3')}</div>
    </div>
  </div>
</section>`
  },
})
