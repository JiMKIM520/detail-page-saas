# Codex 테스트 — 소금빵 스타일링샷 + 섹션 배경 생성

> 목적: gpt-image-2로 (1) 스타일링샷 6장 + (2) 섹션별 배경 6장을 생성해 품질/비용/속도 검증.
> 비교 기준: 기존 Gemini 3 Pro Image 결과 (`output/512266a3/3_v5_test_all/` 참고)
> 예상 비용: 12장 × ~$0.17 = **약 $2 (~3,000원)**
> 예상 시간: 5~8분

---

## 입력 자산

### 누끼 (제품 cutout)
```
/Users/jinman/Downloads/상세페이지ai개발/쌀과밀(소금빵)/
  ├─ 누끼_01.png   ← 메인 누끼 (스타일링샷용)
  ├─ 누끼_02.png
  ├─ 누끼_03.png
  └─ 누끼_04.png
```

### 제품 정보
- 제품: 천연발효종 강릉 고메코나 소금빵
- 카테고리: 식품 (베이커리)
- 브랜드 톤: 따뜻한, 정직한, 수제의, 가족적, 아빠마음
- 브랜드 컬러: #F5A623 (앰버), #F8D347 (옐로우), #1A1A1A (다크)

---

## 출력 디렉터리
```
/Users/jinman/Desktop/Projects/products/detail-page-saas/output/512266a3/codex-test/
  ├─ styling/      ← 스타일링샷 6장
  └─ sections/     ← 섹션 배경 6장
```

---

## Task 1 — 스타일링샷 6장 생성

OpenAI gpt-image-2 high quality, size 1024x1536 (portrait), opaque background.
누끼 이미지를 reference로 첨부 (image edit endpoint 사용).

### 공통 절대 규칙 (모든 shot에 prepend)
```
[ABSOLUTE RULES]
- DO NOT redraw, reimagine, or reinterpret the salt bread. Treat the cutout as a fixed object placed into a new scene.
- Preserve original golden-brown crust color, surface salt crystals, pastry layers, oil sheen exactly as in the cutout.
- DO NOT show fillings, cross-sections, or internal layers as separate elements.
- DO NOT add logos, packaging, branding text, or any letters.
- Natural window light only — NO artificial flash, NO studio strobe glare.
- Kodak Portra 400 film grain, slightly grainy, warm color temperature.
- Natural imperfections welcome: bread crumbs, slightly wrinkled linen, asymmetric placement.
- Studio setting ONLY — NO cafes, NO real kitchens, NO outdoor locations.
- Must feel like real food photographer shot, NOT 3D render, NOT AI-generated look.
- Forbidden render words: "perfect", "clean", "symmetrical", "4K", "hyperrealistic".
```

### Shot 01 — 클로즈업 (golden crust)
```
파일명: styling_01_closeup.png
프롬프트:
Single salt bread placed slightly off-center on natural oatmeal-colored raw linen cloth on weathered light oak studio board. Generous negative space at top for headline overlay.
Props: a few scattered coarse sea salt crystals near the bread, small sprig of dried wheat at corner edge.
Lighting: soft north-window daylight from upper-left, gentle falloff, warm 4800K, soft shadow on linen.
Camera: Canon 5D Mark IV, 50mm f/2.8, ISO 200, slight handheld feel, shallow DOF.
Mood: honest, warm, family-bakery quiet morning.
```

### Shot 02 — 오버헤드 아티잔
```
파일명: styling_02_overhead.png
프롬프트:
Three salt breads arranged in triangle composition, top-down 90-degree overhead shot on bright marble surface.
Props: light flour dusting, wooden spoon, small ceramic dish of coarse salt.
Lighting: soft top light, minimized shadow, even bright tone.
Camera: Canon 5D Mark IV, 50mm f/8 deep focus, ISO 200, soft studio strobe equivalent.
Mood: clean bakery workbench, organized abundance.
```

### Shot 03 — 라이프스타일 패밀리
```
파일명: styling_03_lifestyle.png
프롬프트:
Multiple salt breads in woven rattan basket on checkered linen-draped wooden table, three-quarter angle medium shot.
Props: wicker basket lined with kraft paper, folded unbleached parchment, small milk bottle in soft background bokeh.
Lighting: indirect window light from side, gentle shadows, natural 4500K.
Camera: Canon 5D Mark IV, 85mm f/4, Kodak Portra 400 film grain, ISO 320.
Mood: cozy family breakfast table, fatherly warmth.
```

### Shot 04 — 미니멀 제품
```
파일명: styling_04_minimal.png
프롬프트:
Single salt bread in side profile view on matte gray slate plate, minimal composition.
Props: NONE (intentional bareness).
Lighting: single-direction studio light from right, dramatic chiaroscuro shadow.
Camera: Canon 5D Mark IV, 135mm f/5.6, ISO 200, high contrast.
Mood: editorial product portrait emphasizing form.
```

### Shot 05 — 매크로 텍스처
```
파일명: styling_05_macro.png
프롬프트:
Extreme macro shot of bread surface — flaky pastry layers, golden caramelized ridges, salt crystals filling 80% of frame, blurred warm cream backdrop.
Props: a few salt crystals scattered.
Lighting: raking side light from right at low angle to emphasize lamination texture, warm tungsten-tinted highlights.
Camera: Canon 5D Mark IV, 100mm macro f/2.8, ISO 400, very shallow DOF.
Mood: appetizing, tactile, artisan craft detail.
```

### Shot 06 — 패키징
```
파일명: styling_06_packaging.png
프롬프트:
Salt bread arranged with brand-style packaging on warm beige canvas surface.
Props: brown kraft paper, hemp twine, small handwritten-style sticker (NO actual text).
Lighting: soft even overall, warm 4500K, gentle even shadow.
Camera: Canon 5D Mark IV, 50mm f/5.6, natural color, ISO 200.
Mood: gift-wrapped, careful presentation, trustworthy.
```

---

## Task 2 — 섹션별 배경 6장 생성

OpenAI gpt-image-2 high quality, size 1024x1536 (portrait), opaque background.
**누끼 첨부 X** (배경 전용, 제품 없음).

### 공통 절대 규칙 (모든 섹션 배경에 prepend)
```
[ABSOLUTE BACKGROUND POLICY]
This image will be used as CSS background-image. Cards, boxes, and text are rendered as HTML/SVG OVERLAY on top — they are NOT part of this image.

PROHIBITED (image will be REJECTED if present):
✗ Any text, letters, numbers, logos, watermarks, Korean characters
✗ Any rectangles, boxes, cards, panels, frames, badges
✗ Any UI elements (buttons, dividers, lines mimicking dividers)
✗ Any product photography or silhouettes
✗ Sharp geometric shapes that read as "container"

REQUIRED:
✓ Pure decorative atmosphere — texture, gradient, light, organic forms
✓ Soft transitions — no hard edges suggesting layout container
✓ Designed to RECEIVE an HTML card overlay, not compete with it
```

### Section 01 — Hero
```
파일명: hero_bg.png
Safe zone: bottom 35% must be calm for headline overlay
프롬프트:
Editorial Korean bakery hero background — warm cream linen surface fading to deeper toasted-beige at top, soft golden bokeh sparkle in upper third suggesting morning sunlight through bakery window, subtle visible weave texture, very calm bottom 35% as flat sandstone tone for headline placement, no text, no product, no boxes. Magazine-quality editorial photography aesthetic, Kodak Portra subtle grain. 860x900 vertical.
```

### Section 02 — Brand Story
```
파일명: brand_story_bg.png
Safe zone: center 60% must be visually calm for glass card overlay
프롬프트:
Deep dark editorial backdrop — aged walnut wood grain texture transitioning to near-black velvety shadow at edges, single warm tungsten glow from upper-left at low angle creating soft amber halo center, deep velvety shadows. Center 60% area (vertical 20%-80%) intentionally calm and flat for HTML glass card overlay placement. No text, no product, no frame. Cinematic intimate evening bakery mood. 860x900 vertical.
```

### Section 03 — Ingredients
```
파일명: ingredients_bg.png
Safe zone: left 45% must be calm for side card overlay
프롬프트:
Warm raw linen fabric texture filling right 55% of frame with fine scattered flour dust catching soft daylight, subtle organic shadow rhythm, left 45% (horizontal 0%-45%) calm flat sandstone-beige area reserved for HTML card overlay. Soft directional daylight from upper-right. No text, no product, no boxes. Natural authentic feel, warm 4500K. 860x900 vertical.
```

### Section 04 — Sensory (full-bleed)
```
파일명: sensory_bg.png
Safe zone: full-bleed (text overlays directly, gentle vignette)
프롬프트:
Cinematic atmospheric full-bleed backdrop — warm steam haze drifting across deep amber gradient, golden crust glow effect with subtle macro lamination hint (NO actual product), raking dramatic side light from low-left creating warm specular highlights and deep velvet shadow on right. Atmospheric mist with film-like quality. No text, no product silhouettes, no boxes. Premium food magazine immersive sensory mood. 860x600 landscape.
```

### Section 05 — Packaging
```
파일명: packaging_bg.png
Safe zone: right 50% must be calm for split card overlay
프롬프트:
Clean studio backdrop — premium kraft paper and hemp twine fiber close-up texture filling left 50%, transitioning to flat warm-cream studio paper on right 50% (calm zone for HTML card with product info). Neutral overhead morning daylight, even and trustworthy. No text, no product, no boxes. Minimalist premium packaging atmosphere. 860x900 vertical.
```

### Section 06 — CTA
```
파일명: cta_bg.png
Safe zone: bottom 40% must be calm for CTA button overlay
프롬프트:
Conversion-focused dramatic backdrop — rich amber-orange to deep warm-bronze radial glow on dark warm base, soft golden particle haze drifting upward, deepening shadow at corners. Bottom 40% area calm and slightly darker for HTML button overlay placement. Premium confident purchase mood, no pushy. No text, no product, no buttons, no boxes. 860x900 vertical.
```

---

## 검증 기준

각 이미지 생성 후 다음 체크:

### 스타일링샷 (Task 1)
- [ ] 누끼의 빵 형태/색상이 정확히 보존됨 (재해석 X)
- [ ] 텍스트/로고/패키징 글자 없음
- [ ] AI-generated 느낌 없음 (실사진 톤)
- [ ] Kodak Portra 그레인 보임

### 섹션 배경 (Task 2)
- [ ] 텍스트/숫자/한글 0건
- [ ] 박스/프레임/사각형 0건
- [ ] 제품 silhouette 0건
- [ ] safe zone (지정 영역)이 명확히 calm함
- [ ] 6 섹션 모두 톤이 명확히 다름

### 비용/속도
- [ ] 12장 총 비용 < $3
- [ ] 총 시간 < 10분

---

## 결과 비교 보고서 형식

```markdown
## Codex 테스트 결과 (소금빵)

### 스타일링샷
| # | 파일 | 누끼 보존 | 텍스트 없음 | 톤 일치 | 종합 |
|---|------|---------|----------|--------|------|
| 1 | closeup | ✓/✗ | ✓/✗ | ✓/✗ | A/B/C |
| ... |

### 섹션 배경
| # | 파일 | safe zone | 단조롭지 않음 | 톤 차별화 | 종합 |
|---|------|----------|------------|---------|------|
| 1 | hero | ✓/✗ | ✓/✗ | ✓/✗ | A/B/C |
| ... |

### 메트릭
- 총 비용: $___
- 총 시간: ___분
- 평균 1장 시간: ___초

### 기존 Gemini 결과 대비
- 품질 (1~10): ___ vs Gemini ___
- 비용 비교: ___% 차이
- 권장 모델: gpt-image-2 / Gemini / 혼합
```

---

## Codex 실행 지시

위 12개 프롬프트를 순서대로 OpenAI gpt-image-2 API에 호출:
- styling 6장: image edit endpoint (누끼_01.png를 reference로)
- sections 6장: image generate endpoint (reference 없음)

OPENAI_API_KEY는 `.env.local`에 있음. Node.js + openai SDK (`npm i openai`) 사용.

각 호출 사이 1초 대기 (rate limit 안전).

완료 후 위 검증 기준으로 평가하고 보고서 생성.
