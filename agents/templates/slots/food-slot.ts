/**
 * 식품 카테고리 슬롯형 상세페이지 템플릿 (파라메트릭, 프로덕션).
 * 두브로 그래놀라급 9섹션 구조 + 공유 디자인 토큰(브랜드컬러 변수화).
 * renderFoodDetail(data) → 완성 HTML 문자열. 에이전트(slot-filler)가 슬롯만 채우면 됨.
 *
 * 섹션: HERO · INTRO · INGREDIENT_DIAGRAM · CHECK_POINT · HOW_TO_EAT · WHEN_TO_EAT · SPEC · TRUST · LINEUP · CTA
 *
 * - 카피 슬롯(foodCopySchema): LLM이 채움 (이미지/토큰 제외)
 * - 이미지/토큰: 파이프라인이 누끼/스타일링샷/브랜드색에서 주입 (없으면 브랜드 그라데이션 폴백)
 */
import { z } from 'zod'

export interface FoodTokens {
  primary: string // 메인(딥 브라운/브랜드)
  accent: string // 포인트(레드/오렌지)
  cream: string // 따뜻한 배경
  ink: string // 본문 텍스트
}

export interface FoodDetailData {
  brand: string
  product: string
  usp: string // 히어로 한 줄 가치제안
  badge?: string // 우상단 뱃지 (예: "11번가 단독")
  heroEyebrow?: string // 히어로 영문 eyebrow
  pills: string[] // 히어로 칩 3~4
  intro: { headline: string; body: string }
  ingredientsTitle?: string
  ingredients: { name: string; desc?: string }[] // 6~9개
  ingredientsNote?: string
  checkpoints: { title: string; desc: string }[] // 3~4개
  howToEat: { title: string; desc: string }[] // 2~3개
  whenToEat: { title: string; desc: string }[] // 3개
  spec: { k: string; v: string }[]
  trust: {
    score?: string
    count?: string
    certs?: string[]
    reviews?: { who: string; stars: string; text: string; tag?: string }[]
  }
  lineup: { name: string; tag?: string }[] // 3~4개
  cta: { eyebrow?: string; headline: string; sub?: string; button: string; note?: string }
  images: {
    hero: string
    ingredient?: string
    sensory?: string // 풀블리드 감각 컷(단면 등)
    howToEat?: string[] // 먹는법 사진들
    whenToEat?: string
    lineup?: string[]
  }
  tokens?: Partial<FoodTokens>
}

// ── zod 스키마 ────────────────────────────────────────────────
// 카피 슬롯만 (slot-filler LLM 출력 계약). 이미지/토큰은 파이프라인이 주입.
export const foodCopySchema = z.object({
  brand: z.string().min(1),
  product: z.string().min(1),
  usp: z.string().min(1),
  badge: z.string().optional(),
  heroEyebrow: z.string().optional(),
  pills: z.array(z.string().min(1)).min(3).max(5),
  intro: z.object({ headline: z.string().min(1), body: z.string().min(1) }),
  ingredientsTitle: z.string().optional(),
  ingredients: z.array(z.object({ name: z.string().min(1), desc: z.string().optional() })).min(4).max(9),
  ingredientsNote: z.string().optional(),
  checkpoints: z.array(z.object({ title: z.string().min(1), desc: z.string().min(1) })).min(3).max(4),
  howToEat: z.array(z.object({ title: z.string().min(1), desc: z.string().min(1) })).min(2).max(3),
  whenToEat: z.array(z.object({ title: z.string().min(1), desc: z.string().min(1) })).min(2).max(3),
  spec: z.array(z.object({ k: z.string().min(1), v: z.string().min(1) })).min(3),
  trust: z.object({
    score: z.string().optional(),
    count: z.string().optional(),
    certs: z.array(z.string()).optional(),
    reviews: z
      .array(
        z.object({
          who: z.string().min(1),
          stars: z.string().min(1),
          text: z.string().min(1),
          tag: z.string().optional(),
        }),
      )
      .optional(),
  }),
  lineup: z.array(z.object({ name: z.string().min(1), tag: z.string().optional() })).min(2).max(4),
  cta: z.object({
    eyebrow: z.string().optional(),
    headline: z.string().min(1),
    sub: z.string().optional(),
    button: z.string().min(1),
    note: z.string().optional(),
  }),
})

export type FoodCopyData = z.infer<typeof foodCopySchema>

const tokensSchema = z.object({
  primary: z.string(),
  accent: z.string(),
  cream: z.string(),
  ink: z.string(),
})

// 렌더 입력 전체 (카피 + 이미지 + 토큰). 이미지는 없을 수 있음(폴백).
export const foodDetailSchema = foodCopySchema.extend({
  images: z
    .object({
      hero: z.string().optional(),
      ingredient: z.string().optional(),
      sensory: z.string().optional(),
      howToEat: z.array(z.string()).optional(),
      whenToEat: z.string().optional(),
      lineup: z.array(z.string()).optional(),
    })
    .optional(),
  tokens: tokensSchema.partial().optional(),
})

const DEFAULT_TOKENS: FoodTokens = {
  primary: '#5C4A32',
  accent: '#C0392B',
  cream: '#F8F3EC',
  ink: '#211C19',
}

const esc = (s: string): string => (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function head(t: FoodTokens, title: string): string {
  return `<!DOCTYPE html><html lang="ko"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css">
<style>
  :root{
    --primary:${t.primary}; --accent:${t.accent}; --cream:${t.cream}; --ink:${t.ink};
    --ink-2:#4A413B; --ink-3:#8A7F76; --line:#ECE3D8; --line2:#E0D5C7;
    --deep:#1B1512; --gold:#C9A45C; --soft:#F4E9DA;
    --maxw:860px; --pad:48px;
  }
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Pretendard',-apple-system,'Apple SD Gothic Neo',sans-serif;color:var(--ink);background:#fff;width:var(--maxw);margin:0 auto;line-height:1.7;letter-spacing:-0.01em;-webkit-font-smoothing:antialiased}
  img{display:block;max-width:100%}
  .sec{padding:96px var(--pad);position:relative}
  .sec--cream{background:var(--cream)}
  .sec--tight{padding-top:72px;padding-bottom:72px}
  .eyebrow{font-size:12px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:var(--accent);margin-bottom:16px;display:block}
  .h2{font-size:32px;font-weight:800;line-height:1.34;letter-spacing:-0.03em}
  .h2 .em{color:var(--accent)}
  .lead{font-size:16px;color:var(--ink-2);line-height:1.9}
  /* HERO */
  .hero{position:relative;height:980px;overflow:hidden;background:linear-gradient(155deg,var(--primary) 0%,var(--deep) 85%)}
  .lu__ph{width:100%;height:200px;background:linear-gradient(135deg,var(--soft),var(--line2));display:flex;align-items:center;justify-content:center;color:var(--ink-3);font-size:12.5px}
  .hero__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .hero__scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,12,8,.40) 0%,rgba(18,12,8,.05) 30%,rgba(18,12,8,.18) 58%,rgba(18,12,8,.86) 100%)}
  .hero__top{position:absolute;top:44px;left:var(--pad);right:var(--pad);display:flex;justify-content:space-between;align-items:center}
  .hero__brand{color:#fff;font-size:20px;font-weight:800;letter-spacing:.04em}
  .hero__badge{color:#fff;font-size:12px;font-weight:600;border:1px solid rgba(255,255,255,.55);border-radius:999px;padding:7px 15px}
  .hero__body{position:absolute;left:var(--pad);right:var(--pad);bottom:84px}
  .hero__eyebrow{color:var(--gold);font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;margin-bottom:18px;display:block}
  .hero__title{color:#fff;font-size:52px;font-weight:800;line-height:1.22;letter-spacing:-.035em}
  .hero__sub{color:rgba(255,255,255,.9);font-size:18px;font-weight:500;margin-top:20px;line-height:1.7;max-width:620px}
  .hero__pills{margin-top:32px;display:flex;gap:9px;flex-wrap:wrap}
  .pill{color:#fff;font-size:13px;font-weight:600;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:9px 16px}
  /* INTRO */
  .intro{text-align:center}
  .intro__big{font-size:38px;font-weight:800;line-height:1.42;letter-spacing:-.035em}
  .intro__big .em{color:var(--accent)}
  .intro__p{margin:28px auto 0;max-width:560px;font-size:16.5px;color:var(--ink-2);line-height:1.95}
  /* INGREDIENT DIAGRAM */
  .ing__grid{margin-top:36px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .ing__card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:24px 18px;text-align:center}
  .ing__dot{width:46px;height:46px;border-radius:50%;background:var(--soft);margin:0 auto 14px;display:flex;align-items:center;justify-content:center;color:var(--accent);font-weight:800;font-size:15px}
  .ing__name{font-size:15.5px;font-weight:700;margin-bottom:5px}
  .ing__desc{font-size:13px;color:var(--ink-3);line-height:1.6}
  .ing__note{margin-top:22px;text-align:center;font-size:14px;color:var(--ink-3)}
  /* CHECK POINT */
  .cp__grid{margin-top:32px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .cp__card{background:#fff;border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:12px;padding:26px 24px}
  .cp__no{font-size:13px;font-weight:800;color:var(--accent);letter-spacing:.06em;margin-bottom:10px}
  .cp__t{font-size:18px;font-weight:700;margin-bottom:8px}
  .cp__d{font-size:14.5px;color:var(--ink-2);line-height:1.7}
  /* HOW TO EAT (풀블리드 단면) */
  .fb{position:relative;height:760px;overflow:hidden;background:linear-gradient(155deg,var(--primary) 0%,var(--deep) 85%)}
  .fb__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .fb__scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,12,8,.55) 0%,rgba(18,12,8,.12) 40%,rgba(18,12,8,.65) 100%)}
  .fb__body{position:absolute;left:var(--pad);right:var(--pad);bottom:64px}
  .fb__t{color:#fff;font-size:34px;font-weight:800;letter-spacing:-.03em}
  .how__list{margin-top:30px;display:grid;gap:14px}
  .how__card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:26px 26px;display:flex;gap:18px;align-items:flex-start}
  .how__num{width:34px;height:34px;border-radius:50%;background:var(--accent);color:#fff;font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .how__t{font-size:17px;font-weight:700;margin-bottom:5px}
  .how__d{font-size:14.5px;color:var(--ink-2);line-height:1.7}
  /* WHEN TO EAT */
  .when__grid{margin-top:30px;display:grid;gap:14px}
  .when__card{display:flex;gap:18px;align-items:center;background:#fff;border:1px solid var(--line);border-radius:16px;padding:22px 24px}
  .when__no{font-size:22px;font-weight:800;color:var(--accent);width:40px;flex-shrink:0}
  .when__t{font-size:16px;font-weight:700;margin-bottom:3px}
  .when__d{font-size:14px;color:var(--ink-3);line-height:1.6}
  /* SPEC */
  .spec{border-top:2px solid var(--ink)}
  .spec__row{display:grid;grid-template-columns:150px 1fr;border-bottom:1px solid var(--line)}
  .spec__k{padding:18px 8px 18px 4px;font-size:14.5px;font-weight:700;color:var(--ink-2)}
  .spec__v{padding:18px 4px;font-size:14.5px;color:var(--ink);line-height:1.7}
  /* TRUST */
  .tr__head{display:flex;align-items:center;gap:18px;margin-bottom:26px}
  .tr__score{font-size:44px;font-weight:800;line-height:1}
  .tr__stars{color:var(--gold);font-size:18px;letter-spacing:2px}
  .tr__count{font-size:13.5px;color:var(--ink-3);margin-top:4px}
  .tr__certs{display:flex;flex-wrap:wrap;gap:9px;margin-bottom:22px}
  .tr__cert{font-size:13px;font-weight:600;color:var(--primary);background:var(--soft);border-radius:999px;padding:8px 16px}
  .tr__list{display:grid;gap:13px}
  .tr__card{border:1px solid var(--line);border-radius:14px;padding:22px 24px;background:#fff}
  .tr__top{display:flex;justify-content:space-between;margin-bottom:9px}
  .tr__who{font-size:14px;font-weight:700;color:var(--ink-2)}
  .tr__rs{color:var(--gold);font-size:13px;letter-spacing:1px}
  .tr__txt{font-size:14.5px;color:var(--ink-2);line-height:1.7}
  .tr__tag{display:inline-block;margin-top:11px;font-size:12px;color:var(--accent);background:var(--soft);border-radius:6px;padding:4px 10px}
  /* LINEUP */
  .lu__grid{margin-top:30px;display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
  .lu__card{background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden}
  .lu__img{width:100%;height:200px;object-fit:cover;background:var(--soft)}
  .lu__body{padding:18px 20px}
  .lu__tag{font-size:11px;font-weight:700;color:var(--accent);letter-spacing:.04em}
  .lu__name{font-size:16px;font-weight:700;margin-top:5px}
  /* CTA */
  .cta{background:var(--deep);text-align:center;padding:92px var(--pad)}
  .cta__eyebrow{color:var(--gold);font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;margin-bottom:18px;display:block}
  .cta__t{color:#fff;font-size:34px;font-weight:800;line-height:1.4;letter-spacing:-.03em}
  .cta__p{color:rgba(255,255,255,.72);font-size:16px;margin-top:16px}
  .cta__btn{display:inline-block;margin-top:34px;background:var(--accent);color:#fff;font-size:17px;font-weight:700;padding:18px 52px;border-radius:999px}
  .cta__note{color:rgba(255,255,255,.5);font-size:12.5px;margin-top:16px}
  .photo{border-radius:18px;overflow:hidden;box-shadow:0 24px 60px -28px rgba(33,24,16,.5)}
  .photo img{width:100%;height:520px;object-fit:cover}
</style></head><body>`
}

export function renderFoodDetail(d: FoodDetailData): string {
  const t: FoodTokens = { ...DEFAULT_TOKENS, ...(d.tokens ?? {}) }
  const img = d.images ?? { hero: '' }
  const P = (s?: string): string => esc(s ?? '')

  // HERO
  const hero = `
  <header class="hero">
    ${img.hero ? `<img class="hero__img" src="${P(img.hero)}" alt="${P(d.product)}">` : ''}
    <div class="hero__scrim"></div>
    <div class="hero__top"><div class="hero__brand">${P(d.brand)}</div>${d.badge ? `<div class="hero__badge">${P(d.badge)}</div>` : ''}</div>
    <div class="hero__body">
      ${d.heroEyebrow ? `<span class="hero__eyebrow">${P(d.heroEyebrow)}</span>` : ''}
      <h1 class="hero__title">${P(d.product)}</h1>
      <p class="hero__sub">${P(d.usp)}</p>
      <div class="hero__pills">${d.pills.map((p) => `<span class="pill">${P(p)}</span>`).join('')}</div>
    </div>
  </header>`

  // INTRO
  const intro = `
  <section class="sec intro">
    <span class="eyebrow">Why ${P(d.brand)}</span>
    <p class="intro__big">${d.intro.headline}</p>
    <p class="intro__p">${P(d.intro.body)}</p>
  </section>`

  // INGREDIENT DIAGRAM
  const ing = `
  <section class="sec sec--cream">
    <span class="eyebrow">Ingredients</span>
    <h2 class="h2">${P(d.ingredientsTitle ?? '원재료 안내')}</h2>
    <div class="ing__grid">
      ${d.ingredients.map((x, i) => `<div class="ing__card"><div class="ing__dot">${i + 1}</div><div class="ing__name">${P(x.name)}</div>${x.desc ? `<div class="ing__desc">${P(x.desc)}</div>` : ''}</div>`).join('')}
    </div>
    ${d.ingredientsNote ? `<p class="ing__note">${P(d.ingredientsNote)}</p>` : ''}
  </section>`

  // CHECK POINT
  const cp = `
  <section class="sec">
    <span class="eyebrow">Check Point</span>
    <h2 class="h2">이런 점이 다릅니다</h2>
    <div class="cp__grid">
      ${d.checkpoints.map((c, i) => `<div class="cp__card"><div class="cp__no">POINT ${i + 1}</div><div class="cp__t">${P(c.title)}</div><div class="cp__d">${P(c.desc)}</div></div>`).join('')}
    </div>
  </section>`

  // HOW TO EAT (풀블리드 단면 + 스텝)
  const how = `
  <section class="fb">
    ${img.sensory || img.hero ? `<img class="fb__img" src="${P(img.sensory ?? img.hero)}" alt="${P(d.product)}">` : ''}
    <div class="fb__scrim"></div>
    <div class="fb__body"><h2 class="fb__t">HOW TO EAT<br>이렇게 즐기세요</h2></div>
  </section>
  <section class="sec sec--cream sec--tight">
    <div class="how__list">
      ${d.howToEat.map((h, i) => `<div class="how__card"><div class="how__num">${i + 1}</div><div><div class="how__t">${P(h.title)}</div><div class="how__d">${P(h.desc)}</div></div></div>`).join('')}
    </div>
  </section>`

  // WHEN TO EAT
  const when = `
  <section class="sec">
    <span class="eyebrow">When to Eat</span>
    <h2 class="h2">${P('언제 즐기면 좋을까요?')}</h2>
    <div class="when__grid">
      ${d.whenToEat.map((w, i) => `<div class="when__card"><div class="when__no">0${i + 1}</div><div><div class="when__t">${P(w.title)}</div><div class="when__d">${P(w.desc)}</div></div></div>`).join('')}
    </div>
  </section>`

  // SPEC
  const spec = `
  <section class="sec sec--cream">
    <span class="eyebrow">Product Info</span>
    <h2 class="h2" style="margin-bottom:30px">상세 정보</h2>
    <div class="spec">${d.spec.map((s) => `<div class="spec__row"><div class="spec__k">${P(s.k)}</div><div class="spec__v">${P(s.v)}</div></div>`).join('')}</div>
  </section>`

  // TRUST
  const trust = `
  <section class="sec">
    <span class="eyebrow">Reviews & Trust</span>
    <h2 class="h2" style="margin-bottom:24px">믿고 드셔도 됩니다</h2>
    ${d.trust.score || d.trust.count ? `<div class="tr__head"><div class="tr__score">${P(d.trust.score ?? '')}</div><div><div class="tr__stars">★★★★★</div><div class="tr__count">${P(d.trust.count ?? '')}</div></div></div>` : ''}
    ${d.trust.certs && d.trust.certs.length ? `<div class="tr__certs">${d.trust.certs.map((c) => `<span class="tr__cert">${P(c)}</span>`).join('')}</div>` : ''}
    ${d.trust.reviews && d.trust.reviews.length ? `<div class="tr__list">${d.trust.reviews.map((r) => `<div class="tr__card"><div class="tr__top"><span class="tr__who">${P(r.who)}</span><span class="tr__rs">${P(r.stars)}</span></div><div class="tr__txt">${P(r.text)}</div>${r.tag ? `<span class="tr__tag">${P(r.tag)}</span>` : ''}</div>`).join('')}</div>` : ''}
  </section>`

  // LINEUP
  const lineup = `
  <section class="sec sec--cream">
    <span class="eyebrow">${P(d.brand)} Friends</span>
    <h2 class="h2">제품 라인업</h2>
    <div class="lu__grid">
      ${d.lineup.map((l, i) => `<div class="lu__card">${img.lineup?.[i] || img.hero ? `<img class="lu__img" src="${P(img.lineup?.[i] ?? img.hero)}" alt="${P(l.name)}">` : `<div class="lu__ph">제품 이미지</div>`}<div class="lu__body">${l.tag ? `<div class="lu__tag">${P(l.tag)}</div>` : ''}<div class="lu__name">${P(l.name)}</div></div></div>`).join('')}
    </div>
  </section>`

  // CTA
  const cta = `
  <section class="cta">
    ${d.cta.eyebrow ? `<span class="cta__eyebrow">${P(d.cta.eyebrow)}</span>` : ''}
    <p class="cta__t">${d.cta.headline}</p>
    ${d.cta.sub ? `<p class="cta__p">${P(d.cta.sub)}</p>` : ''}
    <div class="cta__btn">${P(d.cta.button)}</div>
    ${d.cta.note ? `<p class="cta__note">${P(d.cta.note)}</p>` : ''}
  </section>`

  return (
    head(t, `${d.brand} ${d.product}`) +
    hero +
    intro +
    ing +
    cp +
    how +
    when +
    spec +
    trust +
    lineup +
    cta +
    `</body></html>`
  )
}
