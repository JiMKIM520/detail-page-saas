/** CERT 아키타입(템플릿 충실 재현): cert-badge-hero.
 *  와디즈 200섹션 14_인증 공식 뱃지(Badge) 중심형 패턴 재구성.
 *  HACCP/GMP 등 원형 공식 인증 뱃지를 히어로로 배치 + 하이라이트 배너 + 체크리스트 + 하단 인증서 문서 이미지.
 *  식품/건기식 특화. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const checkItemSchema = z.object({
  label: z.string().min(1),          // 굵은 앞부분 (em 허용)
  desc: z.string().min(1).optional(), // 콜론 뒤 설명 (em,br 허용)
})

const schema = z.object({
  eyebrow: z.string().min(1).optional(),       // 상단 pill 태그, 예 "CERTIFICATE"
  title: z.string().min(1),                    // 대형 헤드라인 (em,br)
  subtitle: z.string().min(1).optional(),      // 제목 아래 보조 한 줄
  badgeImage: z.string().optional(),           // 원형 공식 인증 뱃지 이미지 (url)
  highlightText: z.string().min(1).optional(), // 강조 타이틀 배너 텍스트 (em,br)
  bannerText: z.string().min(1).optional(),    // accent 배경 배너 텍스트 (em,br)
  checks: z                                    // 체크리스트 항목 (2~4)
    .array(checkItemSchema)
    .min(2)
    .max(4),
  summaryLines: z                              // 하단 요약 박스 bullet 줄 (2~4)
    .array(z.string().min(1))
    .min(2)
    .max(4)
    .optional(),
  certDocImage: z.string().optional(),         // 하단 인증서 문서 사진 (url)
})

type Data = z.infer<typeof schema>

export const certBadgeHero = defineBlock<Data>({
  id: 'cert-badge-hero',
  archetype: 'cert',
  styleTags: ['trust', 'food', 'premium', 'template', 'centered'],
  imageSlots: 2,
  describe:
    '공식 인증 뱃지 히어로형. 상단 eyebrow pill + 대형 헤드라인 + 원형 뱃지 이미지(HACCP/GMP 등) + 강조 배너 + accent 배너 + 체크리스트 + 하단 요약박스 + 인증서 문서 이미지. 식품/건기식 인증 특화.',
  schema,
  css: `
.cbh{background:var(--bg);color:var(--ink);padding:60px 0 0;text-align:center}
.cbh-eyebrow{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.18em;color:var(--accent);border:1.5px solid var(--accent);border-radius:999px;padding:5px 18px;margin-bottom:20px;text-transform:uppercase}
.cbh-title{font-family:var(--font-display);font-weight:800;font-size:50px;letter-spacing:-.02em;line-height:1.15;padding:0 40px}
.cbh-title .em{color:var(--accent)}
.cbh-sub{margin-top:12px;font-size:14px;color:var(--muted);letter-spacing:.02em;padding:0 40px;line-height:1.6}
.cbh-badge-wrap{margin:38px auto 0;width:220px;height:220px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--accent) 8%,transparent);box-shadow:0 16px 48px -18px rgba(0,0,0,.22)}
.cbh-badge-wrap img,.cbh-badge-wrap .ph{width:100%;height:100%;border-radius:50%;object-fit:cover}
.cbh-highlight{margin:38px 40px 0;background:color-mix(in srgb,var(--accent) 12%,transparent);border-radius:10px;padding:16px 24px;font-family:var(--font-display);font-weight:800;font-size:26px;line-height:1.3;color:var(--ink)}
.cbh-highlight .em{color:var(--accent)}
.cbh-banner{margin:18px 0 0;background:var(--accent);color:#fff;padding:16px 40px;font-family:var(--font-display);font-weight:800;font-size:18px;line-height:1.4;display:flex;align-items:center;gap:10px;justify-content:center}
.cbh-banner .em{color:#fff;text-decoration:underline}
.cbh-banner-icon{flex:0 0 22px;width:22px;height:22px;color:#fff}
.cbh-checks{margin:0;padding:0 40px;text-align:left}
.cbh-check-row{display:flex;align-items:flex-start;gap:14px;padding:18px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 60%,transparent)}
.cbh-check-row:last-child{border-bottom:none}
.cbh-check-icon{flex:0 0 22px;width:22px;height:22px;color:var(--accent);margin-top:1px}
.cbh-check-text{font-size:15px;line-height:1.6;color:var(--ink)}
.cbh-check-text .em{font-weight:800;color:var(--ink)}
.cbh-check-label{font-weight:800;color:var(--ink)}
.cbh-check-colon{color:var(--muted)}
.cbh-summary{margin:28px 40px 0;background:color-mix(in srgb,var(--accent) 6%,transparent);border:1.5px solid color-mix(in srgb,var(--accent) 22%,transparent);border-radius:12px;padding:22px 26px}
.cbh-summary-line{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:700;color:var(--ink);line-height:1.5}
.cbh-summary-line+.cbh-summary-line{margin-top:12px}
.cbh-summary-bullet{flex:0 0 18px;width:18px;height:18px;color:var(--accent)}
.cbh-summary-line .em{color:var(--accent);font-weight:800}
.cbh-doc-wrap{margin:32px 40px 0 40px;border-radius:14px;overflow:hidden;box-shadow:0 10px 32px -14px rgba(0,0,0,.25)}
.cbh-doc-wrap img,.cbh-doc-wrap .ph{width:100%;height:260px;object-fit:cover;display:block;border-radius:14px}
.cbh-bottom-pad{height:56px}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="cbh">
  ${d.eyebrow ? `<span class="cbh-eyebrow">${esc(d.eyebrow)}</span>` : ''}
  <h2 class="cbh-title">${richSafe(d.title)}</h2>
  ${d.subtitle ? `<p class="cbh-sub">${esc(d.subtitle)}</p>` : ''}
  <div class="cbh-badge-wrap">
    ${media(d.badgeImage, 'cbh-badge-img', '공식 인증 뱃지')}
  </div>
  ${d.highlightText ? `<div class="cbh-highlight">${richSafe(d.highlightText)}</div>` : ''}
  ${d.bannerText ? `<div class="cbh-banner"><span class="cbh-banner-icon">${icon('check')}</span>${richSafe(d.bannerText)}</div>` : ''}
  <div class="cbh-checks">
    ${d.checks
      .map(
        (c) => `
    <div class="cbh-check-row">
      <span class="cbh-check-icon">${icon('check')}</span>
      <div class="cbh-check-text">
        ${c.desc
          ? `<span class="cbh-check-label">${richSafe(c.label)}</span><span class="cbh-check-colon"> : </span>${richSafe(c.desc)}`
          : richSafe(c.label)}
      </div>
    </div>`,
      )
      .join('')}
  </div>
  ${
    d.summaryLines && d.summaryLines.length > 0
      ? `<div class="cbh-summary">${d.summaryLines
          .map(
            (line) =>
              `<div class="cbh-summary-line"><span class="cbh-summary-bullet">${icon('check')}</span>${richSafe(line)}</div>`,
          )
          .join('')}</div>`
      : ''
  }
  ${
    d.certDocImage
      ? `<div class="cbh-doc-wrap">${media(d.certDocImage, 'cbh-doc-img', '인증서 문서')}</div>`
      : ''
  }
  <div class="cbh-bottom-pad"></div>
</section>`,
})
