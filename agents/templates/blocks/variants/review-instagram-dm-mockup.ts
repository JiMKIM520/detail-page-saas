/** REVIEW 아키타입: review-instagram-dm-mockup.
 *  [끝판왕] 리뷰·추천 #19 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 배경(배경 사진 선택) + 섹션 헤더(eyebrow 해시태그+별점+대제목) +
 *  스마트폰 목업 안에 Instagram DM 스레드로 리뷰를 "실제 DM 스크린샷"처럼 연출.
 *  인풋바 크롬(카메라·마이크·하트 아이콘)까지 재현해 소셜 증거 신뢰도 극대화. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 상단 eyebrow (예: "#리얼후기 #인스타그램") */
  eyebrow: z.string().optional(),
  /** 별점 1~5 (기본 5) */
  rating: z.number().int().min(1).max(5).optional(),
  /** 대제목 (em 허용) */
  title: z.string().min(1),
  /** 배경 이미지 URL (선택) — 섹션 전체 배경 */
  bgImage: z.string().optional(),
  /** DM 스레드 상단 발신자 프로필 이름 */
  dmSenderName: z.string().optional(),
  /** 발신자 아바타 이미지 (선택) */
  dmSenderAvatar: z.string().optional(),
  /** DM 메시지 버블 목록 (리뷰 3~5개) */
  messages: z
    .array(
      z.object({
        /** 메시지 텍스트 (em 허용) */
        text: z.string().min(1),
        /** 리뷰어 닉네임 (메시지 위 소형 레이블, 선택) */
        reviewer: z.string().optional(),
      }),
    )
    .min(2)
    .max(6),
  /** 입력창 placeholder 텍스트 (기본: "제품의 특성을 입력해주세요!") */
  inputPlaceholder: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const reviewInstagramDmMockup = defineBlock<Data>({
  id: 'review-instagram-dm-mockup',
  archetype: 'review',
  styleTags: ['social-proof', 'mockup', 'instagram', 'dm', 'warm', 'template'],
  imageSlots: 2,
  describe:
    '리얼 후기(소셜 증거). 섹션 헤더(eyebrow 해시태그+별점+대제목) + 스마트폰 목업 안 Instagram DM 스레드로 고객 리뷰를 "실제 DM 스크린샷"처럼 연출. 인풋바 크롬까지 재현. 배경 이미지 선택.',
  schema,
  css: `
/* review-instagram-dm-mockup — 접두사 ridm- */
.ridm{position:relative;padding:56px 40px 64px;text-align:center;overflow:hidden;background:var(--bg);word-break:keep-all}
/* 배경 이미지 오버레이 */
.ridm-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.38;z-index:0;pointer-events:none;display:block}
.ridm-bg.ph{position:absolute;inset:0;border:none;background:rgba(0,0,0,.04);z-index:0}
/* 콘텐츠 레이어 */
.ridm-inner{position:relative;z-index:1}
/* 헤더 */
.ridm-eyebrow{font-family:var(--font-body);font-size:14px;font-weight:600;letter-spacing:.06em;color:var(--accent-d);margin-bottom:10px;opacity:.85}
.ridm-stars{display:flex;justify-content:center;gap:3px;margin-bottom:14px}
.ridm-star{width:20px;height:20px;color:#F5A623}
.ridm-star svg{fill:#F5A623;stroke:none}
.ridm-title{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,5.5vw,38px);line-height:1.22;letter-spacing:-.02em;color:var(--ink);margin-bottom:32px}
.ridm-title .em{color:var(--accent-d)}
/* 폰 목업 */
.ridm-phone{position:relative;margin:0 auto;width:284px;background:var(--paper);border-radius:36px;overflow:hidden;box-shadow:0 28px 56px -18px rgba(0,0,0,.42),0 0 0 2.5px rgba(0,0,0,.14),inset 0 0 0 1px rgba(255,255,255,.55)}
/* 상단 상태바 영역 */
.ridm-statusbar{height:36px;background:var(--paper);display:flex;align-items:center;justify-content:space-between;padding:0 18px 0 22px}
.ridm-statusbar-time{font-size:12px;font-weight:700;color:var(--ink);letter-spacing:-.01em}
.ridm-statusbar-icons{display:flex;align-items:center;gap:5px}
.ridm-statusbar-icons svg{width:12px;height:12px;fill:var(--ink);stroke:none}
/* DM 헤더 바 */
.ridm-dmbar{background:var(--paper);border-bottom:1px solid var(--line);padding:8px 14px;display:flex;align-items:center;gap:10px}
.ridm-dmbar-back{width:18px;height:18px;flex-shrink:0;color:var(--ink)}
.ridm-dmbar-back svg{fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round}
.ridm-avatar-wrap{position:relative;width:34px;height:34px;flex-shrink:0}
.ridm-avatar{width:34px;height:34px;border-radius:50%;object-fit:cover}
.ridm-avatar.ph{background:var(--muted);border-radius:50%;border:none;font-size:0}
.ridm-avatar-online{position:absolute;bottom:1px;right:1px;width:9px;height:9px;border-radius:50%;background:#4ade80;border:1.5px solid var(--paper)}
.ridm-dmbar-info{flex:1;min-width:0}
.ridm-dmbar-name{font-size:13px;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ridm-dmbar-status{font-size:10.5px;color:var(--muted);margin-top:1px}
.ridm-dmbar-actions{display:flex;gap:10px;flex-shrink:0}
.ridm-dmbar-actions svg{width:18px;height:18px;fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
/* 메시지 스레드 영역 */
.ridm-thread{padding:14px 12px 10px;display:flex;flex-direction:column;gap:10px;min-height:260px;background:var(--bg)}
/* 개별 메시지 아이템 */
.ridm-msg{display:flex;align-items:flex-end;gap:7px}
.ridm-msg-avatar{width:24px;height:24px;flex-shrink:0;border-radius:50%;overflow:hidden}
.ridm-msg-avatar img,.ridm-msg-avatar .ridm-avatar-ph{width:24px;height:24px;border-radius:50%;object-fit:cover;background:var(--muted);display:block}
.ridm-bubble-wrap{flex:1;max-width:220px}
.ridm-reviewer{font-size:9.5px;color:var(--muted);margin-bottom:3px;padding-left:2px;font-weight:600;letter-spacing:.01em}
.ridm-bubble{background:#fff;border-radius:16px 16px 16px 4px;padding:10px 13px;font-size:12px;line-height:1.6;color:var(--ink);word-break:keep-all;box-shadow:0 2px 8px rgba(0,0,0,.07)}
.ridm-bubble .em{color:var(--accent-d);font-weight:700}
/* 더보기 점 (읽음 표시 흉내) */
.ridm-msg-dots{display:flex;flex-direction:column;justify-content:flex-end;gap:2px;padding-bottom:3px}
.ridm-dot{width:4px;height:4px;border-radius:50%;background:var(--line)}
/* 인풋바 크롬 */
.ridm-inputbar{background:var(--paper);border-top:1px solid var(--line);padding:9px 12px;display:flex;align-items:center;gap:8px}
.ridm-input-cam,.ridm-input-mic{width:22px;height:22px;flex-shrink:0;color:var(--muted)}
.ridm-input-cam svg,.ridm-input-mic svg{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.ridm-input-field{flex:1;background:rgba(0,0,0,.05);border-radius:999px;padding:7px 12px;font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:var(--font-body)}
.ridm-input-send{width:22px;height:22px;flex-shrink:0;color:var(--accent)}
.ridm-input-send svg{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.ridm-input-heart{width:22px;height:22px;flex-shrink:0;color:#ef4444}
.ridm-input-heart svg{fill:currentColor;stroke:none}
/* 하단 홈 인디케이터 */
.ridm-homeind{height:20px;display:flex;align-items:center;justify-content:center;background:var(--paper)}
.ridm-homeind-bar{width:80px;height:4px;border-radius:999px;background:rgba(0,0,0,.14)}
`,
  render: (d, { esc, richSafe, icon }) => {
    const rating = d.rating ?? 5
    const stars = Array.from({ length: 5 }, (_, i) =>
      i < rating
        ? `<span class="ridm-star"><svg viewBox="0 0 24 24"><path d="M12 2l2.7 8.3H23l-7 5.1 2.7 8.3-7-5.1-7 5.1 2.7-8.3-7-5.1h8.3z"/></svg></span>`
        : `<span class="ridm-star" style="opacity:.22"><svg viewBox="0 0 24 24"><path d="M12 2l2.7 8.3H23l-7 5.1 2.7 8.3-7-5.1-7 5.1 2.7-8.3-7-5.1h8.3z"/></svg></span>`,
    ).join('')

    const avatarSm = d.dmSenderAvatar
      ? `<img src="${esc(d.dmSenderAvatar)}" alt="${esc(d.dmSenderName ?? '발신자')}" class="ridm-msg-avatar"><img>`
      : `<div class="ridm-msg-avatar"><div class="ridm-avatar-ph"></div></div>`

    const messages = d.messages
      .map(
        (m) => `
    <div class="ridm-msg">
      ${
        d.dmSenderAvatar
          ? `<div class="ridm-msg-avatar"><img src="${esc(d.dmSenderAvatar)}" alt="${esc(d.dmSenderName ?? '')}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;display:block"></div>`
          : `<div class="ridm-msg-avatar"><div class="ridm-avatar-ph"></div></div>`
      }
      <div class="ridm-bubble-wrap">
        ${m.reviewer ? `<div class="ridm-reviewer">${esc(m.reviewer)}</div>` : ''}
        <div class="ridm-bubble">${richSafe(m.text)}</div>
      </div>
      <div class="ridm-msg-dots"><div class="ridm-dot"></div><div class="ridm-dot"></div></div>
    </div>`,
      )
      .join('')

    // DM 헤더 아바타
    const dmAvatar = d.dmSenderAvatar
      ? `<img src="${esc(d.dmSenderAvatar)}" alt="${esc(d.dmSenderName ?? '발신자')}" class="ridm-avatar">`
      : `<div class="ridm-avatar ph"></div>`

    const placeholder = esc(d.inputPlaceholder ?? '제품의 특성을 입력해주세요!')

    return `
<section class="ridm">
  ${media(d.bgImage, 'ridm-bg', '배경 이미지')}
  <div class="ridm-inner">
    ${d.eyebrow ? `<p class="ridm-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <div class="ridm-stars">${stars}</div>
    <h2 class="ridm-title">${richSafe(d.title)}</h2>

    <!-- 폰 목업 -->
    <div class="ridm-phone">

      <!-- 상태바 -->
      <div class="ridm-statusbar">
        <span class="ridm-statusbar-time">9:41</span>
        <div class="ridm-statusbar-icons">
          <!-- 신호 -->
          <svg viewBox="0 0 16 16"><rect x="1" y="10" width="2.2" height="4" rx=".5"/><rect x="4.6" y="7.5" width="2.2" height="6.5" rx=".5"/><rect x="8.2" y="5" width="2.2" height="9" rx=".5"/><rect x="11.8" y="2" width="2.2" height="12" rx=".5"/></svg>
          <!-- 와이파이 -->
          <svg viewBox="0 0 16 16" style="fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linecap:round"><path d="M2 7a9 9 0 0 1 12 0M4.5 9.5a5.5 5.5 0 0 1 7 0M7 12a2 2 0 0 1 2 0"/><circle cx="8" cy="14" r=".7" fill="var(--ink)"/></svg>
          <!-- 배터리 -->
          <svg viewBox="0 0 20 12" style="fill:none;stroke:var(--ink);stroke-width:1.4"><rect x="1" y="1.5" width="15" height="9" rx="2.2"/><path d="M17.5 4.5v3" stroke-width="2.2" stroke-linecap="round"/><rect x="2.5" y="3" width="10" height="6" rx="1" fill="var(--ink)" stroke="none"/></svg>
        </div>
      </div>

      <!-- DM 헤더 바 -->
      <div class="ridm-dmbar">
        <div class="ridm-dmbar-back">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M15 18l-6-6 6-6"/></svg>
        </div>
        <div class="ridm-avatar-wrap">
          ${dmAvatar}
          <div class="ridm-avatar-online"></div>
        </div>
        <div class="ridm-dmbar-info">
          <div class="ridm-dmbar-name">${esc(d.dmSenderName ?? '상호명을 입력하세요')}</div>
          <div class="ridm-dmbar-status">활성화 상태</div>
        </div>
        <div class="ridm-dmbar-actions">
          <!-- 전화 아이콘 -->
          <svg viewBox="0 0 24 24"><path d="M5.5 5.5c-.5 2 0 5 3.5 8.5s6.5 4 8.5 3.5l2-3.5-3-2-1.5 1.5c-1-.5-3-2-4-4l1.5-1.5-2-3z"/></svg>
          <!-- 영상통화 아이콘 -->
          <svg viewBox="0 0 24 24"><path d="M16 10l4-2.5v9L16 14"/><rect x="4" y="7" width="12" height="10" rx="2"/></svg>
          <!-- ... 아이콘 -->
          <svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5" fill="var(--ink)" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="var(--ink)" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="var(--ink)" stroke="none"/></svg>
        </div>
      </div>

      <!-- DM 스레드 -->
      <div class="ridm-thread">
        ${messages}
      </div>

      <!-- 인풋바 크롬 -->
      <div class="ridm-inputbar">
        <div class="ridm-input-cam">
          <svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.4"/><path d="M8.5 7l1.3-2.5h4.4L15.5 7"/></svg>
        </div>
        <div class="ridm-input-mic">
          <svg viewBox="0 0 24 24"><path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 19v3"/></svg>
        </div>
        <div class="ridm-input-field">${placeholder}</div>
        <div class="ridm-input-send">
          <svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/></svg>
        </div>
        <div class="ridm-input-heart">
          <svg viewBox="0 0 24 24"><path d="M12 21C12 21 4 15.5 4 9.5A4 4 0 0 1 12 8a4 4 0 0 1 8 1.5C20 15.5 12 21 12 21z"/></svg>
        </div>
      </div>

      <!-- 홈 인디케이터 -->
      <div class="ridm-homeind"><div class="ridm-homeind-bar"></div></div>
    </div>
  </div>
</section>`
  },
})
