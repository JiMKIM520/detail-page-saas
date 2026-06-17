# Blocks Pipeline Wiring Plan

블록 컴포저(`runBlocksComposer`)를 라이브 파이프라인에 additive·flag 기반으로 안전하게 통합하기 위한 배선 계획.

**작성일**: 2026-06-17  
**작성 방법**: 코드 읽기 전용(수정 없음). 추측 없음 — 파일·함수·라인 근거 명시.

---

## 1. 현재 흐름 (요청 → 생성 → 저장 → 상태 전이)

```
POST /api/designs/generate
  └─ route.ts:23            runPipelineForProject(project_id)
       └─ pipeline-bridge.ts
            1. :29          supabase .from('projects').select('*, platforms(name,slug)')
            2. :39          transitionStatus → 'design_generating'
            3. :42-67       intake_files (file_type='product_photo') → /tmp/{projectId}/ 다운로드
            4. :75-82       ProjectInput 구성
            5. :85-102      카테고리 분기
               ├─ category==='food'  :97  runSlotPipeline(input, { heroImageUrl })
               └─ 그 외              :100 runPipeline(input)           [agents/pm.ts]
            6. :105         uploadPipelineOutput(projectId, result.outputDir)
                             → designs 버킷, 경로: projects/{projectId}/{rel}
            7. :113         updateDesignUrls(projectId, uploadResult.urls)
                             → designs 테이블 upsert (preview_url, output_url JSON, section_images)
            8. :116         transitionStatus → 'design_review' (성공) | 'photo_uploaded' (실패)
```

### agents/pm.ts — runPipeline 단계 순서 (비식품 제너릭 경로)
| 단계 | 함수 | 파일:라인 |
|------|------|-----------|
| Step 1 | buildProjectBrief | pm.ts:310 |
| Step 1.5 | collectReferences (design-researcher) | pm.ts:316 |
| Step 2 | runArtDirector → StyleGuide + StylingPrompts | pm.ts:339 |
| Step 3 | runScriptWriter | pm.ts:386 |
| Step 4 | runStylingShots + runCopyWriter (병렬) | pm.ts:414 |
| Step 5 | runLayerImage (v6: SKIP_IMAGE_GENERATION=true → 스킵) | pm.ts:435 |
| Step 6 | runIconMapper | pm.ts:454 |
| Step 7 | **runHtmlBuilder** → `4_final/index.html` | pm.ts:492 |
| Step 8 | QA + 재시도 루프 (최대 3회) | pm.ts:508 |
| Step 9 | runValidator | pm.ts:621 |
| Step 10 | runExporter → `5_export/` (PNG/PDF/ZIP) | pm.ts:633 |

### agents/slot-pipeline.ts — runSlotPipeline 단계 순서 (식품 경로)
| 단계 | 함수 | 파일:라인 |
|------|------|-----------|
| Step 1 | buildProjectBrief | slot-pipeline.ts:54 |
| Step 2 | runScriptWriter | slot-pipeline.ts:59 |
| Step 3 | runSlotFiller → FoodCopyData | slot-pipeline.ts:67 |
| Step 4 | deriveFoodTokens + **renderFoodDetail** → `4_final/index.html` | slot-pipeline.ts:80-92 |
| Step 5 | runExporter | slot-pipeline.ts:97 |

### HTML draft 저장 위치
- 로컬 임시: `output/{localProjectId}/4_final/index.html`  
  (`ensureOutputDirs`가 생성, Vercel에서는 `/tmp/` 하위)
- Storage 업로드: `uploadPipelineOutput` → `projects/{supabaseProjectId}/4_final/index.html`  
  (버킷: `designs`, storage.ts:111 `defaultPatterns[0]`)
- `designs` 테이블: `output_url` JSON 컬럼 내 `html` 키 (storage.ts:196)

---

## 2. 데이터 매핑: projects 필드 → ProjectInput → BlocksComposerInput

### projects 테이블 주요 필드 (migrations 확인)
| DB 컬럼 | 출처 마이그레이션 | 용도 |
|---------|---------|------|
| `company_name` | 001_initial_schema | 제품명(productName으로 사용) |
| `product_highlights` | 001_initial_schema | 회사 소개 텍스트 |
| `category` | 001_initial_schema | 카테고리 슬러그 |
| `platform_id` → `platforms.slug` | 001 + JOIN | 플랫폼 슬러그 |
| `product_name` | 018_add_product_fields | 제품명 (Step2) |
| `product_description` | 018_add_product_fields | 제품 소개 |
| `selling_points` | 018_add_product_fields | 셀링 포인트 배열 |

### ProjectInput 구성 (pipeline-bridge.ts:75-82)
```typescript
const input: ProjectInput = {
  productName:       project.company_name,           // projects.company_name
  category:          project.category ?? 'food',     // projects.category
  platform:          platforms.slug ?? 'smartstore', // JOIN platforms
  productHighlights: composeProductContext(project),  // product_name + product_description
                                                      // + selling_points + product_highlights 합성
  targetAudience:    '일반 소비자',                   // 하드코딩 (확인 필요: DB 컬럼 없음)
  nukkiPaths:        nukkiPaths,                      // intake_files WHERE file_type='product_photo'
}
// brandColors, styleDirections, toneKeywords 등 ProjectInput 필드는 현재 미매핑
// → projects DB에 해당 컬럼이 없거나 pipeline-bridge에서 읽지 않음 (확인 필요)
```

### BlocksComposerInput 계약 (blocks-composer.ts:40-45)
```typescript
export interface BlocksComposerInput {
  brief: ProjectBrief       // pm.ts:buildProjectBrief(input, projectId) 그대로 재사용 가능
  images?: {
    hero?: string           // 첫 누끼컷 서명URL (pipeline-bridge.ts:90 heroImageUrl과 동일)
    lifestyle?: string[]    // 나머지 누끼컷 서명URLs
    cutout?: string
    section?: string[]
  }
  brandColors?: string[]    // ProjectInput.brandColors → 현재 미매핑 (확인 필요)
  outputDir: string         // dirs.base (ensureOutputDirs 결과)
}
```

### 매핑 요약 (bridge → composer)
| BlocksComposerInput | 현재 bridge에서 얻을 수 있는 값 |
|---------------------|-------------------------------|
| `brief` | `buildProjectBrief(input, localProjectId)` — pm.ts:40 그대로 호출 |
| `images.hero` | `heroImageUrl` (signed URL, pipeline-bridge.ts:90-94) |
| `images.lifestyle[]` | `nukkiPaths[1..]` (로컬 파일 경로 — 서명URL 아님, 추가 변환 필요) |
| `brandColors` | 현재 미수집 — projects 테이블에 컬럼 없음(확인 필요) |
| `outputDir` | `dirs.base` (ensureOutputDirs 반환값) |

---

## 3. 통합 지점: 분기 위치와 플래그 설계

### 핵심 통합 지점

**지점 A: `pipeline-bridge.ts:85-102` — 카테고리 분기 블록**

현재 코드:
```typescript
// pipeline-bridge.ts:84-102
const isFood = input.category === 'food'
let result
if (isFood) {
  const { runSlotPipeline } = await import('@/agents/slot-pipeline')
  result = await runSlotPipeline(input, { heroImageUrl })
} else {
  const { runPipeline } = await import('@/agents/pm')
  result = await runPipeline(input)
}
```

제안 삽입 위치: `isFood` 분기 앞에 `USE_BLOCKS` 플래그 분기를 추가(additive). 기존 두 경로는 기본값으로 유지.

```typescript
// 삽입 위치: pipeline-bridge.ts:84 직전
const useBlocks =
  process.env.USE_BLOCKS_COMPOSER === 'true' ||
  (project.use_blocks_composer === true)   // per-project 컬럼 (옵션 B)

if (useBlocks) {
  // 블록 컴포저 경로 (신규)
  const { runBlocksComposer } = await import('@/agents/blocks-composer')
  // ... brief 구성 + 이미지 매핑 + runBlocksComposer 호출
  // ... result를 PipelineResult 계약으로 래핑
} else if (isFood) {
  // 기존 슬롯 경로 (유지)
} else {
  // 기존 제너릭 경로 (유지)
}
```

### 플래그 후보 비교

| 방식 | 위치 | 장점 | 단점 |
|------|------|------|------|
| **A: 환경변수** `USE_BLOCKS_COMPOSER=true` | `.env.local` / Vercel 환경변수 | 즉시 적용, 코드 변경 없음, 글로벌 토글 | 프로젝트별 제어 불가 |
| **B: DB 컬럼** `projects.use_blocks_composer boolean default false` | Supabase migration | 프로젝트별 A/B 테스트 가능, 세밀한 제어 | 마이그레이션 파일 추가 필요 |
| **C: 환경변수 + DB 컬럼 조합** | 둘 다 | 전역 킬스위치(env) + 개별 활성화(DB) | 복잡도 약간 증가 |

**권장안: 환경변수(A)로 시작, 검증 후 DB 컬럼(B)으로 확장**

근거:
- 현재 `SKIP_IMAGE_GENERATION` 패턴(pm.ts:38)이 이미 env 방식으로 동작하고 있어 일관성 확보
- 초기에는 전체 on/off만 필요; 실운용 전환 시 DB 컬럼 추가하면 됨
- Vercel 환경변수로 배포 없이 토글 가능

---

## 4. 산출물 저장: 컴포저 HTML → designs 버킷 흐름

### 기존 저장 함수 재사용 경로

`runBlocksComposer`가 반환하는 `html: string` (blocks-composer.ts:50)을 기존 저장 흐름에 흘려보내는 방법:

**단계 1**: 컴포저 HTML을 `4_final/index.html` 경로에 직접 기록

```typescript
// pipeline-bridge.ts 내 blocks 경로에서:
const htmlPath = path.join(dirs.final, 'index.html')
fs.writeFileSync(htmlPath, composerResult.data.html, 'utf8')
```

`dirs.final`은 `ensureOutputDirs`(agents/utils.ts)가 반환하는 `output/{id}/4_final/`. 이 경로는 `uploadPipelineOutput`의 `defaultPatterns[0]`(`/4_final\/index\.html$/`)와 정확히 일치하므로 **기존 업로드 함수를 그대로 재사용** 가능.

**단계 2**: `uploadPipelineOutput(projectId, outputDir)` → storage.ts:106 그대로 호출

**단계 3**: `updateDesignUrls(projectId, urls)` → storage.ts:162 그대로 호출

**단계 4**: `transitionStatus(supabase, projectId, 'design_review')` → status-machine.ts:74 그대로 호출

### PipelineResult 래핑

blocks 경로에서 기존 `PipelineResult` 계약(pm.ts:65-73)을 맞추기 위한 최소 래핑:

```typescript
// pipeline-bridge.ts blocks 분기 내부 pseudo-code
const composerResult = await runBlocksComposer({
  brief,
  images: { hero: heroImageUrl, lifestyle: nukkiPaths.slice(1) },
  outputDir: dirs.base,
})
fs.writeFileSync(path.join(dirs.final, 'index.html'), composerResult.data!.html, 'utf8')
// page-spec.json은 runBlocksComposer 내부에서 자동 저장됨 (blocks-composer.ts:173)

// 이후 uploadPipelineOutput / updateDesignUrls / transitionStatus는 기존 코드 재사용
result = {
  projectId: localProjectId,
  success: composerResult.success,
  outputDir: dirs.base,
  htmlPath: path.join(dirs.final, 'index.html'),
  stages: { blocksComposer: { success: composerResult.success, durationMs: composerResult.durationMs } },
  retryCount: 0,
  totalDurationMs: composerResult.durationMs ?? 0,
}
```

`page-spec.json`은 `blocks-composer.ts:173`에서 `saveJson`으로 자동 저장됨. `uploadPipelineOutput`의 `defaultPatterns`에 `page-spec.json` 패턴을 추가하면 Storage에도 함께 업로드 가능.

---

## 5. 변경 파일 목록 (최소 diff)

| 파일 | 변경 내용 |
|------|----------|
| `lib/pipeline-bridge.ts` | `USE_BLOCKS_COMPOSER` env 플래그 읽기 + blocks 분기 추가 (기존 isFood/else 앞에 삽입) |
| `lib/storage.ts` | `defaultPatterns`에 `/page-spec\.json$/` 패턴 추가 (선택, page-spec 보존 원할 때) |
| `.env.local` | `USE_BLOCKS_COMPOSER=false` 기본 비활성 항목 추가 |
| `supabase/migrations/0XX_blocks_flag.sql` | `projects` 테이블에 `use_blocks_composer boolean default false` 컬럼 추가 (옵션 B 선택 시) |

**코드 수정 불필요 파일**: `agents/blocks-composer.ts`, `agents/templates/blocks/index.ts`, `lib/status-machine.ts`, `app/api/designs/generate/route.ts` — 모두 기존 그대로 사용.

---

## 6. 검증 계획

> HTTP 200은 실패해도 반환되므로 신뢰 금지. DB + Storage 객체 생성으로 검증.

### 6-1. DB 기반 검증 (필수)

```sql
-- 1. projects.status 도달 확인
SELECT id, status, updated_at
FROM projects
WHERE id = '<test-project-id>'
-- 기대값: status = 'design_review'

-- 2. designs 테이블 레코드 생성 확인
SELECT id, project_id, designer_status, output_url, preview_url, created_at
FROM designs
WHERE project_id = '<test-project-id>'
-- 기대값: 레코드 존재, output_url JSON에 'html' 키 포함

-- 3. 로그 전이 확인
SELECT from_status, to_status, created_at
FROM project_logs
WHERE project_id = '<test-project-id>'
ORDER BY created_at
-- 기대값: photo_uploaded → design_generating → design_review 순서
```

### 6-2. Storage 객체 생성 확인 (필수)

```
Supabase Dashboard → Storage → designs 버킷
경로: projects/{projectId}/4_final/index.html
확인: 객체 존재 + 크기 > 0

선택: projects/{projectId}/page-spec.json (page-spec 업로드 패턴 추가 시)
```

### 6-3. 렌더 확인 (HTML 정합성)

```bash
# designs 버킷에서 HTML 다운로드 후 검사
# 기대값:
# - hero 블록 포함 (hero-* variantId)
# - closing 블록 포함 (closing-* variantId)
# - 한국어 카피 존재
# - data-variant 속성으로 블록 식별 가능
```

### 6-4. 실패 케이스 검증

```sql
-- 실패 시 상태 롤백 확인 (pipeline-bridge.ts:134)
-- 기대값: status = 'photo_uploaded' (rollback)
SELECT status FROM projects WHERE id = '<test-project-id>'
```

---

## 7. 리스크 / 주의사항

### R1: 무음 에러 (가장 큰 리스크)
**위치**: pipeline-bridge.ts:105-110  
`uploadPipelineOutput`의 개별 파일 업로드 실패는 `result.errors` 배열에 기록되지만 함수는 계속 진행. 블록 경로에서도 동일. `result.errors.length > 0`이어도 pipeline은 `design_review`로 전이할 수 있음.  
**대응**: blocks 분기에서 `4_final/index.html` 업로드 성공 여부를 별도로 체크. `urls['4_final/index.html']`이 없으면 실패 처리.

### R2: Vercel 타임아웃
**위치**: route.ts:5 `export const maxDuration = 300` (5분)  
`runBlocksComposer`는 Claude Sonnet 1회 호출(max_tokens 16384, blocks-composer.ts:148) + 실패 시 재시도 1회. 예상 시간: ~30-60초. 기존 runPipeline(~3-5분)보다 훨씬 짧으므로 타임아웃 리스크 낮음.  
**단, 주의**: nukkiPaths → 서명URL 변환(storage.createSignedUrl)을 blocks 경로에서도 수행해야 함. 현재 pipeline-bridge.ts:88-95는 `isFood`일 때만 첫 파일만 변환. blocks 경로에서 복수 이미지 변환이 필요하면 추가 API 호출 발생.

### R3: nukkiPaths vs 서명URL 불일치
**위치**: pipeline-bridge.ts:57-67  
`nukkiPaths`는 로컬 임시 파일 경로(`/tmp/...`). `BlocksComposerInput.images.lifestyle`에 직접 전달하면 AI 프롬프트에 로컬 경로가 포함됨(blocks-composer.ts:105). Claude API는 로컬 경로를 읽을 수 없으므로 **반드시 Supabase 서명URL로 변환 필요**.  
`heroImageUrl` 생성 패턴(pipeline-bridge.ts:88-95)을 나머지 파일에도 적용해야 함.

### R4: outputDir 경로 충돌
**위치**: pm.ts:298-299, slot-pipeline.ts:35-36  
`runPipeline`/`runSlotPipeline`은 내부에서 `crypto.randomUUID()`로 자체 `localProjectId`를 생성하고 `ensureOutputDirs`를 호출함. blocks 경로에서는 pipeline-bridge가 별도로 `ensureOutputDirs`를 호출하거나, `outputDir`을 직접 계산해 `BlocksComposerInput.outputDir`에 전달해야 함. `ensureOutputDirs`가 `agents/utils.ts`에 정의되어 있으므로 임포트해서 사용 가능.

### R5: designs 버킷 public 설정
**위치**: storage.ts:31 `getPublicUrl`  
블록 컴포저가 생성한 HTML에 포함된 이미지 src URL이 `designs` 버킷 public URL을 참조할 경우, 버킷이 public으로 설정되어 있어야 렌더링됨. 현재 슬롯 경로는 로컬 파일 경로가 HTML에 삽입되는 구조이므로 export 시 Playwright가 로컬에서 스크린샷. blocks 경로에서 이미지를 서명URL로 넣으면 Playwright 없이도 URL 접근 가능하나, 서명URL 만료(7일 설정, pipeline-bridge.ts:92) 주의.

### R6: blocks 변형 라이선스
**위치**: agents/templates/blocks/index.ts 주석  
`// Figma 200섹션 인제스천 파일럿` 주석 존재. Figma 200개 템플릿 소스의 클론 금지 조건 여부 확인 필요. 현재 코드로 구현된 변형은 자체 구현이므로 배포 자체는 문제없으나, 향후 Figma 인제스천 어댑터 추가 시 라이선스 검토 필요.

---

## 8. 통합 순서 제안

1. `.env.local`에 `USE_BLOCKS_COMPOSER=false` 추가 (기본 비활성)
2. `pipeline-bridge.ts`에 blocks 분기 삽입 (additive, 기존 경로 보존)
3. 테스트 프로젝트에서 `USE_BLOCKS_COMPOSER=true`로 로컬 실행
4. DB 검증(섹션 6-1, 6-2) 통과 확인
5. Vercel 환경변수에 추가 후 스테이징 검증
6. 이후 필요 시 `projects.use_blocks_composer` DB 컬럼으로 전환
