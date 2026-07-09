/** INGREDIENT 아키타입: ingredient-ellipse-bar-stack
 *  원본: 103_포인트_02.json — 3파트 복합 성분 설명 구조 재구성.
 *  ① point1: 이미지 배경 + 말풍선 성분 뱃지 3개 플로팅
 *  ② point2: 아이콘 원 5개 격자 + 직사각 이미지
 *  ③ point3: 타원(Ellipse) 3개 수직 스택 + 성분별 바 그래프 카드 3개
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── 바 그래프 항목: 성분명 + 퍼센트(0~100 정수)
const barItemSchema = z.object({
  name: z.string().min(1),      // 예: '비타민 A'
  pct: z.number().int().min(1).max(999), // 1일 영양성분 기준치 %
})

// ── 성분 카드(타원 레이어 1개 = 바 그래프 카드 1개)
const layerSchema = z.object({
  label: z.string().min(1),     // 예: '비타민 13종'
  sublabel: z.string().min(1),  // 예: '활성형 비타민 B군 고함량'
  tagline: z.string().min(1),   // 타원 안 짧은 부제: 예: '활력 에너지'
  bars: z.array(barItemSchema).min(2).max(10),
})

// ── 무첨가/품질 아이콘 원 (point2 격자)
const qualityBadgeSchema = z.object({
  icon: z.enum([
    'check','shield','leaf','badge','star','heart','bolt','fire','drop','snow','sprout','gear','thumb'
  ]),
  text: z.string().min(1),  // 예: '합성향료 무첨가'
})

const schema = z.object({
  // === 섹션 공통 헤더 ===
  sectionTag: z.string().optional(),     // 예: 'point 3' — 포인트 라벨
  headline: z.string().min(1),           // (em,br) 메인 타이틀
  subheadline: z.string().optional(),    // (em,br) 헤드 아래 한 줄

  // === point1: 히어로 이미지 + 플로팅 뱃지 ===
  heroImage: z.string().optional(),      // 배경 풀블리드 이미지
  badges: z.array(z.string().min(1)).min(2).max(4), // 플로팅 말풍선 라벨, 예: ['비타민 13종','미네랄 10종','루테인&지아잔틴']

  // === point2: 품질 아이콘 격자 + 보조 이미지 ===
  qualityTitle: z.string().optional(),   // 예: '안심하고 드세요'
  qualitySub: z.string().optional(),     // 예: '엄격한 품질 관리로 까다롭게 생산합니다.'
  qualities: z.array(qualityBadgeSchema).min(3).max(6),
  qualityImage: z.string().optional(),   // 품질 섹션 보조 사진

  // === point3: 타원 스택 + 바 그래프 카드 3개 ===
  stackTitle: z.string().optional(),     // 타원 스택 위 타이틀: 예: '한 알로 채우는 건강'
  stackSub: z.string().optional(),       // 타원 스택 위 부제
  layers: z.array(layerSchema).min(2).max(3), // 2~3개 성분 레이어
})

type Data = z.infer<typeof schema>

export const ingredientEllipseBarStack = defineBlock<Data>({
  id: 'ingredient-ellipse-bar-stack',
  archetype: 'ingredient',
  styleTags: ['light', 'food', 'health', 'editorial', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '3파트 복합 성분 구조. ①히어로 이미지 배경+말풍선 성분 뱃지 플로팅 ②무첨가/품질 아이콘 원 격자+보조이미지 ③타원 3층 수직 스택(성분 레이어 시각화)+성분별 바 그래프 카드(비타민·미네랄·루테인 등). 건강기능식품·종합 영양제 성분 설명에 적합.',
  schema,
  css: `
/* ── 전체 섹션 ── */
.izfo{background:var(--bg);color:var(--ink)}

/* ── PART 1: 히어로 배경 + 플로팅 뱃지 ── */
.izfo-p1{position:relative;width:100%;aspect-ratio:860/500;min-height:320px;overflow:hidden;background:color-mix(in srgb,var(--accent) 12%,var(--bg))}
.izfo-p1-img,.izfo-p1-img .ph{width:100%;height:100%;object-fit:cover;display:block}
.izfo-p1-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.78) 0%,rgba(0,0,0,.66) 45%,rgba(0,0,0,.48) 70%,rgba(0,0,0,.6) 100%)}
.izfo-p1-tag{position:absolute;top:32px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:700;font-size:15px;letter-spacing:.06em;padding:6px 22px;border-radius:999px}
.izfo-p1-title{position:absolute;top:72px;left:0;right:0;text-align:center;color:#fff;font-family:var(--font-display);font-weight:800;font-size:38px;line-height:1.2;padding:0 32px;text-shadow:0 2px 12px rgba(0,0,0,.70),0 1px 4px rgba(0,0,0,.50)}
.izfo-p1-title .em{color:var(--accent)}
.izfo-p1-sub{position:absolute;top:128px;left:0;right:0;text-align:center;color:rgba(255,255,255,.88);font-size:17px;font-weight:500;line-height:1.55;padding:0 40px;text-shadow:0 1px 8px rgba(0,0,0,.65)}
/* 플로팅 말풍선 뱃지 */
.izfo-badges{position:absolute;bottom:0;left:0;right:0;display:flex;justify-content:center;align-items:flex-end;gap:16px;padding:0 var(--pad-x,56px) 28px}
.izfo-badge{position:relative;background:#fff;border-radius:999px;padding:10px 22px;font-family:var(--font-display);font-weight:700;font-size:18px;color:var(--accent);white-space:nowrap;box-shadow:0 6px 20px rgba(0,0,0,.18)}
.izfo-badge::after{content:'';position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);border:8px solid transparent;border-top-color:#fff;border-bottom:none}
/* noimg-safe: 이미지 없으면 단색 패널 + 뱃지만 */
.izfo-p1-noimgbg{width:100%;height:100%;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 18%,var(--bg)) 0%,var(--bg) 100%)}

/* ── PART 2: 품질 아이콘 격자 ── */
.izfo-p2{background:var(--bg);padding:60px var(--pad-x,56px)}
.izfo-p2-hd{text-align:center;margin-bottom:36px}
.izfo-p2-title{font-family:var(--font-display);font-weight:800;font-size:40px;line-height:1.15;color:var(--ink)}
.izfo-p2-sub{margin-top:10px;font-size:17px;color:var(--ink);opacity:.7;font-weight:500}
/* 아이콘 격자 */
.izfo-q-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:20px;margin-bottom:36px}
.izfo-q-item{display:flex;flex-direction:column;align-items:center;gap:10px;width:130px}
.izfo-q-circle{width:90px;height:90px;border-radius:50%;background:color-mix(in srgb,var(--accent) 10%,var(--bg));border:2.5px solid var(--accent);display:flex;align-items:center;justify-content:center;color:var(--accent)}
.izfo-q-circle svg{width:40px;height:40px}
.izfo-q-text{font-size:15px;font-weight:700;color:var(--ink);text-align:center;line-height:1.35}
/* 보조 이미지 */
.izfo-p2-photo{width:100%;border-radius:var(--shape-photo, calc(var(--r-scale,1)*20px));overflow:hidden;min-height:200px;max-height:320px}
.izfo-p2-photo img,.izfo-p2-photo .ph{width:100%;height:100%;min-height:200px;max-height:320px;object-fit:cover;display:block}

/* ── PART 3: 타원 스택 + 바 그래프 카드 ── */
.izfo-p3{padding:60px var(--pad-x,56px) 64px;background:var(--bg)}
.izfo-p3-hd{text-align:center;margin-bottom:44px}
.izfo-p3-ptag{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:700;font-size:15px;letter-spacing:.06em;padding:6px 22px;border-radius:999px;margin-bottom:16px}
.izfo-p3-title{font-family:var(--font-display);font-weight:800;font-size:44px;line-height:1.15;color:var(--ink)}
.izfo-p3-title .em{color:var(--accent)}
.izfo-p3-sub{margin-top:12px;font-size:18px;font-weight:500;color:var(--ink);opacity:.7;line-height:1.5}
/* 타원 스택 */
.izfo-stack{position:relative;width:100%;max-width:760px;margin:0 auto 48px;display:flex;flex-direction:column;gap:-60px}
.izfo-ellipse{position:relative;width:100%;height:200px;margin-bottom:-80px;border-radius:50%;background:color-mix(in srgb,var(--accent) 14%,transparent);overflow:visible;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px}
.izfo-ellipse:last-child{margin-bottom:0}
.izfo-ellipse-label{font-family:var(--font-display);font-weight:700;font-size:22px;color:var(--ink);text-align:center;position:relative;z-index:2}
.izfo-ellipse-sub{font-size:15px;font-weight:500;color:var(--ink);opacity:.65;text-align:center;position:relative;z-index:2}
/* 층 강도 변화 (1번=가장 연, 3번=진함) */
.izfo-ellipse:nth-child(1){background:color-mix(in srgb,var(--accent) 10%,transparent);height:210px}
.izfo-ellipse:nth-child(2){background:color-mix(in srgb,var(--accent) 18%,transparent);height:200px}
.izfo-ellipse:nth-child(3){background:color-mix(in srgb,var(--accent) 28%,transparent);height:190px}
/* 분리선 + 기호 */
.izfo-plus{text-align:center;font-size:20px;font-weight:700;color:var(--accent);position:relative;z-index:3;margin:-16px 0;line-height:1}
/* 바 그래프 카드 묶음 */
.izfo-cards{display:flex;flex-direction:column;gap:20px}
.izfo-card{background:color-mix(in srgb,var(--accent) 6%,var(--paper,#fff));border-radius:calc(var(--r-scale,1)*16px);overflow:hidden}
.izfo-card-head{display:flex;align-items:center;gap:12px;padding:20px 24px 12px;border-bottom:1.5px solid color-mix(in srgb,var(--accent) 15%,transparent)}
.izfo-card-icon{width:52px;height:52px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0}
.izfo-card-icon svg{width:26px;height:26px}
.izfo-card-info{}
.izfo-card-label{font-family:var(--font-display);font-weight:800;font-size:22px;color:var(--ink);line-height:1.15}
.izfo-card-sublabel{font-size:14px;font-weight:500;color:var(--ink);opacity:.6;margin-top:2px}
/* 바 그래프 본체 */
.izfo-bar-list{padding:14px 24px 18px}
.izfo-bar-row{display:flex;align-items:center;gap:0;margin-bottom:10px}
.izfo-bar-row:last-child{margin-bottom:0}
.izfo-bar-name{width:110px;flex-shrink:0;font-size:15px;font-weight:500;color:var(--ink)}
.izfo-bar-track{flex:1;height:14px;background:color-mix(in srgb,var(--accent) 12%,transparent);border-radius:999px;overflow:hidden;margin:0 10px}
.izfo-bar-fill{height:100%;background:var(--accent);border-radius:999px;min-width:4px}
.izfo-bar-pct{width:60px;flex-shrink:0;text-align:right;font-size:14px;font-weight:700;color:var(--accent)}
.izfo-bar-note{text-align:right;font-size:12px;color:var(--ink);opacity:.5;padding:4px 24px 0;margin-top:-4px}
`,
  render: (d, { esc, richSafe, icon }) => {
    /* ── part 1: 히어로 배경 + 뱃지 ── */
    const hasHeroImg = typeof d.heroImage === 'string' && d.heroImage.length > 0
    const heroImgHtml = hasHeroImg
      ? `${media(d.heroImage, 'izfo-p1-img', '성분 히어로 이미지')}`
      : `<div class="izfo-p1-noimgbg" aria-hidden="true"></div>`

    const badgesHtml = d.badges
      .map((b) => `<span class="izfo-badge">${esc(b)}</span>`)
      .join('')

    const p1 = `
<div class="izfo-p1">
  ${heroImgHtml}
  <div class="izfo-p1-overlay" aria-hidden="true"></div>
  ${d.sectionTag ? `<div class="izfo-p1-tag">${esc(d.sectionTag)}</div>` : ''}
  <div class="izfo-p1-title">${richSafe(d.headline)}</div>
  ${d.subheadline ? `<div class="izfo-p1-sub">${richSafe(d.subheadline)}</div>` : ''}
  <div class="izfo-badges">${badgesHtml}</div>
</div>`

    /* ── part 2: 품질 아이콘 격자 ── */
    const hasQualityImg = typeof d.qualityImage === 'string' && d.qualityImage.length > 0
    const qGridHtml = d.qualities
      .map(
        (q) => `
    <div class="izfo-q-item">
      <div class="izfo-q-circle">${icon(q.icon)}</div>
      <div class="izfo-q-text">${esc(q.text)}</div>
    </div>`,
      )
      .join('')

    const p2 = `
<div class="izfo-p2">
  ${d.qualityTitle || d.qualitySub
    ? `<div class="izfo-p2-hd">
      ${d.qualityTitle ? `<h3 class="izfo-p2-title">${richSafe(d.qualityTitle)}</h3>` : ''}
      ${d.qualitySub ? `<p class="izfo-p2-sub">${esc(d.qualitySub)}</p>` : ''}
    </div>`
    : ''}
  <div class="izfo-q-grid">${qGridHtml}</div>
  ${hasQualityImg
    ? `<div class="izfo-p2-photo">${media(d.qualityImage, '', '품질 이미지')}</div>`
    : ''}
</div>`

    /* ── part 3: 타원 스택 + 바 그래프 카드 ── */
    // 타원 스택 — 층별 레이어(마지막 레이어가 맨 앞, 첫 번째가 맨 위)
    const ellipsesHtml = d.layers
      .map(
        (lyr, i) =>
          (i > 0 ? `<div class="izfo-plus" aria-hidden="true">+</div>` : '') +
          `<div class="izfo-ellipse">
        <div class="izfo-ellipse-label">${esc(lyr.label)} <span style="opacity:.6;font-weight:500;font-size:.7em">(${esc(lyr.tagline)})</span></div>
        <div class="izfo-ellipse-sub">${esc(lyr.sublabel)}</div>
      </div>`,
      )
      .join('')

    // 성분별 최대 퍼센트 → 바 너비 기준 (최대 100% 기준 비례)
    const cardIconNames: string[] = ['leaf', 'drop', 'shield']
    const cardsHtml = d.layers
      .map((lyr, ci) => {
        const maxPct = Math.max(...lyr.bars.map((b) => b.pct))
        const barsHtml = lyr.bars
          .map((b) => {
            // 최대 pct 기준 비율로 바 너비 (최소 4%, 최대 95%)
            const fillPct = Math.min(95, Math.max(4, Math.round((b.pct / Math.max(maxPct, 100)) * 100)))
            return `
          <div class="izfo-bar-row">
            <div class="izfo-bar-name">${esc(b.name)}</div>
            <div class="izfo-bar-track"><div class="izfo-bar-fill" style="width:${fillPct}%"></div></div>
            <div class="izfo-bar-pct">${esc(String(b.pct))}%</div>
          </div>`
          })
          .join('')

        return `
      <div class="izfo-card">
        <div class="izfo-card-head">
          <div class="izfo-card-icon">${icon(cardIconNames[ci] ?? 'check')}</div>
          <div class="izfo-card-info">
            <div class="izfo-card-label">${esc(lyr.label)}</div>
            <div class="izfo-card-sublabel">${esc(lyr.sublabel)}</div>
          </div>
        </div>
        <div class="izfo-bar-list">${barsHtml}</div>
        <div class="izfo-bar-note">% 1일 영양성분 기준치</div>
      </div>`
      })
      .join('')

    const p3 = `
<div class="izfo-p3">
  <div class="izfo-p3-hd">
    <div class="izfo-p3-ptag">${esc(d.sectionTag ?? 'INGREDIENT')}</div>
    ${d.stackTitle ? `<h2 class="izfo-p3-title">${richSafe(d.stackTitle)}</h2>` : ''}
    ${d.stackSub ? `<p class="izfo-p3-sub">${esc(d.stackSub)}</p>` : ''}
  </div>
  <div class="izfo-stack" aria-label="성분 레이어 구조">${ellipsesHtml}</div>
  <div class="izfo-cards">${cardsHtml}</div>
</div>`

    return `<section class="izfo">${p1}${p2}${p3}</section>`
  },
})
