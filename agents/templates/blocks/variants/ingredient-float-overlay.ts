/** INGREDIENT 아키타입: ingredient-float-overlay
 *  피그마 030_포인트_구성_페이지_25 흡수.
 *  제품 세로 이미지 위에 그라디언트 알약형 성분 태그 + 흰 알약형 효능 배지를 플로팅 오버레이로 배치.
 *  상단 브랜드/제품명 헤더 + SPF 스펙 라인 + 하단 주석+구분선 구성. noimg-safe: 이미지 없으면 구조 유지. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const ingredientTagSchema = z.object({
  name: z.string().min(1),       // 성분명 (그라디언트 알약 태그)
  sub: z.string().optional(),    // 하위 성분명(들), 쉼표로 구분 — 성분 서브라벨 목록
})

const efficacyBadgeSchema = z.object({
  label: z.string().min(1),      // 효능 단어 ("진정", "보습" 등)
})

const schema = z.object({
  brandName: z.string().min(1),              // 브랜드명 (헤더 상단)
  productName: z.string().min(1),            // 제품명 (헤더 상단, em 허용)
  specLine: z.string().optional(),           // SPF50+ PA++++ 등 스펙 한 줄
  image: z.string().optional(),             // 제품 세로 이미지 (url)
  ingredientTags: z.array(ingredientTagSchema).min(1).max(5),  // 그라디언트 알약 성분 태그
  efficacyBadges: z.array(efficacyBadgeSchema).min(1).max(4), // 흰 알약 효능 배지
  footnote: z.string().optional(),           // 하단 주석 ("원료적 특성에 한함" 등)
})
type Data = z.infer<typeof schema>

export const ingredientFloatOverlay = defineBlock<Data>({
  id: 'ingredient-float-overlay',
  archetype: 'ingredient',
  styleTags: ['light', 'beauty', 'ingredient', 'overlay', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '성분 인포그래픽 블록. 제품 세로 이미지 위에 그라디언트 알약형 성분 태그(UV Filter·병풀추출물 등)와 흰 알약 효능 배지(진정·보습)를 플로팅 오버레이로 배치. 상단 헤더(브랜드/제품명+스펙), 하단 주석+구분선. 자외선 차단제·스킨케어 성분 강조에 적합.',
  schema,
  css: `
.ifo{background:var(--bg);padding:0 0 48px;color:var(--ink)}

/* ── 헤더 영역 ── */
.ifo-hd{padding:0 var(--pad-x,56px);border-bottom:3px solid var(--ink)}
.ifo-hd-top{display:flex;align-items:stretch;gap:0;padding:20px 0 0}
.ifo-hd-rule-v{width:1px;background:var(--ink);margin:0 20px;flex-shrink:0}
.ifo-brand{font-size:20px;font-weight:600;line-height:1.4;color:var(--ink)}
.ifo-product{font-size:30px;font-weight:800;line-height:1.3;color:var(--ink)}
.ifo-product .em{color:var(--accent)}
.ifo-brand-aside{font-size:20px;font-weight:500;line-height:1.5;color:var(--ink);margin-left:auto;text-align:right;align-self:flex-start}
.ifo-hd-rule-h{margin:12px 0 0;height:1px;background:var(--ink)}
.ifo-spec{padding:8px 0 16px;font-size:20px;font-weight:300;letter-spacing:.04em;color:var(--ink)}

/* ── 메인 구성: 이미지 + 오버레이 ── */
.ifo-stage{position:relative;padding:28px var(--pad-x,56px) 0;display:flex;justify-content:center}
.ifo-img-wrap{position:relative;width:294px;flex-shrink:0}
.ifo-img{width:294px;height:560px;object-fit:cover;object-position:center top;border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px));display:block}
.ifo-img.ph{display:none!important}

/* 이미지 없을 때 스테이지 대체 패널 (noimg-safe) */
.ifo-noimg{display:none;background:color-mix(in srgb,var(--accent) 8%,var(--paper));border-radius:calc(var(--r-scale,1)*18px);width:100%;height:240px;margin-bottom:16px}
.ifo-img.ph ~ .ifo-noimg{display:block}

/* ── 오버레이 패널 ── */
.ifo-overlay{position:absolute;inset:0;pointer-events:none}

/* 그라디언트 알약 성분 태그 */
.ifo-tags{position:absolute;left:0;top:0;width:100%;height:100%}
.ifo-tag{
  position:absolute;
  display:inline-flex;align-items:center;
  background:linear-gradient(135deg,var(--accent) 0%,var(--accent-d) 100%);
  color:#ffffff;
  font-size:16px;font-weight:800;
  padding:8px 18px;
  border-radius:999px;
  white-space:nowrap;
  line-height:1;
}
/* 배치: 좌/우 두 열의 어긋난 세로 슬롯.
   태그와 배지는 별개 컨테이너라 nth-child 좌표가 서로를 모른다. 같은 좌표 공간을 쓰면서
   각자 배치하면 한글 라벨(영문 대비 폭이 넓다)이 이미지 폭 294px을 넘겨 충돌한다
   — '가다랑어 흰살'↔'휴먼그레이드 원료' 겹침 실측(2026-07-21).
   태그는 좌열 짝/우열 홀, 배지는 그 사이 빈 슬롯만 쓰도록 세로 위치를 통째로 나눠 갖는다.
   슬롯 간 세로 간격 ≥62px > 라벨 높이(~45px)라 폭과 무관하게 겹치지 않는다. */
.ifo-tag:nth-child(1){top:2%;left:0;transform:translateX(-32%)}
.ifo-tag:nth-child(2){top:13%;right:0;transform:translateX(32%)}
.ifo-tag:nth-child(3){top:24%;left:0;transform:translateX(-32%)}
.ifo-tag:nth-child(4){top:35%;right:0;transform:translateX(32%)}
.ifo-tag:nth-child(5){top:46%;left:0;transform:translateX(-32%)}

/* 효능 배지 (흰 배경 + 색상 텍스트 + 컬러 도트) */
.ifo-badges{position:absolute;left:0;top:0;width:100%;height:100%}
.ifo-badge{
  position:absolute;
  display:inline-flex;align-items:center;gap:8px;
  background:#ffffff;
  border-radius:999px;
  padding:8px 16px 8px 8px;
  font-size:16px;font-weight:800;color:var(--accent);
  white-space:nowrap;
  box-shadow:0 2px 12px rgba(0,0,0,.10);
}
.ifo-badge-dot{
  width:24px;height:24px;border-radius:50%;
  background:var(--accent);
  flex-shrink:0;display:flex;align-items:center;justify-content:center;
}
/* dot 내부 십자선 SVG */
.ifo-badge-dot svg{width:12px;height:12px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round}
/* 배지 배치 — 태그가 쓰지 않는 아래쪽 슬롯(57%~)만 사용해 세로 영역을 나눠 갖는다 */
.ifo-badge:nth-child(1){top:57%;right:0;transform:translateX(32%)}
.ifo-badge:nth-child(2){top:68%;left:0;transform:translateX(-32%)}
.ifo-badge:nth-child(3){top:79%;right:0;transform:translateX(32%)}
.ifo-badge:nth-child(4){top:90%;left:0;transform:translateX(-32%)}

/* 성분 서브라벨 패널 (이미지 오른쪽에 앵커됨)
   .ifo-stage는 justify-content:center라 이미지가 중앙에 온다. 좌측 패딩 기준으로 좌표를 잡으면
   이미지 위에 겹쳐 사진 위 텍스트가 되어버린다(실측 2026-07-21) — 중앙 기준으로 앵커한다. */
.ifo-sublabels{
  position:absolute;
  left:calc(50% + 147px + 20px);
  top:50%;transform:translateY(-50%);
  display:flex;flex-direction:column;gap:0;
}
.ifo-sublabel{padding:6px 0}
.ifo-sublabel-text{font-size:14px;font-weight:700;color:var(--accent);letter-spacing:.02em;line-height:1}
.ifo-sublabel-rule{height:1px;background:var(--accent);margin-top:4px;width:120px}

/* noimg-safe 레이아웃: 이미지 없으면 플렉스 열로 전환 */
.ifo-stage.no-img{display:block}
.ifo-stage.no-img .ifo-tags,
.ifo-stage.no-img .ifo-badges,
.ifo-stage.no-img .ifo-sublabels{position:static;transform:none;display:flex;flex-wrap:wrap;gap:10px;margin-top:16px;top:unset;left:unset;right:unset;bottom:unset}
.ifo-stage.no-img .ifo-tag,
.ifo-stage.no-img .ifo-badge{position:static}
.ifo-stage.no-img .ifo-sublabel-rule{width:80px}

/* ── 커넥터 선 (이미지 위에 깔리는 장식 SVG) ── */
.ifo-connector{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}

/* ── 주석 + 구분선 ── */
.ifo-foot{padding:32px var(--pad-x,56px) 0;display:flex;align-items:center;gap:16px}
.ifo-foot-rule{flex:1;height:5px;background:var(--ink);border-radius:2px}
.ifo-footnote{font-size:13px;font-weight:700;color:var(--muted);white-space:nowrap}
`,
  render: (d, { esc, richSafe }) => {
    const hasImg = typeof d.image === 'string' && d.image.length > 0

    // 그라디언트 알약 성분 태그
    const tagItems = d.ingredientTags
      .map(
        (t) => `
      <span class="ifo-tag">${esc(t.name)}</span>`,
      )
      .join('')

    // 효능 배지 (흰 알약 + 컬러 도트)
    const crossSvg = `<svg viewBox="0 0 12 12"><path d="M6 1v10M1 6h10"/></svg>`
    const badgeItems = d.efficacyBadges
      .map(
        (b) => `
      <span class="ifo-badge">
        <span class="ifo-badge-dot">${crossSvg}</span>${esc(b.label)}
      </span>`,
      )
      .join('')

    // 성분 서브라벨 (첫 번째 성분 태그의 sub 필드들 + 이후 태그 sub 병합)
    const subLabels = d.ingredientTags
      .filter((t) => t.sub)
      .flatMap((t) =>
        (t.sub as string).split(',').map((s) => s.trim()).filter(Boolean),
      )

    const subLabelHtml =
      subLabels.length > 0
        ? `<div class="ifo-sublabels">
          ${subLabels
            .map(
              (s) => `<div class="ifo-sublabel">
            <div class="ifo-sublabel-text">${esc(s)}</div>
            <div class="ifo-sublabel-rule"></div>
          </div>`,
            )
            .join('')}
        </div>`
        : ''

    // 장식 커넥터 라인 SVG (이미지가 있을 때만)
    const connectorSvg = hasImg
      ? // 좌표는 태그·배지의 세로 슬롯(13%·35%·68%)과 맞춘다 — 슬롯을 바꾸면 여기도 함께 옮길 것
        `<svg class="ifo-connector" viewBox="0 0 294 560" preserveAspectRatio="none">
        <line x1="228" y1="73" x2="294" y2="73" stroke="white" stroke-width="2.5" opacity=".85"/>
        <line x1="228" y1="196" x2="294" y2="196" stroke="white" stroke-width="2.5" opacity=".85"/>
        <line x1="66" y1="381" x2="0" y2="381" stroke="white" stroke-width="2.5" opacity=".85"/>
        <circle cx="228" cy="73" r="3" fill="white" opacity=".7"/>
        <circle cx="228" cy="196" r="3" fill="white" opacity=".7"/>
        <circle cx="66" cy="381" r="3" fill="white" opacity=".7"/>
      </svg>`
      : ''

    return `
<section class="ifo">
  <div class="ifo-hd">
    <div class="ifo-hd-top">
      <div>
        <div class="ifo-brand">${esc(d.brandName)}</div>
        <div class="ifo-product">${richSafe(d.productName)}</div>
      </div>
      <div class="ifo-hd-rule-v"></div>
      <div class="ifo-brand-aside">${esc(d.brandName)}</div>
    </div>
    <div class="ifo-hd-rule-h"></div>
    ${d.specLine ? `<div class="ifo-spec">${esc(d.specLine)}</div>` : ''}
  </div>

  <div class="ifo-stage${hasImg ? '' : ' no-img'}">
    <div class="ifo-img-wrap">
      ${media(d.image, 'ifo-img', '제품 이미지')}
      ${hasImg ? `<div class="ifo-overlay">
        ${connectorSvg}
        <div class="ifo-tags">${tagItems}</div>
        <div class="ifo-badges">${badgeItems}</div>
      </div>` : ''}
    </div>
    ${hasImg ? subLabelHtml : `
    <div class="ifo-tags">${tagItems}</div>
    <div class="ifo-badges">${badgeItems}</div>
    ${subLabels.length > 0 ? `<div class="ifo-sublabels">${subLabels.map(s => `<div class="ifo-sublabel"><div class="ifo-sublabel-text">${esc(s)}</div><div class="ifo-sublabel-rule"></div></div>`).join('')}</div>` : ''}
    `}
  </div>

  <div class="ifo-foot">
    ${d.footnote ? `<span class="ifo-footnote">${esc(d.footnote)}</span>` : ''}
    <div class="ifo-foot-rule"></div>
  </div>
</section>`
  },
})
