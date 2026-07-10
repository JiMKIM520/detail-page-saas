/** REASON 아키타입: reason-staircard-overlap
 *  검정 배경 + 대형 Bold 헤드라인 + 그라디언트 해시태그 배너 + 흰 카드 4장 계단식 오프셋 배치.
 *  각 카드 모서리 밖으로 제품 이미지가 돌출(오버랩). 원본: 165_FAQ_문의_구성_페이지_23.json 구조 재구성. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 대형 헤드라인 (em, br 허용) */
  title: z.string().min(1),
  /** 헤드라인 아래 한 줄 부제 */
  subtitle: z.string().optional(),
  /** 그라디언트 배너에 표시할 해시태그 문자열 (예: "#혁신적인 성분  #피부 장벽 강화  #임상 완료") */
  hashtagBanner: z.string().optional(),
  /** 카드 4장 — 구매 이유/강점 항목. 이미지 없어도 붕괴하지 않음 (noimg-safe) */
  cards: z
    .array(
      z.object({
        /** 카드 제목 (em 허용) */
        label: z.string().min(1),
        /** 카드 본문 (em 허용) */
        text: z.string().min(1),
        /** 제품/소재 이미지 URL — 카드 모서리 밖으로 돌출 배치. 브리프 근거 시만. */
        image: z.string().optional(),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const reasonStaircardOverlap = defineBlock<Data>({
  id: 'reason-staircard-overlap',
  archetype: 'reason',
  styleTags: ['dark', 'editorial', 'noimg-safe'],
  imageSlots: 4,
  describe:
    '구매 이유(reason) 다크 블록. 검정 배경 위 대형 Bold 헤드라인 + 그라디언트 해시태그 배너 + 흰 카드 4장 계단식(사선) 오프셋 + 각 카드 모서리 밖 제품 이미지 돌출 오버랩. 이미지 없어도 안전하게 카드만 렌더.',
  schema,
  css: `
.rzpg{position:relative;background:#000;color:#fff;padding:72px var(--pad-x,56px) 96px;overflow:hidden}
.rzpg .em{color:var(--em-dark,#FFF7EA)}

/* 헤드라인 영역 */
.rzpg-head{position:relative;z-index:2;margin-bottom:10px}
.rzpg-sub{font-size:14px;font-weight:500;letter-spacing:.12em;color:#888;text-transform:uppercase;margin-bottom:16px}
.rzpg-title{font-family:var(--font-display);font-weight:800;font-size:clamp(36px,5.6vw,58px);line-height:1.08;letter-spacing:-.02em;color:#fff}
.rzpg-title .em{color:var(--em-dark,#FFF7EA)}

/* 해시태그 그라디언트 배너 */
.rzpg-banner{position:relative;z-index:2;margin:28px 0 52px;padding:14px 22px;border-radius:calc(var(--r-scale,1)*10px);background:linear-gradient(100deg,#1a1a2e 0%,#16213e 40%,#0f3460 70%,#533483 100%);overflow:hidden}
.rzpg-banner::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.04) 50%,transparent 100%)}
.rzpg-banner-txt{position:relative;font-family:var(--font-display);font-size:17px;font-weight:700;letter-spacing:.06em;color:#e8e0ff;line-height:1.5;word-break:keep-all}

/* 카드 스택 */
.rzpg-stack{position:relative;z-index:2;display:flex;flex-direction:column;gap:0}

/* 카드 — 기본 오프셋: 각 카드를 오른쪽으로 계단식 이동 */
.rzpg-item{position:relative;margin-bottom:28px}
.rzpg-item:nth-child(1){margin-left:0}
.rzpg-item:nth-child(2){margin-left:clamp(16px,3vw,32px)}
.rzpg-item:nth-child(3){margin-left:clamp(32px,6vw,64px)}
.rzpg-item:nth-child(4){margin-left:clamp(48px,9vw,96px)}
.rzpg-item:last-child{margin-bottom:0}

/* 흰 카드 */
.rzpg-card{background:#fff;border-radius:calc(var(--r-scale,1)*18px);padding:26px 28px 26px 26px;min-height:90px;position:relative}

/* 카드 텍스트 */
.rzpg-card-label{font-family:var(--font-display);font-size:15px;font-weight:800;color:#000;letter-spacing:.04em;margin-bottom:8px;padding-right:60px}
.rzpg-card-label .em{color:var(--accent-d,#6c3bbf)}
.rzpg-card-text{font-size:14px;font-weight:400;line-height:1.7;color:#333;padding-right:60px}
.rzpg-card-text .em{color:var(--accent-d,#6c3bbf);font-weight:700}

/* 이미지 돌출 — 카드 우측 하단 모서리 밖으로 삐져나옴 */
.rzpg-img-wrap{position:absolute;right:-18px;bottom:-22px;width:var(--shape-photo,calc(var(--r-scale,1)*1px));/* 개별 오버라이드 없이 크기 고정 */width:90px;height:108px;z-index:10;pointer-events:none}
.rzpg-img-wrap img{width:100%;height:100%;object-fit:cover;border-radius:calc(var(--r-scale,1)*12px);box-shadow:0 8px 24px rgba(0,0,0,.38)}
/* noimg-safe: 이미지 없으면 wrap 자체 숨김 — 카드 우측 패딩도 정상화 */
.rzpg-img-wrap.ph-wrap{display:none}
.rzpg-img-wrap.ph-wrap~.rzpg-card .rzpg-card-label,
.rzpg-img-wrap.ph-wrap~.rzpg-card .rzpg-card-text{padding-right:0}
/* 이미지 있는 카드에서 텍스트 오른쪽 공간 확보 */
.rzpg-item.has-img .rzpg-card-label,
.rzpg-item.has-img .rzpg-card-text{padding-right:76px}

/* 배경 장식 — 흐릿한 보라빛 원형 글로우 */
.rzpg-glow{position:absolute;top:-80px;right:-100px;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(100,60,200,.18) 0%,transparent 70%);pointer-events:none;z-index:0}
`,
  render: (d, { esc, richSafe }) => {
    const cards = d.cards.slice(0, 4)
    return `
<section class="rzpg">
  <div class="rzpg-glow"></div>

  <div class="rzpg-head">
    ${d.subtitle ? `<p class="rzpg-sub">${esc(d.subtitle)}</p>` : ''}
    <h2 class="rzpg-title">${richSafe(d.title)}</h2>
  </div>

  ${d.hashtagBanner ? `<div class="rzpg-banner"><p class="rzpg-banner-txt">${esc(d.hashtagBanner)}</p></div>` : ''}

  <div class="rzpg-stack">
    ${cards
      .map((c) => {
        const hasImg =
          typeof c.image === 'string' &&
          /^(https?:\/\/|data:|\/)/.test(c.image.trim())
        return `
    <div class="rzpg-item${hasImg ? ' has-img' : ''}">
      <div class="rzpg-card">
        <p class="rzpg-card-label">${richSafe(c.label)}</p>
        <p class="rzpg-card-text">${richSafe(c.text)}</p>
      </div>
      ${
        hasImg
          ? `<div class="rzpg-img-wrap">${media(c.image, '', '제품 이미지')}</div>`
          : `<div class="rzpg-img-wrap ph-wrap"></div>`
      }
    </div>`
      })
      .join('')}
  </div>
</section>`
  },
})
