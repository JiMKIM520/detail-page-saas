/** USAGE 아키타입: usage-fanout-grid.
 *  피그마 317_제품소개_36 흡수:
 *    - 대형 번호 배지(point 03) 좌 + 제목/부제 우 헤더
 *    - 3장 이미지가 프레임 경계를 넘어 좌우로 삐져나오는 오버플로우 팬아웃 배치 (중앙 최대, 양측 축소)
 *    - 서브 카피 + 설명 텍스트
 *    - 2×2 라운드 썸네일 그리드
 *    - 풀폭 바텀 이미지
 *  라이트 톤. 이미지 전무 시 팬아웃 패널·그리드·풀폭을 틴트 패널로 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 좌측 대형 번호 (예: "03"). em/br 허용. */
  pointNum: z.string().min(1),
  /** 번호 위 소형 라벨 (예: "point"). 순수 텍스트. */
  pointLabel: z.string().optional(),
  /** 헤더 메인 제목. em/br 허용. */
  title: z.string().min(1),
  /** 헤더 부제. 순수 텍스트. */
  subtitle: z.string().optional(),
  /** 팬아웃 중앙 이미지 (가장 크게 표시). url. */
  fanCenter: z.string().optional(),
  /** 팬아웃 좌측 이미지 (경계 밖으로 돌출). url. */
  fanLeft: z.string().optional(),
  /** 팬아웃 우측 이미지 (경계 밖으로 돌출). url. */
  fanRight: z.string().optional(),
  /** 설명 강조 소제목. em/br 허용. */
  descHeading: z.string().optional(),
  /** 설명 본문. em/br 허용. */
  desc: z.string().optional(),
  /** 2×2 썸네일 그리드 (2~4장). url + alt. 브리프 근거 시만. */
  thumbs: z
    .array(
      z.object({
        image: z.string().optional(),
        alt: z.string().min(1),
      }),
    )
    .min(2)
    .max(4)
    .optional(),
  /** 풀폭 바텀 이미지. url. */
  bottomImage: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const usageFanoutGrid = defineBlock<Data>({
  id: 'usage-fanout-grid',
  archetype: 'usage',
  styleTags: ['light', 'editorial', 'serif', 'fanout', 'noimg-safe'],
  imageSlots: 7,
  describe:
    '제품 활용도 소개 블록. 대형 세리프 번호(point 03) 좌+제목 우 헤더 → 3장 이미지가 좌우 경계 밖으로 팬처럼 펼쳐지는 오버플로우 팬아웃 → 설명 텍스트 → 2×2 라운드 썸네일 그리드 → 풀폭 바텀 이미지. 이미지 전무 시 팬아웃·그리드·풀폭을 틴트 패널로 강등.',
  schema,
  css: `
.uhto{background:var(--bg);color:var(--ink);overflow:hidden}

/* ── 헤더: 번호 좌 + 제목 우 ── */
.uhto-hd{display:flex;align-items:flex-start;gap:28px;padding:60px var(--pad-x,56px) 0}
.uhto-num{flex:0 0 auto;text-align:center;min-width:108px}
.uhto-point-label{font-family:var(--font-serif);font-weight:700;font-size:18px;color:var(--accent);letter-spacing:.14em;text-transform:uppercase;line-height:1}
.uhto-point-val{font-family:var(--font-serif);font-weight:700;font-size:100px;color:var(--accent);line-height:.95;letter-spacing:-.02em;margin-top:4px}
.uhto-titles{flex:1;padding-top:6px}
.uhto-title{font-family:var(--font-serif);font-weight:700;font-size:46px;color:var(--ink);line-height:1.15;letter-spacing:-.01em}
.uhto-title .em{color:var(--accent-d)}
.uhto-subtitle{margin-top:10px;font-family:var(--font-body);font-size:22px;font-weight:400;color:var(--ink-2);line-height:1.5;letter-spacing:-.005em}

/* ── 팬아웃: 3장 이미지 오버플로우 배치 ── */
.uhto-fan{position:relative;height:580px;margin-top:42px;overflow:visible}
/* 오버플로우를 바깥에서 clip — section에 overflow:hidden 있으므로 팬아웃 컨테이너만 overflow:visible */
.uhto-fan-inner{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:0}
/* 좌·우 이미지: 프레임 밖으로 삐져나옴(음수 오프셋), 중앙보다 짧음 */
.uhto-fan-side{position:absolute;width:280px;height:440px;border-radius:var(--shape-photo, calc(var(--r-scale,1)*20px));overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,transparent)}
.uhto-fan-side img,.uhto-fan-side .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
.uhto-fan-left{left:-40px;top:70px;transform:rotate(-4deg);z-index:1}
.uhto-fan-right{right:-40px;top:70px;transform:rotate(4deg);z-index:1}
/* 중앙 이미지: 가장 크고 앞으로 올라옴 */
.uhto-fan-center{position:absolute;left:50%;transform:translateX(-50%);width:340px;height:550px;border-radius:var(--shape-photo, calc(var(--r-scale,1)*20px));overflow:hidden;z-index:2;background:color-mix(in srgb,var(--accent) 12%,transparent);box-shadow:0 24px 56px -16px rgba(0,0,0,.22)}
.uhto-fan-center img,.uhto-fan-center .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}

/* ── 팬아웃 이미지 없을 때 강등: 가는 선 구분자 ── */
.uhto-fan-noimg{height:2px;background:var(--line);margin:36px var(--pad-x,56px) 0;opacity:.4;display:none}
.uhto--noimg .uhto-fan{display:none}
.uhto--noimg .uhto-fan-noimg{display:block}

/* ── 설명 영역 ── */
.uhto-desc{padding:48px var(--pad-x,56px) 0}
.uhto-desc-heading{font-family:var(--font-serif);font-size:36px;font-weight:700;color:var(--accent-d);line-height:1.25;letter-spacing:-.01em;margin-bottom:16px}
.uhto-desc-heading .em{color:var(--ink)}
.uhto-desc-body{font-family:var(--font-body);font-size:20px;font-weight:300;color:var(--ink);line-height:1.75;letter-spacing:-.005em}
.uhto-desc-body .em{color:var(--accent-d);font-weight:600}

/* ── 2×2 썸네일 그리드 ── */
.uhto-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:36px var(--pad-x,56px) 0}
.uhto-thumb{aspect-ratio:4/3;border-radius:calc(var(--r-scale,1)*12px);overflow:hidden;background:color-mix(in srgb,var(--accent) 6%,transparent)}
.uhto-thumb img,.uhto-thumb .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}

/* ── 풀폭 바텀 이미지 ── */
.uhto-bottom{margin-top:32px;width:100%;height:560px;overflow:hidden;background:color-mix(in srgb,var(--ink) 6%,transparent)}
.uhto-bottom img,.uhto-bottom .ph{width:100%;height:100%;object-fit:cover}

/* 풀폭·그리드 이미지 없을 때 강등: ph는 전역 display:none!important로 숨겨짐 */

/* 섹션 하단 여백 */
.uhto-end{height:60px}
`,
  render: (d, { esc, richSafe }) => {
    const hasFan =
      (typeof d.fanCenter === 'string' && d.fanCenter.length > 0) ||
      (typeof d.fanLeft === 'string' && d.fanLeft.length > 0) ||
      (typeof d.fanRight === 'string' && d.fanRight.length > 0)

    const noImgClass = !hasFan ? ' uhto--noimg' : ''

    const thumbsHtml =
      d.thumbs && d.thumbs.length >= 2
        ? `<div class="uhto-grid">
  ${d.thumbs
    .slice(0, 4)
    .map(
      (t) =>
        `<div class="uhto-thumb">${media(t.image, 'uhto-thumb-img', esc(t.alt))}</div>`,
    )
    .join('\n  ')}
</div>`
        : ''

    const bottomHtml = d.bottomImage !== undefined
      ? `<div class="uhto-bottom">${media(d.bottomImage, 'uhto-bottom-img', '제품 컷')}</div>`
      : ''

    return `
<section class="uhto${noImgClass}">
  <div class="uhto-hd">
    <div class="uhto-num">
      <div class="uhto-point-label">${esc(d.pointLabel ?? 'point')}</div>
      <div class="uhto-point-val">${richSafe(d.pointNum)}</div>
    </div>
    <div class="uhto-titles">
      <h2 class="uhto-title">${richSafe(d.title)}</h2>
      ${d.subtitle ? `<p class="uhto-subtitle">${esc(d.subtitle)}</p>` : ''}
    </div>
  </div>

  <!-- 팬아웃 (이미지 없을 시 강등) -->
  <div class="uhto-fan" aria-hidden="${!hasFan}">
    <div class="uhto-fan-inner">
      <div class="uhto-fan-side uhto-fan-left">${media(d.fanLeft, 'uhto-fan-left-img', '활용 컷 1')}</div>
      <div class="uhto-fan-center">${media(d.fanCenter, 'uhto-fan-center-img', '활용 컷 2')}</div>
      <div class="uhto-fan-side uhto-fan-right">${media(d.fanRight, 'uhto-fan-right-img', '활용 컷 3')}</div>
    </div>
  </div>
  <div class="uhto-fan-noimg" role="separator"></div>

  ${d.descHeading || d.desc
    ? `<div class="uhto-desc">
    ${d.descHeading ? `<p class="uhto-desc-heading">${richSafe(d.descHeading)}</p>` : ''}
    ${d.desc ? `<p class="uhto-desc-body">${richSafe(d.desc)}</p>` : ''}
  </div>`
    : ''}

  ${thumbsHtml}
  ${bottomHtml}
  <div class="uhto-end"></div>
</section>`
  },
})
