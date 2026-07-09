/** USAGE 아키타입: usage-scene-altcard.
 *  피그마 290_제품특징_25 흡수 — 장소별 사용 씬 4개를 번호 해시태그(#01~#04)·컬러 배경 텍스트 박스·
 *  원형 클립 이미지가 홀수=이미지우/짝수=이미지좌 교번 배치하는 라이트 데스크톱 블록.
 *  헤더 영역: 중앙 아이콘 + 구분선 + 대제목 + 부제목. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const sceneSchema = z.object({
  /** #01 형식 번호 레이블 (생략 시 자동 #NN 생성) */
  tag: z.string().optional(),
  /** 장소명 또는 씬 제목 (em 허용) */
  place: z.string().min(1),
  /** 씬 설명 (em,br 허용) */
  desc: z.string().min(1),
  /** 원형 클립 이미지 URL */
  image: z.string().optional(),
  /** 텍스트 박스 배경 색상 토큰 오버라이드 (hex — 없으면 순환 팔레트 적용) */
  bgColor: z.string().optional(),
})

const schema = z.object({
  /** 섹션 대제목 (em,br 허용) */
  title: z.string().min(1),
  /** 대제목 아래 부제목 (em,br 허용) */
  subtitle: z.string().min(1).optional(),
  /** 헤더 아이콘 이름 (ICON_NAMES 35종) */
  iconName: z.string().optional(),
  /** 장소 씬 카드 (2~4개) */
  scenes: z.array(sceneSchema).min(2).max(4),
})
type Data = z.infer<typeof schema>

/** 번호 태그 자동 생성 — 없으면 #01 형식 */
function autoTag(idx: number): string {
  return `#${String(idx + 1).padStart(2, '0')}.`
}

/** 순환 팔레트 — 피그마 원본 4색 그대로 (순수 hex, 토큰 불가 영역) */
const CYCLE_BG = ['#f6f4e4', '#f9f1e8', '#e8f7fb', '#eefae6']

export const usageSceneAltcard = defineBlock<Data>({
  id: 'usage-scene-altcard',
  archetype: 'usage',
  // noimg-safe: 이미지 전부 미제공 시 원형 프레임 생략 → 텍스트 박스 전폭 강등 렌더
  styleTags: ['light', 'template', 'scene', 'altcard', 'noimg-safe'],
  imageSlots: 4,
  describe:
    '장소별 사용 씬 교번 카드(라이트). 중앙 아이콘·대제목·부제목 헤더 + 홀수=이미지우/짝수=이미지좌 원형 클립 + #NN 번호 해시태그 + 컬러 배경 텍스트 박스. 2~4개 씬. 브리프 근거 시만: bgColor 슬롯.',
  schema,
  css: `
.uigo{background:var(--bg);color:var(--ink);padding:60px 0 72px}

/* ── 헤더 ── */
.uigo-hd{text-align:center;padding:0 var(--pad-x,56px) 0}
.uigo-icon{display:flex;align-items:center;justify-content:center;width:80px;height:80px;margin:0 auto 16px;color:var(--ink)}
.uigo-icon svg{width:80px;height:80px}
.uigo-div{width:400px;max-width:100%;height:1px;background:var(--line,#d9d9d9);margin:0 auto 28px}
.uigo-title{font-family:var(--font-display);font-weight:700;font-size:clamp(36px,5vw,58px);line-height:1.18;color:var(--ink);letter-spacing:-.02em}
.uigo-title .em{color:var(--accent)}
.uigo-subtitle{margin-top:16px;font-family:var(--font-body);font-size:clamp(15px,2vw,22px);font-weight:400;color:var(--ink-2);line-height:1.65}
.uigo-subtitle .em{color:var(--accent);font-weight:600}

/* ── 씬 리스트 ── */
.uigo-list{margin-top:48px;display:flex;flex-direction:column;gap:28px;padding:0 var(--pad-x,56px)}

/* ── 씬 카드 ── */
.uigo-card{display:flex;align-items:center;gap:28px;min-height:360px}
/* 짝수 카드: 이미지 왼쪽 */
.uigo-card.rev{flex-direction:row-reverse}

/* 원형 이미지 프레임 */
.uigo-img-wrap{flex:0 0 calc(55% - 14px);max-width:440px}
.uigo-circle{width:100%;aspect-ratio:1/1;border-radius:50%;overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,transparent);
  /* 시그니처 형태: 완전 원형 — 피그마 r:300 (짧은 변 기준 150px) 재현, 슬롯 크기 대비 항상 50% */
  --shape-photo:50%}
.uigo-circle img,.uigo-circle .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}

/* 텍스트 박스 영역 */
.uigo-text-wrap{flex:1;display:flex;flex-direction:column;gap:0}
.uigo-tag{font-family:var(--font-display);font-weight:700;font-size:clamp(40px,5.5vw,56px);color:var(--ink);letter-spacing:-.01em;line-height:1;margin-bottom:8px}
.uigo-box{padding:24px 28px;border-radius:calc(var(--r-scale,1)*14px)}
.uigo-place{font-family:var(--font-display);font-weight:700;font-size:clamp(22px,3vw,32px);color:var(--ink);line-height:1.2;margin-bottom:10px}
.uigo-place .em{color:var(--accent)}
.uigo-desc{font-family:var(--font-body);font-size:clamp(14px,1.8vw,18px);font-weight:400;color:var(--ink);line-height:1.75}
.uigo-desc .em{color:var(--accent-d,#1a1a1a);font-weight:600}

/* ── noimg-safe 강등: 이미지 전무 시 텍스트 박스 전폭 ── */
.uigo-card.noimg{gap:0}
.uigo-card.noimg .uigo-img-wrap{display:none}
.uigo-card.noimg .uigo-text-wrap{flex:1 1 100%}
.uigo-card.noimg .uigo-tag{font-size:clamp(32px,4vw,44px)}
.uigo-card.noimg .uigo-box{padding:28px 32px}
`,
  render: (d, { esc, richSafe, icon }) => {
    // noimg-safe 가드: 전체 씬에 이미지가 하나도 없으면 원형 프레임 완전 생략
    const withImgs = d.scenes.some((s) => typeof s.image === 'string' && s.image.trim().length > 0)

    const iconHtml = d.iconName
      ? `<div class="uigo-icon">${icon(d.iconName)}</div>`
      : ''

    const cards = d.scenes
      .map((s, i) => {
        const isEven = i % 2 === 1   // 짝수 인덱스(2번째, 4번째) → 이미지 왼쪽
        const tag = s.tag ?? autoTag(i)
        const bg = s.bgColor ?? CYCLE_BG[i % CYCLE_BG.length]
        const noImgClass = !withImgs ? ' noimg' : ''
        const revClass = isEven && withImgs ? ' rev' : ''

        const imgBlock = withImgs
          ? `<div class="uigo-img-wrap">
          <div class="uigo-circle">${media(s.image, '', `${esc(s.place)} 사용 이미지`)}</div>
        </div>`
          : ''

        return `
    <div class="uigo-card${revClass}${noImgClass}">
      ${imgBlock}
      <div class="uigo-text-wrap">
        <div class="uigo-tag">${esc(tag)}</div>
        <div class="uigo-box" style="background:${bg}">
          <p class="uigo-place">${richSafe(s.place)}</p>
          <p class="uigo-desc">${richSafe(s.desc)}</p>
        </div>
      </div>
    </div>`
      })
      .join('')

    return `
<section class="uigo">
  <div class="uigo-hd">
    ${iconHtml}
    <div class="uigo-div"></div>
    <h2 class="uigo-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="uigo-subtitle">${richSafe(d.subtitle)}</p>` : ''}
  </div>
  <div class="uigo-list">
    ${cards}
  </div>
</section>`
  },
})
