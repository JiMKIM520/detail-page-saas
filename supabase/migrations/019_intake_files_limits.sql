-- 019: intake-files 업로드 하드 제한 + file_type 제약 버그 수정
-- 배경: 버킷이 file_size_limit/allowed_mime_types 둘 다 null(무제한)이고,
--       file_type 제약에 brand_logo·reference_design가 빠져 해당 업로드 시 메타 insert가
--       제약위반(500)으로 제출이 실패하던 문제.

-- (1) 버킷 하드 제한: 20MiB + 이미지/PDF만 허용 (클라이언트 MAX_FILE_MB=20과 동기화)
update storage.buckets
set file_size_limit = 20971520,                        -- 20 MiB
    allowed_mime_types = array['image/*', 'application/pdf']
where id = 'intake-files';

-- (2) file_type 제약에 brand_logo, reference_design 추가
alter table intake_files drop constraint if exists intake_files_file_type_check;
alter table intake_files add constraint intake_files_file_type_check
  check (file_type in ('product_photo', 'brochure', 'detail_capture', 'brand_logo', 'reference_design', 'other'));
