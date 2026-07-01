/** POINT 아키타입: feature-product-float-icon-grid.
 *  [끝판왕] 포인트 구성 #34 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 솔리드 브랜드색 배경 위 제품 이미지 자유 부유(컨테이너 없음) + eyebrow + 대형 제품명 헤드라인
 *           → 하단 2열 라운드 흰 카드 그리드(체크 아이콘 + 소제목 + 본문, 2~6쌍). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 눈썹 레이블 (선택, 예: "상품 설명을 입력하세요.") */
  eyebrow: z.string().optional(),
  /** 대형 제품명 헤드라인 (em 허용) */
  title: z.string().min(1),
  /** 히어로 배경색 오버라이드 (선택; 기본 var(--accent) 사용 — hex/rgb 직접 지정 가능) */
  heroBg: z.string().optional(),
  /** 부유 제품 이미지 1 (메인, 크게) */
  productImage1: z.string().optional(),
  /** 부유 제품 이미지 2 (서브, 작게 — 살짝 겹침 연출) */
  productImage2: z.string().optional(),
  /** 제품 이미지 공통 alt */
  productAlt: z.string().optional(),
  /** 아이콘+소제목+본문 카드 (2~6개, 2열 그리드) */
  items: z
    .array(
      z.object({
        /** 카드 아이콘 (ICONS 키; 생략 시 check) */
        icon: z.string().optional(),
        /** 카드 소제목 (em 허용) */
        heading: z.string().min(1),
        /** 카드 본문 (선택, em/br 허용) */
        body: z.string().optional(),
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const featureProductFloatIconGrid = defineBlock<Data>({
  id: 'feature-product-float-icon-grid',
  archetype: 'point' as any,
  styleTags: ['brand-bg', 'float', 'grid', 'icon-card', 'rounded', 'template'],
  imageSlots: 2,
  describe:
    '포인트 구성(제품 부유+아이콘 카드). 솔리드 브랜드색 배경 위 제품 이미지 자유 부유(컨테이너 없음) + eyebrow + 대형 헤드라인 → 2열 라운드 흰 카드 그리드(체크 아이콘+소제목+본문, 2~6쌍). 뷰티·식품 포인트 섹션에 적합.',
  schema,
  css: `
/* feature-product-float-icon-grid — 접두사 fpfig- */
.fpfig{word-break:keep-all;overflow-wrap:break-word}

/* ── 히어로 존: 솔리드 브랜드색 배경 + 이미지 부유 ── */
.fpfig-hero{position:relative;background:var(--accent);overflow:hidden;padding:40px 40px 0;min-height:300px;display:flex;flex-direction:column;align-items:center;text-align:center}
.fpfig-eyebrow{font-family:var(--font-body);font-size:14px;font-weight:500;color:rgba(255,255,255,.75);letter-spacing:.04em;margin-bottom:8px}
.fpfig-title{font-family:var(--font-display);font-weight:800;font-size:clamp(30px,7vw,50px);line-height:1.18;letter-spacing:-.02em;color:#fff;position:relative;z-index:2}
/* 다크 배경이므로 .em은 반투명 흰색(충분한 대비 확보, accent-d 저대비 회피) */
.fpfig-title .em{color:rgba(255,255,255,.82);text-shadow:0 2px 8px rgba(0,0,0,.10)}

/* 이미지 부유: 두 이미지를 가로 배치, 컨테이너 없이 배경에 직접 floating */
.fpfig-float{position:relative;width:100%;height:210px;margin-top:22px;display:flex;align-items:flex-end;justify-content:center}
/* 배경 깊이감 장식 원 */
.fpfig-orb{position:absolute;bottom:-50px;left:50%;transform:translateX(-50%);width:320px;height:220px;border-radius:50%;background:rgba(255,255,255,.09);pointer-events:none;z-index:1}
/* 메인 제품 이미지 — 컨테이너 없음, 배경 위 자유 부유 */
.fpfig-img1{width:130px;height:190px;object-fit:contain;display:block;position:relative;z-index:3;filter:drop-shadow(0 8px 20px rgba(0,0,0,.18))}
.fpfig-img1.ph{width:130px;height:190px;border:2px dashed rgba(255,255,255,.35);background:rgba(255,255,255,.10);color:rgba(255,255,255,.55);border-radius:8px;z-index:3}
/* 서브 제품 이미지 — 메인 왼쪽에 살짝 겹침 */
.fpfig-img2{width:82px;height:130px;object-fit:contain;display:block;position:relative;z-index:2;margin-right:-14px;margin-bottom:10px;filter:drop-shadow(0 6px 14px rgba(0,0,0,.13))}
.fpfig-img2.ph{width:82px;height:130px;border:2px dashed rgba(255,255,255,.28);background:rgba(255,255,255,.08);color:rgba(255,255,255,.45);border-radius:6px;z-index:2}

/* ── 카드 그리드 존 ── */
.fpfig-grid{background:var(--bg);padding:26px 18px 40px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
.fpfig-card{background:var(--paper);border-radius:18px;padding:20px 16px 18px;display:flex;flex-direction:column;box-shadow:0 2px 10px -3px rgba(0,0,0,.07)}
/* 아이콘 원형 배지 */
.fpfig-icon{width:30px;height:30px;border-radius:50%;background:var(--accent);display:grid;place-items:center;color:#fff;margin-bottom:10px;flex-shrink:0}
.fpfig-icon svg{width:15px;height:15px}
.fpfig-ch{font-family:var(--font-display);font-weight:700;font-size:14px;line-height:1.4;color:var(--ink);margin-bottom:5px}
.fpfig-ch .em{color:var(--accent-d)}
.fpfig-cb{font-family:var(--font-body);font-size:12px;line-height:1.65;color:var(--muted)}
.fpfig-cb .em{color:var(--accent-d);font-weight:600}
`,
  render: (d, { esc, richSafe, icon }) => {
    const heroBgStyle = d.heroBg ? ` style="background:${esc(d.heroBg)}"` : ''

    const cards = d.items
      .map(
        (it) => `
    <div class="fpfig-card">
      <div class="fpfig-icon">${icon(it.icon ?? 'check')}</div>
      <div class="fpfig-ch">${richSafe(it.heading)}</div>
      ${it.body ? `<div class="fpfig-cb">${richSafe(it.body)}</div>` : ''}
    </div>`,
      )
      .join('')

    return `
<section class="fpfig">
  <div class="fpfig-hero"${heroBgStyle}>
    ${d.eyebrow ? `<p class="fpfig-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="fpfig-title">${richSafe(d.title)}</h2>
    <div class="fpfig-float">
      <div class="fpfig-orb"></div>
      ${media(d.productImage2, 'fpfig-img2', esc(d.productAlt ?? '제품 이미지 2'))}
      ${media(d.productImage1, 'fpfig-img1', esc(d.productAlt ?? '제품 이미지'))}
    </div>
  </div>
  <div class="fpfig-grid">
    ${cards}
  </div>
</section>`
  },
})
