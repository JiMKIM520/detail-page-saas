/** CERT 아키타입(템플릿 충실 재현): cert-pedestal.
 *  와디즈 200섹션 14_인증 _228:700 (3D 무대 연출 인증서) 패턴 재구성.
 *  다크 스튜디오 배경 + 받침대 위 인증서 액자 교번 진열 + 사선 라벨 연결 + 홀로그램 씰.
 *  cert-frame(라이트 단순)·cert-badge-hero(중앙 뱃지)와 다른 무대형 다크 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const certItemSchema = z.object({
  image: z.string().optional(),           // 인증서 이미지 (url)
  labelTitle: z.string().min(1),          // 라벨 굵은 제목 (em,br)
  labelNote: z.string().min(1).optional(),// 라벨 하단 작은 주석 (em,br)
})

const schema = z.object({
  heading: z.string().min(1).optional(),      // 섹션 상단 대제목 (기본 "Certificate")
  subtitle: z.string().min(1).optional(),     // 헤딩 아래 한 줄 설명
  certs: z
    .array(certItemSchema)
    .min(2)
    .max(4),                                  // 교번 진열 아이템 (2~4)
})
type Data = z.infer<typeof schema>

export const certPedestal = defineBlock<Data>({
  id: 'cert-pedestal',
  archetype: 'cert',
  styleTags: ['dark', 'premium', 'trust', 'template', 'editorial'],
  imageSlots: 4,
  describe:
    '인증서 3D 무대 연출. 다크 스튜디오 + 받침대 위 인증서 액자 교번(좌우 사선 연결) + 홀로그램 씰 + 라벨. 인증/시험성적서 신뢰 강조용.',
  schema,
  css: `
.cpd{background:var(--ink);color:#fff;padding:64px 0 72px;text-align:center;overflow:hidden}
.cpd-hd{padding:0 56px;margin-bottom:52px}
.cpd-heading{font-family:var(--font-display);font-weight:800;font-size:62px;letter-spacing:-.02em;line-height:1.05;color:var(--accent)}
.cpd-subtitle{margin-top:12px;font-size:17px;color:rgba(255,255,255,.7);line-height:1.6}

/* 인증서 아이템 행 */
.cpd-row{position:relative;margin-bottom:40px;display:flex;align-items:flex-end;min-height:340px}
.cpd-row:last-child{margin-bottom:0}

/* 짝수(0-indexed): 인증서 오른쪽, 라벨 왼쪽 */
.cpd-row.cpd-even{flex-direction:row;justify-content:flex-end;padding-right:56px}
/* 홀수: 인증서 왼쪽, 라벨 오른쪽 */
.cpd-row.cpd-odd{flex-direction:row-reverse;justify-content:flex-end;padding-left:56px}

/* 받침대 + 액자 묶음 */
.cpd-stage{position:relative;flex:0 0 auto;display:flex;flex-direction:column;align-items:center}

/* 액자 */
.cpd-frame{position:relative;width:240px;height:300px;background:#fff;border:8px solid #d8d8d8;box-shadow:0 32px 64px -24px rgba(0,0,0,.75),0 8px 24px -8px rgba(0,0,0,.5);z-index:2}
.cpd-frame img,.cpd-frame .ph{width:100%;height:100%;object-fit:cover;display:block}

/* 홀로그램 씰 */
.cpd-seal{position:absolute;bottom:-14px;left:-14px;width:72px;height:72px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#ffffff 0%,color-mix(in srgb,var(--accent) 55%,#fff) 38%,var(--accent) 100%);display:grid;place-items:center;box-shadow:0 6px 20px rgba(0,0,0,.38);z-index:3;transform:rotate(-8deg)}
.cpd-seal-text{font-size:7px;font-weight:800;letter-spacing:.12em;color:#fff;text-align:center;line-height:1.25;text-transform:uppercase}

/* 받침대(사다리꼴) */
.cpd-pedestal{width:200px;height:44px;background:linear-gradient(180deg,rgba(255,255,255,.18) 0%,rgba(255,255,255,.06) 100%);border-left:1px solid rgba(255,255,255,.2);border-right:1px solid rgba(255,255,255,.2);border-bottom:3px solid rgba(255,255,255,.25);clip-path:polygon(8% 0%,92% 0%,100% 100%,0% 100%);z-index:1;margin-top:-2px}

/* 사선 연결선 */
.cpd-connector{position:absolute;top:50%;width:90px;border-top:1px dashed rgba(255,255,255,.35);z-index:0}
.cpd-row.cpd-even .cpd-connector{right:296px;transform-origin:right center;transform:translateY(-50%) rotate(-14deg)}
.cpd-row.cpd-odd .cpd-connector{left:296px;transform-origin:left center;transform:translateY(-50%) rotate(14deg)}

/* 라벨 */
.cpd-label{flex:0 0 auto;max-width:220px;text-align:left;padding-bottom:60px}
.cpd-row.cpd-even .cpd-label{padding-right:24px;text-align:right}
.cpd-row.cpd-odd .cpd-label{padding-left:24px;text-align:left}
.cpd-label-title{font-family:var(--font-display);font-weight:800;font-size:24px;line-height:1.25;color:#fff}
.cpd-label-title .em{color:var(--accent)}
.cpd-label-note{margin-top:10px;font-size:12px;color:rgba(255,255,255,.5);line-height:1.65}
.cpd-label-note .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="cpd">
  <div class="cpd-hd">
    <h2 class="cpd-heading">${esc(d.heading ?? 'Certificate')}</h2>
    ${d.subtitle ? `<p class="cpd-subtitle">${esc(d.subtitle)}</p>` : ''}
  </div>
  ${d.certs
    .map(
      (c, i) => {
        const side = i % 2 === 0 ? 'cpd-even' : 'cpd-odd'
        return `
  <div class="cpd-row ${side}">
    <div class="cpd-label">
      <div class="cpd-label-title">${richSafe(c.labelTitle)}</div>
      ${c.labelNote ? `<div class="cpd-label-note">${richSafe(c.labelNote)}</div>` : ''}
    </div>
    <div class="cpd-connector"></div>
    <div class="cpd-stage">
      <div class="cpd-frame">
        ${media(c.image, 'cpd-frame-img', '인증서')}
        <div class="cpd-seal"><span class="cpd-seal-text">CERTI<br>FIED</span></div>
      </div>
      <div class="cpd-pedestal"></div>
    </div>
  </div>`
      }
    )
    .join('')}
</section>`,
})
