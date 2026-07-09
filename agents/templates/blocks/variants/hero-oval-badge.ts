/** HERO 아키타입: hero-oval-badge
 *  피그마 012_pc_전환9 재구성 —
 *  좌측 타이틀 스택(소제목+대제목+본문) + 해시태그 뱃지 행,
 *  우측 이중 타원 벡터 라인 안에 감싼 누끼 이미지 + 황금별 3개 오버랩.
 *  라이트 크림 배경. 이미지 부재 시 타원 프레임을 틴트 패널로 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 소제목 라인 (em 허용) — 예: "달콤하고 촉촉한 꿀 맛!" */
  subtitle: z.string().min(1),
  /** 대제목 (em 허용, br 가능) — 제품/브랜드명 대형 출력 */
  title: z.string().min(1),
  /** 본문 한 줄 (em 허용) */
  body: z.string().optional(),
  /** 해시태그 뱃지 2~4개 — "# 당도 보장" 형식으로 입력 */
  tags: z.array(z.string().min(1)).min(2).max(4),
  /** 누끼 이미지 URL (타원형 프레임에 contain) */
  image: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const heroOvalBadge = defineBlock<Data>({
  id: 'hero-oval-badge',
  archetype: 'hero',
  styleTags: ['light', 'warm', 'food', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '라이트 크림 배경 히어로. 좌측에 소제목+대제목(대형)+본문+해시태그 뱃지 행, 우측에 이중 타원 SVG 라인 안에 감싼 누끼 이미지 + 황금별 3개 포인트. 식품·농산물·리빙 카테고리 전환 섹션에 적합. 이미지 없어도 타원 틴트 패널로 안전 강등.',
  schema,
  css: `
.hqsz{position:relative;display:flex;align-items:center;justify-content:space-between;padding:0 var(--pad-x,56px);background:var(--bg);overflow:hidden;min-height:400px}
.hqsz-left{flex:0 0 auto;width:min(560px,54%);padding:48px 0;z-index:1}
.hqsz-sub{font-family:var(--font-body);font-size:clamp(16px,2vw,20px);font-weight:500;color:var(--accent);margin-bottom:6px;line-height:1.3}
.hqsz-sub .em{color:var(--accent-d)}
.hqsz-title{font-family:var(--font-display);font-weight:700;font-size:clamp(40px,5.5vw,72px);color:var(--ink);line-height:1.08;letter-spacing:-.02em;margin-bottom:10px}
.hqsz-title .em{color:var(--accent)}
.hqsz-body{font-family:var(--font-body);font-size:clamp(14px,1.6vw,18px);font-weight:400;color:var(--ink-2);line-height:1.55;margin-bottom:22px}
.hqsz-body .em{color:var(--accent-d);font-weight:600}
.hqsz-tags{display:flex;flex-wrap:wrap;gap:8px}
.hqsz-tag{display:inline-block;background:color-mix(in srgb,var(--accent) 18%,var(--bg));color:var(--ink);font-family:var(--font-body);font-size:clamp(13px,1.4vw,16px);font-weight:500;padding:6px 16px;border-radius:calc(var(--r-scale,1)*6px);white-space:nowrap}
.hqsz-right{flex:0 0 auto;width:min(520px,44%);display:flex;align-items:center;justify-content:center;position:relative;height:400px}
.hqsz-oval-wrap{position:relative;width:min(380px,100%);aspect-ratio:519/609}
.hqsz-oval-wrap svg.hqsz-rings{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.hqsz-img-frame{position:absolute;inset:4% 5%;border-radius:var(--shape-photo,50%/50%);overflow:hidden;background:color-mix(in srgb,var(--accent) 12%,var(--bg))}
.hqsz-img-frame img,.hqsz-img-frame .ph{width:100%;height:100%;object-fit:contain;object-position:center bottom;border-radius:inherit;display:block}
.hqsz-img-frame .ph{display:none!important}
/* noimg-safe: 이미지 없을 때 프레임이 틴트 패널로 — 빈 타원이 노출되지 않게 */
.hqsz-oval-wrap:not(:has(img)) .hqsz-img-frame{background:color-mix(in srgb,var(--accent) 14%,var(--bg))}
.hqsz-star{position:absolute;fill:var(--accent);opacity:.92}
.hqsz-star-1{top:18%;left:5%;width:clamp(18px,3%,30px);height:clamp(18px,3%,30px)}
.hqsz-star-2{bottom:30%;left:-2%;width:clamp(28px,5%,52px);height:clamp(28px,5%,52px)}
.hqsz-star-3{bottom:12%;right:4%;width:clamp(20px,3.5%,36px);height:clamp(20px,3.5%,36px)}
`,
  render: (d, { esc, richSafe }) => {
    const imgNode = media(d.image, 'hqsz-img', '제품 이미지')
    // 이미지 있으면 <img>, 없으면 .ph div (baseCss .ph{display:none!important}로 은닉됨 — noimg-safe)
    return `
<section class="hqsz">
  <div class="hqsz-left">
    <p class="hqsz-sub">${richSafe(d.subtitle)}</p>
    <h1 class="hqsz-title disp">${richSafe(d.title)}</h1>
    ${d.body ? `<p class="hqsz-body">${richSafe(d.body)}</p>` : ''}
    <div class="hqsz-tags">
      ${d.tags.map((t) => `<span class="hqsz-tag">${esc(t)}</span>`).join('\n      ')}
    </div>
  </div>
  <div class="hqsz-right">
    <div class="hqsz-oval-wrap">
      <!-- 이중 타원 SVG 링 장식 -->
      <svg class="hqsz-rings" viewBox="0 0 519 609" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="259.5" cy="304.5" rx="255.5" ry="300" stroke="currentColor" stroke-width="1.6" stroke-dasharray="6 5" opacity=".35"/>
        <ellipse cx="259.5" cy="304.5" rx="237" ry="280" stroke="currentColor" stroke-width="1.2" opacity=".22"/>
      </svg>
      <!-- 누끼 이미지 프레임 (타원 안쪽) -->
      <div class="hqsz-img-frame">
        ${imgNode}
      </div>
      <!-- 황금별 3개 오버랩 -->
      <svg class="hqsz-star hqsz-star-1" viewBox="0 0 24 24"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/></svg>
      <svg class="hqsz-star hqsz-star-2" viewBox="0 0 24 24"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/></svg>
      <svg class="hqsz-star hqsz-star-3" viewBox="0 0 24 24"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/></svg>
    </div>
  </div>
</section>`
  },
})
