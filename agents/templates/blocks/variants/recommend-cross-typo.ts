/** RECOMMEND 아키타입: recommend-cross-typo
 *  피그마 027_포인트_구성_페이지_11 흡수.
 *  잡지식 크로스오버 타이포(브랜드명 × 인물명 96pt 교차) + 좌우 수직 기둥선 + 위치 배너 오버레이 이미지카드
 *  + 하단 수직 막대 리듬 스트립. 라이트 배경. noimg-safe 강등 지원. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 레이블 행 왼쪽: "브랜드명 X 인물명" 형식 (em 허용) */
  headerLeft: z.string().min(1),
  /** 상단 레이블 행 오른쪽: "WHO IS …" 형식 */
  headerRight: z.string().min(1),
  /** 이미지 위 위치/상황 배너 텍스트 (pin 아이콘 자동) */
  locationLabel: z.string().min(1),
  /** 이미지 URL */
  image: z.string().optional(),
  /** 크로스오버 타이포 첫 번째 블록: 브랜드명 (1~2줄, em 허용) */
  brandName: z.string().min(1),
  /** 크로스오버 타이포 두 번째 블록: 인물/앰배서더 이름 (라틴 대문자 권장) */
  personName: z.string().min(1),
  /** 이미지 아래 캡션 한 줄 (순수 텍스트) */
  caption: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const recommendCrossTypo = defineBlock<Data>({
  id: 'recommend-cross-typo',
  archetype: 'recommend',
  styleTags: ['light', 'editorial', 'magazine', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '잡지식 크로스오버 타이포 추천 블록. 좌우 수직 기둥선이 콘텐츠 영역을 프레이밍하고, ' +
    '브랜드명(2줄)과 인물명(1줄)을 96pt 대형 타이포로 교차 배치. 중앙 이미지카드에 위치 배너 오버레이. ' +
    '하단 수직 막대 리듬 스트립 마감. 앰배서더·콜라보·여행지 추천에 적합.',
  schema,
  css: `
/* ── recommend-cross-typo ─────────────────────────── */
.rmsx{
  position:relative;
  background:var(--bg);
  color:var(--ink);
  padding:0 var(--pad-x,56px) 0;
  overflow:hidden;
}

/* 좌우 수직 기둥선 */
.rmsx-pillar-l,
.rmsx-pillar-r{
  position:absolute;
  top:0;bottom:0;
  width:1px;
  background:var(--ink);
  opacity:.18;
}
.rmsx-pillar-l{left:var(--pad-x,56px)}
.rmsx-pillar-r{right:var(--pad-x,56px)}

/* ── 상단 헤더 행 ── */
.rmsx-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:22px 0 18px;
  border-top:2px solid var(--ink);
  border-bottom:1px solid var(--ink);
  margin-bottom:28px;
}
.rmsx-header-label{
  font-family:var(--font-body);
  font-size:15px;
  font-weight:400;
  letter-spacing:.06em;
  color:var(--ink-2);
  text-transform:uppercase;
}
.rmsx-header-label .em{color:var(--accent)}

/* ── 이미지카드 ── */
.rmsx-card{
  position:relative;
  width:100%;
  aspect-ratio:718/440;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*10px));
  overflow:hidden;
  background:color-mix(in srgb, var(--accent) 8%, var(--paper));
}
.rmsx-card img,
.rmsx-card .ph{
  width:100%;height:100%;
  object-fit:cover;
  border-radius:inherit;
  display:block;
}

/* 이미지 부재 시 강등: 카드 높이 유지 + 그라데이션 스크림 숨김 처리 */
.rmsx-card.noimg{
  min-height:220px;
  background:color-mix(in srgb, var(--accent) 12%, var(--paper));
}
.rmsx-card.noimg .rmsx-loc{
  background:var(--paper);
  border-bottom:1px solid var(--line);
}

/* 위치 배너 — 이미지 위 상단 오버레이 */
.rmsx-loc{
  position:absolute;
  top:0;left:0;right:0;
  display:flex;
  align-items:center;
  gap:8px;
  padding:10px 16px 10px 14px;
  background:rgba(255,255,255,.92);
  backdrop-filter:blur(4px);
  -webkit-backdrop-filter:blur(4px);
}
.rmsx-loc-icon{
  flex:0 0 18px;
  width:18px;height:18px;
  color:var(--accent);
}
.rmsx-loc-text{
  font-family:var(--font-body);
  font-weight:700;
  font-size:17px;
  color:var(--ink);
  letter-spacing:-.01em;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

/* ── 크로스오버 타이포 영역 ── */
.rmsx-xtypo{
  margin-top:20px;
  line-height:1.0;
  font-family:var(--font-display);
  font-weight:800;
  letter-spacing:-.03em;
  overflow:hidden;
}
.rmsx-brand{
  font-size:clamp(48px,8.8vw,96px);
  color:var(--ink);
  word-break:keep-all;
}
.rmsx-brand .em{color:var(--accent)}
.rmsx-person{
  font-size:clamp(48px,8.8vw,96px);
  font-family:var(--font-lat,'Cormorant Garamond',serif);
  font-weight:800;
  color:var(--ink);
  /* 브랜드명과 겹쳐 보이도록 음수 마진으로 교차 */
  margin-top:-0.08em;
  letter-spacing:-.01em;
}

/* ── 캡션 ── */
.rmsx-caption{
  margin-top:14px;
  font-size:17px;
  font-weight:400;
  color:var(--ink-2);
  letter-spacing:.01em;
}

/* ── 하단 수직 막대 리듬 스트립 ── */
.rmsx-strip{
  display:flex;
  align-items:center;
  gap:0;
  margin-top:28px;
  padding-bottom:32px;
  /* 막대들 사이 균등 분포 */
  justify-content:space-between;
}
.rmsx-strip-bar{
  width:3px;
  height:20px;
  border-radius:999px;
  background:var(--ink);
  opacity:.22;
}
`,
  render: (d, { esc, richSafe, icon }) => {
    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())

    // 하단 수직 막대 13개 (원본 비례)
    const bars = Array.from({ length: 13 }, () => `<span class="rmsx-strip-bar"></span>`).join('')

    // 위치 배너 pin 아이콘
    const pinSvg = `<svg class="rmsx-loc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>`

    return `
<section class="rmsx">
  <span class="rmsx-pillar-l" aria-hidden="true"></span>
  <span class="rmsx-pillar-r" aria-hidden="true"></span>

  <!-- 상단 레이블 헤더 행 -->
  <div class="rmsx-header">
    <span class="rmsx-header-label">${richSafe(d.headerLeft)}</span>
    <span class="rmsx-header-label">${esc(d.headerRight)}</span>
  </div>

  <!-- 이미지카드 + 위치 배너 오버레이 -->
  <div class="rmsx-card${hasImg ? '' : ' noimg'}">
    ${media(d.image, '', '추천 이미지')}
    <div class="rmsx-loc">
      ${pinSvg}
      <span class="rmsx-loc-text">${esc(d.locationLabel)}</span>
    </div>
  </div>

  <!-- 크로스오버 타이포 -->
  <div class="rmsx-xtypo" aria-label="${esc(d.brandName)} ${esc(d.personName)}">
    <div class="rmsx-brand">${richSafe(d.brandName)}</div>
    <div class="rmsx-person">${esc(d.personName)}</div>
  </div>

  ${d.caption ? `<p class="rmsx-caption">${esc(d.caption)}</p>` : ''}

  <!-- 하단 수직 막대 리듬 스트립 -->
  <div class="rmsx-strip" aria-hidden="true">${bars}</div>
</section>`
  },
})
