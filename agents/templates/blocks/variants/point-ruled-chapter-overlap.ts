/** POINT 아키타입: point-ruled-chapter-overlap.
 *  피그마 265_포인트_08 패턴 흡수 재구성 (클론 아님).
 *
 *  시그니처 장치:
 *  1) 가로선 + "point N" 라틴 레이블로 챕터 구분 (섹션 수 2~4)
 *  2) 섹션마다 메인 타이틀 + 서브 텍스트 위계
 *  3) 섹션 내 이미지 존 3종 선택: duo(2열 오프셋) | overlap(대·소 오버랩) | single(풀너비)
 *  4) 선택적 번호 리스트(이미지 썸 + 번호 + 소항목 텍스트)
 *  라이트 배경. 섹션별 배경 선택(기본 white / warm).
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/* ── 스키마 ─────────────────────────────────────────────── */

const listItemSchema = z.object({
  /** 번호 리스트 썸네일 이미지 (optional) */
  thumb: z.string().optional(),
  /** 항목 레이블 — 짧은 소제목 */
  label: z.string().min(1),
  /** 항목 설명 */
  text: z.string().min(1),
})

const sectionSchema = z.object({
  /** 섹션 포인트 레이블 — 기본 "point 0N" */
  pointLabel: z.string().optional(),
  /** 섹션 메인 타이틀 (em, br 허용) */
  title: z.string().min(1),
  /** 타이틀 아래 서브 텍스트 */
  sub: z.string().optional(),
  /** 이미지 존 레이아웃 타입
   *  - "duo"     : 2열 오프셋 그리드 (이미지A + 이미지B, B가 100px 내려앉음)
   *  - "overlap" : 대(배경) 이미지 위에 소 이미지 오프셋 오버랩
   *  - "single"  : 풀너비 단일 이미지
   *  - "none"    : 이미지 없음 */
  layout: z.enum(['duo', 'overlap', 'single', 'none']).default('duo'),
  /** 이미지 A (duo=왼쪽 또는 background, overlap=배경 대형) */
  imageA: z.string().optional(),
  /** 이미지 B (duo=오른쪽, overlap=전경 소형) */
  imageB: z.string().optional(),
  /** 중앙 캡션 텍스트박스 — 라틴 대제목 (accent 색, em 허용) */
  capLatTitle: z.string().optional(),
  /** 캡션 한국어 서브카피 */
  capSub: z.string().optional(),
  /** 번호 리스트 항목 (0~4개) */
  items: z.array(listItemSchema).max(4).optional(),
  /** 섹션 배경 : "white" | "warm" — 기본 white */
  bg: z.enum(['white', 'warm']).default('white'),
})

const schema = z.object({
  /** 전체 블록 상단 eyebrow (선택) */
  eyebrow: z.string().optional(),
  /** 섹션 반복 (2~4개) */
  sections: z.array(sectionSchema).min(2).max(4),
})

type Data = z.infer<typeof schema>

/* ── 헬퍼 ───────────────────────────────────────────────── */
const pad2 = (n: number) => String(n).padStart(2, '0')

/* ── defineBlock ─────────────────────────────────────────── */

export const pointRuledChapterOverlap = defineBlock<Data>({
  id: 'point-ruled-chapter-overlap',
  archetype: 'point',
  styleTags: ['light', 'editorial', 'numbered', 'noimg-safe'],
  imageSlots: 6,
  describe:
    '포인트 챕터 오버랩(라이트). 가로선+라틴 point N 레이블로 챕터 구분 → 메인 타이틀+서브 위계 → 섹션별 이미지 존(duo 2열오프셋 / overlap 대소오버랩 / single 풀너비) → 선택적 번호 리스트. 2~4 섹션 수직 스택. 브리프 근거 시만: 번호 리스트 썸네일.',
  schema,
  css: `
/* ── point-ruled-chapter-overlap — 접두사 ppoy- ── */
.ppoy{background:var(--bg);padding:0 0 72px;word-break:keep-all;overflow-wrap:break-word}
.ppoy-eyebrow{text-align:center;padding:48px var(--pad-x,56px) 0;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-d);margin-bottom:0}

/* 섹션 */
.ppoy-sec{padding:56px 0 0}
.ppoy-sec--warm{background:color-mix(in srgb,var(--accent) 7%,var(--bg))}

/* 챕터 헤더: 가로선 + point N 레이블 + 가로선 */
.ppoy-ch{display:flex;align-items:center;gap:0;padding:0 var(--pad-x,56px);margin-bottom:32px}
.ppoy-ch-line{flex:0 0 40px;height:2px;background:var(--accent);opacity:.5}
.ppoy-ch-line.right{flex:1}
.ppoy-ch-label{font-family:var(--font-lat,var(--font-display));font-weight:700;font-size:clamp(28px,6vw,44px);color:var(--accent);letter-spacing:-.01em;padding:0 14px;line-height:1}

/* 타이틀 존 */
.ppoy-ttl-wrap{padding:0 var(--pad-x,56px);margin-bottom:28px}
.ppoy-title{font-family:var(--font-body);font-weight:600;font-size:clamp(24px,5.5vw,44px);color:var(--ink);line-height:1.35;letter-spacing:-.02em}
.ppoy-title .em{color:var(--accent)}
.ppoy-sub{margin-top:12px;font-size:clamp(14px,3.5vw,16px);color:var(--ink-2);line-height:1.7;font-weight:400}

/* 이미지 존 — duo */
.ppoy-duo{padding:0 var(--pad-x,56px);display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start;margin-bottom:28px}
.ppoy-duo-a{border-radius:var(--shape-photo, calc(var(--r-scale,1)*10px));overflow:hidden;aspect-ratio:9/12;background:color-mix(in srgb,var(--accent) 10%,var(--bg))}
.ppoy-duo-b{border-radius:var(--shape-photo, calc(var(--r-scale,1)*10px));overflow:hidden;aspect-ratio:9/13;background:color-mix(in srgb,var(--accent) 8%,var(--bg));margin-top:60px}
.ppoy-duo-a img,.ppoy-duo-a .ph,
.ppoy-duo-b img,.ppoy-duo-b .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}

/* 이미지 존 — overlap */
.ppoy-ovl{margin:0 var(--pad-x,56px) 28px;position:relative;height:320px;overflow:hidden;max-width:calc(872px - var(--pad-x,56px)*2)}
.ppoy-ovl-bg{position:absolute;left:0;top:0;width:72%;aspect-ratio:4/5;border-radius:var(--shape-photo, calc(var(--r-scale,1)*10px));overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,var(--bg))}
.ppoy-ovl-bg img,.ppoy-ovl-bg .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
.ppoy-ovl-fg{position:absolute;right:0;bottom:0;width:44%;aspect-ratio:3/4;border-radius:var(--shape-photo, calc(var(--r-scale,1)*8px));overflow:hidden;background:color-mix(in srgb,var(--accent) 12%,var(--bg));box-shadow:0 12px 32px -8px rgba(0,0,0,.18)}
.ppoy-ovl-fg img,.ppoy-ovl-fg .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}

/* 이미지 존 — single */
.ppoy-single{padding:0 var(--pad-x,56px);margin-bottom:28px}
.ppoy-single-img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*10px));display:block;background:color-mix(in srgb,var(--accent) 8%,var(--bg))}
.ppoy-single-img.ph{display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:13px}

/* 캡션 텍스트박스 */
.ppoy-cap{text-align:center;padding:0 var(--pad-x,56px);margin-bottom:24px}
.ppoy-cap-lat{font-family:var(--font-lat,var(--font-display));font-weight:800;font-size:clamp(32px,7vw,56px);color:var(--accent);letter-spacing:-.02em;line-height:1}
.ppoy-cap-lat .em{color:var(--ink)}
.ppoy-cap-div{width:56px;height:3px;background:var(--accent);margin:12px auto 10px;border-radius:999px}
.ppoy-cap-sub{font-size:clamp(13px,3.2vw,15px);color:var(--ink-2);line-height:1.7}

/* 번호 리스트 */
.ppoy-list{padding:0 var(--pad-x,56px);display:flex;flex-direction:column;gap:0}
.ppoy-li{display:flex;align-items:flex-start;gap:16px;padding:16px 0;border-top:1px solid var(--line)}
.ppoy-li:first-child{border-top:none}
/* 썸네일 */
.ppoy-li-thumb{flex:0 0 56px;width:56px;height:56px;border-radius:calc(var(--r-scale,1)*6px);overflow:hidden;background:color-mix(in srgb,var(--accent) 10%,var(--bg))}
.ppoy-li-thumb img,.ppoy-li-thumb .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
/* 번호+텍스트 */
.ppoy-li-body{flex:1;min-width:0}
.ppoy-li-num{font-family:var(--font-lat,var(--font-display));font-weight:800;font-size:36px;line-height:1;color:color-mix(in srgb,var(--accent) 45%,var(--bg));letter-spacing:-.02em;display:block;margin-bottom:2px}
.ppoy-li-label{font-weight:700;font-size:clamp(14px,3.8vw,16px);color:var(--accent);margin-bottom:4px}
.ppoy-li-text{font-size:clamp(12px,3vw,14px);color:var(--ink-2);line-height:1.65}
`,
  render: (d, { esc, richSafe }) => {
    const eyebrowHtml = d.eyebrow
      ? `<p class="ppoy-eyebrow">${esc(d.eyebrow)}</p>`
      : ''

    const sections = d.sections
      .map((sec, si) => {
        const secClass = `ppoy-sec${sec.bg === 'warm' ? ' ppoy-sec--warm' : ''}`
        const chLabel = sec.pointLabel ?? `point ${pad2(si + 1)}`

        /* 챕터 헤더 */
        const chapterHtml = `
      <div class="ppoy-ch">
        <span class="ppoy-ch-line"></span>
        <span class="ppoy-ch-label">${esc(chLabel)}</span>
        <span class="ppoy-ch-line right"></span>
      </div>`

        /* 타이틀 */
        const titleHtml = `
      <div class="ppoy-ttl-wrap">
        <h2 class="ppoy-title">${richSafe(sec.title)}</h2>
        ${sec.sub ? `<p class="ppoy-sub">${esc(sec.sub)}</p>` : ''}
      </div>`

        /* 이미지 존 */
        let imgHtml = ''
        if (sec.layout === 'duo') {
          const hasImg = sec.imageA || sec.imageB
          if (hasImg) {
            imgHtml = `
      <div class="ppoy-duo">
        <div class="ppoy-duo-a">${media(sec.imageA, '', '포인트 이미지 A')}</div>
        <div class="ppoy-duo-b">${media(sec.imageB, '', '포인트 이미지 B')}</div>
      </div>`
          }
        } else if (sec.layout === 'overlap') {
          const hasImg = sec.imageA || sec.imageB
          if (hasImg) {
            imgHtml = `
      <div class="ppoy-ovl">
        <div class="ppoy-ovl-bg">${media(sec.imageA, '', '배경 이미지')}</div>
        <div class="ppoy-ovl-fg">${media(sec.imageB, '', '전경 이미지')}</div>
      </div>`
          }
        } else if (sec.layout === 'single') {
          const hasImg = sec.imageA
          if (hasImg) {
            imgHtml = `
      <div class="ppoy-single">
        ${media(sec.imageA, 'ppoy-single-img', '섹션 이미지')}
      </div>`
          }
        }
        /* layout === 'none' → imgHtml = '' */

        /* 캡션 텍스트박스 */
        const capHtml =
          sec.capLatTitle || sec.capSub
            ? `
      <div class="ppoy-cap">
        ${sec.capLatTitle ? `<p class="ppoy-cap-lat">${richSafe(sec.capLatTitle)}</p>` : ''}
        ${sec.capLatTitle ? `<div class="ppoy-cap-div"></div>` : ''}
        ${sec.capSub ? `<p class="ppoy-cap-sub">${esc(sec.capSub)}</p>` : ''}
      </div>`
            : ''

        /* 번호 리스트 */
        const listHtml =
          sec.items && sec.items.length > 0
            ? `
      <ul class="ppoy-list">
        ${sec.items
          .map(
            (it, ii) => `
        <li class="ppoy-li">
          ${it.thumb ? `<div class="ppoy-li-thumb">${media(it.thumb, '', esc(it.label))}</div>` : ''}
          <div class="ppoy-li-body">
            <span class="ppoy-li-num">${pad2(ii + 1)}.</span>
            <p class="ppoy-li-label">${esc(it.label)}</p>
            <p class="ppoy-li-text">${esc(it.text)}</p>
          </div>
        </li>`,
          )
          .join('')}
      </ul>`
            : ''

        return `
    <div class="${secClass}">
      ${chapterHtml}
      ${titleHtml}
      ${imgHtml}
      ${capHtml}
      ${listHtml}
    </div>`
      })
      .join('')

    return `
<section class="ppoy">
  ${eyebrowHtml}
  ${sections}
</section>`
  },
})
