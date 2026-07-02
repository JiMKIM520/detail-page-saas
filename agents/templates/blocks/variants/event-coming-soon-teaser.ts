/** EVENT 아키타입(템플릿 충실 재현): event-coming-soon-teaser.
 *  와디즈 200섹션 "13_이벤트" _01(커밍순 티저) 패턴을 토큰 기반으로 재구성(클론 아님).
 *  날짜 eyebrow + 대형 공개 예고 헤드라인 + 3D 이미지 + 번호 예고 블릿 + 안내 본문.
 *  다크 배경에 세로 중앙 구성. 클래스·상품·서비스 오픈 예고 섹션에 최적. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, ICON_NAMES } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),       // 날짜+라벨 eyebrow (예: "06.25 COMING SOON")
  headline: z.string().min(1),                  // 대형 예고 헤드라인 (em,br 허용, 예: "기다리던 클래스가<br>곧 공개됩니다")
  image: z.string().optional(),                 // 3D 오브젝트/상품 이미지 url
  bullets: z
    .array(
      z.object({
        icon: z.enum(ICON_NAMES).optional(),    // 아이콘 이름 (생략 시 번호 사용)
        text: z.string().min(1),                // 예고 항목 텍스트 (em,br 허용)
      }),
    )
    .min(1)
    .max(4),
  body: z.string().min(1).optional(),           // 하단 안내 본문 (소형, em,br 허용)
})
type Data = z.infer<typeof schema>

export const eventComingSoonTeaser = defineBlock<Data>({
  id: 'event-coming-soon-teaser',
  archetype: 'event',
  styleTags: ['premium', 'template', 'dark', 'teaser', 'coming-soon'],
  imageSlots: 1,
  describe:
    '커밍순 티저. 다크 배경 + 날짜 eyebrow + 대형 예고 헤드라인(흰 디스플레이) + 중앙 3D 이미지 + 번호/아이콘 예고 블릿 카드 + 안내 본문. 클래스·상품·서비스 오픈 전 예고 섹션에 최적.',
  schema,
  css: `
/* ── 래퍼 ── */
.ecst{background:var(--brand);color:#fff;overflow:hidden;padding:48px 0 56px;position:relative}

/* dot-grid 배경 패턴 */
.ecst::before{
  content:"";
  position:absolute;inset:0;
  background-image:radial-gradient(circle,rgba(255,255,255,.09) 1px,transparent 1px);
  background-size:28px 28px;
  pointer-events:none;
}

/* eyebrow */
.ecst-eye{
  padding:0 44px;
  font-size:13px;
  font-weight:700;
  letter-spacing:.12em;
  color:rgba(255,255,255,.65);
  margin-bottom:20px;
  position:relative;
}

/* 대형 헤드라인 */
.ecst-headline{
  padding:0 44px;
  font-family:var(--font-display);
  font-weight:900;
  font-size:52px;
  letter-spacing:-.03em;
  line-height:1.12;
  color:#fff;
  position:relative;
}
.ecst-headline .em{color:var(--accent)}

/* 이미지 영역 */
.ecst-img-wrap{
  display:flex;
  justify-content:center;
  align-items:center;
  padding:36px 44px 28px;
  position:relative;
}
/* glow halo behind image */
.ecst-img-wrap::before{
  content:"";
  position:absolute;
  width:260px;height:260px;
  border-radius:50%;
  background:color-mix(in srgb,var(--accent) 28%,transparent);
  filter:blur(48px);
  top:50%;left:50%;
  transform:translate(-50%,-50%);
  pointer-events:none;
}
.ecst-img{
  width:260px;
  height:260px;
  object-fit:contain;
  position:relative;
  z-index:1;
  border-radius:16px;
}

/* 예고 블릿 카드 */
.ecst-bullets{
  margin:0 36px;
  background:rgba(255,255,255,.08);
  border:1.5px solid rgba(255,255,255,.14);
  border-radius:20px;
  padding:26px 28px;
  display:flex;
  flex-direction:column;
  gap:14px;
  position:relative;
}
.ecst-bullet{
  display:flex;
  align-items:flex-start;
  gap:14px;
}
.ecst-bullet-icon{
  flex-shrink:0;
  width:28px;height:28px;
  border-radius:50%;
  background:var(--accent);
  color:#fff;
  display:grid;
  place-items:center;
  font-family:var(--font-display);
  font-weight:900;
  font-size:13px;
  line-height:1;
}
.ecst-bullet-icon svg{width:15px;height:15px}
.ecst-bullet-text{
  font-size:16px;
  font-weight:600;
  color:rgba(255,255,255,.92);
  line-height:1.5;
}
.ecst-bullet-text .em{color:var(--accent);font-weight:700}

/* 안내 본문 */
.ecst-body{
  margin-top:28px;
  padding:0 44px;
  font-size:13px;
  color:rgba(255,255,255,.52);
  line-height:1.75;
  position:relative;
}
.ecst-body .em{color:rgba(255,255,255,.8);font-weight:600}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="ecst">
  ${d.eyebrow ? `<p class="ecst-eye">${esc(d.eyebrow)}</p>` : ''}

  <h2 class="ecst-headline">${richSafe(d.headline)}</h2>

  <div class="ecst-img-wrap">
    ${media(d.image, 'ecst-img', '커밍순 오브젝트 이미지')}
  </div>

  <div class="ecst-bullets">
    ${d.bullets
      .map(
        (b, i) => `
    <div class="ecst-bullet">
      <span class="ecst-bullet-icon">${b.icon ? icon(b.icon) : String(i + 1)}</span>
      <span class="ecst-bullet-text">${richSafe(b.text)}</span>
    </div>`,
      )
      .join('')}
  </div>

  ${d.body ? `<p class="ecst-body">${richSafe(d.body)}</p>` : ''}
</section>`,
})
