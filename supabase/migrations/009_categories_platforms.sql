-- 카테고리 테이블 생성
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  legal_summary text,
  tone text,
  created_at timestamptz default now()
);

-- 7대 카테고리 시드
insert into categories (name, slug, legal_summary, tone) values
('식품/농축수산물', 'food',
 '식품표시광고법 제8조. 원재료명·영양성분·알레르기·소비기한·원산지 필수. 의약품적 표현 금지.',
 '따뜻한 전문성'),
('건강기능식품', 'health-food',
 '건강기능식품법. 식약처 인정 기능성 문구만 허용. 부원료 과장·전문가 권위 차용·명현반응 주장 금지. GMP·인증마크 필수.',
 '극도로 이성적·논리적'),
('뷰티/화장품', 'beauty',
 '화장품법 제13조. 전성분·사용기한·내용량 필수. 피부 세포 재생·영구적 미백·독소 배출 등 금지.',
 '세련되고 감각적 + 전문적'),
('패션/의류/잡화', 'fashion',
 '섬유제품품질표시규정. 섬유 조성·혼용률·사이즈 스펙·원산지·세탁 방법 필수.',
 '트렌디하고 감각적'),
('생활용품', 'living',
 '전기용품안전관리법, 생활화학제품안전관리법. KC 인증·성분 정보·사용 주의사항 필수.',
 '실용적이고 신뢰감 있는'),
('전자제품', 'electronics',
 '전기용품안전관리법. KC 인증·정격 스펙·소비전력·A/S 정보 필수. 과장 성능 표현 금지.',
 '기술적이고 정밀한'),
('반려동물', 'pet',
 '사료관리법. 원재료·영양성분·급여량·주의사항 필수. 질병 치료 효능 표현 금지.',
 '따뜻하고 전문적인');

-- 플랫폼 추가 (기존 4개 + 신규 5개)
insert into platforms (name, slug, style_guide) values
('11번가', '11st',
 '11번가 상세페이지: 가로 831px, 모바일 최적화 필수. 가격 비교 강조, 할인율 뱃지 활용. 깔끔한 그리드 레이아웃.'),
('오늘의집', 'ohouse',
 '오늘의집 상세페이지: 가로 1440px 고해상도. 라이프스타일 연출 이미지 중심. 공간 배치 사진 필수. 감성적 스토리텔링.'),
('무신사', 'musinsa',
 '무신사 상세페이지: 가로 1500px 이상 고해상도. 착용 사진 필수 (다각도). 사이즈 실측표 필수. 미니멀하고 트렌디한 톤.'),
('위메프', 'wemakeprice',
 '위메프 상세페이지: 딜/특가 강조형. 할인율·타임세일 배너 상단 배치. 간결하고 직관적인 구성.'),
('SSG', 'ssg',
 'SSG 상세페이지: 프리미엄 톤. 고급스러운 이미지 연출, 브랜드 스토리 강조. 여백 활용한 고급 레이아웃.')
on conflict (slug) do nothing;

-- 기존 플랫폼 style_guide 업데이트 (정확한 스펙 반영)
update platforms set style_guide =
 '스마트스토어 상세페이지: 가로 860px 권장. 상단 히어로 → 특징 3-5개 → 사용법 → 리뷰 → CTA. 이미지:텍스트 7:3. 모바일 비율 85% 이상 고려.'
where slug = 'smartstore';

update platforms set style_guide =
 '쿠팡 상세페이지: 이미지 용량 3MB 이하. 로켓배송 뱃지 활용. 간결한 아이콘+텍스트 조합. 모바일 세로형 최적화. 비교표 효과적.'
where slug = 'coupang';

update platforms set style_guide =
 'G마켓 상세페이지: 가격 비교 강조형. 할인/혜택 배너 상단, 스펙 표 포함, 배송/AS 정보 하단. 원색 강조색 사용.'
where slug = 'gmarket';

update platforms set style_guide =
 '카카오쇼핑 상세페이지: 감성적 톤. 라이프스타일 이미지 중심, 스토리텔링형 구성, 따뜻한 색감. 선물하기 연동 고려.'
where slug = 'kakao';

-- projects 테이블에 category_id 컬럼 추가
alter table projects add column category_id uuid references categories(id);

-- 기존 데이터 마이그레이션: category 텍스트 → category_id UUID
update projects p set category_id = c.id
from categories c
where (p.category = '식품' and c.slug = 'food')
   or (p.category = '뷰티' and c.slug = 'beauty')
   or (p.category = '패션' and c.slug = 'fashion')
   or (p.category = '생활용품' and c.slug = 'living')
   or (p.category = '전자제품' and c.slug = 'electronics');

-- category 텍스트 컬럼은 유지 (하위 호환), 새 프로젝트는 category_id 사용
