# 다음 세션 이어가기 (핸드오프) — 2026-06-01 (compact 직전)

> compact 후 이 문서부터 읽고 진행. 대상은 **소금빵 하나** (`c0ff7994-4c13-4bbf-9ddd-d621bcfd5096`).

## ★ 핵심 결정 (사용자 확정, 2026-06-01)
- **현재 우선순위 = 웹앱 완성도 + 상세페이지 "결과물" 완성도.** 이 두 가지에 집중.
- **템플릿↔이미지 연속성 문제는 "나중에" 해결(보류).** 이유: 비용 절감 위해 "이미지 생성 API 안 쓰고 프롬프트만 출력 → 디자이너가 이미지 제작" 방식으로 갔는데, 그 결과 템플릿(html-builder)에 이미지가 안 채워지는 연속성 문제가 생김. **지금은 이 배선을 파지 말 것.**
- 참고(보류된 미래 작업): 상세페이지 템플릿은 원래 이미지가 아니라 Figma 편집 가능 HTML(html.to.design)로 가는 게 목표였음.

## ★ 근본 원인 (참고 — 보류된 문제)
v6에서 비용절감 차 **"이미지 직접 생성 → 프롬프트만 출력"**(`SKIP_IMAGE_GENERATION=true`, styling-shots 빈 배열) → html-builder가 배치할 이미지 0개 → 누끼 fallback 땜빵 → tmp 경로라 Figma 깨짐. **이 연속성 배선은 나중에.**

## ★ 지금 할 일 (완성도 우선)
1. **웹앱 완성도**: 작업관리 UI(200스케일·내작업·미배정·필터)는 적용+검증됨 — 디자이너/기획자 계정 실제 로그인 시각 검증, 클라이언트 D-022 시각 확인, 남은 UX/버그 점검. 빌드 green 유지.
2. **상세페이지 "결과물" 완성도**: 현재 완성된 결과물은 **이미지형 경로(generateDesignForProject)** — 돈덕/황태는 한국어 품질 우수, 쌀과밀 재생성됨. 이걸 데모 수준으로 완성도 점검(품질 일관성, 한글 텍스트, 섹션 구성). (※ 템플릿/Figma 경로는 보류)
3. 결과물을 사용자에게 실제 렌더로 보여주며 완성도 합의.

## 이번 세션 완료(커밋됨)
- `f6ce46e` 작업관리 UI 200스케일(대시보드 검색/담당자·단계·지연 필터/컬럼 카운트·스크롤/초기화) + 디자이너·기획자 "내 작업" 필터 + 클라이언트 D-022(진행트래커 제거→3구간, 단일 프로젝트 뷰). **200더미로 대시보드 육안 검증 완료**(필터·검색·미배정 동작).
- `21c4eb2` html-builder 누끼 fallback(빈 슬롯 임시) + 스타일링 프롬프트 품질(3:4·30%여백·삼분법·역할·브랜드컬러·NEGATIVE).
- `29d8fab` exporter: designer 번들에 images/ 동봉 + 경로 ./images/ 재작성(Figma용).
- 스타일링샷 **3장 실제 생성**(개선 프롬프트, Gemini, 896x1200≈3:4), 저장 위치:
  `designs` 버킷 `projects/c0ff7994-.../styling_real/{hero_dark_closeup,overhead_minimal,butter_pairing}.png`
  (메인이 아직 육안 검토 안 함 — compact 후 확인해 품질 판단)

## 데모 3종 현재 상태 (이미지형 generateDesignForProject 경로, 한국어 OK)
- 돈덕 순대 delivered(7섹션+PDF), 쌀과밀 design_review(6), 황태 design_review(7), 흑마늘 design_review. 더미 제거됨.
- ※ 이건 **이미지형(섹션 통째 Gemini 생성)** 결과. 사용자가 원하는 건 **템플릿(Figma) 경로** — 위 남은작업이 그것.

## gotcha / 실행
- tsx: 항상 `env -u ANTHROPIC_API_KEY node_modules/.bin/tsx --env-file=.env.local <script>` (전역 무효 ANTHROPIC 키 제거). `~/.zshrc:12` 주석됨.
- dev: `env -u ANTHROPIC_API_KEY PORT=3000 npm run dev`. 빌드 green 유지.
- **검증은 DB·브라우저·산출물로. HTTP 200/존재만으로 "완료" 선언 금지** (메모리 feedback_no_fake_completion).
- 템플릿 경로: `runPipelineForProject`(=/api/designs/generate). 이미지형: `generateDesignForProject`(=/api/photography/complete).
- Vercel 300초 한도: 기획 223초·초안 9분 초과 → 배포 시 비동기 잡 필요(로컬 데모 무관).

## 계정 (테스트)
- admin: `/admin` admin / DetailAI!2026
- 디자이너: designer1@detailai.app / DetailAI!2026 (designer2도)
- 기획자: planner1@detailai.app / DetailAI!2026 (planner2도)
- 사업자: `/login` demo@detailai.app / 123-45-67890

## 미검증 잔여 QA
- 디자이너 계정 로그인 시 /designer "내 작업" 필터 시각 확인(코드만 검증)
- 클라이언트 단일 프로젝트 강조 뷰(데모 3건이라 미표시 — 데모 1건 정리 시 확인)
