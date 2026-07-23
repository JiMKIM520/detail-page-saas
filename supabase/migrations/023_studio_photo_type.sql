-- 촬영 누끼(studio_photo) 파일 타입 허용 — 포토그래퍼가 /photography에서 등록하는
-- 전문 촬영본. 파이프라인(fetchProductRefFiles)이 사업자 업로드 원본보다 우선 사용한다.
alter table intake_files drop constraint if exists intake_files_file_type_check;
alter table intake_files add constraint intake_files_file_type_check
  check (file_type in ('product_photo', 'brochure', 'detail_capture', 'brand_logo', 'reference_design', 'studio_photo', 'other'));
