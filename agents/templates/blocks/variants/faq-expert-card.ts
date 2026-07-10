/** FAQ 아키타입: faq-expert-card
 *  원형 전문가 프로필 사진 + 직함 뱃지를 상단에 배치하고,
 *  연회색 배경 위 흰 대형 카드 안에 핑크 대형 "Q." 접두 + 질문·답변 2세트를 세로로 쌓는 구성.
 *  피그마 원본: 176_FAQ_문의_구성_페이지_12 (860×1780, fmwy 접두, light)
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  sectionTitle: z.string().min(1),           // 예: "Q&A"  (em 허용)
  sectionDesc:  z.string().optional(),       // 섹션 부제 한 줄
  profileImage: z.string().optional(),       // (url) 원형 프로필 사진
  profileName:  z.string().optional(),       // 이름 또는 직책 코드  예: "Sat.09"
  profileRole:  z.string().optional(),       // 직함  예: "수석연구원"
  pairs: z.array(
    z.object({
      question: z.string().min(1),           // (em,br) 질문 본문
      answer:   z.string().min(1),           // (em,br) 답변 본문
    })
  ).min(1).max(4),
})
type Data = z.infer<typeof schema>

export const faqExpertCard = defineBlock<Data>({
  id:         'faq-expert-card',
  archetype:  'faq',
  styleTags:  ['light', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '전문가 원형 프로필 사진+직함 뱃지를 상단에 두고, 연회색 배경 위 흰 대형 카드 안에 ' +
    '핑크 대형 Q. 접두 + 질문·답변 세트를 세로 나열. 실제 전문가 Q&A 형식 연출. ' +
    '이미지 없이도 뱃지+이니셜 폴백으로 안전하게 강등(noimg-safe).',
  schema,
  css: `
/* ── faq-expert-card (fmwy) ──────────────────────────────────────── */
.fmwy{background:var(--bg);padding:64px var(--pad-x,56px) 72px;color:var(--ink)}

/* 섹션 헤더 */
.fmwy-hd{text-align:center;margin-bottom:40px}
.fmwy-title{font-family:var(--font-display);font-weight:800;font-size:52px;
  letter-spacing:-.02em;line-height:1.1;color:var(--ink)}
.fmwy-title .em{color:var(--accent)}
.fmwy-desc{margin-top:12px;font-size:16px;color:var(--muted);font-weight:500;line-height:1.6}

/* 흰 카드 */
.fmwy-card{background:var(--paper);border-radius:calc(var(--r-scale,1)*20px);
  padding:40px 48px 52px;box-shadow:0 4px 32px -8px rgba(0,0,0,.08)}

/* 프로필 블록 */
.fmwy-prof{display:flex;flex-direction:column;align-items:center;gap:0;margin-bottom:32px;position:relative}
.fmwy-avatar-wrap{position:relative;width:140px;height:140px}
.fmwy-avatar{width:140px;height:140px;border-radius:50%;overflow:hidden;
  background:color-mix(in srgb,var(--accent) 14%,var(--bg));
  border:3px solid var(--line)}
.fmwy-avatar img,.fmwy-avatar .ph{width:100%;height:100%;object-fit:cover;border-radius:50%}
/* noimg-safe: 이미지 없을 때 이니셜 원 표시 */
.fmwy-avatar-init{display:none;width:100%;height:100%;border-radius:50%;
  background:color-mix(in srgb,var(--accent) 18%,var(--bg));
  align-items:center;justify-content:center;
  font-family:var(--font-display);font-weight:800;font-size:38px;color:var(--accent)}
.fmwy-avatar.no-img .fmwy-avatar-init{display:flex}
.fmwy-badge{position:absolute;bottom:2px;right:-8px;
  background:var(--accent);border-radius:50%;
  width:64px;height:64px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  box-shadow:0 2px 8px rgba(0,0,0,.18)}
.fmwy-badge-name{font-size:11px;font-weight:800;color:#fff;line-height:1.2;text-align:center}
.fmwy-badge-role{font-size:10px;font-weight:700;color:rgba(255,255,255,.85);line-height:1.2;text-align:center}

/* 구분선 */
.fmwy-rule{border:none;border-top:2px solid var(--line);margin:0 -48px 0}

/* Q&A 세트 */
.fmwy-pairs{margin-top:0}
.fmwy-pair{padding:28px 0}
.fmwy-pair+.fmwy-pair{border-top:2px solid var(--line)}
.fmwy-q-mark{font-family:var(--font-display);font-weight:800;font-size:44px;
  color:var(--accent);line-height:1;margin-bottom:6px}
.fmwy-q-text{font-family:var(--font-display);font-weight:700;font-size:22px;
  color:var(--accent);line-height:1.35;margin-bottom:14px}
.fmwy-q-text .em{color:var(--ink)}
.fmwy-a-text{font-size:15px;color:var(--ink-2);line-height:1.78;font-weight:400}
.fmwy-a-text .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    // noimg-safe: 이미지 URL 유무 판별
    const hasImg = typeof d.profileImage === 'string' && /^(https?:\/\/|data:|\/)/.test(d.profileImage.trim())
    // 이니셜 폴백: 이름 첫 글자 또는 '?'
    const initial = (d.profileName ?? '전문가').trim().charAt(0)

    const avatarHtml = hasImg
      ? `<div class="fmwy-avatar">${media(d.profileImage, '', '전문가 프로필')}</div>`
      : `<div class="fmwy-avatar no-img"><span class="fmwy-avatar-init">${esc(initial)}</span></div>`

    const badgeHtml = (d.profileName || d.profileRole)
      ? `<div class="fmwy-badge">
          ${d.profileName ? `<span class="fmwy-badge-name">${esc(d.profileName)}</span>` : ''}
          ${d.profileRole ? `<span class="fmwy-badge-role">${esc(d.profileRole)}</span>` : ''}
        </div>`
      : ''

    const pairsHtml = d.pairs.map(p => `
    <div class="fmwy-pair">
      <div class="fmwy-q-mark">Q.</div>
      <p class="fmwy-q-text">${richSafe(p.question)}</p>
      <p class="fmwy-a-text">${richSafe(p.answer)}</p>
    </div>`).join('')

    return `
<section class="fmwy">
  <div class="fmwy-hd">
    <h2 class="fmwy-title disp">${richSafe(d.sectionTitle)}</h2>
    ${d.sectionDesc ? `<p class="fmwy-desc">${esc(d.sectionDesc)}</p>` : ''}
  </div>
  <div class="fmwy-card">
    <div class="fmwy-prof">
      <div class="fmwy-avatar-wrap">
        ${avatarHtml}
        ${badgeHtml}
      </div>
    </div>
    <hr class="fmwy-rule">
    <div class="fmwy-pairs">${pairsHtml}
    </div>
  </div>
</section>`
  },
})
