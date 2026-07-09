/** DETAIL 아키타입(템플릿 충실 재현): detail-overlap-bookend.
 *  244_제품소개_23 패턴 재구성:
 *  point 번호 헤더(가로선 + 라벨 + 가로선) → 풀블리드 이미지 → 오버랩 2장 레이어(뒤 480+앞 360)
 *  → 중앙 텍스트 영역(대형 세리프 카피+가로선+설명) → 풀블리드 이미지
 *  → 베이지 배경 전환 + 사이드 정렬 사진 + 우측 캡션.
 *  라이트·패션/라이프스타일 상세페이지 포인트 섹션. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  pointLabel: z.string().optional(),          // 기본 "point 01" — 헤더 라벨
  topImage: z.string().optional(),            // 풀블리드 상단 이미지 (url)
  backImage: z.string().optional(),           // 오버랩 뒤 레이어 이미지 (url)
  frontImage: z.string().optional(),          // 오버랩 앞 레이어 이미지 (url)
  centerHeadline: z.string().min(1),          // 중앙 대형 세리프 헤드라인 (em,br)
  centerDesc: z.string().min(1),              // 중앙 설명 문구 (em,br)
  bottomImage: z.string().optional(),         // 풀블리드 하단 이미지 (url)
  sideImage: z.string().optional(),           // 베이지 영역 사이드 사진 (url)
  sideCaption: z.string().optional(),         // 사이드 사진 우측 정렬 캡션 (순수 텍스트)
})
type Data = z.infer<typeof schema>

export const detailOverlapBookend = defineBlock<Data>({
  id: 'detail-overlap-bookend',
  archetype: 'detail',
  // noimg-safe: 이미지 없으면 풀블리드 슬롯은 숨기고(ph display:none), 오버랩 영역은 빈 베이지 패널로 강등
  styleTags: ['light', 'editorial', 'fashion', 'lifestyle', 'noimg-safe'],
  imageSlots: 5,
  describe:
    '제품 포인트(오버랩 북엔드). point 번호 헤더(가로선 분절) + 풀블리드 상단 이미지 + 오버랩 2장(뒤 480+앞 360 px 오프셋) + 중앙 세리프 헤드라인·설명 + 풀블리드 하단 이미지 + 베이지 배경 전환·사이드 사진·우측 캡션. 패션/라이프스타일 라이트 포인트 섹션.',
  schema,
  css: `
.dob{background:var(--bg);color:var(--ink)}

/* ── 포인트 헤더 ─────────────────────────────── */
.dob-hd{display:flex;align-items:center;gap:0;padding:52px var(--pad-x,56px) 44px}
.dob-hd-line{flex:1;height:1px;background:var(--accent)}
.dob-hd-line.short{flex:0 0 40px}
.dob-hd-label{font-family:var(--font-lat,'Cormorant Garamond',serif);font-weight:700;font-size:40px;color:var(--accent);letter-spacing:.02em;padding:0 18px;white-space:nowrap;line-height:1}

/* ── 풀블리드 이미지 ──────────────────────────── */
.dob-bleed{width:100%;aspect-ratio:860/480;overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,var(--bg))}
.dob-bleed img,.dob-bleed .ph{width:100%;height:100%;object-fit:cover;display:block}

/* ── 오버랩 사진 영역 ─────────────────────────── */
.dob-overlap{position:relative;width:100%;height:520px;overflow:visible;margin:0 auto}
.dob-back{
  position:absolute;left:var(--pad-x,56px);top:0;
  width:480px;height:420px;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*10px));
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 12%,var(--bg));
  z-index:1
}
.dob-back img,.dob-back .ph{width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit}
.dob-front{
  position:absolute;right:var(--pad-x,56px);top:60px;
  width:360px;height:320px;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*10px));
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 8%,var(--bg));
  box-shadow:0 12px 36px -10px rgba(0,0,0,.18);
  z-index:2
}
.dob-front img,.dob-front .ph{width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit}

/* ── 중앙 텍스트 영역 ─────────────────────────── */
.dob-center{padding:48px var(--pad-x,56px) 52px;text-align:center}
.dob-headline{font-family:var(--font-lat,'Cormorant Garamond',serif);font-weight:600;font-size:56px;color:var(--accent);letter-spacing:.01em;line-height:1.12}
.dob-headline .em{color:var(--ink)}
.dob-rule{width:56px;height:3px;background:var(--accent);margin:20px auto}
.dob-desc{max-width:620px;margin:0 auto;font-family:var(--font-body);font-size:17px;font-weight:400;color:var(--ink-2);line-height:1.78}
.dob-desc .em{color:var(--accent);font-weight:700}

/* ── 베이지 전환 영역 ─────────────────────────── */
.dob-beige{background:#f0e9e3;padding:44px var(--pad-x,56px) 48px}
.dob-side{display:flex;flex-direction:column;align-items:flex-start;gap:16px;max-width:500px}
.dob-side-photo{
  width:100%;max-width:500px;
  aspect-ratio:500/400;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*8px));
  overflow:hidden;
  background:color-mix(in srgb,var(--muted) 40%,#f0e9e3)
}
.dob-side-photo img,.dob-side-photo .ph{width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit}
.dob-caption{width:100%;text-align:right;font-family:var(--font-body);font-size:13px;color:var(--muted);line-height:1.55;white-space:pre-line}
`,
  render: (d, { esc, richSafe }) => `
<section class="dob">

  <!-- 포인트 헤더 -->
  <div class="dob-hd">
    <span class="dob-hd-line short"></span>
    <span class="dob-hd-label">${esc(d.pointLabel ?? 'point 01')}</span>
    <span class="dob-hd-line"></span>
  </div>

  <!-- 풀블리드 상단 이미지 -->
  <div class="dob-bleed">${media(d.topImage, '', '상단 제품 이미지')}</div>

  <!-- 오버랩 2장 -->
  <div class="dob-overlap">
    <div class="dob-back">${media(d.backImage, '', '뒤 레이어 이미지')}</div>
    <div class="dob-front">${media(d.frontImage, '', '앞 레이어 이미지')}</div>
  </div>

  <!-- 중앙 텍스트 영역 -->
  <div class="dob-center">
    <p class="dob-headline">${richSafe(d.centerHeadline)}</p>
    <div class="dob-rule"></div>
    <p class="dob-desc">${richSafe(d.centerDesc)}</p>
  </div>

  <!-- 풀블리드 하단 이미지 -->
  <div class="dob-bleed">${media(d.bottomImage, '', '하단 제품 이미지')}</div>

  <!-- 베이지 전환 + 사이드 사진 -->
  <div class="dob-beige">
    <div class="dob-side">
      <div class="dob-side-photo">${media(d.sideImage, '', '사이드 컷')}</div>
      ${d.sideCaption ? `<p class="dob-caption">${esc(d.sideCaption)}</p>` : ''}
    </div>
  </div>

</section>`,
})
