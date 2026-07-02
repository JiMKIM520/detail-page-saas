/** RECOMMEND 아키타입: recommend-persona-list-annotated.
 *  [끝판왕] 리뷰·추천 #4 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 손글씨 아이브로우 + 볼드 대제목 + 구분선 + 라벨 +
 *  [핼프톤 아바타 실루엣 | 소제목에 오렌지 손그림 원형/밑줄 어노테이션 + 설명] 수직 반복.
 *  "이런 분에게 추천" 타겟 페르소나 열거형 — 다른 recommend/review 변형에 없는 고유 모티프. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/* ── 오렌지 손그림 어노테이션 SVG 생성 헬퍼 ────────────────────────────── */

/** 손그림 타원 — 키워드를 둘러싸는 불규칙 원형 stroke. cx/cy는 relative em 기준. */
function ovalAnnotation(id: string): string {
  // 노이즈를 준 타원 path — 자연스러운 손그림 느낌
  return `<svg class="rpla-annot rpla-oval" aria-hidden="true" id="${id}" viewBox="0 0 120 38" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M8 24 C6 14 20 4 50 3 C80 2 116 8 118 18 C120 28 104 36 64 37 C24 38 6 32 8 24 Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke-dasharray="none"/></svg>`
}

/** 손그림 밑줄 — 키워드 아래 불규칙 웨이브 선. */
function underlineAnnotation(id: string): string {
  return `<svg class="rpla-annot rpla-uline" aria-hidden="true" id="${id}" viewBox="0 0 110 12" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M2 6 C20 2 40 10 60 5 C80 0 100 8 108 5" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`
}

/* ── 어노테이션 타입 ────────────────────────────────────────────────── */
const AnnotationType = z.enum(['oval', 'underline', 'none'])

/* ── 스키마 ─────────────────────────────────────────────────────────── */
const schema = z.object({
  /** 손글씨 아이브로우 (짧은 서술, em 허용) */
  eyebrow: z.string().min(1).optional(),
  /** 대제목 (em 허용 — 일부 어절 accent 강조 가능) */
  title: z.string().min(1),
  /** 서브 라벨 ("이런 분들이 해당됩니다" 계열) */
  label: z.string().min(1).optional(),
  /** 페르소나 항목 (3~6개) */
  items: z
    .array(
      z.object({
        /** 아바타 이미지 URL (없으면 핼프톤 실루엣 아이콘 자동 렌더) */
        avatar: z.string().optional(),
        /** 소제목 — 반드시 annotatedKeyword 포함 권장 (em 허용) */
        heading: z.string().min(1),
        /** 어노테이션할 핵심 키워드 (heading 내 일치 문자열). 없으면 어노테이션 미렌더. */
        annotatedKeyword: z.string().optional(),
        /** 어노테이션 종류: oval(원형), underline(밑줄), none */
        annotationType: AnnotationType.optional(),
        /** 설명 본문 (em, br 허용) */
        body: z.string().optional(),
      }),
    )
    .min(3)
    .max(6),
})
type Data = z.infer<typeof schema>

/* ── 블록 정의 ───────────────────────────────────────────────────────── */
export const recommendPersonaListAnnotated = defineBlock<Data>({
  id: 'recommend-persona-list-annotated',
  archetype: 'recommend',
  styleTags: ['warm', 'handdrawn', 'persona', 'annotated', 'template'],
  imageSlots: 0,
  describe:
    '추천 타겟 페르소나 리스트. 손글씨 아이브로우 + 볼드 대제목 + 구분선 + 라벨 + [핼프톤 아바타 | 소제목 키워드에 오렌지 손그림 원형/밑줄 어노테이션 + 설명] 수직 반복(3~6개). 오렌지 어노테이션이 고유 시그니처.',
  schema,
  css: `
/* recommend-persona-list-annotated — 접두사 rpla- */
.rpla{background:var(--paper);padding:56px 48px 68px;word-break:keep-all;overflow-wrap:break-word}

/* ── 헤더 ── */
.rpla-eyebrow{font-family:var(--font-hand);font-size:22px;color:var(--muted);text-align:center;line-height:1.4;margin-bottom:6px}
.rpla-eyebrow .em{color:var(--accent-d)}
.rpla-title{font-family:var(--font-display);font-weight:800;font-size:clamp(30px,6vw,44px);color:var(--ink);letter-spacing:-.025em;line-height:1.2;text-align:center}
.rpla-title .em{color:var(--accent-d)}
.rpla-div{width:100%;height:1.5px;background:var(--line);margin:28px 0 22px;border:none}
.rpla-label{font-size:14px;font-weight:600;color:var(--muted);margin-bottom:32px;letter-spacing:.02em}

/* ── 페르소나 항목 ── */
.rpla-list{display:flex;flex-direction:column;gap:0}
.rpla-item{display:flex;align-items:flex-start;gap:28px;padding:28px 0;border-bottom:1px solid var(--line)}
.rpla-item:last-child{border-bottom:none;padding-bottom:0}
.rpla-item:first-child{padding-top:0}

/* ── 아바타 ── */
.rpla-avatar{flex:0 0 80px;width:80px;height:80px;object-fit:cover;border-radius:50%;display:block}
.rpla-avatar.ph{flex:0 0 80px;width:80px;height:80px;background:none;border:none;display:flex;align-items:center;justify-content:center}
/* 핼프톤 실루엣 SVG — placeholder 대용 */
.rpla-silhouette{width:80px;height:80px;color:#C0BFBC;opacity:.85}

/* ── 텍스트 영역 ── */
.rpla-text{flex:1;min-width:0}

/* ── 소제목 + 어노테이션 래퍼 ── */
.rpla-heading-wrap{position:relative;display:inline-block;margin-bottom:10px;line-height:1.45}
.rpla-heading{font-family:var(--font-display);font-weight:800;font-size:clamp(17px,3.8vw,21px);color:var(--ink);letter-spacing:-.01em;line-height:1.45}
.rpla-heading .em{color:var(--accent-d)}

/* ── 어노테이션 공통 ── */
.rpla-kw-wrap{position:relative;display:inline-block}
.rpla-annot{position:absolute;pointer-events:none;color:#E87722}

/* 타원 — 키워드를 감싸는 타원형 */
.rpla-oval{
  top:50%;left:50%;
  transform:translate(-50%,-52%);
  width:calc(100% + 20px);
  height:calc(100% + 14px);
}

/* 밑줄 — 키워드 아래 */
.rpla-uline{
  bottom:-4px;left:-2px;
  width:calc(100% + 4px);
  height:10px;
}

/* ── 본문 ── */
.rpla-body{font-family:var(--font-body);font-size:14px;color:var(--muted);line-height:1.75}
.rpla-body .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    /* 핼프톤 실루엣 — 반투명 점선 SVG 아바타 */
    const silhouette = `<svg class="rpla-silhouette" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <pattern id="rpla-dots" patternUnits="userSpaceOnUse" width="4" height="4">
      <circle cx="1.5" cy="1.5" r="1.2" fill="currentColor"/>
    </pattern>
    <mask id="rpla-persona-mask">
      <!-- 머리 -->
      <ellipse cx="40" cy="24" rx="14" ry="15" fill="white"/>
      <!-- 어깨/몸통 (위쪽 절반만) -->
      <path d="M14 80 C14 58 22 50 40 50 C58 50 66 58 66 80Z" fill="white"/>
    </mask>
  </defs>
  <rect x="0" y="0" width="80" height="80" fill="url(#rpla-dots)" mask="url(#rpla-persona-mask)"/>
</svg>`

    const eyebrowHtml = d.eyebrow
      ? `<p class="rpla-eyebrow">${richSafe(d.eyebrow)}</p>`
      : ''

    const labelHtml = d.label
      ? `<p class="rpla-label">${esc(d.label)}</p>`
      : ''

    const itemsHtml = d.items
      .map((it, idx) => {
        /* 아바타 */
        const avatarHtml = it.avatar
          ? `<img class="rpla-avatar" src="${esc(it.avatar)}" alt="${esc(it.heading)} 아바타">`
          : `<div class="rpla-avatar ph">${silhouette}</div>`

        /* 소제목: annotatedKeyword가 있으면 해당 부분을 래퍼로 감싸고 어노테이션 SVG 삽입 */
        let headingHtml: string
        const kw = it.annotatedKeyword
        const aType = it.annotationType ?? (kw ? 'oval' : 'none')

        if (kw && aType !== 'none' && it.heading.includes(kw)) {
          const svgId = `rpla-an-${idx}`
          const annotSvg = aType === 'underline'
            ? underlineAnnotation(svgId)
            : ovalAnnotation(svgId)

          // heading 내 키워드를 래퍼 span으로 교체 (richSafe 처리 후 DOM 안전하게)
          // 전략: heading 텍스트를 keyword 기준으로 split해 각각 richSafe 적용
          const kwEsc = esc(kw)
          const safeHeading = richSafe(it.heading)
          // richSafe 적용 후 이스케이프된 키워드 위치를 찾아 래퍼 삽입
          const safeKw = kwEsc  // esc()는 &amp;/&lt;/&gt;만 바꾸므로 일반 한글은 동일
          const kwWrapped = `<span class="rpla-kw-wrap">${safeKw}${annotSvg}</span>`
          headingHtml = safeHeading.replace(safeKw, kwWrapped)
        } else {
          headingHtml = richSafe(it.heading)
        }

        const bodyHtml = it.body
          ? `<p class="rpla-body">${richSafe(it.body)}</p>`
          : ''

        return `<div class="rpla-item">
  ${avatarHtml}
  <div class="rpla-text">
    <div class="rpla-heading-wrap">
      <h3 class="rpla-heading">${headingHtml}</h3>
    </div>
    ${bodyHtml}
  </div>
</div>`
      })
      .join('\n')

    return `<section class="rpla">
  ${eyebrowHtml}
  <h2 class="rpla-title">${richSafe(d.title)}</h2>
  <hr class="rpla-div">
  ${labelHtml}
  <div class="rpla-list">
    ${itemsHtml}
  </div>
</section>`
  },
})
