/** RECOMMEND 아키타입: recommend-persona-grid.
 *  [끝판왕] 추천·B&A #3 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크그린(--ink) 배경 + 흰색 eyebrow + accent 강조 대형 헤드라인
 *  + 원형 아바타(이미지 슬롯) 흰 카드 3열×N행 그리드 + 페르소나 라벨. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 대형 헤드라인 위 작은 eyebrow 문구 (선택) */
  eyebrow: z.string().optional(),
  /** 메인 헤드라인 (em 허용 — 강조 어절에 accent 색) */
  title: z.string().min(1),
  /** 페르소나 카드 목록 (4~6개 권장, 최소 2·최대 6) */
  items: z
    .array(
      z.object({
        /** 원형 아바타 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 카드 하단 페르소나 라벨 (em, br 허용) */
        label: z.string().min(1),
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const recommendPersonaGrid = defineBlock<Data>({
  id: 'recommend-persona-grid',
  archetype: 'recommend',
  styleTags: ['dark', 'grid', 'persona', 'target', 'template'],
  imageSlots: 6,
  describe:
    '추천 대상(페르소나). 다크 배경 + eyebrow + accent 강조 대형 헤드라인 + 원형 아바타+라벨 흰 카드 3열×N행 그리드. 구매를 망설이는 잠재 고객 유형을 시각적으로 나열.',
  schema,
  css: `
/* recommend-persona-grid — 접두사 rpg- */

/* 다크(--ink) 배경 블록 */
.rpg{
  background:var(--ink);
  color:#fff;
  padding:56px 32px 64px;
  text-align:center;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* eyebrow */
.rpg-eyebrow{
  font-family:var(--font-body);
  font-size:clamp(13px,2.6vw,16px);
  font-weight:500;
  letter-spacing:.03em;
  color:rgba(255,255,255,.65);
  margin-bottom:8px;
}

/* 대형 헤드라인 */
.rpg-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,7vw,52px);
  line-height:1.18;
  letter-spacing:-.025em;
  color:#fff;
  margin-bottom:40px;
}
/* 다크 배경 — .em은 밝은 var(--accent)로 override(전역 accent-d는 다크에서 대비 낮음) */
.rpg-title .em{
  color:var(--accent);
}

/* 카드 그리드: 항상 3열 */
.rpg-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:16px;
}

/* 개별 카드 */
.rpg-card{
  background:var(--paper);
  border-radius:16px;
  padding:24px 12px 20px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:14px;
  box-shadow:0 8px 24px -8px rgba(0,0,0,.45);
}

/* 원형 아바타 래퍼 — 이미지와 placeholder 모두 원형으로 잘림 */
.rpg-avatar-wrap{
  width:88px;
  height:88px;
  border-radius:50%;
  overflow:hidden;
  flex-shrink:0;
  background:rgba(0,0,0,.06);
}
.rpg-avatar{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}
/* placeholder: .ph 전역 클래스를 사용하되 원형 컨테이너 안에서 크기 맞춤 */
.rpg-avatar.ph{
  width:100%;
  height:100%;
  font-size:11px;
  border-radius:0;
  border:none;
  background:rgba(0,0,0,.08);
  color:var(--muted);
}

/* 페르소나 라벨 */
.rpg-label{
  font-family:var(--font-body);
  font-weight:700;
  font-size:clamp(13px,2.8vw,16px);
  line-height:1.5;
  letter-spacing:-.01em;
  color:var(--ink);
  text-align:center;
}
/* 라이트 카드 안 .em — 충분한 대비를 위해 --accent-d */
.rpg-label .em{
  color:var(--accent-d);
}
`,
  render: (d, { esc, richSafe }) => {
    const eyebrowHtml = d.eyebrow
      ? `<p class="rpg-eyebrow">${esc(d.eyebrow)}</p>`
      : ''

    const cardsHtml = d.items
      .map((it) => {
        const avatarHtml = media(
          it.image,
          'rpg-avatar',
          esc(it.imageAlt ?? '페르소나 아바타'),
        )
        return `
    <div class="rpg-card">
      <div class="rpg-avatar-wrap">${avatarHtml}</div>
      <p class="rpg-label">${richSafe(it.label)}</p>
    </div>`
      })
      .join('')

    return `
<section class="rpg">
  ${eyebrowHtml}
  <h2 class="rpg-title">${richSafe(d.title)}</h2>
  <div class="rpg-grid">
    ${cardsHtml}
  </div>
</section>`
  },
})
