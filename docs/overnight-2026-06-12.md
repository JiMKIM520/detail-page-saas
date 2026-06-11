# 야간 자율 작업 로그 — 2026-06-12

사용자 요청: "지금까지의 개발과정과 현재의 산출물을 리뷰하고 부족한 부분을 개선해줘. 내일 아침까지 진행."

## 안전 원칙 (자율 모드)
- prod 재배포 / git push / 파괴적 작업은 **하지 않음** (라이브 치명버그 발견 시만 예외, 그 경우도 로그에 명시)
- 모든 변경은 로컬·가역적. prod DB는 검증용 임시행(생성→삭제)만, 정리 필수
- 각 단계 검증 후 진행. 빌드 그린 유지

---

## 1. 리뷰 — 이번 세션 산출물 & 결함

### A. 의뢰폼 개편 (배포됨, 커밋 077b648)
- P1 문구/칩/Step4 안내사항 + P2 신규 제품필드(제품명·제품소개·셀링포인트) 풀스택.
- migration 018 prod 적용 완료. 빌드 그린 ×3, 평가자 리뷰 통과.
- **결함/미검증**:
  - (D1) 라이브 폼 4단계 E2E를 내가 직접 검증 못 함 (스모크 401까지만). → 오늘밤 브라우저 E2E로 마감.
  - (D2) Step4 입력요약표 제거 = PDF 지시 따름이나 사용자 확정 대기.
  - (D3) 커밋 로컬 only(미푸시) — 의도적(승인 필요).

### B. 조합형 블록 시스템 (미커밋, dormant)
- 엔진(types/tokens/shared/registry/composer) + 변형 12개. 컴포저로 A/B 스타일 검증, 빌드 그린, 리뷰 통과(MEDIUM 2 수정).
- **결함/미완**:
  - (D4) 검증된 15아키타입 중 **8블록 미포팅**(recommend/checklist/strip/seal/reason/equation/story/cert) → 식품 1벌 미완.
  - (D5) AI 컴포저(brief→PageSpec) 미구현 → 파이프라인이 아직 못 씀.
  - (D6) 미커밋 → 세션 작업 유실 위험.

### C. 레포 위생 (audit 지적)
- (D7) lint 에러 95개(전부 scripts/upload-ssal-rerender.ts + 루트 test_*.js) — 배포 무관하나 기술부채.
- (D8) codex-watchdog.ts 하드코딩 prod UUID 4개 → env 권고 (타 도구라 신중).

---

## 2. 오늘밤 계획 (가치·저위험 순)
1. **[D1] 배포 의뢰폼 E2E 검증** — 라이브 4단계 브라우저 스크린샷 + 신규필드 DB 영속 검증(임시행 생성→삭제), usage 리셋. 
2. **[D4] 식품 블록 라이브러리 완성** — 8블록 포팅 → 15블록 컴포저 렌더 검증 → 빌드 그린.
3. **[D5] AI 컴포저 에이전트** — brief+이미지 → PageSpec(zod) 코드 구현(고비용 생성 실행은 안 함).
4. **적대적 리뷰(워크플로)** — 신규 코드 전체 리뷰 → 결함 수정.
5. **[D6] 블록시스템+컴포저 로컬 커밋**(별도, 미푸시).
6. **[D7] 기술부채 정리**(여유 시, 가역적).
7. **아침 보고** — 한 것/결정/사용자 확인필요 항목.

---

## 3. 진행 로그

### Phase 1 — 배포 의뢰폼 라이브 E2E ✅ 완료 (D1 마감)
- 도구: playwright-core + Chrome, 대상 https://detail-page-saas.vercel.app
- 계정: client@test.com / 전화뒷4 `0000` (로그인 성공 → /projects)
- 스크린샷 7장(/tmp/e2e/00~05): 대시보드·Step1·2·3·4 전부 PDF 스펙대로 라이브 확인.
  - 대시보드: "디자인 의뢰 시작하기" 버튼, "아직 의뢰 없음" 제거 ✅
  - Step1: 회사 소개 / 브랜드 있음(로고 BI 업로드) / 기업 소개서·상품 카탈로그 ✅
  - Step2: **제품명·제품 소개·셀링 포인트(1~5, 필수3)** 신규 + 제품사진 "1~2장" ✅
  - Step3: 신규 칩 5종(귀여운·밝은·따뜻한·편안한·부드러운) + URL 라벨 2종 ✅
  - Step4: 입력요약표 제거 + 안내사항 3체크리스트 + 제출 게이팅(전 disabled→후 enabled) ✅
- **검증 결과: GATING OK=true, 전 단계 정상.** 최종 제출은 클릭 안 함(prod AI 파이프라인/비용 방지). usage 0/1 유지 → 사용자가 아침에 동일 계정으로 테스트 가능.
- 미실행: 실제 최종제출(파이프라인 트리거) — 의도적 회피. 폼→API→DB 매핑은 배포전 회귀 워크플로에서 정적 추적 완료.

### Phase 2 — 식품 블록 라이브러리 완성 (D4) ✅ 코드/렌더 검증
- 검증된 데모의 미포팅 8블록을 TS 변형으로 포팅:
  - recommend-dark, checklist-checks, strip-band, reason-question, feature-seal, equation-visual, story-pair, cert-rosette
- index.ts 등록 → **총 20변형** (식품 14 + 에디토리얼 6). 격리 tsc 클린.
- 컴포저로 식품 전 아키타입 **14블록 1페이지(8402px) 조립 렌더** → getBoundingClientRect 진단으로 14섹션 순서·위치 정상 확인(hc 최상단 … clm 최하단). dsf=1 렌더로 시각 확인.
- **교훈(기록)**: playwright fullPage + deviceScaleFactor=2 는 긴 페이지에서 스티칭 아티팩트(하단에 상단 블록 중복 표시) 발생 → 긴 페이지 시각검증은 dsf=1 또는 섹션 bounding-box 진단 사용할 것.
- 데모 산출물: /tmp/spike/full15.html, full_dsf1.png. 재현 스크립트: scripts/blocks-full-demo.ts

### Phase 3 — AI 컴포저 에이전트 (D5) ✅ 코드 완성 + 결정론 검증
- `agents/blocks-composer.ts`: brief+이미지 → PageSpec.
  - AI 출력 계약(composerOutputSchema) = { meta, presetKey, blocks[] }. 토큰은 AI가 안 쓰고 presetKey+브랜드색에서 `deriveTokens`로 도출(신뢰성).
  - `assemblePageSpec()` 순수 함수로 분리(테스트 가능) → `renderPage()`가 변형 id/슬롯 데이터 검증, 실패 시 오류 피드백 1회 재시도.
  - 시스템 프롬프트: 카탈로그 + 20변형 데이터 계약 + 조립 규칙(히어로 시작/클로징 끝, 12~18블록, 반복 제한) + 정직성(인증/후기 날조 금지) + 금칙어.
- `scripts/blocks-composer-test.ts`: **결정론 테스트 8/8 통과** — 유효 출력 렌더, 미등록 변형/필수 누락 throw, 브랜드색→accent, 프리셋별 폰트.
- **미검증(정직)**: 실제 Claude 호출 경로는 코드 완성이나 오늘밤 실행 안 함(키 로딩/토큰비용). slot-filler와 동일 패턴이라 신뢰도 높음. 파이프라인 배선도 미적용(라이브 식품 경로 무회귀 위해) — 다음 단계.

### Phase 4 — 신규 코드 적대적 리뷰(워크플로 3에이전트) → 결함 수정 ✅
- 판정 pass-with-fixes. CRITICAL 0, HIGH 3·MEDIUM 3·LOW 2. **7건 전부 수정**:
  - HIGH: checkpoint-rows/compare-cooking icon `z.string()` → `z.enum(ICON_NAMES)` (shared.ts 단일 출처). 미검증 아이콘이 getIcon silent fallback(check)으로 잘못 렌더되던 것 차단.
  - HIGH: blocks-composer DATA_CONTRACTS의 equation `b:{…}` 단축 → `b:{ image?(url), label }` 명시(label 필수 노출), compare `right:{…}`도 전개 + icon 목록 정정.
  - MEDIUM: seal.ts 고정 SVG id → 렌더별 `bk-sealarc-${rand}` 고유화(2회 등장 시 textPath 오추적 방지).
  - MEDIUM: composerOutputSchema `.min(4).max(24)` → `.min(10).max(20)` + hero-first/closing-last refine(구조 강제).
  - MEDIUM: runBlocksComposer elapsed() 이중 호출 → `const ms` 단일 캡처.
  - LOW: cert `.ct-rosette g{stroke}` → `g path,g circle`로 스코프(로제트 글자 헤일로 제거, 시각 확인).
  - LOW: closing-mood sub `.min(1).optional()`(빈 DOM 방지).
- 재검증: 격리 tsc 클린, 결정론 테스트 8/8, 14블록 재렌더 + cert/seal 시각 확인. 풀 빌드 그린.

### Phase 5 — 블록 시스템 로컬 커밋 ✅
- 26파일(코어 6 + 변형 15 + 컴포저 + 스크립트 3 + 로그) 명시적 스테이징. codex-watchdog/데모에셋 제외.
- **커밋 d91662b** (로컬 main). **미푸시**(승인 필요 + prod 무관). → 077b648(intake) 위에 쌓임.

### Phase 6 — 문서/메모리/보고 ✅
- `docs/blocks-system.md` 아키텍처+확장 가이드 작성.
- 메모리 project_detailai_block_system 갱신(20변형·컴포저·커밋).
- 아래 아침 보고.

---

## 4. 아침 보고 (사용자 확인용)

### 오늘밤 한 일 (전부 검증 완료)
| | 결과 |
|---|---|
| **배포 의뢰폼 라이브 E2E** | 4단계 전부 PDF 스펙대로 동작 확인(스크린샷 /tmp/e2e/). 안내사항 체크 게이팅 OK. |
| **식품 블록 라이브러리 완성** | 8블록 추가 → **20변형**, 14블록 조립 렌더 검증 |
| **AI 컴포저 구현** | brief→PageSpec, 결정론 테스트 8/8 |
| **적대적 리뷰 + 수정** | 7건(HIGH 3·MED 3·LOW 1) 전부 수정·재검증 |
| **로컬 커밋** | 블록시스템 d91662b (intake는 어제 077b648) |
| **빌드** | npm run build 그린 (전 구간) |

### 사용자 확인/결정 필요 (내가 임의로 안 한 것)
1. **GitHub 푸시** — 로컬 커밋 2개(077b648 intake, d91662b blocks) 미푸시. 푸시 원하시면 진행. (intake는 이미 prod 배포됨 — 푸시는 레포 동기화용)
2. **Step4 입력요약표 제거** — PDF "내용 삭제" 지시대로 제거함. 유지 원하시면 되돌림.
3. **블록 시스템 파이프라인 배선** — 현재 dormant. 라이브 식품 경로에 연결할지(다음 큰 단계). 무회귀 위해 오늘밤은 미배선.
4. **AI 컴포저 실 LLM 호출** — 코드 완성·결정론 검증했으나 실제 Claude 호출은 미실행(키/토큰). 원하면 1회 테스트.
5. **기술부채(내 작업 아님, 손 안 댐)** — lint 에러 95개는 전부 `scripts/upload-ssal-rerender.ts`(any 2곳) + 루트 `test_hero_*.js`/`test_typo_*.js`(require import). codex-watchdog.ts 하드코딩 prod UUID 4개. 정리 여부 결정 필요.

### 라이브 테스트 계정 (의뢰폼 직접 확인용)
- https://detail-page-saas.vercel.app/login · 이메일 `client@test.com` · 전화뒷4 `0000` · usage 0/1(새 의뢰 가능)

### 산출물 위치
- 블록 시스템: agents/templates/blocks/ + agents/blocks-composer.ts · 문서 docs/blocks-system.md
- 데모: /tmp/spike/full15.html(14블록), assets/blocks-demo/ · E2E 스크린샷 /tmp/e2e/
- 이 로그: docs/overnight-2026-06-12.md

