# 야간 자율 작업 로그 (2026-06-01 23:48 → 06-02 07:00)

> 사용자: 23:48 취침, 07:00 결과 확인. 7시간 자율. "최고 퀄리티까지 멈추지 말고 계속 수정."
> 원칙: 실제 증거(브라우저/콘솔/DB/파일)로만 판단. 거짓·과장 완료 선언 금지.
> 범위: 소금빵(쌀과밀, c0ff7994) 샘플 하나로 — ① 웹앱 사용성·기능(최우선) ② 스타일링샷 퀄리티 ③ 템플릿+피그마 연동 ④ 최종 결과물 + 웹앱 표시 확인.

## 검증 환경
- dev: `env -u ANTHROPIC_API_KEY PORT=3000 npm run dev` (fresh 재기동, .next 캐시 삭제 후)
- DB: Supabase uddyemjqoxqttzpminwa. 프로젝트 4건(돈덕 delivered / 쌀과밀·황태·흑마늘 design_review), auth.users 14명
- 계정: admin(/admin admin·DetailAI!2026), designer1@detailai.app·DetailAI!2026, planner1@detailai.app·DetailAI!2026, demo@detailai.app·123-45-67890(/login)

## 타임라인 / 발견·수정

### [23:50] 빌드 green 확인 — PASS (exit 0)

### [23:50] stale dev 서버 이슈 발견·해소
- 증상: 대시보드에 빈 `<select>`(옵션0) + React "value without onChange" 콘솔 에러
- 근본원인: 이전 세션부터 떠있던 dev 서버가 stale 컴파일본 서빙(소스엔 이미 제거됨)
- 조치: 포트3000 kill + .next 삭제 + fresh 재기동 → 빈 select 0개, 콘솔 에러 0건 확인
- 교훈: 모든 시각 검증은 fresh 서버에서. (stale면 검증 무효)

### [00:00] 🔴 CRITICAL 발견 — 스태프(디자이너/기획자) 자기 작업 페이지 접근 불가 (proxy.ts M-1)
- 증상(브라우저 증거): designer1@detailai.app 로그인 → `/login`이 role!==client면 `/planner`로 push → **미들웨어가 role!=='admin'이라 `/projects`(클라이언트뷰)로 리다이렉트** → 디자이너가 자기 작업 못 봄
- 근본원인: proxy.ts:47-49 ADMIN_PATHS(`/planner /designer /photography /users`)가 `role!=='admin'`만 통과. planner/designer 차단. (AdminLayout은 3역할 허용 — 미들웨어와 불일치)
- 부수: `/dashboard`는 ADMIN_PATHS에 없어 미들웨어 보호 누락(C-2), `/admin`이 PUBLIC startsWith라 범위 과대(C-3)
- 조치: proxy.ts 재작성 — 스태프경로(/dashboard /planner /designer /photography)=admin/planner/designer 허용, /users=admin전용, /admin=정확매칭

### [Turbopack 이슈] dev 서버 .next/dev 캐시 손상 반복(manifest ENOENT/compaction) → **검증을 프로덕션(build+start)로 전환**해 안정화. 빌드 green.

### [코드 정적감사 서브에이전트 결과] docs/AUDIT-FINDINGS.md — 내가 직접 재검증한 것:
- C-1 shooting-list, C-4 scripts/generate: 라우트 role 가드 없음(단 미들웨어가 미인증 /api는 401 → "로그인한 아무 역할이나 트리거" 수준). 수정 대상
- H-1 ab-test await 누락(Vercel only), H-4 designs/review uuid 검증 없음
- H-2/H-7 fire-and-forget·M-3/4/5 로컬 output/ 의존: **Vercel 배포 전용 이슈, 로컬 데모엔 무관** → 배포 작업으로 분리(오늘 데모 우선)

### [23:51] 관리자 대시보드 — PASS
- 검색/미배정/담당자/단계/지연 필터 칩 정상, "4건 표시", 컬럼 카운트(초안제작3·완료1) 정확, 콘솔 에러 0

### [00:05] ✅ 수정·검증 완료 (프로덕션 재빌드 green 후 브라우저 재검증)
1. **proxy.ts (M-1/C-2/C-3)** — 스태프경로 admin/planner/designer 허용, /dashboard 보호, /admin 정확매칭. → designer1 로그인 시 `/designer` 정상 진입(이전엔 /projects로 튕김). **검증 OK**
2. **login/page.tsx** — 역할별 랜딩(designer→/designer, planner→/planner, admin→/dashboard, client→/projects)
3. **DesignPreview.tsx (다운로드 JSON href 버그)** — output_url JSON 파싱 → 라벨별 링크(HTML/모바일zip/PCzip/디자이너zip) + 레거시 단일URL 폴백. 프로덕션서 5링크 모두 https 정상 + 미리보기 이미지 로드 **검증 OK**
4. **API 라우트(서브에이전트)** — shooting-list/scripts.generate role 가드 추가, ab-test await 추가, designs/review 입력검증. tsc clean
- 디자이너 상세: 미리보기(860×17082) 정상, AI기획안 PDF, 최종파일 5종 다운로드 정상

### 경미 UX(기록, 후순위)
- 스태프 nav 라벨이 "DetailAI Admin"(디자이너에게도 Admin 표기). 역할별 라벨 개선 후보
- 디자이너 nav에 기획검수/스타일링샷 링크 노출(공용 워크스페이스라 동작은 함)
- demo 클라이언트가 3개 프로젝트 소유(사용량 0/1과 모순) → 단일뷰 미발동. demo→소금빵 1개로 정리 필요(데모 데이터)
- 인증된 사용자가 /login 접근 시 리다이렉트 안 됨(경미)

---

## [00:20] 소금빵 결과물 실물 검토 (실제 이미지 열어봄)

### ② 스타일링샷 — ✅ PASS (3장 모두 프로급)
- hero_dark_closeup / overhead_minimal / butter_pairing: 다크 슬레이트+린넨, 황금빛 소금빵+소금결정, 버터/나이프 소품, 3:4, **텍스트 없음**. 개선 프롬프트(3:4·30%여백·역할·NEGATIVE) 효과 확실. 데모용으로 충분.

### ③ 템플릿 퀄리티 + 피그마 — ⚠️ 혼재 (디자인시스템 우수 / 이미지배경 섹션 붕괴)
- style-guide.json: 정교(웜브라운·크림, Tenada+NanumMyeongjo+GothicA1+Brush, 9패턴, 명암리듬, food_handmade_03) — 템플릿같지 않음 ✅
- 텍스트/카드 섹션(brand_story "빵을 굽는 이유", key_benefit "세 가지 차이"): **우수**, 완벽한 한글, 타이포·카피 좋음 ✅
- 🔴 풀블리드 이미지섹션(hero "매일 아침 갓 구운 한 입", sensory "손끝부터 시작되는 맛"): **흰 텍스트가 크림 배경 위→거의 안 보임 + 누끼 컷아웃이 텍스트에 겹침**. cta/ingredients/packaging도 동일 추정
- 🔴 export: 4_final/index.html 이미지경로가 `../../../tmp_nukki/누끼_*.png`(빌드후 깨짐), designer 번들에 images/ 폴더 없음 → Figma 번들 이미지 깨짐
- 근본: 풀블리드 섹션은 **다크 사진 배경** 전제인데 누끼(투명 컷아웃)가 들어가 흰 텍스트 무배경

### ④ 최종 결과물(이미지형 generateDesignForProject) — ✅ 시각 강력 / ⚠️ 텍스트 아티팩트
- hero: 11번가 셀러 상세페이지급(타임딜·뱃지·버터단면·CTA), 큰 한글 깨끗 ✅
- features: 4피처카드+다이어그램 화려 BUT 작은 한글 깨짐("지롬/밀할가루/문세없나/선일청정")·영문혼입(Crispy Crust) — **이미지에 텍스트가 구워져 수정 불가**

### 결론·전략
- 이미지형 = 즉시 데모 가능(시각 임팩트), 단 작은텍스트 결함 본질적
- 템플릿형 = **진짜 편집텍스트(완벽 한글)+Figma** → 이미지배경 섹션만 고치면 최고결과물
- **다음 작업: 템플릿 풀블리드 섹션에 스타일링샷 배경+다크 스크림 배선 + export 이미지 번들 수정 → 재렌더 검증** (= 사용자가 원한 연속성·Figma·최종결과물 동시 해결)

## [00:30] ✅ 템플릿 수정·재렌더·업로드·웹앱반영 완료

### 수정 내용
1. **html-builder.ts CSS 스크림(견고·파이프라인 영구반영)**: `.v5-section.dark-section`에 다크 베이스(`--color-text-dark`) + `::after` 스크림 그라데이션 추가 → 배경이 누끼/누락이어도 흰 텍스트 항상 가독. 이후 모든 프로젝트 렌더에 적용됨.
2. **소금빵 배경 배선(scripts/rerender-ssal-template.ts, API불필요)**: 기존 planning(style-guide/refined-copy/script/icon-mapping) 재사용 + 다크 풀블리드 섹션(hero/sensory/cta/brand_story/ingredients/packaging) 배경에 실제 스타일링샷 3장 배선 → runHtmlBuilder(순수조립)+runExporter(Google Chrome Playwright) 재렌더
3. **업로드(scripts/upload-ssal-rerender.ts)**: 4_final/index.html + 5_export/** 108개 덮어쓰기(designer-figma.zip만 용량초과 실패, output_url 미참조라 무관). preview_url←mobile/detail_page.png, output_url←4종 링크

### 검증(실제 렌더 육안)
- hero: 다크 사진배경+스크림→흰 헤드라인 "매일 아침, 갓 구운 한 입" 가독 ✅ (이전 붕괴→해결)
- packaging("오늘 빵은 오늘 만들어집니다"), 마무리 인용 등 전 섹션 가독 ✅
- 전체 페이지: 다크(사진)/라이트(크림카드) 교차 에디토리얼 리듬, 완벽한 한글 ✅
- Figma 번들: designer/images/ 에 스타일링샷3+Tenada폰트, index.html `./images/*` 참조, tmp_nukki 0건 ✅
- 웹앱: 클라이언트 미리보기가 새 템플릿 렌더로 교체 확인 ✅

### 최종 결과물 옵션(아침에 사용자 선택)
- A. **템플릿형(현재 적용)**: 완벽한 한글 + Figma 편집가능 + 사진배경. 에디토리얼/브랜드 톤
- B. **이미지형(design_v1_*, 스토리지 보존)**: 타임딜·뱃지·CTA 화려(전환형) BUT 작은 한글 깨짐·영문혼입(수정불가)
- 권장: 텍스트 정확성+편집성 때문에 A. 단 전환요소(가격/타임딜/CTA버튼)는 A에 약함 → 사용자 판단 필요

## [01:05] 데모 정리 + 전 라우트 dev 검증 + 🔴 프로덕션 빌드 이슈

### D-022 데모 정리
- demo@detailai.app 소유 3개 → **소금빵 1개만** (황태→hwangtae@demo.kr, 돈덕순대→sundae@demo.kr 재배정)
- demo user_profiles 행 없어서 0/1 표시되던 것 → 행 생성(usage_count=1, usage_limit=1) → **"사용량 1/1" + "의뢰 시작하기" 숨김 + 단일 강조뷰** 확인
- intake 게이팅 추가: usage 소진 시 폼 대신 "이미 의뢰를 진행 중입니다" 안내(제출은 increment_usage RPC가 서버단 차단 — 이미 동작)
- admin/login 리다이렉트 역할별 수정(admin→/dashboard, designer→/designer, planner→/planner) — /login·/admin 모두

### 🔴 중대: 프로덕션 빌드(`next build` + `next start`) 비결정적 깨짐 — 데모는 반드시 `npm run dev`
- 증상: `next start`에서 일부 라우트가 500. 로그: "The client reference manifest for route X does not exist" + "Could not find module boundary-components.js#ViewportBoundary / MetadataBoundary / IconMark in the React Client Manifest"
- 매번 다른 라우트(designer→intake→users→projects)에서 발생. **Turbopack 빌드와 webpack 빌드(`--turbopack` 5청크, `--webpack` 19청크) 둘 다 발생.** 매니페스트 파일은 디스크에 존재하는데 런타임이 못 찾음 → Next16(modified, AGENTS.md) 빌드/매니페스트 생성 비결정 버그로 추정
- **영향: Vercel 프로덕션 배포 시 라우트 500 위험** → 배포 전 별도 조사·검증 필수
- **대응(데모): `npm run dev`로 구동(요청시 컴파일/매니페스트 생성이라 회피). dev에서 전 역할·전 라우트 정상 확인:**
  - admin: 로그인→/dashboard ✅, dashboard(4카드·콘솔0) ✅, designer상세(새템플릿+다운로드5종) ✅, users ✅, photography ✅
  - designer1: 로그인→/designer(내작업 소금빵) ✅
  - planner1: 로그인→/planner ✅
  - client(demo): 로그인→/projects(1/1 단일) ✅, 상세(템플릿미리보기·3구간·이미지보호·코멘트) ✅, intake(게이트) ✅

### 빌드 상태
- `npm run build`(Turbopack) exit 0 (타입/컴파일 통과). `--webpack` exit 0. 단 위 런타임 매니페스트 이슈 별개.

## [01:16] 최종 폴리시 + 검증 (dev에서)
- 코멘트 흐름 **end-to-end 동작 확인**: 클라이언트가 코멘트 작성→제출(POST 201)→표시 ✅. 비전문적 "QA 테스트 코멘트"는 삭제, 현실적 데모 코멘트 1건만 남김.
- 루트 metadata 기본 보일러플레이트 수정: 탭 제목 "Create Next App"→"DetailAI — 상세페이지 제작", `<html lang>` en→ko
- 모바일(390px) 클라이언트 상세: 가로 오버플로 없음·미리보기 뷰포트 맞춤·500 없음 ✅
- dev 서버(port 3000) UP 유지, 전 데모 라우트 사전컴파일됨

## 최종 상태 요약
- **데모 즉시 가능**: `npm run dev`로 구동(이미 떠있음). 4역할 전 흐름·소금빵 결과물 검증 완료.
- **소금빵 최종결과물**: 템플릿형(완벽한 한글+Figma+사진배경) 웹앱 반영. 이미지형은 보존(옵션B).
- **미커밋**(사용자 검토 후 커밋). Codex 파일은 분리.
- **유일한 큰 잔여 리스크**: 프로덕션 빌드(배포) 비결정 매니페스트 버그 — 배포 전 조사 필요. 데모엔 무관(dev 사용).
