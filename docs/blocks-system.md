# 조합형 블록 시스템 (agents/templates/blocks)

상세페이지를 **아키타입 × 변형(variant) 블록의 조합**으로 생성하는 엔진.
기존 고정 단일 템플릿(`agents/templates/slots/food-slot.ts`)의 "휑하고 단편적" 한계를 해결하기 위해,
마스터급 섹션 블록을 라이브러리화하고 AI가 골라 조립한다. (피그마 템플릿 200개 흡수 대비 구조)

> 현재 상태: **dormant** (라이브 파이프라인에 미배선). 코드/렌더/리뷰 검증 완료, 빌드 그린.

## 구조

```
agents/templates/blocks/
├ types.ts        BlockArchetype(15) · BlockVariant<T> · PageSpec · RenderCtx · defineBlock<T>
├ tokens.ts       프리셋(warm-playful · modern-editorial) + deriveTokens(presetKey, brandColors)
├ shared.ts       esc · richSafe · cssSafe · media · ICONS/ICON_NAMES · baseCss(토큰→:root) · FONT_LINKS
├ registry.ts     registerBlocks · getVariant · listVariants · catalog
├ composer.ts     renderPage(PageSpec) → { html, usedVariants, blockCount } · pageSpecSchema
├ index.ts        모든 변형 등록 + 공개 API
└ variants/       변형 20종 (파일당 1아키타입의 변형들)
agents/blocks-composer.ts   AI 컴포저: brief+이미지 → PageSpec (Claude)
```

## 핵심 개념

- **아키타입(BlockArchetype)**: 섹션의 역할 — hero, recommend, checklist, strip, checkpoint, point, feature, reason, equation, callout, story, cert, compare, spec, closing.
- **변형(BlockVariant)**: 같은 아키타입의 서로 다른 디자인. 각 변형은 `{ id, archetype, styleTags, imageSlots, describe, schema(zod), css, render }`.
  - CSS는 2글자 접두사로 스코핑(예: hero-centered=`hc`, recommend-dark=`rec`)해 충돌 방지. 공유 유틸(`wm .lab .em .ph .disp .serif .hand`)만 baseCss.
  - render는 슬롯 데이터 → 완성 `<section>` HTML. 텍스트는 반드시 `esc`(평문) 또는 `richSafe`(`<br>`+`<span class="em">`만 허용)로 이스케이프.
- **PageSpec**: `{ meta, tokens, blocks: [{ variantId, data }] }`. AI 컴포저의 출력이자 `renderPage`의 입력.
- **컴포저(renderPage)**: variantId 조회 → 슬롯 데이터 zod 검증(실패 시 throw, fail-fast) → 변형 CSS dedup → baseCss(토큰)+폰트+섹션 조립.

## 현재 변형 (20)

| 아키타입 | 변형 |
|---|---|
| hero | hero-centered(따뜻), hero-editorial(명조) |
| recommend | recommend-dark |
| checklist | checklist-checks |
| strip | strip-band |
| checkpoint | checkpoint-rows(아이콘 행), checkpoint-grid(2×2 넘버) |
| point | point-bubble |
| feature | feature-fullbleed, feature-seal(도장씰) |
| reason | reason-question |
| equation | equation-visual |
| callout | callout-banner, statement-serif |
| story | story-pair |
| cert | cert-rosette |
| compare | compare-cooking |
| spec | spec-table |
| closing | closing-mood(다크), closing-light(라이트) |

식품 페이지 = 위 식품계 14개를 조립(예: scripts/blocks-full-demo.ts → 14블록 8402px).

## 변형 추가법

1. `variants/<archetype>.ts` 에 `defineBlock<T>({...})` 작성. (스키마·스코핑된 CSS·render)
2. `index.ts` 의 import + `registerBlocks([...])` 배열에 등록.
3. 끝. 컴포저·토큰·검증·카탈로그가 자동 적용.
   - 아이콘이 필요하면 `shared.ts` ICONS에 추가하고 `ICON_NAMES`에 키 추가(스키마 enum 검증 자동).
   - 새 아키타입이면 `types.ts` BlockArchetype 유니온에 추가.

## AI 컴포저 (agents/blocks-composer.ts)

- 입력: `{ brief(ProjectBrief), images, brandColors, outputDir }`.
- AI(Claude Sonnet)는 `{ meta, presetKey, blocks[] }` 만 출력 — **토큰은 직접 안 씀**(presetKey+브랜드색에서 `deriveTokens`로 도출, 신뢰성).
- `assemblePageSpec(out, brandColors)`(순수 함수) → `renderPage`로 변형 id/슬롯 데이터 검증. 실패 시 오류 피드백 1회 재시도.
- 가드: blocks `.min(10).max(20)` + 첫 블록 hero / 마지막 블록 closing refine. 정직성(인증/후기 날조 금지), 금칙어.
- 테스트: `scripts/blocks-composer-test.ts`(결정론 8/8). **실 LLM 호출은 미검증**(코드 완성, slot-filler 동일 패턴).

## 다음 단계 (미완)

1. **파이프라인 배선**: `lib/pipeline-bridge.ts` 식품 경로(또는 신규 경로)에서 `runBlocksComposer` 호출 → `renderPage` HTML → exporter. (현재 라이브 무회귀 위해 미배선)
2. **Figma 인제스천**: figma MCP로 200 템플릿 노드트리 → 섹션 분류 → 신규 변형 자동 생성(샘플 1개로 자동화율 측정 후 스케일).
3. **이미지 공급**: 변형의 imageSlots 충족 위해 누끼 + Gemini 스타일링샷 + 섹션 그래픽 매핑.
4. 멀티 수직(뷰티/전자) 변형 확장.
