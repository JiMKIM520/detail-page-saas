/** CHECKLIST 아키타입: checklist-radial-ledger
 *  피그마 163_FAQ_문의_구성_페이지_8 흡수.
 *  상단: 제품 이미지를 중심으로 원형 아이콘 5개(최대 6개)를 방사형 배치.
 *  중단: 헤드라인 + 서브카피.
 *  하단: 구분선 레저 리스트(아이콘 레이블 + 상세 텍스트) — 이중 구조.
 *  이미지 없을 때: 원형 아이콘 군이 중앙 빈 원(noimg-safe)으로 강등, 레이아웃 유지. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const itemSchema = z.object({
  icon: z.string().min(1),      // ICON_NAMES 35종 중 하나
  label: z.string().min(1),     // 짧은 레이블 (4~8자)
  text: z.string().min(1),      // (em,br) 상세 설명
})

const schema = z.object({
  eyebrow: z.string().optional(),            // 헤드라인 위 소제목 (예: "로봇청소기에만 있는")
  title: z.string().min(1),                  // (em,br) 강점 헤드라인 (예: "5가지 강점!")
  image: z.string().optional(),              // 제품 이미지 URL (없으면 빈 원으로 강등)
  items: z.array(itemSchema).min(3).max(6),  // 방사형 아이콘 + 레저 리스트 항목 (동일 순서)
})
type Data = z.infer<typeof schema>

export const checklistRadialLedger = defineBlock<Data>({
  id: 'checklist-radial-ledger',
  archetype: 'checklist',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '제품 이미지 주변 원형 아이콘 방사형 배치(상단) + 구분선 레저 목록(하단) 이중 구조. 연파랑 배경. 로봇청소기·가전·뷰티 등 강점 5~6개를 시각적으로 나열할 때 최적. 이미지 없으면 빈 원 강등으로 레이아웃 유지.',
  schema,
  css: `
/* ── 섹션 래퍼 ── */
.cixn{background:var(--cixn-bg,#e8ebf3);padding:56px var(--pad-x,56px) 64px;--cixn-bg:#e8ebf3}

/* ── 방사형 스테이지 ── */
/* overflow:visible + 외부 여백으로 노드·라벨이 스테이지 밖으로 나와도 잘리지 않도록 */
.cixn-stage-wrap{width:100%;max-width:540px;margin:0 auto;padding:56px 56px 72px}
.cixn-stage{position:relative;width:100%;aspect-ratio:1/.72;overflow:visible}
/* 제품 이미지 / 빈 원 중심 */
.cixn-hub{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:38%;aspect-ratio:1/0.72;border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));
  overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,#fff)}
.cixn-hub img,.cixn-hub .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block}
/* 이미지 없을 때 .ph가 전역 display:none이므로 빈 원 폴백 */
.cixn-hub--empty{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:38%;aspect-ratio:1/1;border-radius:50%;
  background:color-mix(in srgb,var(--accent) 10%,#fff);
  border:2px dashed var(--line)}
/* 원형 아이콘 노드 */
.cixn-node{position:absolute;display:flex;flex-direction:column;align-items:center;gap:6px;
  transform:translate(-50%,-50%)}
.cixn-circle{width:72px;height:72px;border-radius:50%;background:#fff;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 14px -4px rgba(0,0,0,.14)}
.cixn-circle svg{width:30px;height:30px;color:var(--accent)}
.cixn-node-lbl{font-size:13px;font-weight:600;color:var(--ink-2);white-space:nowrap;
  text-align:center;letter-spacing:-.01em}

/* ── 헤드라인 존 ── */
.cixn-hd{margin:36px 0 32px;text-align:left}
.cixn-eyebrow{font-size:18px;font-weight:500;color:var(--ink-2);margin-bottom:6px;letter-spacing:-.01em}
.cixn-title{font-family:var(--font-display);font-size:48px;font-weight:900;
  line-height:1.12;letter-spacing:-.03em;color:var(--ink)}
.cixn-title .em{color:var(--accent)}

/* ── 레저 리스트(구분선 목록) ── */
.cixn-ledger{border-top:1px solid var(--line)}
.cixn-row{display:flex;align-items:flex-start;gap:20px;
  padding:22px 0;border-bottom:1px solid var(--line)}
.cixn-row-icon{flex:0 0 36px;width:36px;height:36px;border-radius:50%;
  background:color-mix(in srgb,var(--accent) 12%,transparent);
  display:flex;align-items:center;justify-content:center;margin-top:2px}
.cixn-row-icon svg{width:18px;height:18px;color:var(--accent)}
.cixn-row-body{flex:1;min-width:0}
.cixn-row-lbl{font-size:18px;font-weight:700;color:var(--ink);margin-bottom:6px;letter-spacing:-.02em}
.cixn-row-text{font-size:15px;line-height:1.75;color:var(--ink-2)}
.cixn-row-text .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe, icon }) => {
    // 방사형 좌표 — 5~6개 노드를 타원 궤도에 균등 배치.
    // 시작 각도 -90° (12시), 시계 방향. 단위: 퍼센트 (stageWidth/Height 기준).
    // 스테이지 aspect-ratio = 1/0.72 → 타원 rx 42%, ry 44%.
    const n = d.items.length
    const startDeg = -90
    const rx = 38 // % of stage width  (수평 반경) — 허브(38%)와 겹침 방지용 여유 확보
    const ry = 38 // % of stage height (수직 반경) — 하단 노드가 허브 이미지와 수직 겹침 방지
    const cx = 50
    const cy = 50
    const nodes = d.items.map((item, i) => {
      const deg = startDeg + (360 / n) * i
      const rad = (deg * Math.PI) / 180
      const x = cx + rx * Math.cos(rad)
      const y = cy + ry * Math.sin(rad)
      return { item, x, y }
    })

    // 이미지 슬롯 — .ph는 전역 display:none이므로 url 없으면 빈 원 폴백 div만 표시
    const hasImg =
      typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())

    return `
<section class="cixn">

  <!-- 방사형 스테이지 -->
  <div class="cixn-stage-wrap">
  <div class="cixn-stage" role="img" aria-label="제품 핵심 기능 방사형 다이어그램">
    <!-- 제품 이미지 허브 -->
    ${
      hasImg
        ? `<div class="cixn-hub">${media(d.image, '', '제품 이미지')}</div>`
        : `<div class="cixn-hub--empty" aria-hidden="true"></div>`
    }
    <!-- 원형 아이콘 노드 -->
    ${nodes
      .map(
        ({ item, x, y }) => `
    <div class="cixn-node" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%" aria-hidden="true">
      <div class="cixn-circle">${icon(item.icon)}</div>
      <span class="cixn-node-lbl">${esc(item.label)}</span>
    </div>`,
      )
      .join('')}
  </div>
  </div>

  <!-- 헤드라인 존 -->
  <div class="cixn-hd">
    ${d.eyebrow ? `<p class="cixn-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="cixn-title">${richSafe(d.title)}</h2>
  </div>

  <!-- 레저 리스트 -->
  <div class="cixn-ledger">
    ${d.items
      .map(
        (item) => `
    <div class="cixn-row">
      <div class="cixn-row-icon" aria-hidden="true">${icon(item.icon)}</div>
      <div class="cixn-row-body">
        <p class="cixn-row-lbl">${esc(item.label)}</p>
        <p class="cixn-row-text">${richSafe(item.text)}</p>
      </div>
    </div>`,
      )
      .join('')}
  </div>

</section>`
  },
})
