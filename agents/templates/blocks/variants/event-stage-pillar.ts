/** EVENT 아키타입: event-stage-pillar
 *  피그마 054_포인트_구성_페이지_22 구조 흡수.
 *  좌우 1px 수직 기둥선 + 수평 교차선으로 무대 프레임 연출.
 *  전면 이미지 위 다크 스크림 + 날짜·제목·운영시간·메뉴 텍스트 분산 배치.
 *  noimg-safe: 이미지 없을 때 다크 그라데이션 배경으로 강등(붕괴 없음). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 이벤트 브랜드명 또는 소제목 (em,br) */
  eyebrow: z.string().optional(),
  /** 날짜 또는 대형 강조 텍스트 (em,br) — 최대 6자 내외 권장 */
  dateDisplay: z.string().min(1),
  /** 날짜 아래 이벤트 명칭 (em,br) */
  eventName: z.string().min(1),
  /** 운영 시간 또는 기간 안내 (순수 텍스트) */
  hoursLine: z.string().optional(),
  /** 중단 배지 텍스트 — 무대 중앙 pill 프레임 (순수 텍스트) */
  badgeText: z.string().optional(),
  /** 배경 이미지 URL */
  image: z.string().optional(),
  /** 시그니처 상품/메뉴 카테고리 라벨 (순수 텍스트) */
  menuLabel: z.string().optional(),
  /** 시그니처 상품/메뉴 이름 (em 허용 — 강조색) */
  menuName: z.string().optional(),
  /** 가격 표기 (순수 텍스트) */
  menuPrice: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const eventStagePillar = defineBlock<Data>({
  id: 'event-stage-pillar',
  archetype: 'event',
  styleTags: ['dark', 'editorial', 'event', 'full-bleed', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '이벤트 무대 프레임 블록. 전면 배경 이미지 위 좌우 1px 수직 기둥선+수평 교차선으로 공연·팝업·행사 공간감 연출. ' +
    '대형 날짜+이벤트명 상단 배치, 중앙 pill 배지, 우하단 메뉴/상품 블록(optional). 다크 분위기 행사 상세페이지에 적합.',
  schema,
  css: `
.edsq{position:relative;width:100%;min-height:620px;overflow:hidden;
  background:var(--brand,#0a0a0a);color:#fff;
  padding:56px var(--pad-x,56px) 64px}

/* 배경 이미지 — noimg-safe: .ph는 display:none!important이므로 배경 그라데이션이 그대로 보임 */
.edsq-bg{position:absolute;inset:0;z-index:0}
.edsq-bg img{width:100%;height:100%;object-fit:cover;border-radius:var(--shape-photo,0px);display:block}
/* 다크 스크림: 이미지 위 가독성 보장 */
.edsq-bg::after{content:'';position:absolute;inset:0;
  background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.32) 45%,rgba(0,0,0,.72) 100%);
  pointer-events:none}

/* noimg-safe 강등: 이미지 없을 때 브랜드 다크 그라데이션 */
.edsq-bg .ph+.edsq-bg-fallback,.edsq-bg:not(:has(img)) .edsq-bg-fallback{display:block}
.edsq-bg-fallback{display:none;position:absolute;inset:0;
  background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 18%,#0d0d0d) 0%,#0a0a0a 60%,color-mix(in srgb,var(--accent-d) 10%,#050505) 100%)}

/* 무대 기둥 프레임 — 좌우 수직 1px 선 */
.edsq-pillar-l,.edsq-pillar-r{
  position:absolute;top:0;bottom:0;width:1px;
  background:rgba(232,231,223,.55);z-index:1;pointer-events:none}
.edsq-pillar-l{left:var(--pad-x,56px)}
.edsq-pillar-r{right:var(--pad-x,56px)}

/* 수평 교차선 — 기둥 좌우 바깥으로 짧게 뻗는 T형 */
.edsq-cross{position:absolute;z-index:1;pointer-events:none;display:flex;align-items:center}
.edsq-cross-l,.edsq-cross-r{height:1px;width:32px;background:rgba(255,255,255,.7)}
.edsq-cross-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.8);flex-shrink:0}
/* 교차선 위치: 섹션 중간쯤 */
.edsq-cross-lt{top:42%;left:calc(var(--pad-x,56px) - 32px)}
.edsq-cross-rt{top:42%;right:calc(var(--pad-x,56px) - 32px);flex-direction:row-reverse}

/* 콘텐츠 레이어 */
.edsq-inner{position:relative;z-index:2;min-height:560px;display:flex;flex-direction:column;justify-content:space-between}
.edsq .em{color:var(--em-dark,#FFF7EA)}

/* 상단 영역 */
.edsq-top{padding-top:8px}
.edsq-eyebrow{font-family:var(--font-display);font-weight:700;font-size:18px;
  letter-spacing:.12em;color:rgba(255,255,255,.65);text-transform:uppercase;margin-bottom:20px}
.edsq-eyebrow .em{color:var(--em-dark,#FFF7EA)}

/* 날짜 대형 표시 */
.edsq-date-row{display:flex;align-items:center;gap:14px;margin-bottom:8px}
.edsq-star{display:inline-block;width:30px;height:30px;flex-shrink:0;opacity:.9}
.edsq-star svg{width:100%;height:100%;fill:#fff}
.edsq-date{font-family:var(--font-display);font-weight:400;font-size:clamp(52px,9vw,88px);
  line-height:1;letter-spacing:-.02em;color:#fff}
.edsq-date .em{color:var(--em-dark,#FFF7EA)}

.edsq-event-name{font-family:var(--font-display);font-weight:800;font-size:clamp(28px,5vw,52px);
  line-height:1.12;letter-spacing:-.01em;color:#fff;margin-bottom:12px}
.edsq-event-name .em{color:var(--em-dark,#FFF7EA)}

.edsq-hours{font-family:var(--font-lat),'Cormorant Garamond',serif;font-weight:400;
  font-size:clamp(14px,2vw,22px);letter-spacing:.06em;
  color:transparent;background:linear-gradient(90deg,rgba(255,255,255,.9) 0%,rgba(255,255,255,.45) 100%);
  -webkit-background-clip:text;background-clip:text;margin-top:6px}

/* 중앙 pill 배지 */
.edsq-badge-wrap{display:flex;justify-content:flex-end;padding:0 8px}
.edsq-badge{display:inline-block;border:1px solid rgba(255,255,255,.45);
  border-radius:calc(var(--r-scale,1)*30px);padding:10px 28px;
  font-family:var(--font-lat),'Cormorant Garamond',serif;font-size:clamp(13px,1.8vw,18px);
  letter-spacing:.04em;color:rgba(255,255,255,.88);backdrop-filter:blur(4px);
  background:rgba(255,255,255,.06)}

/* 하단 메뉴/상품 블록 — 우하단 */
.edsq-bottom{display:flex;justify-content:flex-end;padding-bottom:4px}
.edsq-menu{text-align:right}
.edsq-menu-label{font-family:var(--font-display);font-weight:700;font-size:clamp(16px,2.2vw,22px);
  color:rgba(255,255,255,.85);margin-bottom:2px}
.edsq-menu-label .em{color:var(--em-dark,#FFF7EA)}
.edsq-menu-name{font-family:var(--font-display);font-weight:700;font-size:clamp(18px,2.8vw,28px);
  color:var(--accent);line-height:1.15}
.edsq-menu-name .em{color:var(--em-dark,#FFF7EA)}
.edsq-menu-price{font-family:var(--font-lat),'Cormorant Garamond',serif;font-weight:300;
  font-size:clamp(16px,2.4vw,26px);color:rgba(255,255,255,.8);margin-top:4px;letter-spacing:.02em}
`,
  render: (d, { esc, richSafe }) => {
    const starSvg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0l1.6 7.2 7.2-1.6-5.2 5.2 5.2 5.2-7.2-1.6L12 21.6l-1.6-7.2-7.2 1.6 5.2-5.2-5.2-5.2 7.2 1.6z"/></svg>`

    const menuBlock =
      d.menuLabel || d.menuName || d.menuPrice
        ? `
    <div class="edsq-bottom">
      <div class="edsq-menu">
        ${d.menuLabel ? `<div class="edsq-menu-label">${richSafe(d.menuLabel)}</div>` : ''}
        ${d.menuName ? `<div class="edsq-menu-name">${richSafe(d.menuName)}</div>` : ''}
        ${d.menuPrice ? `<div class="edsq-menu-price">${esc(d.menuPrice)}</div>` : ''}
      </div>
    </div>`
        : ''

    return `
<section class="edsq">
  <!-- 배경 이미지 레이어 -->
  <div class="edsq-bg">
    ${media(d.image, 'edsq-bg-img', '이벤트 배경')}
    <div class="edsq-bg-fallback"></div>
  </div>

  <!-- 무대 기둥 프레임 -->
  <div class="edsq-pillar-l" aria-hidden="true"></div>
  <div class="edsq-pillar-r" aria-hidden="true"></div>

  <!-- 수평 교차선 -->
  <div class="edsq-cross edsq-cross-lt" aria-hidden="true">
    <span class="edsq-cross-l"></span>
    <span class="edsq-cross-dot"></span>
  </div>
  <div class="edsq-cross edsq-cross-rt" aria-hidden="true">
    <span class="edsq-cross-l"></span>
    <span class="edsq-cross-dot"></span>
  </div>

  <!-- 콘텐츠 -->
  <div class="edsq-inner">
    <div class="edsq-top">
      ${d.eyebrow ? `<div class="edsq-eyebrow">${richSafe(d.eyebrow)}</div>` : ''}

      <div class="edsq-date-row">
        <span class="edsq-star" aria-hidden="true">${starSvg}</span>
        <div class="edsq-date">${richSafe(d.dateDisplay)}</div>
        <span class="edsq-star" aria-hidden="true">${starSvg}</span>
      </div>

      <div class="edsq-event-name">${richSafe(d.eventName)}</div>
      ${d.hoursLine ? `<div class="edsq-hours">${esc(d.hoursLine)}</div>` : ''}
    </div>

    ${d.badgeText ? `
    <div class="edsq-badge-wrap">
      <span class="edsq-badge">${esc(d.badgeText)}</span>
    </div>` : ''}

    ${menuBlock}
  </div>
</section>`
  },
})
