# 야간 작업 결과 리포트 (2026-06-02 아침 확인용)

> 23:48~ 자율 작업. **실제 브라우저·DB·렌더 파일로 검증한 것만 적었습니다. 추측·과장 없음.**
> 데모 대상: **소금빵(쌀과밀, c0ff7994) 하나.** 상세 작업로그: `docs/OVERNIGHT-PROGRESS.md`

---

## ★ 최신 업데이트 (피드백 반영, 새벽 작업분) — 여기부터 보세요

### 1. 상세페이지 디자인 전면 재제작 (요청: 기존 템플릿 별로 → 실사용급으로)
- 기존 AI-자체생성 템플릿(food_handmade_03) **폐기**. 실제 한국 프리미엄 식품 상세페이지 수준으로 **CSS 신규 제작**(Pretendard, 시네마틱 히어로, 풀블리드 단면컷, 가격/구성, 구매후기, 스펙표, 배송/교환, CTA).
- **냉정한 디자인 검토(서브에이전트, 52점→재작업)** 의 P0/P1 전부 반영: 가격·구성 추가 / 구매후기 추가 / **단면컷 신규 생성**(속살+버터층) / 포인트3 사진 중복 제거 / 풀블리드로 레이아웃 변화 / CTA 희소성 배지.
- **AI 스타일링샷 5종**(외관·오버헤드·버터·**단면**·플레이팅) 적용. 모든 텍스트는 **편집 가능한 진짜 HTML 텍스트(완벽한 한글)**.
- 보기: 웹앱 사업자 미리보기 = 이 결과물. 직접 이미지: `…/v2/detail.png`. Figma용 HTML: `…/v2/detail.html`.
- 렌더 버그(Chrome 16384px 캡처한계로 하단 wrap) 발견·수정(1x 캡처)·재게시·캐시버스트까지 완료. 웹앱 미리보기 정상 확인.

### 2. 클라이언트용 설명 문서 (요청) — `docs/CLIENT-STATUS.html`
- 진행상황 · 한계점 · 개선계획(로드맵) 포함, 파이프라인 인포그래픽과 같은 형식의 폴리시 HTML. 브라우저로 열어 클라이언트에게 바로 제시 가능(인쇄/PDF 가능).

### 3. 웹앱 마무리 폴리시
- 스태프 콘솔 브랜드 배지 "Admin"→"STUDIO"(디자이너에게도 어색하지 않게), 로고 클릭 → /dashboard. 탭 제목 DetailAI. tsc green.
- 기능은 4역할 전 흐름 검증 완료(아래 1번 참고). **단, 프로덕션 배포 빌드 이슈는 미해결(데모는 dev 구동)** — 아래 4번.

### 4. 파이프라인 정렬 + 데모 데이터 (피드백 반영)
- **스타일링샷 = API 생성으로 정렬**: 결정대로 "프롬프트만 출력→외부 업로드"가 아니라 **Gemini API 직접 생성**. photography 페이지를 AI 생성 갤러리 + "AI로 생성/재생성" 버튼으로 교체(`/api/photography/generate-shots` 신규). 소금빵 5컷 정상 표시 확인. (단, 완전 자동 runPipeline의 SKIP_IMAGE_GENERATION 통합은 후속)
- **데모 검증용 데이터 시드**(`scripts/seed-demo-clean.ts`): 대시보드 5컬럼이 각 1개씩 채워지도록 단계 분산 — 접수·스크립트(황태), 디자인기획(흑마늘), 스타일링샷(제주감귤), 초안제작(소금빵=쇼케이스), 완료(돈덕). 각 사업자 계정당 1프로젝트(D-022). 더미 0건 확인.
- **웹앱↔파이프라인 일치 점검 결과**: 단계 구조·역할 게이트는 일치. 남은 불일치 = ① 스타일링샷 완전자동(위에서 UI/버튼은 API화, 자동파이프라인 통합은 후속) ② 새 프리미엄 템플릿이 html-builder 자동생성에 미통합(소금빵 수동).

### Figma 편집(html.to.design) 방법
1. `…/v2/detail.html` 파일 내용을 복사 → Figma의 **html.to.design 플러그인 → "Import HTML code"(붙여넣기)**. (이미지가 절대 URL이라 그대로 로드됨. Supabase가 HTML을 text/plain으로 서빙해 URL-직접 import는 안 되니 붙여넣기 방식 사용)
2. 폰트: Pretendard 설치 필요(한국 디자이너 대부분 보유). 스크림·배경·텍스트가 각각 레이어로 들어와 편집 가능.

---

## 0. 가장 먼저 — 데모는 `npm run dev`로 띄우세요 (중요)

```bash
cd /Users/jinman/Desktop/Projects/products/detail-page-saas
env -u ANTHROPIC_API_KEY PORT=3000 npm run dev
```
- 지금 이 dev 서버가 떠 있습니다(제가 켜둠). 꺼졌으면 위 명령으로 재기동.
- ⚠️ **`npm run build`+`npm start`(프로덕션)는 쓰지 마세요.** 아래 4번 참고 — 라우트가 간헐적으로 500.

### 데모 계정
| 역할 | 경로 | 계정 |
|------|------|------|
| 관리자 | `/admin` | admin / DetailAI!2026 → 로그인 시 대시보드 |
| 디자이너 | `/login` | designer1@detailai.app / DetailAI!2026 (사업자번호 칸에 비밀번호 입력) |
| 기획자 | `/login` | planner1@detailai.app / DetailAI!2026 |
| 사업자 | `/login` | demo@detailai.app / 123-45-67890 |

---

## 1. 웹앱 사용성·기능 (최우선) — 검증 완료, 핵심 버그 수정

**dev 서버에서 4역할 전 흐름 실제 로그인·렌더 검증:**
- 관리자: 로그인→대시보드(200개 동시 진행 전제 필터/검색/미배정/단계/지연·컬럼카운트, 콘솔에러 0) / 디자이너상세(미리보기+다운로드5종) / 사용자관리 / 스타일링샷제작 모두 정상
- 디자이너: 로그인→`/designer` "내 작업"에 배정된 소금빵 표시 ✅
- 기획자: 로그인→`/planner` 스크립트 검수 ✅
- 사업자: 로그인→단일 프로젝트 강조뷰 / 상세(3구간 최소진행·초안미리보기·이미지보호·코멘트) ✅

**🔴 발견·수정한 핵심 버그 (수정 전엔 데모가 깨졌을 것):**
1. **스태프 로그인 불가(proxy.ts)** — 미들웨어가 `/planner /designer /photography`를 admin만 통과시켜 **디자이너·기획자가 로그인하면 클라이언트 페이지로 튕겼음**. → admin/planner/designer 모두 허용하도록 수정. /dashboard 미들웨어 보호 추가, /admin 경로 매칭 정밀화.
2. **디자이너 "최종 파일 다운로드" 링크 깨짐(DesignPreview.tsx)** — output_url(JSON 객체)을 그대로 href에 넣어 다운로드 불가였음. → JSON 파싱해 HTML/모바일zip/PCzip/Figma zip 개별 링크로.
3. **역할별 로그인 랜딩** — designer→/designer, planner→/planner, admin→/dashboard.
4. **API 권한 가드 추가** — shooting-list / scripts.generate(Claude 비용 발생)에 role 가드, ab-test await 누락 수정, designs/review 입력검증.
5. **D-022(사업자 1회 제한)** — demo가 3개 프로젝트를 갖고 있던 것 정리(소금빵 1개), 사용량 1/1 표시·"의뢰 시작하기" 숨김, intake 페이지 게이팅 추가(제출은 이미 서버단 increment_usage로 차단됨).

## 2. 스타일링샷 퀄리티 — ✅ 합격 (프로급)
- 3장(`styling_real/`): 다크 슬레이트+린넨 배경, 황금빛 소금빵+소금결정, 버터/나이프 소품, 3:4, **텍스트 없음**. 개선 프롬프트(역할·3:4·30%여백·NEGATIVE) 효과. 데모용 충분.

## 3. 템플릿 퀄리티 + 피그마 연동성 — 🔧 수정 완료
**문제였던 것:** 풀블리드 이미지 섹션(hero/sensory 등)이 **흰 텍스트인데 배경이 투명 누끼라 글자가 안 보였음**. 편집용 HTML/Figma 번들은 이미지 경로가 깨져 있었음.
**수정:**
- html-builder CSS: 다크 섹션에 다크 베이스+스크림 추가 → 흰 텍스트 항상 가독(이후 모든 프로젝트에 영구 적용)
- 소금빵: 다크 섹션 배경에 실제 스타일링샷 배선 → 재렌더 → 업로드. 헤드라인 "매일 아침, 갓 구운 한 입" 등 전 섹션 가독 확인.
- **Figma 번들(designer.zip)**: index.html + images/(스타일링샷3+Tenada폰트), 경로 `./images/`, 깨진 경로 0건 → html.to.design import 가능.
- **모든 텍스트가 진짜 편집 텍스트(완벽한 한글, 오타 없음)** — 이미지형의 한계(아래) 없음.

## 4. 최종 결과물 — 웹앱에 반영됨 + 두 옵션
사업자/디자이너 화면 미리보기 = **수정된 템플릿 렌더**로 교체됨(완벽한 한글, 사진배경, 명암 교차 에디토리얼).

**선택 필요 — 두 가지 상세페이지 스타일이 있습니다:**
- **A. 템플릿형(현재 적용)**: 완벽한 한글 + Figma 편집가능 + 사진배경. 톤은 브랜드/에디토리얼.
- **B. 이미지형(`design_v1_*`, 스토리지에 보존)**: 타임딜·할인가·뱃지·CTA버튼이 들어간 화려한 전환형. **단 작은 한글이 깨지고 영문이 섞입니다(예: "지롬 14cm", "밀할가루", "Crispy Crust") — 이미지에 텍스트가 구워져 수정 불가.**
- 제 권장: 텍스트 정확성·편집성 때문에 **A**. 다만 11번가 전환요소(가격/타임딜)는 A가 약하니, 최종 톤은 사장님이 보고 정해주세요.

---

## 4. 🔴 반드시 알아야 할 리스크 — 프로덕션 빌드(배포)
- `next build`+`next start`(=Vercel 배포 방식)에서 **라우트가 간헐적으로 500**. 로그: "client reference manifest for route X does not exist", "boundary-components#ViewportBoundary not in React Client Manifest". Turbopack·webpack 빌드 모두 발생, 매번 다른 라우트.
- 매니페스트 파일은 디스크에 있는데 런타임이 못 찾음 → Next16(커스텀) 빌드 비결정 이슈로 추정.
- **데모는 dev로 회피했지만, Vercel 배포 시 동일 증상 가능 → 배포 전 별도 조사 필수.** (AGENTS.md: "this is NOT the Next.js you know" — 포크 버전)

## 5. 남은 일 / 미검증
- 프로덕션 빌드 매니페스트 이슈 근본 조사(배포 전 필수)
- 코멘트 제출/AB생성/디자이너 승인→납품 end-to-end는 미실행(컴포넌트·API는 검증)
- 이미지형 작은 텍스트 품질은 구조상 미해결(이미지 생성 방식 한계 — 사용자가 "나중에"로 보류한 연속성 이슈)
- 템플릿 자동 배선은 소금빵만 적용(스크립트). 파이프라인 자동화는 후속(CSS 스크림은 파이프라인 영구 반영됨)

## 6. 변경 파일 (커밋 대기 — 검토 후 커밋하세요, 제가 자동 커밋 안 함)
내 변경: `proxy.ts`, `app/(auth)/login/page.tsx`, `app/actions/admin-login.ts`, `app/(client)/intake/page.tsx`, `components/designer/DesignPreview.tsx`, `agents/html-builder.ts`, `app/api/{photography/shooting-list, scripts/generate, scripts/ab-test, designs/review}/route.ts`
문서/스크립트: `docs/AUDIT-FINDINGS.md`, `docs/OVERNIGHT-PROGRESS.md`, `docs/MORNING-REPORT.md`, `scripts/rerender-ssal-template.ts`, `scripts/upload-ssal-rerender.ts`
※ `.watchdog/`, `docs/CODEX-WATCHDOG*`, `scripts/codex-watchdog*` 등은 제 변경 아님(Codex) — 커밋 시 분리.
DB 변경: 황태/돈덕 client_id 재배정, demo user_profiles 생성(usage 1/1), 소금빵 designs.preview_url/output_url 갱신.
