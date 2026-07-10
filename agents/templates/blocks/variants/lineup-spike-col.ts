/** LINEUP 아키타입: lineup-spike-col.
 *  피그마 017_상품_구성_페이지_13 흡수 — 4열 상품 구성 테이블,
 *  지정 강조 열(기본 3번)에 우돌출 삼각 스파이크 상단 캡 하이라이트 칼럼 장치.
 *  라이트 배경. 이미지 슬롯 없이도 안전 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const itemSchema = z.object({
  name: z.string().min(1),                  // 제품명
  tags: z.array(z.string().min(1)).min(1).max(5), // 해시태그 목록
  image: z.string().optional(),             // 옵션 이미지 (url)
})

const schema = z.object({
  title: z.string().min(1),                 // 섹션 상단 제품명/시리즈명 (em,br)
  subtitle: z.string().optional(),          // 부제 한 줄
  highlightIndex: z.number().int().min(0).max(3).optional(), // 강조 열 인덱스(0-based, 기본 2 = 3번째)
  items: z.array(itemSchema).min(2).max(4), // 옵션 목록 (2~4개)
})
type Data = z.infer<typeof schema>

export const lineupSpikeCol = defineBlock<Data>({
  id: 'lineup-spike-col',
  archetype: 'lineup',
  styleTags: ['light', 'editorial', 'grid', 'noimg-safe'],
  imageSlots: 4,
  describe:
    '4열(또는 2~4열) 상품 구성 테이블. 지정 열(기본 3번째) 상단에 accent 색 직사각+우돌출 삼각 스파이크 캡으로 추천 옵션을 강조. 각 열: 옵션 번호 · 이미지 슬롯 · 제품명 · 해시태그. 라이트 배경. 이미지 없으면 이미지 영역 숨김(noimg-safe).',
  schema,
  css: `
/* ── lkfw: lineup-spike-col ── */
.lkfw{background:var(--bg);padding:60px 0 64px;color:var(--ink)}
.lkfw-hd{padding:0 var(--pad-x,56px) 32px;text-align:left}
.lkfw-title{font-family:var(--font-display);font-weight:800;font-size:clamp(36px,5vw,56px);line-height:1.1;color:var(--accent)}
.lkfw-title .em{color:var(--ink)}
.lkfw-sub{margin-top:10px;font-size:16px;color:var(--ink-2);font-weight:500}
/* 구분선 */
.lkfw-rule{height:1px;background:var(--line);margin:0 var(--pad-x,56px)}
/* 테이블 래퍼 */
.lkfw-grid{display:flex;align-items:stretch;margin:0 var(--pad-x,56px);border-bottom:1px solid var(--line)}
/* 단일 열 */
.lkfw-col{flex:1;display:flex;flex-direction:column;align-items:center;position:relative;padding-bottom:28px;border-right:1px solid var(--line)}
.lkfw-col:last-child{border-right:none}
/* 스파이크 캡 (강조 열) — boolean union(직사각+삼각) */
.lkfw-col-hi{flex:0 0 auto;position:relative;z-index:1}
.lkfw-spike-cap{display:block;width:100%;background:var(--accent);position:relative}
/* 삼각 돌출: 우측 하단 꼭짓점이 열 오른쪽 밖으로 돌출 */
.lkfw-spike-cap::after{
  content:'';
  position:absolute;
  right:-22px;
  bottom:0;
  width:0;height:0;
  border-top:22px solid transparent;
  border-bottom:0 solid transparent;
  border-left:22px solid var(--accent);
}
/* 강조 열 전체 테두리 */
.lkfw-col-hi .lkfw-col{background:var(--paper);border-left:2px solid var(--accent);border-right:2px solid var(--accent);border-bottom:2px solid var(--accent);border-radius:0 0 calc(var(--r-scale,1)*8px) calc(var(--r-scale,1)*8px)}
/* 옵션 번호 */
.lkfw-num{font-family:var(--font-display);font-weight:400;font-size:clamp(48px,7vw,72px);line-height:1;margin-top:18px;color:var(--accent)}
.lkfw-col-hi .lkfw-num{color:#fff}
/* 옵션 라벨 */
.lkfw-label{font-size:13px;font-weight:600;letter-spacing:.06em;color:var(--accent);margin-top:4px;text-transform:uppercase}
.lkfw-col-hi .lkfw-label{color:#fff}
/* 이미지 프레임 */
.lkfw-img-wrap{width:100%;padding:8px 16px;margin-top:10px}
.lkfw-img{width:100%;aspect-ratio:1/1;border-radius:var(--shape-photo, calc(var(--r-scale,1)*8px));object-fit:cover;background:color-mix(in srgb,var(--accent) 8%,var(--paper))}
.lkfw-img.ph{display:none!important}
/* 이미지 없을 때 공간 회수 — noimg-safe */
.lkfw-no-img .lkfw-img-wrap{display:none}
/* 제품명 */
.lkfw-name{font-size:15px;font-weight:700;color:var(--accent);margin-top:14px;text-align:center;padding:0 8px}
/* 해시태그 */
.lkfw-tags{margin-top:8px;display:flex;flex-direction:column;align-items:center;gap:2px;padding:0 8px 0}
.lkfw-tag{font-size:12px;font-weight:500;color:var(--muted);line-height:1.5}
/* 강조 열 캡 내부 텍스트 */
.lkfw-spike-inner{display:flex;flex-direction:column;align-items:center;padding:18px 8px 14px}
.lkfw-spike-inner .lkfw-num{margin-top:0}
`,
  render: (d, { esc, richSafe }) => {
    const hiIdx = d.highlightIndex ?? 2
    // 이미지가 하나라도 있으면 이미지 영역 표시
    const hasAnyImg = d.items.some(
      (it) => typeof it.image === 'string' && /^(https?:\/\/|data:|\/)/.test(it.image.trim()),
    )
    const pad2 = (n: number) => String(n).padStart(2, '0')

    const cols = d.items.map((item, i) => {
      const isHi = i === hiIdx
      const num = pad2(i + 1)
      const imgHtml = media(item.image, 'lkfw-img', `옵션 ${num}`)
      const tagsHtml = item.tags
        .map((t) => `<span class="lkfw-tag">#${esc(t)}</span>`)
        .join('')

      if (isHi) {
        // 강조 열: 스파이크 캡 + 열 내부
        return `
<div class="lkfw-col-hi" style="flex:0 0 calc(25% + 2px);display:flex;flex-direction:column;position:relative;z-index:2">
  <div class="lkfw-spike-cap">
    <div class="lkfw-spike-inner">
      <span class="lkfw-num" style="color:#fff">${esc(num)}</span>
      <span class="lkfw-label" style="color:rgba(255,255,255,.8)">옵션 ${esc(num)}</span>
    </div>
  </div>
  <div style="flex:1;background:var(--paper);border-left:2px solid var(--accent);border-right:2px solid var(--accent);border-bottom:2px solid var(--accent);border-radius:0 0 calc(var(--r-scale,1)*8px) calc(var(--r-scale,1)*8px);display:flex;flex-direction:column;align-items:center;padding-bottom:28px${hasAnyImg ? '' : ''}">
    ${hasAnyImg ? `<div class="lkfw-img-wrap">${imgHtml}</div>` : ''}
    <p class="lkfw-name">${esc(item.name)}</p>
    <div class="lkfw-tags">${tagsHtml}</div>
  </div>
</div>`
      }

      // 일반 열
      return `
<div class="lkfw-col${hasAnyImg ? '' : ' lkfw-no-img'}">
  <span class="lkfw-num">${esc(num)}</span>
  <span class="lkfw-label">옵션 ${esc(num)}</span>
  ${hasAnyImg ? `<div class="lkfw-img-wrap">${imgHtml}</div>` : ''}
  <p class="lkfw-name">${esc(item.name)}</p>
  <div class="lkfw-tags">${tagsHtml}</div>
</div>`
    })

    return `
<section class="lkfw">
  <div class="lkfw-hd">
    <h2 class="lkfw-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="lkfw-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="lkfw-rule"></div>
  <div class="lkfw-grid">
    ${cols.join('')}
  </div>
</section>`
  },
})
