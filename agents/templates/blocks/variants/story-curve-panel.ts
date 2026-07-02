/** STORY 아키타입(템플릿 충실 재현): story-curve-panel.
 *  와디즈 200섹션 09_브랜드스토리 _02 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 풀블리드 상단 이미지 → 우상단에서 큰 라운드 코너 흰 패널이 올라와 곡선 전환 →
 *  패널 내 좌정렬 손글씨 아이브로 + 대형 EN 디스플레이 제목(accent 색) + 본문 문단.
 *  story-photo-header(strip 띠 전환)와 달리 패널 오버랩으로 곡선미 강조. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 풀블리드 배경 이미지 URL (상단 전체) */
  heroImage: z.string().optional(),
  /** 패널 내 손글씨 소제목 (예: "우리 브랜드 스토리를 들려주세요") — em,br 허용 */
  eyebrow: z.string().min(1).optional(),
  /** EN 디스플레이 대제목 1행 (예: "OUR") — em,br 허용 */
  titleLine1: z.string().min(1),
  /** EN 디스플레이 대제목 2행 (예: "BRAND STORY") — em,br 허용 */
  titleLine2: z.string().min(1).optional(),
  /** 본문 문단들 (1~3개) — em,br 허용 */
  paragraphs: z.array(z.string().min(1)).min(1).max(3),
})
type Data = z.infer<typeof schema>

export const storyCurvePanel = defineBlock<Data>({
  id: 'story-curve-panel',
  archetype: 'story',
  styleTags: ['editorial', 'light', 'template', 'fullbleed', 'story', 'curve'],
  imageSlots: 1,
  describe:
    '브랜드 스토리(곡선 패널 오버랩). 풀블리드 이미지 상반 + 우상단 큰 라운드 코너 흰 패널이 올라와 곡선 전환 + 패널 내 손글씨 아이브로 + 대형 EN 디스플레이 제목(accent) + 본문. story-photo-header의 strip 전환과 달리 패널 오버랩으로 곡선미 표현.',
  schema,
  css: `
/* story-curve-panel — 접두사 scp- */
.scp{background:var(--bg);color:var(--ink);overflow:hidden}

/* 이미지 영역: 전체 너비, 고정 높이 — 패널이 오버랩하도록 relative */
.scp-img-wrap{position:relative;width:100%;height:420px;overflow:hidden}
.scp-hero{width:100%;height:100%;object-fit:cover;display:block}
.scp-hero.ph{width:100%;height:100%;border-radius:0;border:none}

/* 곡선 전환 패널: 흰 배경 + 큰 top-left 라운드 코너 → 이미지 위로 올라옴 */
.scp-panel{
  position:relative;
  background:var(--paper);
  border-radius:48px 0 0 0;
  margin-top:-60px;
  padding:52px 44px 64px;
  z-index:2;
}

/* 손글씨 아이브로 */
.scp-eyebrow{
  font-family:var(--font-hand),'Gaegu',cursive;
  font-size:20px;
  font-weight:400;
  color:var(--ink-2);
  line-height:1.55;
  margin-bottom:20px;
  letter-spacing:.01em;
}
.scp-eyebrow .em{color:var(--accent)}

/* EN 디스플레이 대제목 */
.scp-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(52px,9vw,80px);
  line-height:1.08;
  letter-spacing:-.02em;
  color:var(--accent);
  margin-bottom:32px;
}
.scp-title .em{color:var(--accent-dark,var(--accent))}

/* 본문 문단 */
.scp-copy{display:flex;flex-direction:column;gap:18px}
.scp-p{
  font-family:var(--font-body);
  font-size:15px;
  font-weight:400;
  color:var(--ink-2);
  line-height:1.85;
  letter-spacing:-.01em;
}
.scp-p .em{color:var(--accent);font-weight:600}
`,
  render: (d, { esc, richSafe }) => `
<section class="scp">
  <div class="scp-img-wrap">
    ${media(d.heroImage, 'scp-hero', '브랜드 스토리 대표 이미지')}
  </div>
  <div class="scp-panel">
    ${d.eyebrow ? `<p class="scp-eyebrow">${richSafe(d.eyebrow)}</p>` : ''}
    <h2 class="scp-title">${richSafe(d.titleLine1)}${d.titleLine2 ? `<br>${richSafe(d.titleLine2)}` : ''}</h2>
    <div class="scp-copy">
      ${d.paragraphs.map((p) => `<p class="scp-p">${richSafe(p)}</p>`).join('\n      ')}
    </div>
  </div>
</section>`,
})
