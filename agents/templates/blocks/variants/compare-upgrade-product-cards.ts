/** COMPARE 아키타입: compare-upgrade-product-cards.
 *  피그마 [끝판왕] 추천·B&A #17 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 업그레이드 헤드라인 + 2열 카드(구버전 좌-중립/신버전 우-accent 강조+NEW 배지)
 *  + 카드별 제품 이미지 + 특징 목록(구버전 muted / 신버전 check 아이콘+ink 강조).
 *  라이트 배경, 커머스 업그레이드 어필 최적화. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const featureSchema = z.object({
  /** 특징 텍스트 (em, br 허용) */
  text: z.string().min(1),
})

const schema = z.object({
  /** 상단 업그레이드 헤드라인 (em, br 허용) — 예: "<span class=\"em\">[제품명]</span>이 한층 더<br>업그레이드 되어 돌아왔습니다!" */
  headline: z.string().min(1),
  /** 서브 헤드라인/아이베로우 (선택, em 허용) */
  subheadline: z.string().optional(),

  /* ── 구버전(왼쪽) 카드 ── */
  /** 구버전 카드 헤더 라벨 — 예: "기존 [디바이스명]" */
  oldLabel: z.string().min(1),
  /** 구버전 제품 이미지 URL */
  oldImage: z.string().optional(),
  /** 구버전 특징 목록 (3~7개 권장) */
  oldFeatures: z.array(featureSchema).min(2).max(8),

  /* ── 신버전(오른쪽) 카드 ── */
  /** 신버전 배지 텍스트 — 예: "NEW" | "업그레이드" */
  newBadge: z.string().min(1).optional(),
  /** 신버전 카드 헤더 라벨 — 예: "업그레이드 [디바이스명]" */
  newLabel: z.string().min(1),
  /** 신버전 제품 이미지 URL */
  newImage: z.string().optional(),
  /** 신버전 특징 목록 (oldFeatures 와 동일 수 권장) */
  newFeatures: z.array(featureSchema).min(2).max(8),

  /** 하단 마무리 강조 문구 (선택, em 허용) */
  closer: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const compareUpgradeProductCards = defineBlock<Data>({
  id: 'compare-upgrade-product-cards',
  archetype: 'compare' as any,
  styleTags: ['light', 'compare', 'upgrade', 'product', 'commerce', 'template'],
  imageSlots: 2,
  describe:
    '업그레이드 비교(구버전 vs 신버전). 중앙 업그레이드 헤드라인 + 2열 카드(좌:구버전 중립회색/우:신버전 accent 강조+NEW 배지) + 카드별 제품이미지 + 특징 목록(구:muted/신:check 아이콘+ink). 뷰티·가전·헬스케어 커머스 업셀 최적화.',
  schema,
  css: `
/* compare-upgrade-product-cards — 접두사 cupc- */

/* 라이트 배경 블록 */
.cupc{
  background:var(--paper);
  padding:52px 28px 60px;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* ── 헤드라인 영역 ── */
.cupc-hd{
  text-align:center;
  margin-bottom:36px;
}
.cupc-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(26px,5.6vw,38px);
  line-height:1.28;
  letter-spacing:-.025em;
  color:var(--ink);
}
/* 라이트 배경 — .em은 --accent-d(어두운 포인트)로 대비 확보 */
.cupc-headline .em{color:var(--accent-d)}
.cupc-sub{
  margin-top:8px;
  font-family:var(--font-body);
  font-size:14px;
  color:var(--muted);
  letter-spacing:-.005em;
}
.cupc-sub .em{color:var(--accent-d);font-weight:700}

/* ── 2열 카드 래퍼 ── */
.cupc-cols{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
  align-items:start;
}

/* ── 공통 카드 ── */
.cupc-card{
  border-radius:16px;
  overflow:hidden;
  background:var(--bg);
  box-shadow:0 12px 28px -16px rgba(0,0,0,.22);
  position:relative;
  display:flex;
  flex-direction:column;
}

/* ── 구버전 카드 (중립 회색) ── */
.cupc-card.old{
  box-shadow:0 4px 14px -10px rgba(0,0,0,.16);
  opacity:.88;
}
.cupc-card-hdr.old{
  background:#EAEAED;
  color:#8A8A96;
  text-align:center;
  font-family:var(--font-display);
  font-weight:800;
  font-size:13px;
  letter-spacing:.04em;
  padding:13px 10px;
}

/* ── 신버전 카드 (accent 강조) ── */
.cupc-card.new{
  box-shadow:0 18px 38px -18px rgba(0,0,0,.32);
  outline:2.5px solid var(--accent);
  outline-offset:-2.5px;
}
.cupc-card-hdr.new{
  background:var(--accent);
  color:#fff;
  text-align:center;
  font-family:var(--font-display);
  font-weight:800;
  font-size:13px;
  letter-spacing:.04em;
  padding:13px 10px;
}

/* ── NEW 배지 ── */
.cupc-badge{
  position:absolute;
  top:10px;
  right:10px;
  background:var(--accent-d);
  color:#fff;
  font-family:var(--font-display);
  font-weight:800;
  font-size:11px;
  letter-spacing:.06em;
  padding:4px 10px;
  border-radius:999px;
  z-index:2;
  /* 세일·주목 배지 — accent-d는 커머스 시맨틱 강조색 */
}

/* ── 제품 이미지 ── */
.cupc-img{
  width:100%;
  aspect-ratio:1/1;
  object-fit:cover;
  display:block;
}
.cupc-img.ph{
  width:100%;
  aspect-ratio:1/1;
  border:none;
  border-radius:0;
  background:rgba(0,0,0,.04);
  color:var(--muted);
  font-size:12px;
}

/* ── 특징 목록 ── */
.cupc-features{
  padding:14px 14px 18px;
  display:flex;
  flex-direction:column;
  gap:0;
  flex:1;
}
.cupc-feat{
  display:flex;
  align-items:flex-start;
  gap:7px;
  padding:10px 0;
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.55;
  letter-spacing:-.01em;
  border-bottom:1px solid var(--line);
}
.cupc-feat:last-child{border-bottom:none}

/* 구버전 특징 — muted 텍스트, 아이콘 없음 */
.cupc-feat.old{
  color:var(--muted);
  padding-left:4px;
}
.cupc-feat.old .em{color:var(--muted)}

/* 신버전 특징 — ink 강조 + check 아이콘 */
.cupc-feat.new{
  color:var(--ink);
  font-weight:600;
}
.cupc-feat.new .em{color:var(--accent-d)}
.cupc-feat-icon{
  flex-shrink:0;
  width:16px;
  height:16px;
  color:var(--accent);
  margin-top:1px;
}

/* ── 하단 마무리 문구 ── */
.cupc-closer{
  margin-top:36px;
  text-align:center;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(20px,4vw,28px);
  line-height:1.38;
  letter-spacing:-.02em;
  color:var(--ink);
}
.cupc-closer .em{color:var(--accent-d)}
`,
  render: (d, { esc, richSafe, icon }) => {
    const checkSvg = `<span class="cupc-feat-icon">${icon('check')}</span>`

    const oldRows = d.oldFeatures
      .map(
        (f) => `
      <div class="cupc-feat old">
        <span>${richSafe(f.text)}</span>
      </div>`,
      )
      .join('')

    const newRows = d.newFeatures
      .map(
        (f) => `
      <div class="cupc-feat new">
        ${checkSvg}
        <span>${richSafe(f.text)}</span>
      </div>`,
      )
      .join('')

    const badge = d.newBadge
      ? `<div class="cupc-badge">${esc(d.newBadge)}</div>`
      : ''

    return `
<section class="cupc">
  <div class="cupc-hd">
    <h2 class="cupc-headline">${richSafe(d.headline)}</h2>
    ${d.subheadline ? `<p class="cupc-sub">${richSafe(d.subheadline)}</p>` : ''}
  </div>

  <div class="cupc-cols">
    <!-- 구버전 카드 (중립) -->
    <div class="cupc-card old">
      <div class="cupc-card-hdr old">${esc(d.oldLabel)}</div>
      ${media(d.oldImage, 'cupc-img', esc(d.oldLabel))}
      <div class="cupc-features">${oldRows}</div>
    </div>

    <!-- 신버전 카드 (accent 강조) -->
    <div class="cupc-card new">
      ${badge}
      <div class="cupc-card-hdr new">${esc(d.newLabel)}</div>
      ${media(d.newImage, 'cupc-img', esc(d.newLabel))}
      <div class="cupc-features">${newRows}</div>
    </div>
  </div>

  ${d.closer ? `<p class="cupc-closer">${richSafe(d.closer)}</p>` : ''}
</section>`
  },
})
