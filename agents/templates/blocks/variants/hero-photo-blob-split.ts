/** HERO 아키타입(템플릿 충실 재현): hero-photo-blob-split.
 *  와디즈 200섹션 11_인트로_사진중심 (frame 1284:1813) 패턴 재구성.
 *  상반 풀블리드 사진 + 상단 중앙 브랜드 로고 텍스트 →
 *  하반 대형 둥근 블롭(accent 틴트 배경) 위 좌정렬 제품명(대형 대문자) + 설명.
 *  블롭이 사진 존과 겹쳐 올라오는 분할 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brandLogo: z.string().min(1).optional(),  // 상단 중앙 브랜드 로고 텍스트 (예: "Brand Logo")
  heroImage: z.string().optional(),         // 상반 풀블리드 제품 사진 (url)
  productName: z.string().min(1),           // 블롭 위 대형 제품명 — 대문자 강조 (em,br 허용)
  desc: z.string().min(1).optional(),       // 제품명 아래 설명 문구 (em,br 허용)
})
type Data = z.infer<typeof schema>

export const heroPhotoBlobSplit = defineBlock<Data>({
  id: 'hero-photo-blob-split',
  archetype: 'hero',
  styleTags: ['premium', 'photo', 'template', 'colorblock', 'editorial'],
  imageSlots: 1,
  describe:
    '사진+블롭 분할 히어로. 상반 풀블리드 사진(상단 중앙 브랜드 로고) + 하반 대형 둥근 블롭 위 좌정렬 대문자 제품명·설명. 사진과 블롭이 겹쳐지는 2-존 인트로.',
  schema,
  css: `
/* ── hpbs = hero-photo-blob-split 접두사 ── */
.hpbs {
  position: relative;
  width: 100%;
  background: var(--bg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ─ 상반 사진 존 ─ */
.hpbs-photo-zone {
  position: relative;
  width: 100%;
  height: 580px;
  flex: 0 0 auto;
  overflow: hidden;
  background: var(--ink);
}

.hpbs-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  z-index: 0;
}

/* 브랜드 로고 — 사진 위 중앙 상단 */
.hpbs-logo {
  position: absolute;
  top: 36px;
  left: 0;
  right: 0;
  z-index: 2;
  text-align: center;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 16px;
  letter-spacing: .14em;
  color: rgba(255, 255, 255, .92);
  text-shadow: 0 1px 8px rgba(0, 0, 0, .3);
}

/* ─ 블롭 존 (하반 — 상단이 사진 존과 겹침) ─ */
.hpbs-blob-zone {
  position: relative;
  z-index: 3;
  /* 블롭이 사진 위로 올라오도록 음수 마진 */
  margin-top: -140px;
  flex: 0 0 auto;
  padding-bottom: 72px;
}

/* 블롭 배경 도형 — border-radius로 큰 타원/약자형 */
.hpbs-blob {
  position: relative;
  background: color-mix(in srgb, var(--accent) 18%, #fff);
  border-radius: 60% 60% 0 0 / 52px 52px 0 0;
  min-height: 440px;
  width: 100%;
}

/* 블롭 내 콘텐츠 */
.hpbs-content {
  padding:64px var(--pad-x,56px) 0;
}

/* 제품명 — 대형 대문자 좌정렬 */
.hpbs-name {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 80px;
  letter-spacing: -.01em;
  line-height: 1.05;
  color: var(--accent);
  text-transform: uppercase;
  margin-bottom: 20px;
}

.hpbs-name .em {
  color: var(--accent-d);
}

/* 설명 문구 */
.hpbs-desc {
  font-family: var(--font-body);
  font-size: 17px;
  font-weight: 400;
  line-height: 1.7;
  color: var(--ink);
  opacity: .82;
}

.hpbs-desc .em {
  color: var(--accent);
  font-weight: 700;
  opacity: 1;
}
`,
  render: (d, { esc, richSafe }) => {
    const img = d.heroImage && d.heroImage.trim() ? d.heroImage : undefined
    return `
<section class="hpbs">
  <!-- 상반: 풀블리드 사진 존 -->
  <div class="hpbs-photo-zone">
    ${img
      ? media(img, 'hpbs-bg', esc(d.productName))
      : `<div class="hpbs-bg ph" style="position:absolute;inset:0;width:100%;height:100%">제품 사진</div>`
    }
    ${d.brandLogo ? `<p class="hpbs-logo">${esc(d.brandLogo)}</p>` : ''}
  </div>

  <!-- 하반: 둥근 블롭 + 좌정렬 텍스트 -->
  <div class="hpbs-blob-zone">
    <div class="hpbs-blob">
      <div class="hpbs-content">
        <h1 class="hpbs-name">${richSafe(d.productName)}</h1>
        ${d.desc ? `<p class="hpbs-desc">${richSafe(d.desc)}</p>` : ''}
      </div>
    </div>
  </div>
</section>`
  },
})
