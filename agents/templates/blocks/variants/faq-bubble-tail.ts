/** FAQ 아키타입: faq-bubble-tail
 *  Q&A/08 피그마 프레임 재구성. 채팅 말풍선 꼬리 달린 Q버블(포인트 색 배경) + 아이콘+텍스트 A블록 3세트 +
 *  하단 전폭 사진. 말풍선 꼬리는 인라인 SVG로 구현. 톤: mixed(라이트 섹션 + 포인트 색 버블). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pairSchema = z.object({
  q: z.string().min(1),              // 질문 (한 줄, em 허용)
  a: z.string().min(1),              // 답변 (여러 줄, em/br 허용)
})

const schema = z.object({
  label: z.string().optional(),      // 대형 영문 라벨 (기본 "Q&A", em 허용)
  title: z.string().optional(),      // 서브 헤딩 (기본 "궁금하신 점 물어보세요!", em 허용)
  pairs: z.array(pairSchema).min(1).max(6),
  image: z.string().optional(),      // 하단 전폭 사진 (url)
})
type Data = z.infer<typeof schema>

export const faqBubbleTail = defineBlock<Data>({
  id: 'faq-bubble-tail',
  archetype: 'faq',
  styleTags: ['light', 'mixed', 'chat', 'noimg-safe'],
  imageSlots: 1,
  describe:
    'FAQ 채팅 말풍선 블록. 포인트 색 말풍선(꼬리 SVG 포함) Q 버블 + 흰 라운드 A 블록 최대 6쌍 + 선택적 하단 전폭 사진. ' +
    '대화형 UX로 신뢰를 쌓는 혜택/유의사항 안내에 적합. 수치·후기 슬롯은 없음.',
  schema,
  css: `
.fafe{background:var(--bg);padding:60px 0 0}
.fafe-hd{text-align:center;padding:0 var(--pad-x,56px) 44px}
.fafe-label{font-family:var(--font-display);font-weight:800;font-size:80px;line-height:1;
  color:var(--accent);letter-spacing:-.02em}
.fafe-title{margin-top:12px;font-size:18px;font-weight:500;color:var(--ink-2);line-height:1.5}
.fafe-list{display:flex;flex-direction:column;gap:32px;padding:0 var(--pad-x,56px)}
.fafe-pair{}
/* Q 말풍선 */
.fafe-q-wrap{position:relative}
.fafe-q-bubble{display:flex;align-items:center;gap:16px;
  background:var(--accent);
  border-radius:calc(var(--r-scale,1)*16px);
  padding:18px 22px;min-height:64px}
.fafe-q-icon{flex:0 0 36px;width:36px;height:36px;color:#fff;opacity:.95}
.fafe-q-text{font-family:var(--font-display);font-weight:700;font-size:17px;
  color:#fff;line-height:1.4;flex:1}
.fafe-q-text .em{color:var(--em-dark,#FFF7EA);font-style:normal}
/* 꼬리 SVG — 버블 하단 왼쪽 */
.fafe-tail{display:block;width:28px;height:20px;margin-left:28px;color:var(--accent)}
/* A 답변 블록 */
.fafe-a-block{display:flex;align-items:flex-start;gap:16px;
  background:var(--paper,#fff);
  border-radius:calc(var(--r-scale,1)*16px);
  padding:18px 22px;margin-top:0}
.fafe-a-icon{flex:0 0 36px;width:36px;height:36px;color:var(--accent)}
.fafe-a-text{font-size:16px;font-weight:500;color:var(--ink-2);line-height:1.72;flex:1}
.fafe-a-text .em{color:var(--accent);font-weight:700}
/* 하단 전폭 사진 */
.fafe-photo{margin-top:48px;width:100%;aspect-ratio:1/1;
  border-radius:0;object-fit:cover;
  border-radius:var(--shape-photo, 0px);display:block}
/* noimg-safe: 사진 없으면 하단 여백만 */
.fafe-photo-wrap:empty{display:none}
.fafe-photo-wrap .ph{display:none!important}
.fafe-bottom{padding-bottom:60px}
`,
  render: (d, { esc, richSafe, icon }) => {
    // Q 아이콘: 말풍선 느낌의 'phone' 대신 별도 인라인 SVG (Q 레터형)
    const qIcon = `<svg class="fafe-q-icon" viewBox="0 0 36 36" fill="none" stroke="currentColor"
      stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="18" cy="18" r="14"/>
      <path d="M14.5 14.5c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5c0 1.8-1.2 2.8-2.5 3.5v1"/>
      <circle cx="18" cy="24" r="1" fill="currentColor" stroke="none"/>
    </svg>`

    // A 아이콘: shield(신뢰) 계열 → badge 아이콘 사용
    const aIcon = `<span class="fafe-a-icon">${icon('badge')}</span>`

    // 꼬리 SVG — 버블 하단 좌측에서 아래로 삼각 꼬리
    const tail = `<svg class="fafe-tail" viewBox="0 0 28 20" fill="currentColor">
      <path d="M0 0 L28 0 L0 20 Z"/>
    </svg>`

    const pairs = d.pairs
      .map(
        (p) => `
<div class="fafe-pair">
  <div class="fafe-q-wrap">
    <div class="fafe-q-bubble">
      ${qIcon}
      <span class="fafe-q-text">${richSafe(p.q)}</span>
    </div>
    ${tail}
  </div>
  <div class="fafe-a-block">
    ${aIcon}
    <p class="fafe-a-text">${richSafe(p.a)}</p>
  </div>
</div>`,
      )
      .join('')

    const hasImage = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())

    return `
<section class="fafe">
  <div class="fafe-hd">
    <p class="fafe-label">${richSafe(d.label ?? 'Q&amp;A')}</p>
    ${d.title ? `<p class="fafe-title">${richSafe(d.title)}</p>` : `<p class="fafe-title">궁금하신 점 물어보세요!</p>`}
  </div>
  <div class="fafe-list">
    ${pairs}
  </div>
  ${hasImage
    ? `<div class="fafe-photo-wrap">${media(d.image, 'fafe-photo', 'FAQ 하단 이미지')}</div>`
    : `<div class="fafe-bottom"></div>`}
</section>`
  },
})
