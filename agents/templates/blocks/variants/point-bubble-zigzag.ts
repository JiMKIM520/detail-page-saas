/** POINT 아키타입: point-bubble-zigzag.
 *  피그마 206_포인트_07 흡수 — 3섹션 수직 나열 구조 재구성.
 *  섹션별 장치:
 *    §1 오버랩 원형 성분 버블(3개 그린 계열 반투명 원, CSS overlap) +
 *       지그재그 성분 카드 리스트(번호 뱃지·이미지·제목·설명 좌우 교대)
 *    §2 비포애프터 카드 스택(색 블록 타이틀 행 + before 다크/after 브랜드색 2열)
 *    §3 원형 동심원 버블 아이콘 카드 리스트(수직 스택, 원형 아이콘 좌측)
 *  각 섹션: point 레이블 → 대형 이미지 → 그라디언트 키워드 박스 → 하단 컴포넌트.
 *  이미지 없을 때 .ph가 display:none 처리되어 레이아웃 유지(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── 섹션별 서브 스키마 ──────────────────────────────────────────
const ingredientItemSchema = z.object({
  image: z.string().optional(),         // (url) 성분 사진
  name: z.string().min(1),              // 성분 한국어명 (em 허용)
  nameLat: z.string().optional(),       // 성분 학명/영문
  benefit: z.string().min(1),           // 짧은 효능 라벨
  desc: z.string().min(1),              // 설명 2~3줄
})

const bubbleItemSchema = z.object({
  nameLat: z.string().min(1),           // 학명/영문 (버블 상단)
  nameKo: z.string().min(1),            // 한국어명 (버블 하단)
})

const beforeAfterItemSchema = z.object({
  label: z.string().min(1),             // 케이스 라벨 (예: "01_두피케어")
  period: z.string().optional(),        // 기간 라벨 (예: "4주 사용 후 비교")
  imageBefore: z.string().optional(),   // (url) 비포 사진
  imageAfter: z.string().optional(),    // (url) 애프터 사진
})

const certItemSchema = z.object({
  title: z.string().min(1),             // 인증/항목명
  detail: z.string().min(1),            // 세부 설명
})

// ── 섹션 스키마 ────────────────────────────────────────────────
const section1Schema = z.object({
  pointLabel: z.string().default('point 01.'),
  productTag: z.string().optional(),    // 우측 작은 태그
  image: z.string().optional(),         // (url) 대형 사진
  kw: z.string().min(1),               // 키워드 박스 대형 문구 (em,br)
  kwSub: z.string().optional(),         // 키워드 박스 위 소제목
  desc: z.string().optional(),          // 섹션 설명
  bubbles: z.array(bubbleItemSchema).min(2).max(4),
  ingredients: z.array(ingredientItemSchema).min(2).max(4),
})

const section2Schema = z.object({
  pointLabel: z.string().default('point 02.'),
  productTag: z.string().optional(),
  image: z.string().optional(),         // (url) 대형 사진
  kw: z.string().min(1),               // 키워드 박스 대형 문구 (em,br)
  kwSub: z.string().optional(),
  desc: z.string().optional(),
  beforeAfters: z.array(beforeAfterItemSchema).min(1).max(3),
  disclaimer: z.string().optional(),    // * 주의 문구
})

const section3Schema = z.object({
  pointLabel: z.string().default('point 03.'),
  productTag: z.string().optional(),
  image: z.string().optional(),         // (url) 대형 사진
  kw: z.string().min(1),               // 키워드 박스 대형 문구 (em,br)
  kwSub: z.string().optional(),
  desc: z.string().optional(),
  certs: z.array(certItemSchema).min(2).max(4),
})

const schema = z.object({
  sec1: section1Schema,
  sec2: section2Schema,
  sec3: section3Schema,
})

type Data = z.infer<typeof schema>
type Sec1 = z.infer<typeof section1Schema>
type Sec2 = z.infer<typeof section2Schema>
type Sec3 = z.infer<typeof section3Schema>

// ── 렌더 헬퍼 ─────────────────────────────────────────────────
function renderPointHeader(label: string, tag: string | undefined, esc: (s: string | undefined) => string): string {
  return `
  <div class="pwxp-pt-row">
    <span class="pwxp-pt-label">${esc(label)}</span>
    ${tag ? `<span class="pwxp-pt-tag">${esc(tag)}</span>` : ''}
  </div>`
}

function renderKwBox(kw: string, kwSub: string | undefined, desc: string | undefined, richSafe: (s: string | undefined) => string): string {
  return `
  <div class="pwxp-kw-wrap">
    ${kwSub ? `<p class="pwxp-kw-sub">${richSafe(kwSub)}</p>` : ''}
    <div class="pwxp-kw-box">
      <p class="pwxp-kw-text">${richSafe(kw)}</p>
    </div>
    ${desc ? `<p class="pwxp-kw-desc">${richSafe(desc)}</p>` : ''}
  </div>`
}

function renderBigImage(url: string | undefined): string {
  return `<div class="pwxp-img-frame">${media(url, 'pwxp-img', '포인트 사진')}</div>`
}

// §1: 버블 + 지그재그 성분 리스트
function renderSec1(d: Sec1, esc: (s: string | undefined) => string, richSafe: (s: string | undefined) => string): string {
  const bubbleColors = [
    'rgba(123,166,54,0.88)',
    'rgba(64,141,47,0.80)',
    'rgba(47,141,111,0.70)',
    'rgba(90,110,57,0.75)',
  ]
  return `
<section class="pwxp pwxp-s1">
  ${renderPointHeader(d.pointLabel, d.productTag, esc)}
  ${renderBigImage(d.image)}
  ${renderKwBox(d.kw, d.kwSub, d.desc, richSafe)}

  <!-- 오버랩 원형 버블 -->
  <div class="pwxp-bubbles" aria-hidden="true">
    ${d.bubbles.map((b, i) => `
    <div class="pwxp-bubble" style="--bc:${bubbleColors[i % bubbleColors.length]}">
      <span class="pwxp-bubble-lat">${esc(b.nameLat)}</span>
      <span class="pwxp-bubble-div"></span>
      <span class="pwxp-bubble-ko">${esc(b.nameKo)}</span>
    </div>`).join('')}
  </div>

  <!-- 지그재그 성분 카드 리스트 -->
  <ul class="pwxp-ing-list">
    ${d.ingredients.map((item, i) => `
    <li class="pwxp-ing-item${i % 2 === 1 ? ' rev' : ''}">
      <div class="pwxp-ing-num-wrap">
        <span class="pwxp-ing-num">${i + 1}</span>
      </div>
      <div class="pwxp-ing-img-wrap">
        ${media(item.image, 'pwxp-ing-img', esc(item.name))}
      </div>
      <div class="pwxp-ing-body">
        <p class="pwxp-ing-name-lat">${esc(item.nameLat ?? '')}</p>
        <h3 class="pwxp-ing-name">${richSafe(item.name)}</h3>
        <p class="pwxp-ing-benefit">${esc(item.benefit)}</p>
        <p class="pwxp-ing-desc">${esc(item.desc)}</p>
      </div>
    </li>`).join('')}
  </ul>
</section>`
}

// §2: 비포애프터 카드 스택
function renderSec2(d: Sec2, esc: (s: string | undefined) => string, richSafe: (s: string | undefined) => string): string {
  return `
<section class="pwxp pwxp-s2">
  ${renderPointHeader(d.pointLabel, d.productTag, esc)}
  ${renderBigImage(d.image)}
  ${renderKwBox(d.kw, d.kwSub, d.desc, richSafe)}

  <!-- 비포애프터 카드 -->
  <div class="pwxp-ba-list">
    ${d.beforeAfters.map((ba, i) => `
    <div class="pwxp-ba-card">
      <div class="pwxp-ba-header">
        <span class="pwxp-ba-label">${String(i + 1).padStart(2, '0')}_${esc(ba.label)}</span>
        <span class="pwxp-ba-div"></span>
        ${ba.period ? `<span class="pwxp-ba-period">${esc(ba.period)}</span>` : ''}
      </div>
      <div class="pwxp-ba-cols">
        <div class="pwxp-ba-col pwxp-ba-before">
          ${media(ba.imageBefore, 'pwxp-ba-img', '사용 전')}
          <p class="pwxp-ba-flag">before</p>
        </div>
        <div class="pwxp-ba-col pwxp-ba-after">
          ${media(ba.imageAfter, 'pwxp-ba-img', '사용 후')}
          <p class="pwxp-ba-flag">after</p>
        </div>
      </div>
    </div>`).join('')}
    ${d.disclaimer ? `<p class="pwxp-ba-disc">${esc(d.disclaimer)}</p>` : ''}
  </div>
</section>`
}

// §3: 동심원 아이콘 버블 + 수직 인증 카드 리스트
function renderSec3(d: Sec3, esc: (s: string | undefined) => string, richSafe: (s: string | undefined) => string): string {
  return `
<section class="pwxp pwxp-s3">
  ${renderPointHeader(d.pointLabel, d.productTag, esc)}
  ${renderBigImage(d.image)}
  ${renderKwBox(d.kw, d.kwSub, d.desc, richSafe)}

  <!-- 동심원 아이콘 버블 인증 카드 리스트 -->
  <ul class="pwxp-cert-list">
    ${d.certs.map((item, i) => `
    <li class="pwxp-cert-item">
      <!-- 동심원 버블 아이콘 (CSS only) -->
      <div class="pwxp-cert-bubble" aria-hidden="true">
        <div class="pwxp-cert-ring pwxp-cert-r3"></div>
        <div class="pwxp-cert-ring pwxp-cert-r2"></div>
        <div class="pwxp-cert-ring pwxp-cert-r1">
          <span class="pwxp-cert-idx">${i + 1}</span>
        </div>
      </div>
      <div class="pwxp-cert-body">
        <div class="pwxp-cert-vline" aria-hidden="true"></div>
        <h3 class="pwxp-cert-title">${richSafe(item.title)}</h3>
        <p class="pwxp-cert-detail">${esc(item.detail)}</p>
      </div>
    </li>`).join('')}
  </ul>
</section>`
}

// ── 변형 정의 ──────────────────────────────────────────────────
export const pointBubbleZigzag = defineBlock<Data>({
  id: 'point-bubble-zigzag',
  archetype: 'point',
  styleTags: ['light', 'natural', 'ingredient', 'before-after', 'cert', 'noimg-safe'],
  imageSlots: 7,   // §1 대형1 + 성분최대4, §2 대형1, §3 대형1 (성분이미지 제외하면 3)
  describe:
    '3섹션 포인트 블록. §1 오버랩 반투명 원형 성분 버블 + 지그재그 성분 카드 리스트, §2 비포애프터 2열 색블록 카드(before 다크/after 브랜드), §3 동심원 버블 아이콘 + 수직 인증 카드. 각 섹션 공통: point 레이블·대형 사진·그라디언트 키워드 박스. 자연/뷰티/헬스 제품 성분·효능 강조에 적합.',
  schema,
  css: `
/* ── POINT-BUBBLE-ZIGZAG (pwxp) ── */
.pwxp{padding:60px 0;color:var(--ink)}
.pwxp-s1{background:var(--bg)}
.pwxp-s2{background:var(--paper,#fff)}
.pwxp-s3{background:color-mix(in srgb,var(--accent) 6%,var(--bg))}

/* point 레이블 행 */
.pwxp-pt-row{display:flex;align-items:center;justify-content:space-between;padding:0 var(--pad-x,56px) 28px}
.pwxp-pt-label{font-family:'Cafe24 Dangdanghae',var(--font-hand),cursive;font-size:38px;color:var(--accent-d)}
.pwxp-pt-tag{font-size:14px;font-weight:500;color:var(--accent-d);opacity:.75;letter-spacing:.04em}

/* 대형 이미지 프레임 */
.pwxp-img-frame{padding:0 var(--pad-x,56px);margin-bottom:36px}
.pwxp-img{width:100%;aspect-ratio:760/620;object-fit:cover;border-radius:var(--shape-photo,calc(var(--r-scale,1)*18px));display:block}

/* 키워드 박스 */
.pwxp-kw-wrap{padding:0 var(--pad-x,56px);text-align:center;margin-bottom:44px}
.pwxp-kw-sub{font-size:22px;font-weight:500;color:var(--ink);margin-bottom:10px;letter-spacing:-.01em}
.pwxp-kw-box{display:inline-block;background:linear-gradient(90deg,var(--accent-d),var(--accent));padding:14px 36px;border-radius:calc(var(--r-scale,1)*6px);margin:6px auto}
.pwxp-kw-text{font-family:var(--font-display);font-weight:700;font-size:52px;color:#fff;line-height:1.15;letter-spacing:-.02em}
.pwxp-kw-text .em{color:#d0ff01}
.pwxp-kw-desc{font-size:18px;color:var(--ink-2);line-height:1.7;margin-top:18px}

/* §1: 오버랩 버블 */
.pwxp-bubbles{display:flex;align-items:center;justify-content:center;padding:0 var(--pad-x,56px);margin-bottom:52px;position:relative;height:280px}
.pwxp-bubble{position:absolute;width:240px;height:240px;border-radius:50%;background:var(--bc,rgba(123,166,54,.88));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:28px}
.pwxp-bubble:nth-child(1){left:calc(var(--pad-x,56px) + 10px);top:20px;z-index:3}
.pwxp-bubble:nth-child(2){left:calc(var(--pad-x,56px) + 130px);top:20px;z-index:2}
.pwxp-bubble:nth-child(3){left:calc(var(--pad-x,56px) + 260px);top:20px;z-index:1}
.pwxp-bubble:nth-child(4){left:calc(var(--pad-x,56px) + 390px);top:20px;z-index:0}
.pwxp-bubble-lat{font-family:var(--font-lat,'Cormorant Garamond',serif);font-size:18px;font-weight:500;color:#fff;text-align:center;line-height:1.2}
.pwxp-bubble-div{width:56%;height:1px;background:#fff;opacity:.6}
.pwxp-bubble-ko{font-size:16px;font-weight:700;color:#fff;text-align:center;letter-spacing:.03em}

/* §1: 지그재그 성분 카드 */
.pwxp-ing-list{list-style:none;padding:0 var(--pad-x,56px);display:flex;flex-direction:column;gap:32px}
.pwxp-ing-item{display:flex;align-items:center;gap:24px;position:relative}
.pwxp-ing-item.rev{flex-direction:row-reverse}
.pwxp-ing-num-wrap{position:absolute;top:0;left:0;z-index:2}
.pwxp-ing-item.rev .pwxp-ing-num-wrap{left:auto;right:0}
.pwxp-ing-num{display:flex;align-items:center;justify-content:center;width:44px;height:44px;background:var(--accent-d);color:#fff;font-size:22px;font-weight:700;font-family:var(--font-display);border-radius:calc(var(--r-scale,1)*4px)}
.pwxp-ing-img-wrap{flex:0 0 44%;position:relative}
.pwxp-ing-img{width:100%;aspect-ratio:1/0.85;object-fit:cover;border-radius:var(--shape-photo,calc(var(--r-scale,1)*14px));display:block}
.pwxp-ing-body{flex:1;min-width:0}
.pwxp-ing-name-lat{font-family:var(--font-lat,'Cormorant Garamond',serif);font-size:16px;color:var(--accent-d);margin-bottom:4px;letter-spacing:.02em}
.pwxp-ing-name{font-size:26px;font-weight:700;color:var(--accent-d);line-height:1.2;margin-bottom:4px}
.pwxp-ing-name .em{color:var(--accent)}
.pwxp-ing-benefit{font-size:18px;font-weight:600;color:var(--ink);margin-bottom:10px}
.pwxp-ing-desc{font-size:15px;color:var(--ink-2);line-height:1.7}

/* §2: 비포애프터 */
.pwxp-ba-list{padding:0 var(--pad-x,56px);display:flex;flex-direction:column;gap:24px}
.pwxp-ba-card{border-radius:calc(var(--r-scale,1)*10px);overflow:hidden;border:1px solid var(--line,#e5e5e5)}
.pwxp-ba-header{display:flex;align-items:center;gap:12px;background:var(--accent-d);padding:14px 20px}
.pwxp-ba-label{font-size:20px;font-weight:700;color:#f5f8e5;letter-spacing:.02em;white-space:nowrap}
.pwxp-ba-div{flex:1;height:1px;background:#f5f8e5;opacity:.45}
.pwxp-ba-period{font-size:15px;color:rgba(245,248,229,.75);white-space:nowrap}
.pwxp-ba-cols{display:grid;grid-template-columns:1fr 1fr}
.pwxp-ba-col{display:flex;flex-direction:column}
.pwxp-ba-img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}
.pwxp-ba-before{background:#1a1a1a}
.pwxp-ba-after{background:var(--accent-d)}
.pwxp-ba-flag{font-size:18px;font-weight:600;padding:12px;text-align:center;letter-spacing:.06em}
.pwxp-ba-before .pwxp-ba-flag{color:#fff;font-weight:400}
.pwxp-ba-after .pwxp-ba-flag{color:#d0ff01;font-weight:700}
.pwxp-ba-disc{font-size:13px;color:var(--muted,#888);text-align:center;padding-top:8px}

/* §3: 동심원 버블 인증 카드 */
.pwxp-cert-list{list-style:none;padding:0 var(--pad-x,56px);display:flex;flex-direction:column;gap:0}
.pwxp-cert-item{display:flex;align-items:flex-start;gap:28px;padding:24px 0;border-bottom:1px solid var(--line,#e5e5e5)}
.pwxp-cert-item:last-child{border-bottom:none}
.pwxp-cert-bubble{position:relative;flex:0 0 100px;height:100px}
.pwxp-cert-ring{position:absolute;border-radius:50%;border:2px solid var(--accent-d)}
.pwxp-cert-r3{inset:0;opacity:.22}
.pwxp-cert-r2{inset:8px;opacity:.45}
.pwxp-cert-r1{inset:18px;background:var(--accent-d);display:flex;align-items:center;justify-content:center}
.pwxp-cert-idx{font-family:var(--font-display);font-weight:700;font-size:22px;color:#fff}
.pwxp-cert-body{flex:1;min-width:0;display:flex;gap:16px;align-items:flex-start}
.pwxp-cert-vline{width:3px;min-height:60px;background:var(--line,#e5e5e5);border-radius:calc(var(--r-scale,1)*2px);flex:0 0 3px;margin-top:4px}
.pwxp-cert-title{font-size:22px;font-weight:700;color:var(--ink);margin-bottom:8px;line-height:1.3}
.pwxp-cert-title .em{color:var(--accent-d)}
.pwxp-cert-detail{font-size:15px;color:var(--ink-2);line-height:1.72}
`,
  render: (d, { esc, richSafe }) => `
${renderSec1(d.sec1, esc, richSafe)}
${renderSec2(d.sec2, esc, richSafe)}
${renderSec3(d.sec3, esc, richSafe)}
`,
})
