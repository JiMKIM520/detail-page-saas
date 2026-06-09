-- 018: 의뢰 폼 제품 정보 분리 (AI 스크립트 입력용)
-- 기존 product_highlights = "회사 소개"로 유지하고, 제품 전용 필드를 추가한다.
-- 모두 nullable(추가형) — 기존 데이터/흐름 무회귀.

alter table projects
  add column if not exists product_name text,
  add column if not exists product_description text,
  add column if not exists selling_points jsonb;

comment on column projects.product_name is '제품명 (의뢰 Step2)';
comment on column projects.product_description is '제품 소개 (의뢰 Step2, AI 스크립트 입력)';
comment on column projects.selling_points is '셀링 포인트 문자열 배열 (의뢰 Step2, 최소 3개)';
