/** PROMO 아키타입: promo-scatter-banner.
 *  [끝판왕] 포인트 구성 #16 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 풀블리드 + 이벤트 레이블 + 도트 구분자 초대형 한글 헤드라인 +
 *  서브카피 + 해시태그 필 — 텍스트 그룹 중앙, 3D 제품 오브젝트 4개 상하좌우
 *  귀퉁이 콜라주 산포(일부 프레임 밖으로 크롭 흘러남). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 이벤트 레이블 (예: "Weekend Event") */
  eventLabel: z.string().min(1),
  /** 초대형 헤드라인 — 도트 구분자 포함 원문 전달 (em 허용).
   *  예: "주.말.특.가" — 작성자가 직접 . 삽입 */
  headline: z.string().min(1),
  /** 헤드라인 아래 서브카피 (br, em 허용) */
  subCopy: z.string().min(1),
  /** 해시태그 필 텍스트 (예: "#LIFE") */
  hashtag: z.string().optional(),
  /** 좌상단 오브젝트 이미지 URL (PNG 누끼 권장) */
  objTopLeft: z.string().optional(),
  /** 우상단 오브젝트 이미지 URL */
  objTopRight: z.string().optional(),
  /** 좌하단 오브젝트 이미지 URL */
  objBottomLeft: z.string().optional(),
  /** 우하단 오브젝트 이미지 URL */
  objBottomRight: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const promoScatterBanner = defineBlock<Data>({
  id: 'promo-scatter-banner',
  archetype: 'promo' as any,
  styleTags: ['dark', 'event', 'scatter', 'playful', 'fullbleed', 'template'],
  imageSlots: 4,
  describe:
    '프로모션 산포 배너. 다크 풀블리드 배경 + 상단 이벤트 레이블 + 도트 구분자 초대형 한글 헤드라인 + 서브카피 + 해시태그 필 중앙 배치. 3D 제품 오브젝트 4개(누끼)를 사방 귀퉁이에 산포·크롭 처리. 이벤트/시즌 세일 섹션.',
  schema,
  css: `
/* promo-scatter-banner — 접두사 psb- */
.psb{
  position:relative;
  background:var(--ink);
  overflow:hidden;
  /* 정사각형에 가까운 비율 (모바일 상세페이지 1:1.2~1.4) */
  min-height:520px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  padding:72px 48px;
  text-align:center;
  word-break:keep-all;
}
/* ── 이벤트 레이블 ── */
.psb-label{
  font-family:var(--font-body);
  font-size:13px;
  font-weight:600;
  letter-spacing:.18em;
  text-transform:uppercase;
  color:rgba(255,255,255,.55);
  margin-bottom:22px;
  position:relative;
  z-index:2;
}
/* ── 초대형 헤드라인 ── */
.psb-headline{
  position:relative;
  z-index:2;
  font-family:var(--font-display);
  font-weight:800;
  /* 도트 구분자가 헤드라인 안에 포함되므로 자간 약간 넓게 */
  font-size:clamp(72px,18vw,108px);
  line-height:1.05;
  letter-spacing:.04em;
  color:#fff;
  margin-bottom:18px;
}
/* 다크 배경 em — var(--accent)으로 밝게 override */
.psb-headline .em{
  color:var(--accent);
}
/* ── 서브카피 ── */
.psb-sub{
  position:relative;
  z-index:2;
  font-family:var(--font-body);
  font-size:15px;
  font-weight:500;
  line-height:1.75;
  color:rgba(255,255,255,.7);
  margin-bottom:28px;
}
.psb-sub .em{
  color:var(--accent);
  font-weight:700;
}
/* ── 해시태그 필 ── */
.psb-tag{
  position:relative;
  z-index:2;
  display:inline-block;
  padding:10px 28px;
  border-radius:999px;
  /* accent 반투명 필 — 다크 배경 위에서 은은하게 */
  background:rgba(255,255,255,.12);
  border:1.5px solid rgba(255,255,255,.22);
  font-family:var(--font-body);
  font-size:14px;
  font-weight:700;
  letter-spacing:.06em;
  color:#fff;
}
/* ── 귀퉁이 오브젝트 공통 ── */
/* 각 이미지는 position:absolute 로 모서리에 배치,
   section overflow:hidden 에 의해 바깥 부분이 크롭된다. */
.psb-obj{
  position:absolute;
  width:190px;
  /* 세로는 auto — 이미지 비율 유지 */
  object-fit:contain;
  pointer-events:none;
  /* PNG 누끼 없을 때 플레이스홀더 박스가 덜 방해되도록 */
  opacity:.97;
}
/* 각 모서리 위치: 이미지 일부가 프레임 밖으로 흘러나오도록 -20~-40px 오프셋 */
.psb-obj.tl{
  top:-24px;
  left:-28px;
  /* 좌상단은 약간 반시계 기울기로 역동성 */
  transform:rotate(-12deg);
}
.psb-obj.tr{
  top:-18px;
  right:-30px;
  transform:rotate(10deg);
}
.psb-obj.bl{
  bottom:-28px;
  left:-22px;
  transform:rotate(8deg);
}
.psb-obj.br{
  bottom:-24px;
  right:-26px;
  transform:rotate(-10deg);
}
/* 플레이스홀더(이미지 미제공 시) — 오브젝트 자리 점선 박스 */
.psb-obj.ph{
  width:150px;
  height:150px;
  border-radius:12px;
  font-size:12px;
  opacity:.35;
}
`,
  render: (d, { esc, richSafe }) => {
    const topLeft = media(d.objTopLeft, 'psb-obj tl', '오브젝트 좌상단')
    const topRight = media(d.objTopRight, 'psb-obj tr', '오브젝트 우상단')
    const bottomLeft = media(d.objBottomLeft, 'psb-obj bl', '오브젝트 좌하단')
    const bottomRight = media(d.objBottomRight, 'psb-obj br', '오브젝트 우하단')

    return `
<section class="psb">
  <!-- 귀퉁이 오브젝트 (z-index 1, 텍스트 뒤) -->
  ${topLeft}
  ${topRight}
  ${bottomLeft}
  ${bottomRight}
  <!-- 중앙 텍스트 그룹 -->
  <p class="psb-label">${esc(d.eventLabel)}</p>
  <h2 class="psb-headline">${richSafe(d.headline)}</h2>
  <p class="psb-sub">${richSafe(d.subCopy)}</p>
  ${d.hashtag ? `<span class="psb-tag">${esc(d.hashtag)}</span>` : ''}
</section>`
  },
})
