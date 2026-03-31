# DetailAI Agent Company 설계서

> **목표**: 상세페이지 자동 생성 서비스를 에이전트 회사 형태로 운영하여 24시간 무인 처리
>
> **트랙 비교**: 웹앱(사람 개입) vs 에이전트(자동화) 병행 운영으로 사업성 검증
>
> **도구**: Paperclip (에이전트) + n8n (워크플로우) + Supabase (데이터) + Claude API (AI)

---

## 1. 회사 구조

```
                    ┌──────────────┐
                    │   PM Agent   │ ← 전체 오케스트레이션
                    │  (대표이사)   │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
  ┌───────┴──────┐ ┌──────┴───────┐ ┌──────┴───────┐
  │ 접수팀       │ │ 제작팀       │ │ 품질관리팀   │
  │ Intake Agent │ │ Production   │ │ QA Agent     │
  └──────────────┘ │              │ └──────────────┘
                   ├─ Script Agent│
                   ├─ Photo Agent │
                   └─ Design Agent│
```

---

## 2. 에이전트 상세

### 2.1 PM Agent (오케스트레이터)

| 항목 | 내용 |
|------|------|
| **역할** | 전체 파이프라인 모니터링, 지연 감지, 에스컬레이션, 클라이언트 커뮤니케이션 |
| **트리거** | 상시 (5분 주기 폴링 또는 이벤트 기반) |
| **입력** | Supabase projects 테이블 상태 |
| **출력** | 다음 에이전트 호출 지시, 지연 알림, 클라이언트 안내 메일 |
| **모델** | Haiku (비용 효율, 단순 라우팅) |

**시스템 프롬프트**:
```
당신은 DetailAI의 프로젝트 매니저입니다.
Supabase에서 프로젝트 상태를 확인하고, 각 단계별 에이전트에게 작업을 배정합니다.

역할:
1. 새로운 의뢰(intake_submitted)가 있으면 접수 에이전트에게 전달
2. 각 단계가 완료되면 다음 단계 에이전트를 호출
3. 24시간 이상 정체된 프로젝트는 관리자에게 알림
4. 클라이언트에게 진행 상황 안내 메일 발송

상태 머신:
intake_submitted → script_generating → script_review → script_approved → photo_scheduled → photo_uploaded → design_generating → design_review → design_approved → delivered
```

---

### 2.2 Intake Agent (접수 매니저)

| 항목 | 내용 |
|------|------|
| **역할** | 의뢰 접수 검증, 카테고리×플랫폼 호환성 확인, 누락 정보 요청 |
| **트리거** | 프로젝트 상태 = `intake_submitted` |
| **입력** | 프로젝트 데이터 (기업명, 카테고리, 플랫폼, 강조 포인트, 첨부 파일) |
| **출력** | 검증 완료 → Script Agent 호출 / 정보 부족 → 클라이언트에 보완 요청 |
| **모델** | Haiku |

**시스템 프롬프트**:
```
당신은 DetailAI의 접수 담당자입니다.
새 의뢰가 들어오면 다음을 확인합니다:

1. 필수 정보 확인: 기업명, 카테고리, 플랫폼, 강조 포인트
2. 카테고리×플랫폼 호환성 매트릭스 확인:
   - ◎(best), ○(good): 통과
   - △(limited): 경고 메모 추가 후 통과
   - ×(none): 차단, 클라이언트에 대안 플랫폼 추천
3. 제품 사진 첨부 여부 확인 (최소 1장)
4. 모든 조건 충족 시 "script_generating" 상태로 전환

[호환성 매트릭스]
food: {smartstore: best, coupang: best, kakao: best, 11st: good, gmarket: good, ohouse: limited, musinsa: none}
health-food: {smartstore: best, coupang: best, 11st: good, gmarket: good, kakao: good, ohouse: none, musinsa: none}
beauty: {kakao: best, ssg: best, smartstore: good, coupang: good, musinsa: good, ohouse: none}
fashion: {musinsa: best, smartstore: good, 11st: good, gmarket: good, coupang: limited, kakao: limited, ohouse: none}
living: {smartstore: best, coupang: best, gmarket: best, ohouse: best, 11st: good, kakao: good, musinsa: limited}
electronics: {smartstore: best, coupang: best, 11st: best, gmarket: best, kakao: good, ohouse: limited, musinsa: none}
pet: {smartstore: best, coupang: best, 11st: good, gmarket: good, kakao: good, ohouse: good, musinsa: none}
```

---

### 2.3 Script Agent (스크립트 라이터)

| 항목 | 내용 |
|------|------|
| **역할** | 카테고리×플랫폼 분화 프롬프트로 상세페이지 스크립트 생성 |
| **트리거** | 프로젝트 상태 = `script_generating` |
| **입력** | 프로젝트 데이터 + 제품 이미지 + 카테고리 프롬프트 + 플랫폼 프롬프트 |
| **출력** | 스크립트 JSON (sections, shooting_requirements, tone, color_suggestion) |
| **모델** | Sonnet (Vision 포함, 이미지 분석 필요) |

**시스템 프롬프트**: `lib/ai/prompts/builder.ts`의 `buildDifferentiatedSystemPrompt()` 출력을 그대로 사용.

카테고리별 프롬프트 파일 위치:
- `lib/ai/prompts/categories/food.ts` (식품)
- `lib/ai/prompts/categories/health-food.ts` (건강기능식품)
- `lib/ai/prompts/categories/beauty.ts` (뷰티)
- `lib/ai/prompts/categories/fashion.ts` (패션)
- `lib/ai/prompts/categories/living.ts` (생활용품)
- `lib/ai/prompts/categories/electronics.ts` (전자제품)
- `lib/ai/prompts/categories/pet.ts` (반려동물)

---

### 2.4 QA Agent (법적 컴플라이언스 검증)

| 항목 | 내용 |
|------|------|
| **역할** | 생성된 스크립트의 법적 컴플라이언스 자동 검증 |
| **트리거** | 스크립트 생성 완료 후 (script_review 전) |
| **입력** | 스크립트 JSON + 해당 카테고리의 금지 표현 목록 |
| **출력** | PASS (→ script_review) / FAIL (→ 위반 항목 + 수정 요청 → Script Agent 재생성) |
| **모델** | Haiku (패턴 매칭 중심, 비용 효율) |

**시스템 프롬프트**:
```
당신은 이커머스 법적 컴플라이언스 검증 전문가입니다.
생성된 상세페이지 스크립트에서 법적 위반 사항을 검출합니다.

검증 절차:
1. 해당 카테고리의 금지 표현 테이블과 스크립트 전문 대조
2. 질병명 직접 언급 여부 (식품/건기식)
3. 효능 단정 표현 여부 ("~합니다" vs "도움을 줄 수 있습니다")
4. 인증 마크 누락 여부 (KC, GMP, HACCP 등)
5. 필수 면책 문구 포함 여부 (건기식: "의약품이 아닙니다")
6. 타사 비방/부당 비교 표현 여부

출력 형식:
{
  "result": "PASS" | "FAIL",
  "violations": [
    {
      "section_index": 2,
      "text": "위반 텍스트",
      "rule": "위반 규칙",
      "suggestion": "수정 제안"
    }
  ],
  "compliance_score": 0-100
}

기준: violations가 1개라도 있으면 FAIL.
FAIL 시 Script Agent에게 violations 목록과 함께 재생성을 요청합니다.
최대 3회 재시도 후에도 FAIL이면 사람 검토로 에스컬레이션합니다.
```

**카테고리별 금지 표현 참조**:
- 식품: 질병명(당뇨, 암, 고혈압) 언급, 의약품적 표현, 타사 비방
- 건기식: 부원료 과장, 전문가 권위 차용, 명현반응 주장, 면책 문구 누락
- 뷰티: 피부 질환 치료 표현, "세포 재생", "독소 배출", 무인증 천연/오가닉
- 패션: 소재 허위 표기, 타 브랜드 모방 주장, 근거 없는 최저가
- 생활용품: 인체 무해 단정, 조건 없는 "99.9% 제거", KC 미인증
- 전자제품: 근거 없는 최고 성능, 고장 불가 주장
- 반려동물: 질병 치료 표현, 전문가 보증, 처방식 표현

---

### 2.5 Photo Director Agent (촬영 디렉터)

| 항목 | 내용 |
|------|------|
| **역할** | 승인된 스크립트 기반 촬영 가이드 생성 + 일정 조율 |
| **트리거** | 프로젝트 상태 = `script_approved` |
| **입력** | 승인된 스크립트 JSON의 shooting_requirements + 카테고리 촬영 가이드 |
| **출력** | 상세 촬영 체크리스트 (컷별 앵글, 조명, 소품, 주의사항) |
| **모델** | Haiku |

---

### 2.6 Design Agent (디자인 디렉터)

| 항목 | 내용 |
|------|------|
| **역할** | 업로드된 촬영 사진 + 스크립트 기반 상세페이지 디자인 생성 |
| **트리거** | 프로젝트 상태 = `photo_uploaded` |
| **입력** | 스크립트 JSON + 촬영 사진 + 플랫폼 이미지 스펙 |
| **출력** | Vertex AI Imagen 4로 생성된 디자인 이미지 |
| **모델** | Sonnet (Imagen API 호출 오케스트레이션) |

---

## 3. 핸드오프 규칙 (상태 전환)

```
intake_submitted
    ↓ [Intake Agent: 검증 통과]
script_generating
    ↓ [Script Agent: 스크립트 생성]
    ↓ [QA Agent: 컴플라이언스 검증 — PASS]
script_review
    ↓ [트랙A: 사람 승인 / 트랙B: 자동 승인 (QA 통과 시)]
script_approved
    ↓ [Photo Director: 촬영 가이드 생성]
photo_scheduled
    ↓ [외부: 촬영 완료 + 업로드 — 현재 수동]
photo_uploaded
    ↓ [Design Agent: 디자인 생성]
design_generating → design_review
    ↓ [트랙A: 사람 승인 / 트랙B: 자동]
design_approved → delivered
```

### 트랙 A vs 트랙 B 차이점

| 단계 | 트랙 A (웹앱) | 트랙 B (에이전트) |
|------|:---:|:---:|
| 접수 검증 | IntakeForm UI | Intake Agent 자동 |
| 스크립트 생성 | Claude API 직접 | Script Agent |
| 스크립트 검토 | Planner가 승인/반려 | QA Agent 자동 검증 → 통과 시 자동 승인 |
| 촬영 가이드 | 자동 생성 + 사람 확인 | Photo Director 자동 |
| 디자인 생성 | Imagen API 직접 | Design Agent |
| 디자인 검토 | Designer가 승인/반려 | 자동 승인 (추후 품질 AI 추가 가능) |
| 클라이언트 소통 | 웹 대시보드 | PM Agent 자동 메일/알림 |

---

## 4. n8n 워크플로우 설계

### 4.1 트리거 워크플로우

```
[Supabase Trigger: projects INSERT/UPDATE]
    ↓
[Switch: status 값 분기]
    ├─ intake_submitted → Paperclip: Intake Agent 호출
    ├─ script_generating → Paperclip: Script Agent 호출
    ├─ script_review → Paperclip: QA Agent 호출
    ├─ script_approved → Paperclip: Photo Director 호출
    ├─ photo_uploaded → Paperclip: Design Agent 호출
    └─ delivered → Gmail: 클라이언트 납품 안내 메일
```

### 4.2 모니터링 워크플로우 (PM Agent 보조)

```
[Cron: 매 1시간]
    ↓
[Supabase: 24시간 이상 정체 프로젝트 조회]
    ↓
[IF 존재] → Gmail: 관리자 알림 + Slack/카톡 알림
```

### 4.3 클라이언트 알림 워크플로우

```
[Supabase Trigger: 상태 변경]
    ↓
[Switch: 새 상태]
    ├─ script_review → Gmail: "스크립트 검토 준비 완료" 안내
    ├─ design_review → Gmail: "디자인 확인 요청" 안내
    └─ delivered → Gmail: "납품 완료" + 다운로드 링크
```

---

## 5. 비용 추정 (건당)

| 에이전트 | 모델 | 예상 토큰 | 비용 |
|----------|------|-----------|------|
| PM Agent | Haiku | ~1K | ~$0.001 |
| Intake Agent | Haiku | ~2K | ~$0.002 |
| Script Agent | Sonnet (Vision) | ~8K | ~$0.05 |
| QA Agent | Haiku | ~3K | ~$0.003 |
| Photo Director | Haiku | ~2K | ~$0.002 |
| Design Agent | Sonnet + Imagen | ~5K + Imagen | ~$0.03 + Imagen비용 |
| **합계** | | | **~$0.09 + Imagen** |

트랙 A(웹앱) 대비 사람 인건비가 제거되므로, 에이전트 비용이 훨씬 저렴합니다.

---

## 6. 단계별 구현 로드맵

### Phase 1: 핵심 에이전트 (1주)
- [ ] Paperclip: Script Agent + QA Agent 구성
- [ ] n8n: Supabase → Paperclip 트리거 워크플로우
- [ ] 테스트: 실제 의뢰 1건으로 트랙 A vs 트랙 B 비교

### Phase 2: 전체 파이프라인 (2주)
- [ ] Paperclip: Intake Agent + Photo Director + Design Agent 추가
- [ ] n8n: 클라이언트 알림 워크플로우
- [ ] PM Agent 모니터링 워크플로우

### Phase 3: 최적화 + 비교 (2주)
- [ ] 10건 이상 처리 후 트랙 A/B 비교 데이터 수집
- [ ] QA Agent 정확도 튜닝 (False Positive/Negative 분석)
- [ ] OpenClaw 내재화 검토

### Phase 4: 스케일업
- [ ] 24시간 무인 운영 전환
- [ ] 클라이언트 셀프서비스 (이메일 의뢰 → 자동 처리 → 자동 납품)
- [ ] 월 처리량 목표 설정 + 비용 최적화

---

## 7. 비교 측정 계획

트랙 A/B 각 10건 처리 후 아래 데이터 수집:

| 지표 | 측정 방법 |
|------|----------|
| 처리 시간 | Supabase: created_at → status='delivered' 차이 |
| 건당 비용 | API 호출 비용 + 인건비 (트랙A만) |
| 컴플라이언스 통과율 | QA Agent 결과 vs 사람 검토 결과 비교 |
| 수정 요청 횟수 | comments 테이블 count per project |
| 클라이언트 만족도 | 납품 후 설문 (1-5점) |
