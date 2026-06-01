# DetailAI 최종 결과물 (2026-06-01)

3종 데모(돈덕 순대·쌀과밀 소금빵·황태이야기) 실제 한국어 상세페이지 완성. 전부 Claude 스크립트 + Gemini 섹션 이미지(육안 검증, 클라이언트급 품질).

## 최종 샘플 (status=design_review/delivered, 더미 제거 완료)
| 제품 | 섹션 | 스크립트 | 텍스트 품질 | project_id |
|------|------|----------|------------|------------|
| 돈덕 순대 | 7 + PDF | claude-sonnet-4 | 한국어 완벽 (국내산 100% 전통순대 / 45% 타임딜 ₩14,900) | 5d2f266f-4f34-4562-9223-6d3050b518b2 |
| 쌀과밀 소금빵 | 6 + PDF | claude-sonnet-4 | 한국어 완벽 (매일 아침 갓 구운 행복 / 45% 할인 ₩8,200) | c0ff7994-4c13-4bbf-9ddd-d621bcfd5096 |
| 황태이야기 | 7 + PDF | claude-sonnet-4 | 한국어 완벽 (120일 자연건조 / 대관령 덕장 직송 / 69% 할인) | 5b919f67-b9b7-4c43-a33a-108bb05dd5d7 |

섹션 이미지 공개 URL: `designs` 버킷 `projects/{id}/design_v1_{type}_{ts}.png`, PDF: `design_v1_{ts}.pdf`.
운영자 검수: `/designer/{id}`, 사업자 결과 확인: `/projects/{id}`.

## 검증 요약 (DB·브라우저·산출물)
- **GOAL1 웹앱**: 전 12개 페이지 렌더 확인(로그인/admin/projects/projects[id]/intake/dashboard/planner/planner[id]/photography/photography[id]/designer/designer[id]/users) + 상호작용(배정·코멘트·편집·AB생성·재생성·검수전달·사용자관리·이미지보호·미인증차단·intake 1회제한 RPC). 빌드 green, 콘솔 에러 0.
- **GOAL2 실제 샘플**: 3종 모두 최신 script=claude + 제품정보 반영 + 실제 섹션 이미지. model=demo 더미 전량 제거.
- **GOAL3 최종 결과물**: 3종 히어로 육안 검증 — 한국어 정확·전문 푸드포토·클라이언트 즉시 제시 가능.

## 이번 작업에서 수정한 버그 (9건)
1. 전역 무효 ANTHROPIC_API_KEY가 .env.local 가림 (401) → ~/.zshrc 주석
2. 인테이크 이미지 413 → 1568px 리사이즈
3. photography/complete 인증 누락 → 권한 가드
4. 재승인 시 500 → 409 가드
5. updateDesignUrls 유령 컬럼 edited_html_url → designs row 무음 실패 수정 + 에러 표면화
6. role/API 불일치 4개 라우트 → planner/designer 허용
7. prompt_ready 업로드 슬롯 미생성 → styling shots 기준 슬롯 생성
8. generateDesignForProject 승인 스크립트 .single() 다중 실패 → 최신 1건 사용
9. Gemini 이미지 텍스트 영어 렌더 → 프롬프트 한글 전용 강제 + 영어/오타 금지

## 알려진 한계 / 후속
- Gemini 이미지 텍스트는 비결정적 — 드물게 영어로 나올 수 있음(재생성으로 해결). 한글강제 프롬프트로 확률 개선.
- 장시간 작업(디자인 기획 ~223초, 초안 ~9분) Vercel 300초 한도 초과 → 배포 시 비동기 잡 분리 필요 (로컬/사전생성 데모는 무관).
- 스타일링샷 업로드는 데이터 경로·실제 소비(쌀과밀 초안이 업로드샷 사용)까지 검증됨. 브라우저 파일선택 클릭만 수동 미실행.
