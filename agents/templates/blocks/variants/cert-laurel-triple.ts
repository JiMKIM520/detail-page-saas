/** CERT 아키타입: cert-laurel-triple
 *  피그마 189_인증서_09 구조 흡수.
 *  좌우 월계수 인라인 SVG + 그라데이션 헤드라인 + 3개 인증서 이미지 수평 나열 +
 *  3행 흰색 체크리스트 카드(금색 체크 아이콘 + 골드 별 모양 합격 배지).
 *  이미지 부재 시 이미지 열 전체를 숨기는 noimg-safe 강등 구현. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const certImageSchema = z.object({
  image: z.string().optional(),   // 인증서 이미지 url (선택)
  caption: z.string().min(1),     // 인증서 이미지 아래 라벨 (예: "낙하 테스트")
})

const checkItemSchema = z.object({
  label: z.string().min(1),       // 굵은 한 줄 타이틀 (예: "낙하 테스트 합격")
  detail: z.string().min(1),      // 얇은 세부 설명 (예: "1m 높이 낙하 100회 완료")
  badgeText: z.string().optional(), // 별 배지 안 텍스트 (기본 "테스트\n합격", br 허용)
})

const schema = z.object({
  headline: z.string().min(1),         // (em,br) 그라데이션 대형 제목
  subheadline: z.string().optional(),  // 제목 아래 보조 문구
  certs: z.array(certImageSchema).min(1).max(3),   // 인증서 이미지 열 (1~3개)
  items: z.array(checkItemSchema).min(1).max(4),   // 체크리스트 행 (1~4개)
})
type Data = z.infer<typeof schema>

export const certLaurelTriple = defineBlock<Data>({
  id: 'cert-laurel-triple',
  archetype: 'cert',
  styleTags: ['light', 'warm', 'premium', 'noimg-safe'],
  imageSlots: 3,
  describe:
    '좌우 월계수 장식 + 그라데이션 대형 헤드라인 + 인증서 사진 3장 수평 나열 + 흰색 카드 체크리스트(골드 체크+별 합격 배지). 내구성/품질 인증 신뢰 섹션. 이미지 없어도 레이아웃 유지(noimg-safe).',
  schema,
  css: `
.clt{background:var(--bg);padding:64px var(--pad-x,56px) 72px;text-align:center}

/* ── 타이틀 영역 ── */
.clt-hd{position:relative;display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:36px}
.clt-laurel{flex:0 0 auto;width:88px;height:auto;opacity:.9}
.clt-laurel.left{transform:scaleX(1)}
.clt-laurel.right{transform:scaleX(-1)}
.clt-title-wrap{flex:1;min-width:0;padding:0 16px}
.clt-headline{
  font-family:var(--font-display);font-weight:800;font-size:clamp(36px,5vw,64px);
  line-height:1.1;letter-spacing:-.02em;
  background:linear-gradient(135deg,var(--accent-d) 0%,var(--accent) 50%,#e8a020 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}
.clt-headline .em{-webkit-text-fill-color:transparent}
.clt-subhl{margin-top:10px;font-size:16px;font-weight:400;color:var(--ink-2);line-height:1.55}

/* ── 인증서 이미지 열 ── */
.clt-imgs{display:flex;justify-content:center;gap:16px;margin-bottom:32px}
.clt-img-item{display:flex;flex-direction:column;align-items:center;gap:10px;flex:0 1 220px;min-width:0}
.clt-img-frame{
  width:100%;aspect-ratio:220/320;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));
  overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,transparent);
}
.clt-img-frame img,.clt-img-frame .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
.clt-img-cap{font-size:13px;font-weight:500;color:var(--ink-2);text-align:center}

/* 이미지가 전혀 없으면 .clt-imgs-hidden 클래스를 붙여 열 전체 숨김 (noimg-safe) */
.clt-imgs-hidden{display:none}

/* ── 체크리스트 카드 ── */
.clt-list{display:flex;flex-direction:column;gap:14px}
.clt-card{
  position:relative;display:flex;align-items:center;
  background:var(--paper,#ffffff);
  border-radius:calc(var(--r-scale,1)*18px);
  padding:22px 104px 22px 24px;
  text-align:left;
  box-shadow:0 2px 12px -4px rgba(0,0,0,.09);
}
.clt-check-icon{
  flex:0 0 38px;width:38px;height:38px;
  display:flex;align-items:center;justify-content:center;
  margin-right:18px;color:var(--accent);
}
.clt-check-icon svg{width:28px;height:28px;stroke:var(--accent);stroke-width:2.8}
.clt-card-body{flex:1;min-width:0}
.clt-card-label{font-size:17px;font-weight:700;color:var(--ink);line-height:1.3;margin-bottom:4px}
.clt-card-detail{font-size:14px;font-weight:400;color:var(--ink-2);line-height:1.5}

/* ── 별 합격 배지 ── */
.clt-star-wrap{
  position:absolute;right:14px;top:50%;transform:translateY(-50%);
  width:72px;height:72px;flex:0 0 72px;
}
.clt-star-wrap svg.clt-star-bg{position:absolute;inset:0;width:100%;height:100%}
.clt-star-ring{
  position:absolute;inset:8px;border-radius:50%;
  border:1.5px solid rgba(202,144,51,.5);
}
.clt-star-ring2{
  position:absolute;inset:11px;border-radius:50%;
  border:1px solid rgba(202,144,51,.3);
}
.clt-star-text{
  position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-family:var(--font-display);font-weight:700;font-size:11px;
  color:#ffffff;text-align:center;line-height:1.25;white-space:pre-line;letter-spacing:.03em;
}
`,
  render: (d, { esc, richSafe }) => {
    // noimg-safe: 인증서 이미지 슬롯이 하나라도 있으면 이미지 열 렌더,
    // 전부 비어있으면 .clt-imgs-hidden 로 열 전체 숨김
    const hasAnyImg = d.certs.some(
      (c) => typeof c.image === 'string' && /^(https?:\/\/|data:|\/)/.test(c.image.trim()),
    )
    const imgsHidden = !hasAnyImg

    const laurelSvg = (cls: string) => `
<svg class="clt-laurel ${cls}" viewBox="0 0 88 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 줄기 -->
  <path d="M44 190 C44 150 44 110 44 10" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" opacity=".5"/>
  <!-- 잎사귀 쌍 — 7단 -->
  <ellipse cx="33" cy="170" rx="13" ry="7" transform="rotate(-30 33 170)" fill="var(--accent)" opacity=".55"/>
  <ellipse cx="55" cy="170" rx="13" ry="7" transform="rotate(30 55 170)"  fill="var(--accent)" opacity=".55"/>
  <ellipse cx="29" cy="145" rx="13" ry="7" transform="rotate(-38 29 145)" fill="var(--accent)" opacity=".6"/>
  <ellipse cx="59" cy="145" rx="13" ry="7" transform="rotate(38 59 145)"  fill="var(--accent)" opacity=".6"/>
  <ellipse cx="26" cy="118" rx="12" ry="6.5" transform="rotate(-44 26 118)" fill="var(--accent)" opacity=".65"/>
  <ellipse cx="62" cy="118" rx="12" ry="6.5" transform="rotate(44 62 118)"  fill="var(--accent)" opacity=".65"/>
  <ellipse cx="24" cy="92"  rx="11" ry="6"   transform="rotate(-48 24 92)"  fill="var(--accent)" opacity=".7"/>
  <ellipse cx="64" cy="92"  rx="11" ry="6"   transform="rotate(48 64 92)"   fill="var(--accent)" opacity=".7"/>
  <ellipse cx="26" cy="67"  rx="10" ry="5.5" transform="rotate(-52 26 67)"  fill="var(--accent)" opacity=".72"/>
  <ellipse cx="62" cy="67"  rx="10" ry="5.5" transform="rotate(52 62 67)"   fill="var(--accent)" opacity=".72"/>
  <ellipse cx="29" cy="44"  rx="9"  ry="5"   transform="rotate(-55 29 44)"  fill="var(--accent)" opacity=".75"/>
  <ellipse cx="59" cy="44"  rx="9"  ry="5"   transform="rotate(55 59 44)"   fill="var(--accent)" opacity=".75"/>
  <ellipse cx="33" cy="24"  rx="8"  ry="4.5" transform="rotate(-60 33 24)"  fill="var(--accent)" opacity=".8"/>
  <ellipse cx="55" cy="24"  rx="8"  ry="4.5" transform="rotate(60 55 24)"   fill="var(--accent)" opacity=".8"/>
  <!-- 상단 끝 장식 -->
  <circle cx="44" cy="11" r="4" fill="var(--accent)" opacity=".85"/>
</svg>`

    // 별 배지 SVG (골드 별 → 흰 텍스트)
    const starBadge = (text: string) => {
      const safeText = text.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
      return `
<div class="clt-star-wrap" aria-hidden="true">
  <svg class="clt-star-bg" viewBox="0 0 72 72">
    <polygon points="36,4 42.5,26 66,26 47.5,40 54,62 36,48 18,62 24.5,40 6,26 29.5,26"
      fill="var(--accent)" />
  </svg>
  <div class="clt-star-ring"></div>
  <div class="clt-star-ring2"></div>
  <div class="clt-star-text">${esc(safeText)}</div>
</div>`
    }

    // 체크 SVG (인라인)
    const checkSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13l5 5L20 7"/></svg>`

    return `
<section class="clt">
  <!-- 타이틀 영역: 좌우 월계수 + 그라데이션 헤드라인 -->
  <div class="clt-hd">
    ${laurelSvg('left')}
    <div class="clt-title-wrap">
      <h2 class="clt-headline">${richSafe(d.headline)}</h2>
      ${d.subheadline ? `<p class="clt-subhl">${esc(d.subheadline)}</p>` : ''}
    </div>
    ${laurelSvg('right')}
  </div>

  <!-- 인증서 이미지 열 (noimg-safe: 이미지 없으면 열 숨김) -->
  <div class="clt-imgs${imgsHidden ? ' clt-imgs-hidden' : ''}">
    ${d.certs
      .map(
        (c) => `
    <div class="clt-img-item">
      <div class="clt-img-frame">${media(c.image, '', esc(c.caption))}</div>
      <span class="clt-img-cap">${esc(c.caption)}</span>
    </div>`,
      )
      .join('')}
  </div>

  <!-- 체크리스트 카드 -->
  <div class="clt-list">
    ${d.items
      .map(
        (item) => `
    <div class="clt-card">
      <div class="clt-check-icon">${checkSvg}</div>
      <div class="clt-card-body">
        <div class="clt-card-label">${esc(item.label)}</div>
        <div class="clt-card-detail">${esc(item.detail)}</div>
      </div>
      ${starBadge(item.badgeText ?? '테스트\n합격')}
    </div>`,
      )
      .join('')}
  </div>
</section>`
  },
})
