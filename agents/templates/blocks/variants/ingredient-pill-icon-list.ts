/** INGREDIENT 아키타입: ingredient-pill-icon-list
 *  피그마 163_제품소개_07 구조 흡수.
 *  풀블리드 이미지 배경 (다크) + 대형 질문형 헤드라인 + 그라디언트 pill 섹션 헤더(1~2개) +
 *  본문 설명 + 원형 아이콘 컬러 라벨 + 설명 3단 리스트.
 *  이미지 부재 시 다크 그레이디언트 패널로 강등 (noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pillSchema = z.object({
  label: z.string().min(1),   // pill 태그 텍스트 (em 비허용 — pill 내부 순수 텍스트)
  body: z.string().optional(), // pill 아래 본문 설명 (em,br 허용)
})

const itemSchema = z.object({
  icon: z.string().min(1).optional(), // ICON_NAMES 중 하나 (기본 leaf)
  label: z.string().min(1),           // 강조 색상 라벨 (em 비허용)
  text: z.string().min(1),            // 설명 본문 (em,br 허용)
})

const schema = z.object({
  image:    z.string().optional(),                         // (url) 풀블리드 배경 이미지
  headline: z.string().min(1),                            // 대형 질문형 헤드라인 (em,br 허용)
  sub:      z.string().optional(),                        // 헤드라인 바로 아래 부제 (순수 텍스트)
  pills:    z.array(pillSchema).min(1).max(2),            // 그라디언트 pill 섹션 그룹 1~2개
  items:    z.array(itemSchema).min(2).max(5),            // 원형 아이콘 리스트 2~5행
})
type Data = z.infer<typeof schema>

export const ingredientPillIconList = defineBlock<Data>({
  id: 'ingredient-pill-icon-list',
  archetype: 'ingredient',
  styleTags: ['dark', 'food', 'eco', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '성분/원료 소개. 풀블리드 배경 이미지(다크) + 대형 질문형 헤드라인 + 그라디언트 캡슐(pill) 섹션 헤더 1~2개 + 원형 컬러 아이콘·강조 라벨·설명 2~5단 리스트. 친환경·식물성 원료 소개에 최적.',
  schema,
  css: `
/* ── 전체 섹션 ── */
.igru{position:relative;width:100%;overflow:hidden;background:var(--bg)}

/* ── 배경 이미지 / noimg-safe 강등 ── */
.igru-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.igru-bg.ph{display:none!important}
.igru-overlay{position:absolute;inset:0;z-index:1;
  background:linear-gradient(160deg,rgba(10,22,14,.72) 0%,rgba(5,16,10,.84) 100%)}
/* 이미지 없으면 오버레이 대신 짙은 다크 그린 그라디언트로 배경 대체 */
.igru.no-img .igru-overlay{background:linear-gradient(160deg,#0b1f10 0%,#061208 100%)}

/* ── 내부 콘텐츠 래퍼 ── */
.igru-inner{position:relative;z-index:2;padding:64px var(--pad-x,56px) 72px}

/* ── 헤드라인 영역 ── */
.igru-headline{font-family:var(--font-display);font-weight:700;font-size:56px;
  line-height:1.12;letter-spacing:-.02em;color:#fff;word-break:keep-all}
.igru-headline .em{color:var(--em-dark,#FFF7EA)}
.igru .em{color:var(--em-dark,#FFF7EA)}
.igru-sub{margin-top:16px;font-size:20px;font-weight:400;color:rgba(255,255,255,.72);line-height:1.55}

/* ── pill 섹션 그룹 ── */
.igru-pill-group{margin-top:44px}
.igru-pill-group+.igru-pill-group{margin-top:32px}

/* 그라디언트 캡슐 헤더 pill */
.igru-pill{display:inline-flex;align-items:center;
  padding:12px 30px;border-radius:999px;
  background:linear-gradient(90deg,var(--accent-d,#1a6b0a),var(--accent,#2d8714));
  font-size:22px;font-weight:600;color:#fff;letter-spacing:.01em;white-space:nowrap}

/* pill 아래 본문 */
.igru-pill-body{margin-top:18px;font-size:18px;font-weight:400;color:rgba(255,255,255,.82);
  line-height:1.72;max-width:680px}
.igru-pill-body .em{color:var(--em-dark,#FFF7EA)}

/* ── 아이콘 리스트 ── */
.igru-list{margin-top:44px;display:flex;flex-direction:column;gap:0}
.igru-item{display:flex;align-items:flex-start;gap:24px;
  padding:28px 0;border-bottom:1px solid rgba(255,255,255,.10)}
.igru-item:last-child{border-bottom:none}

/* 원형 아이콘 버블 (r=999 예외) */
.igru-icon{flex:0 0 72px;width:72px;height:72px;border-radius:999px;
  background:var(--accent,#2d8714);
  display:flex;align-items:center;justify-content:center;
  color:#fff}
.igru-icon svg{width:36px;height:36px;stroke:#fff;fill:none}

/* 텍스트 그룹 */
.igru-item-body{flex:1;padding-top:4px}
.igru-item-label{font-size:18px;font-weight:700;color:var(--accent,#2d8714);
  line-height:1.3;margin-bottom:8px}
.igru-item-text{font-size:16px;font-weight:400;color:rgba(255,255,255,.78);line-height:1.68}
.igru-item-text .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe, icon }) => {
    // 이미지 유무 판단 — noimg-safe 강등 클래스 토글
    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())
    const rootCls = hasImg ? 'igru' : 'igru no-img'

    // 아이콘 기본값: leaf (원료/성분 톤)
    const renderIcon = (name: string | undefined): string => icon(name ?? 'leaf')

    return `
<section class="${rootCls}">
  ${hasImg ? media(d.image, 'igru-bg', '성분 배경') : ''}
  <div class="igru-overlay"></div>
  <div class="igru-inner">

    <!-- 헤드라인 영역 -->
    <h2 class="igru-headline">${richSafe(d.headline)}</h2>
    ${d.sub ? `<p class="igru-sub">${esc(d.sub)}</p>` : ''}

    <!-- 그라디언트 pill 섹션 그룹 -->
    ${d.pills
      .map(
        (p) => `
    <div class="igru-pill-group">
      <span class="igru-pill">${esc(p.label)}</span>
      ${p.body ? `<p class="igru-pill-body">${richSafe(p.body)}</p>` : ''}
    </div>`,
      )
      .join('')}

    <!-- 원형 아이콘 리스트 -->
    <div class="igru-list">
      ${d.items
        .map(
          (it) => `
      <div class="igru-item">
        <div class="igru-icon">${renderIcon(it.icon)}</div>
        <div class="igru-item-body">
          <div class="igru-item-label">${esc(it.label)}</div>
          <div class="igru-item-text">${richSafe(it.text)}</div>
        </div>
      </div>`,
        )
        .join('')}
    </div>

  </div>
</section>`
  },
})
