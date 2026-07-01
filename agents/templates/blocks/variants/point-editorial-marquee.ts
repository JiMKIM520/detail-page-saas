/** POINT 아키타입: point-editorial-marquee.
 *  [끝판왕] 포인트 구성 #8 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 양측 세로 rotated repeating-text ticker strip
 *            + full-bleed 라이프스타일 이미지
 *            + 하단 solid-black 카피 패널
 *            + 프레임 밖으로 넘치는 oversized ghost 워드. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 세로 ticker에 반복 출력될 짧은 문구 (예: "BURN NOW. FEEL ALIVE") */
  tickerText: z.string().min(1),
  /** 풀블리드 라이프스타일 이미지 URL */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
  /** 하단 카피 패널 eyebrow (작은 상단 문구, em/br 허용) */
  eyebrow: z.string().min(1),
  /** 하단 카피 패널 대제목 (em/br 허용) */
  headline: z.string().min(1),
  /** 프레임 밖으로 넘치는 oversized ghost 워드 (영문 1~2단어 권장) */
  ghostWord: z.string().min(1),
})
type Data = z.infer<typeof schema>

export const pointEditorialMarquee = defineBlock<Data>({
  id: 'point-editorial-marquee',
  archetype: 'point',
  styleTags: ['dark', 'editorial', 'marquee', 'lifestyle', 'template'],
  imageSlots: 1,
  describe:
    '포인트 에디토리얼 마키. 양측 세로 rotated ticker strip(반복 텍스트) + 중앙 풀블리드 라이프스타일 이미지 + 하단 solid-black 카피 패널(eyebrow+대제목) + 프레임 밖으로 넘치는 oversized ghost 워드. 운동/패션/라이프스타일 브랜드 강조 섹션.',
  schema,
  css: `
/* point-editorial-marquee — 접두사 pem- */
.pem{position:relative;overflow:hidden;background:#000;display:grid;grid-template-columns:44px 1fr 44px;min-height:540px}

/* ── ticker strips (좌/우) ── */
.pem-strip{position:relative;overflow:hidden;background:#000;z-index:2}
.pem-strip-inner{
  position:absolute;
  top:0;left:0;
  width:100%;
  /* 세로 ticker: 텍스트를 rotated repeating 으로 흘림 */
  display:flex;
  flex-direction:column;
  gap:0;
  animation:pem-scroll 12s linear infinite;
}
.pem-strip.right .pem-strip-inner{animation-direction:reverse}
.pem-strip-item{
  white-space:nowrap;
  font-family:var(--font-display);
  font-weight:800;
  font-size:11px;
  letter-spacing:.12em;
  text-transform:uppercase;
  color:#fff;
  opacity:.88;
  /* 수직 배치 후 rotate — 좌측: 위→아래(↓), 우측: 아래→위(↑) */
  writing-mode:vertical-rl;
  transform:rotate(180deg);
  padding:16px 0;
  line-height:1;
}
.pem-strip.right .pem-strip-item{transform:rotate(0deg)}
@keyframes pem-scroll{
  0%{transform:translateY(0)}
  100%{transform:translateY(-50%)}
}

/* ── center image zone ── */
.pem-center{position:relative;z-index:1;overflow:hidden}
.pem-img{
  width:100%;
  /* 이미지 높이 = 섹션 전체에서 카피 패널 높이를 뺀 만큼 */
  aspect-ratio:9/14;
  object-fit:cover;
  object-position:center top;
  display:block;
}
.pem-img.ph{
  width:100%;
  aspect-ratio:9/14;
  background:rgba(255,255,255,.06);
  border:2px dashed rgba(255,255,255,.18);
  color:rgba(255,255,255,.4);
}

/* ── ghost word (프레임 밖 oversized) ── */
.pem-ghost{
  position:absolute;
  bottom:-0.18em;
  left:50%;
  transform:translateX(-50%);
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(100px,28vw,200px);
  letter-spacing:-.04em;
  line-height:1;
  color:#fff;
  opacity:.07;
  white-space:nowrap;
  pointer-events:none;
  z-index:3;
  /* 텍스트가 패널 위로 살짝 올라오도록 mix-blend 없이 투명도만 */
  user-select:none;
}

/* ── 하단 solid-black 카피 패널 ── */
.pem-copy{
  grid-column:1/-1;
  background:#000;
  padding:20px 52px 26px;
  text-align:center;
  position:relative;
  z-index:4;
  border-top:1.5px solid rgba(255,255,255,.10);
}
.pem-eyebrow{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:13px;
  font-weight:500;
  letter-spacing:.14em;
  color:rgba(255,255,255,.60);
  text-transform:uppercase;
  margin-bottom:6px;
  word-break:keep-all;
}
.pem-eyebrow .em{color:var(--accent);font-weight:700}
.pem-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(32px,7vw,52px);
  letter-spacing:-.025em;
  line-height:1.12;
  color:#fff;
  word-break:keep-all;
}
/* 다크 배경 — .em은 밝은 accent(var(--accent))로 override */
.pem-headline .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => {
    // ticker 텍스트를 12회 복제해 끊김 없는 루프 구현 (CSS translateY(-50%) 루프와 매칭)
    const REPEAT = 12
    const tickerItems = Array.from({ length: REPEAT })
      .map(() => `<span class="pem-strip-item">${esc(d.tickerText)}</span>`)
      .join('')

    return `
<section class="pem">
  <div class="pem-strip left">
    <div class="pem-strip-inner">${tickerItems}</div>
  </div>

  <div class="pem-center">
    ${media(d.image, 'pem-img', esc(d.imageAlt ?? '라이프스타일 이미지'))}
    <div class="pem-ghost" aria-hidden="true">${esc(d.ghostWord)}</div>
  </div>

  <div class="pem-strip right">
    <div class="pem-strip-inner">${tickerItems}</div>
  </div>

  <div class="pem-copy">
    <p class="pem-eyebrow">${richSafe(d.eyebrow)}</p>
    <h2 class="pem-headline">${richSafe(d.headline)}</h2>
  </div>
</section>`
  },
})
