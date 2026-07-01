/** DETAIL 아키타입: detail-point-scroll-stack.
 *  [끝판왕] 내용전개 #7 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 배경(--paper/--bg) + POINT 번호 eyebrow(accent-d) + 소제목 라벨 + 대형 헤드라인 +
 *  2줄 본문 → 풀블리드 이미지 + 이미지 캡션 수직 스택. 항목별 반복 서사 전개형. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 전체 도입 제목(선택). 없으면 첫 POINT가 바로 시작. */
  sectionTitle: z.string().optional(),
  /** POINT 번호 + 헤드라인 + 본문 + 이미지 반복 유닛 (2~5개) */
  items: z
    .array(
      z.object({
        /** 번호 표기 (예: "01", "02"). 생략 시 자동 인덱스로 렌더. */
        pointNo: z.string().optional(),
        /** eyebrow 아래 소카테고리 라벨 (예: "서브텍스트", "특징 소개") */
        subtitle: z.string().optional(),
        /** 대형 헤드라인 (em, br 허용) */
        heading: z.string().min(1),
        /** 본문 설명 (em, br 허용) */
        body: z.string().optional(),
        /** 풀블리드 이미지 URL */
        image: z.string().optional(),
        /** 이미지 하단 캡션 (짧은 보조 설명) */
        imageCaption: z.string().optional(),
        /** 이미지 alt 텍스트 */
        imageAlt: z.string().optional(),
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

export const detailPointScrollStack = defineBlock<Data>({
  id: 'detail-point-scroll-stack',
  archetype: 'detail' as any,
  styleTags: ['light', 'narrative', 'scroll', 'editorial', 'template'],
  imageSlots: 3,
  describe:
    '내용전개(포인트 순차 서사). 밝은 배경 + POINT 번호 eyebrow + 소제목 라벨 + 대형 헤드라인 + 본문 → 풀블리드 이미지 + 캡션 수직 반복 스택(2~5회). 스크롤하며 항목별 전개.',
  schema,
  css: `
/* detail-point-scroll-stack — 접두사 dpss- */
.dpss{background:var(--bg);color:var(--ink);padding:0}

/* 선택적 섹션 도입 타이틀 */
.dpss-section-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,5.5vw,40px);
  line-height:1.2;
  letter-spacing:-.02em;
  color:var(--ink);
  padding:56px 40px 8px;
  text-align:left;
}
.dpss-section-title .em{color:var(--accent-d)}

/* 각 POINT 유닛 */
.dpss-item{margin-bottom:0}

/* 텍스트 블록 */
.dpss-text{
  background:var(--paper);
  padding:48px 40px 40px;
}

/* POINT 번호 eyebrow — 밝은 배경 위이므로 accent-d 사용(저대비 금지) */
.dpss-eyebrow{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-weight:700;
  font-size:14px;
  letter-spacing:.12em;
  text-transform:uppercase;
  color:var(--accent-d);
  margin-bottom:10px;
  line-height:1;
}

/* 소제목 라벨 */
.dpss-subtitle{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-weight:400;
  font-size:14px;
  letter-spacing:.02em;
  color:var(--muted);
  margin-bottom:14px;
  line-height:1.4;
}

/* 대형 헤드라인 */
.dpss-heading{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(32px,7.5vw,52px);
  line-height:1.18;
  letter-spacing:-.025em;
  color:var(--ink);
  margin-bottom:20px;
}
/* 밝은 배경 위 .em — 전역 accent-d 그대로 사용 */
.dpss-heading .em{color:var(--accent-d)}

/* 본문 */
.dpss-body{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:15px;
  line-height:1.8;
  color:var(--muted);
  letter-spacing:-.01em;
}
.dpss-body .em{color:var(--accent-d);font-weight:700}

/* 풀블리드 이미지 래퍼 */
.dpss-img-wrap{
  position:relative;
  background:var(--line);
}

/* 풀블리드 이미지 */
.dpss-img{
  width:100%;
  aspect-ratio:4/3;
  object-fit:cover;
  display:block;
}
.dpss-img.ph{
  width:100%;
  aspect-ratio:4/3;
  border:none;
  background:rgba(0,0,0,.07);
  color:var(--muted);
}

/* 이미지 캡션 */
.dpss-caption{
  background:var(--paper);
  padding:14px 40px 16px;
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:13px;
  line-height:1.6;
  color:var(--muted);
  letter-spacing:.01em;
  text-align:right;
}

/* 항목 구분선 (마지막 항목 제외) */
.dpss-item:not(:last-child) .dpss-caption{
  border-bottom:1px solid var(--line);
  padding-bottom:40px;
  margin-bottom:0;
}
`,
  render: (d, { esc, richSafe }) => {
    const itemsHtml = d.items
      .map((it, i) => {
        const no = it.pointNo ?? String(i + 1).padStart(2, '0')
        return `
    <div class="dpss-item">
      <div class="dpss-text">
        <p class="dpss-eyebrow">POINT <strong>${esc(no)}</strong></p>
        ${it.subtitle ? `<p class="dpss-subtitle">${esc(it.subtitle)}</p>` : ''}
        <h3 class="dpss-heading">${richSafe(it.heading)}</h3>
        ${it.body ? `<p class="dpss-body">${richSafe(it.body)}</p>` : ''}
      </div>
      <div class="dpss-img-wrap">
        ${media(it.image, 'dpss-img', esc(it.imageAlt ?? '제품 이미지'))}
      </div>
      ${it.imageCaption ? `<p class="dpss-caption">${esc(it.imageCaption)}</p>` : ''}
    </div>`
      })
      .join('')

    return `
<section class="dpss">
  ${d.sectionTitle ? `<h2 class="dpss-section-title">${richSafe(d.sectionTitle)}</h2>` : ''}
  ${itemsHtml}
</section>`
  },
})
