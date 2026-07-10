/** FEATURE 아키타입: feature-offset-gallery.
 *  피그마 245_제품소개_24 패턴 흡수 — "point N" 라틴 헤더 + 좌우 100px 엇갈림 비대칭 갤러리 + 중앙 텍스트 영역.
 *  좌 이미지 600h, 우 이미지 700h 컨테이너에서 100px 하단 오프셋 배치해 의도적 비대칭 리듬 구현.
 *  라이트 배경. 이미지 전무 시 갤러리 행을 생략하고 텍스트 단독 레이아웃으로 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  pointLabel: z.string().optional(),          // "point 01" 류 라틴 번호 헤더 (기본 "point 01")
  title: z.string().min(1),                   // 섹션 대제목 (em,br 허용)
  subtitle: z.string().optional(),            // 대제목 아래 한 줄 부제
  imageLeft: z.string().optional(),           // 좌측 이미지 (url) — 600h 프레임
  imageRight: z.string().optional(),          // 우측 이미지 (url) — 100px 아래 오프셋 700h 컨테이너
  captionTitle: z.string().optional(),        // 갤러리 아래 중앙 액센트 캡션 제목 (em,br 허용)
  captionDesc: z.string().optional(),         // 캡션 본문 설명
})
type Data = z.infer<typeof schema>

export const featureOffsetGallery = defineBlock<Data>({
  id: 'feature-offset-gallery',
  archetype: 'feature',
  styleTags: ['light', 'editorial', 'asymmetric', 'gallery', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '라틴 "point N" 번호 헤더 + 좌우 100px 엇갈림 비대칭 2열 갤러리 + 중앙 캡션 텍스트. 라이트 배경. 패션·라이프스타일·식품 신뢰 구간에 적합. 이미지 부재 시 갤러리 행 생략 강등.',
  schema,
  css: `
.fvix{background:var(--bg);color:var(--ink);padding:60px 0 70px}

/* ── 포인트 헤더 ── */
.fvix-pt{display:flex;align-items:center;gap:0;padding:0 var(--pad-x,56px);margin-bottom:36px}
.fvix-pt-line{flex:1;height:1px;background:var(--accent);opacity:.45}
.fvix-pt-line.pre{max-width:50px;margin-right:16px}
.fvix-pt-line.post{flex:1;margin-left:16px}
.fvix-pt-label{font-family:var(--font-lat,'Cormorant Garamond',serif);font-weight:600;font-size:44px;color:var(--accent);letter-spacing:.02em;line-height:1;white-space:nowrap}

/* ── 타이틀 블록 ── */
.fvix-hd{padding:0 var(--pad-x,56px);margin-bottom:40px}
.fvix-title{font-family:var(--font-body),'Pretendard',sans-serif;font-weight:500;font-size:48px;color:var(--ink);line-height:1.2;letter-spacing:-.02em}
.fvix-title .em{color:var(--accent)}
.fvix-sub{margin-top:14px;font-size:22px;font-weight:400;color:var(--ink-2);line-height:1.55}

/* ── 비대칭 갤러리 ── */
.fvix-gallery{display:flex;gap:10px;align-items:flex-start;padding:0 var(--pad-x,56px);min-height:0}

/* 좌 컬럼: 600h 사진 */
.fvix-col-l{flex:0 0 calc(50% - 5px);width:calc(50% - 5px)}
.fvix-img-l{
  width:100%;
  height:600px;
  object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));
  display:block;
}
.fvix-img-l.ph{height:600px;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px))}

/* 우 컬럼: 700h 컨테이너, 이미지는 내부 100px 하단 오프셋으로 엇갈림 */
.fvix-col-r{flex:0 0 calc(50% - 5px);width:calc(50% - 5px);height:700px;position:relative;overflow:visible}
.fvix-img-r{
  width:100%;
  height:600px;
  object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));
  display:block;
  position:absolute;
  bottom:0;
  left:0;
}
.fvix-img-r.ph{position:absolute;bottom:0;left:0;height:600px;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px))}

/* ── 중앙 캡션 영역 ── */
.fvix-caption{text-align:center;padding:44px var(--pad-x,56px) 0}
.fvix-cap-divider{width:64px;height:3px;background:var(--accent);margin:0 auto 22px;border-radius:999px}
.fvix-cap-title{font-family:var(--font-lat,'Cormorant Garamond',serif);font-weight:600;font-size:46px;color:var(--accent);line-height:1.1;letter-spacing:.01em}
.fvix-cap-title .em{color:var(--ink)}
.fvix-cap-desc{margin-top:18px;font-size:20px;font-weight:400;color:var(--ink-2);line-height:1.7;max-width:620px;margin-left:auto;margin-right:auto}
`,
  render: (d, { esc, richSafe }) => {
    // 이미지 강등 가드: 좌우 중 하나라도 없으면 갤러리 행 전체 생략 (noimg-safe)
    const hasLeft = typeof d.imageLeft === 'string' && d.imageLeft.length > 0
    const hasRight = typeof d.imageRight === 'string' && d.imageRight.length > 0
    const showGallery = hasLeft || hasRight

    const pointLabel = d.pointLabel ?? 'point 01'

    return `
<section class="fvix">
  <!-- 포인트 헤더 -->
  <div class="fvix-pt">
    <span class="fvix-pt-line pre"></span>
    <span class="fvix-pt-label">${esc(pointLabel)}</span>
    <span class="fvix-pt-line post"></span>
  </div>

  <!-- 타이틀 -->
  <div class="fvix-hd">
    <h2 class="fvix-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="fvix-sub">${esc(d.subtitle)}</p>` : ''}
  </div>

  ${showGallery ? `<!-- 비대칭 갤러리: 좌 600h · 우 100px 하단 오프셋 -->
  <div class="fvix-gallery">
    <div class="fvix-col-l">
      ${media(d.imageLeft, 'fvix-img-l', '제품 이미지 1')}
    </div>
    <div class="fvix-col-r">
      ${media(d.imageRight, 'fvix-img-r', '제품 이미지 2')}
    </div>
  </div>` : ''}

  ${d.captionTitle || d.captionDesc ? `<!-- 중앙 캡션 -->
  <div class="fvix-caption">
    ${d.captionTitle ? `<div class="fvix-cap-divider"></div>
    <p class="fvix-cap-title">${richSafe(d.captionTitle)}</p>` : ''}
    ${d.captionDesc ? `<p class="fvix-cap-desc">${esc(d.captionDesc)}</p>` : ''}
  </div>` : ''}
</section>`
  },
})
