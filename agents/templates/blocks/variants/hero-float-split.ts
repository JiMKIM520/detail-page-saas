/** HERO 아키타입: hero-float-split.
 *  피그마 033_pc_전환14 패턴 재구성.
 *  좌·우 전면 이미지를 가르고 중앙에 라운드 흰 패널이 부유하는 플로팅 카드 구조.
 *  형광펜 밑줄 + 소제목 + 대형 헤드라인 + 본문 텍스트 위계. 라이트 톤. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  kicker:  z.string().min(1),           // 형광펜 위 소제목 (em 허용)
  title:   z.string().min(1),           // 대형 헤드라인 (em,br 허용)
  desc:    z.string().optional(),       // 패널 하단 한 줄 본문 텍스트
  imageL:  z.string().optional(),       // 왼쪽 전면 이미지 (url)
  imageR:  z.string().optional(),       // 오른쪽 전면 이미지 (url)
  highlightColor: z.string().optional(), // 형광펜 색 (기본 #fff600, 토큰 권장)
})
type Data = z.infer<typeof schema>

export const heroFloatSplit = defineBlock<Data>({
  id: 'hero-float-split',
  archetype: 'hero',
  // noimg-safe: 이미지 부재 시 배경색 슬랩으로 강등. 패널·텍스트 구조는 유지.
  styleTags: ['light', 'food', 'editorial', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '좌우 전면 사진을 가르고 중앙 라운드 흰 패널이 부유하는 히어로. 형광펜 밑줄 + 소제목 + 대형 제품명 + 본문. 식품/농산물/소비재에 적합. 400px 고정 높이 와이드 배너 형태.',
  schema,
  css: `
.hfs{
  position:relative;
  width:100%;
  height:400px;
  background:var(--bg);
  overflow:hidden;
  display:flex;
  align-items:stretch;
}

/* 좌우 이미지 절반 */
.hfs-img-l,
.hfs-img-r{
  flex:0 0 50%;
  width:50%;
  height:100%;
  position:relative;
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 12%,var(--bg));
}
.hfs-img-l img,
.hfs-img-l .ph,
.hfs-img-r img,
.hfs-img-r .ph{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  border-radius:0;
}

/* noimg 강등: 이미지 없으면 슬랩 배경 */
.hfs-img-l.hfs-noimg{
  background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 18%,var(--bg)) 0%,var(--bg) 100%);
}
.hfs-img-r.hfs-noimg{
  background:linear-gradient(225deg,color-mix(in srgb,var(--accent) 18%,var(--bg)) 0%,var(--bg) 100%);
}

/* 중앙 부유 카드 */
.hfs-card{
  position:absolute;
  top:50%;
  left:50%;
  transform:translate(-50%,-50%);
  width:clamp(320px,38%,658px);
  min-height:200px;
  background:var(--paper,#ffffff);
  border-radius:calc(var(--r-scale,1)*30px);
  box-shadow:0 12px 48px -8px rgba(0,0,0,.22),0 2px 8px -2px rgba(0,0,0,.12);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  padding:32px 40px 30px;
  text-align:center;
  z-index:2;
}

/* 소제목 (형광펜 위) */
.hfs-kicker{
  font-family:var(--font-body);
  font-size:clamp(14px,1.6vw,20px);
  font-weight:600;
  color:var(--ink);
  line-height:1.3;
  margin-bottom:4px;
}
.hfs-kicker .em{color:var(--accent);font-weight:700}

/* 형광펜 밑줄 */
.hfs-hl{
  width:clamp(120px,55%,390px);
  height:clamp(10px,1.2vw,20px);
  border-radius:calc(var(--r-scale,1)*3px);
  margin:0 auto 2px;
  /* highlightColor는 인라인 style로 주입 */
  background:var(--hfs-hl-color,#fff600);
}

/* 대형 헤드라인 */
.hfs-title{
  font-family:var(--font-display);
  font-size:clamp(28px,4.5vw,58px);
  font-weight:800;
  color:var(--ink);
  line-height:1.15;
  letter-spacing:-.01em;
  margin-top:6px;
}
.hfs-title .em{color:var(--accent);font-weight:900}

/* 본문 */
.hfs-desc{
  margin-top:14px;
  font-family:var(--font-body);
  font-size:clamp(13px,1.4vw,17px);
  font-weight:500;
  color:var(--ink-2);
  line-height:1.6;
}
.hfs-desc .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const hlColor = d.highlightColor ?? '#fff600'
    const hasL = typeof d.imageL === 'string' && d.imageL.length > 0
    const hasR = typeof d.imageR === 'string' && d.imageR.length > 0
    return `
<section class="hfs">
  <div class="hfs-img-l${hasL ? '' : ' hfs-noimg'}">${hasL ? media(d.imageL, '', '제품 이미지 왼쪽') : ''}</div>
  <div class="hfs-img-r${hasR ? '' : ' hfs-noimg'}">${hasR ? media(d.imageR, '', '제품 이미지 오른쪽') : ''}</div>
  <div class="hfs-card">
    <p class="hfs-kicker">${richSafe(d.kicker)}</p>
    <div class="hfs-hl" style="--hfs-hl-color:${esc(hlColor)}" aria-hidden="true"></div>
    <h2 class="hfs-title">${richSafe(d.title)}</h2>
    ${d.desc ? `<p class="hfs-desc">${richSafe(d.desc)}</p>` : ''}
  </div>
</section>`
  },
})
