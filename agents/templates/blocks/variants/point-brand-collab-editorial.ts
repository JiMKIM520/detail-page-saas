/** POINT 아키타입: point-brand-collab-editorial.
 *  [끝판왕] 포인트 구성 #11 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 아웃라인/고스트 초대형 브랜드 로고타입 헤더 바
 *            + 지오태그 칩 오버레이된 풀블리드 이미지
 *            + 대형 디스플레이 헤드라인 + 고스트 아웃라인 서브 브랜드네임
 *            + 캡션 + 하단 바코드풍 틱 스트립. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 헤더 바 왼쪽: 브랜드 협업 표기 (예: "브랜드 X 헤연", em 허용) */
  brandCollab: z.string().min(1),
  /** 헤더 바 오른쪽: 서브 레이블 (예: "WHO IS HEYEON") */
  headerLabel: z.string().min(1),
  /** 지오태그 칩 텍스트 (예: "Osaka, Orange Street") */
  geoTag: z.string().min(1),
  /** 풀블리드 대표 이미지 URL */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
  /** 대형 헤드라인 (em, br 허용) */
  headline: z.string().min(1),
  /** 고스트 아웃라인 브랜드네임 (로고타입 효과) */
  ghostBrand: z.string().min(1),
  /** 이미지 하단 한 줄 캡션 (선택) */
  caption: z.string().optional(),
})
type Data = z.infer<typeof schema>

/** 바코드풍 틱 스트립 — 시드 기반으로 가변 높이/굵기 틱 32개 생성 */
function buildTickStrip(): string {
  // 시드 고정(렌더 결정론적) — 세 가지 높이 패턴 교번
  const heights = [14, 22, 18, 10, 26, 18, 12, 22, 16, 28, 10, 20, 14, 24, 18, 12,
                   22, 16, 10, 26, 14, 20, 18, 12, 24, 16, 10, 22, 18, 14, 26, 20]
  const widths  = [ 2,  3,  2,  1,  3,  2,  2,  3,  1,  2,  3,  2,  1,  3,  2,  2,
                    3,  2,  1,  3,  2,  2,  1,  3,  2,  2,  3,  1,  2,  3,  2,  2]
  return heights
    .map(
      (h, i) =>
        `<span class="pbce-tick" style="height:${h}px;width:${widths[i]}px"></span>`,
    )
    .join('')
}

export const pointBrandCollabEditorial = defineBlock<Data>({
  id: 'point-brand-collab-editorial',
  archetype: 'point',
  styleTags: ['editorial', 'collab', 'ghost', 'logotype', 'template'],
  imageSlots: 1,
  describe:
    '브랜드 협업 포인트 에디토리얼. 아웃라인/고스트 로고타입 헤더 바 + 지오태그 칩 오버레이 풀블리드 이미지 + 대형 디스플레이 헤드라인 + 고스트 아웃라인 서브 브랜드네임 + 캡션 + 하단 바코드풍 틱 스트립. 인물/로케이션 협업 콘텐츠에 최적.',
  schema,
  css: `
/* point-brand-collab-editorial — 접두사 pbce- */
.pbce{background:var(--paper);overflow:hidden;word-break:keep-all;overflow-wrap:break-word}

/* ── 헤더 바 ── */
.pbce-hbar{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 20px;
  border-bottom:1px solid var(--ink);
}
.pbce-brand-collab{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(13px,3.2vw,16px);
  letter-spacing:.06em;
  color:transparent;
  -webkit-text-stroke:1.2px var(--ink);
  text-transform:uppercase;
  line-height:1;
}
.pbce-brand-collab .em{
  -webkit-text-stroke:1.2px var(--accent-d);
  color:transparent;
}
.pbce-hlabel{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(11px,2.6vw,13px);
  letter-spacing:.1em;
  color:var(--ink);
  text-transform:uppercase;
  line-height:1;
}

/* ── 이미지 래퍼 + 지오태그 칩 ── */
.pbce-fig{position:relative;width:100%}
.pbce-img{
  width:100%;
  aspect-ratio:3/4;
  object-fit:cover;
  display:block;
}
.pbce-img.ph{
  width:100%;
  aspect-ratio:3/4;
  background:rgba(0,0,0,.06);
  border:2px dashed var(--line);
  color:var(--muted);
}
.pbce-geo{
  position:absolute;
  top:18px;
  left:18px;
  display:inline-flex;
  align-items:center;
  gap:5px;
  background:rgba(255,255,255,.88);
  backdrop-filter:blur(6px);
  -webkit-backdrop-filter:blur(6px);
  border-radius:999px;
  padding:6px 14px 6px 10px;
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:13px;
  font-weight:600;
  color:var(--ink);
  line-height:1;
  box-shadow:0 2px 8px rgba(0,0,0,.14);
  max-width:calc(100% - 36px);
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.pbce-geo-icon{
  flex-shrink:0;
  width:14px;height:14px;
  color:var(--accent-d);
}

/* ── 텍스트 블록 ── */
.pbce-body{padding:24px 20px 20px}
.pbce-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(30px,7.8vw,46px);
  line-height:1.18;
  letter-spacing:-.02em;
  color:var(--ink);
  margin-bottom:2px;
}
.pbce-headline .em{color:var(--accent-d)}
.pbce-ghost{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(34px,9vw,54px);
  line-height:1.08;
  letter-spacing:-.03em;
  color:transparent;
  -webkit-text-stroke:1.5px var(--muted);
  margin-bottom:14px;
  /* 고스트 아웃라인 효과 */
  opacity:.7;
}
.pbce-caption{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:14px;
  color:var(--muted);
  line-height:1.6;
  letter-spacing:.01em;
}
.pbce-caption .em{color:var(--accent-d);font-weight:700}

/* ── 바코드풍 틱 스트립 ── */
.pbce-strip{
  display:flex;
  align-items:flex-end;
  justify-content:center;
  gap:3px;
  padding:18px 20px 22px;
  border-top:1px solid var(--line);
}
.pbce-tick{
  display:inline-block;
  background:var(--ink);
  border-radius:1px;
  flex-shrink:0;
  opacity:.82;
}
`,
  render: (d, { esc, richSafe, icon }) => {
    const pinIcon = `<svg class="pbce-geo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>`

    return `
<section class="pbce">
  <div class="pbce-hbar">
    <span class="pbce-brand-collab">${richSafe(d.brandCollab)}</span>
    <span class="pbce-hlabel">${esc(d.headerLabel)}</span>
  </div>
  <div class="pbce-fig">
    ${media(d.image, 'pbce-img', esc(d.imageAlt ?? '브랜드 협업 이미지'))}
    <div class="pbce-geo">${pinIcon}${esc(d.geoTag)}</div>
  </div>
  <div class="pbce-body">
    <h2 class="pbce-headline">${richSafe(d.headline)}</h2>
    <p class="pbce-ghost">${esc(d.ghostBrand)}</p>
    ${d.caption ? `<p class="pbce-caption">${richSafe(d.caption)}</p>` : ''}
  </div>
  <div class="pbce-strip">
    ${buildTickStrip()}
  </div>
</section>`
  },
})
