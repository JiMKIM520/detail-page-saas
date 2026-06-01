# 상세페이지 디자인 가이드 v3 — 레퍼런스 기반

## 레퍼런스 분석 결과

### 공통 디자인 패턴 (모든 카테고리)

1. **배경색 교차가 섹션 구분의 핵심**
   - 선이나 구분선 없이, 배경색만으로 섹션 전환
   - 패턴: 다크 → 크림 → 화이트 → 베이지 → 다크 → ...
   - 카테고리별 기본 컬러가 다름 (식품=웜브라운, 뷰티=핑크/그린)

2. **제품 사진이 디자인의 일부**
   - 사진이 단순히 삽입되는 게 아니라 배경/레이아웃과 유기적으로 결합
   - 사진 위에 텍스트가 자연스럽게 오버레이
   - 사진이 섹션 경계를 넘어가기도 함 (오버랩)

3. **대형 한글 타이포그래피**
   - 섹션 제목이 매우 크고 굵음 (48~72px 수준)
   - 제목 내 핵심 단어에 컬러/굵기 강조
   - 명조+고딕 혼용으로 감성+가독성 동시 확보

4. **아이콘/배지가 디자인 요소**
   - 체크마크, 원형 아이콘, 라벨 태그 활용
   - 인증 뱃지 (HACCP, GMP 등) 가로 나열
   - 숫자 강조 (4.9/5, 92%, 12,000개)

5. **스토리텔링 흐름**
   - 히어로 → 타겟 고객 공감 → 해결책 → 스펙 → 사용법 → 인증/리뷰 → CTA
   - 각 섹션이 "왜 이 제품인가"를 순서대로 설득

### 카테고리별 차이

| 카테고리 | 컬러 톤 | 사진 스타일 | 타이포 | 특수 섹션 |
|---------|---------|-----------|--------|---------|
| 식품 | 웜 브라운/크림/베이지 | 시즐컷, 플레이팅 | 감성적 명조 | 조리법, 원재료 스토리 |
| 뷰티 | 핑크/민트/화이트 | 텍스처, 모델 | 세련된 영문+한글 | 성분 다이어그램, Before/After |
| 전자제품 | 다크그레이/블랙/블루 | 제품 중심 | 강렬한 고딕 | 스펙 비교표, 기능 다이어그램 |

## HTML/CSS 구현 전략

### 1. 히어로 섹션
```
[레퍼런스 패턴]
- 풀블리드 배경 (컬러 or 스타일링샷)
- 하단에 대형 타이포 오버레이
- 브랜드 로고 상단

[HTML/CSS 구현]
- background-image: url(스타일링샷) + linear-gradient 오버레이
- position: relative → absolute 텍스트 배치
- font-size: 56px, font-weight: 900
- text-shadow for 가독성
```

### 2. 장점/혜택 섹션
```
[레퍼런스 패턴]
- 배경색 전환 (크림/베이지)
- 아이콘 + 제목 + 설명 카드
- 또는 체크마크 리스트
- 중간에 제품 사진 풀블리드 삽입

[HTML/CSS 구현]
- CSS Grid 2열 카드
- SVG 아이콘 (Heroicons/Phosphor)
- 카드: background, border-radius, box-shadow
- 제품 사진: width: 100%, object-fit: cover
```

### 3. 제품 상세 섹션
```
[레퍼런스 패턴]
- 제품 사진이 크게 (풀블리드 or 50%+)
- 옆에 텍스트 리스트
- 또는 제품 중심에 놓고 주위에 특징 배치

[HTML/CSS 구현]
- flexbox 좌우 배치 (이미지 60% + 텍스트 40%)
- 또는 position: relative로 제품 이미지 중심 + absolute 텍스트
- 체크마크 리스트: ::before pseudo-element
```

### 4. 스토리/브랜드 섹션
```
[레퍼런스 패턴]
- 다크 배경 (브라운/네이비)
- 흰색 텍스트, 감성적 카피
- 큰 따옴표 장식

[HTML/CSS 구현]
- background-color: #8B4513 (식품) 또는 카테고리 컬러
- color: white
- ::before content: """ 장식 요소
- max-width: 680px, margin: 0 auto (중앙 정렬)
```

### 5. 사용법 섹션
```
[레퍼런스 패턴]
- 번호가 큰 스텝 (1, 2, 3)
- 각 스텝에 아이콘 or 이미지
- 배경색 교차

[HTML/CSS 구현]
- counter CSS 또는 큰 숫자 span
- flexbox 가로 배치 (모바일: 세로)
- 스타일링샷을 각 스텝 이미지로 삽입
```

### 6. CTA 섹션
```
[레퍼런스 패턴]
- 브랜드 컬러 풀블리드 배경
- 큰 가격 텍스트
- 버튼형 요소
- 긴급 문구 ("오늘만", "한정 수량")

[HTML/CSS 구현]
- background-color: primary color
- font-size: 72px (가격)
- border-radius: 50px 버튼
- animation: pulse (긴급 뱃지)
```

## 핵심 CSS 기법

### 디자인 퀄리티를 높이는 CSS
```css
/* 타이포그래피 계층 */
.hero-title { font-size: 56px; font-weight: 900; line-height: 1.2; letter-spacing: -1px; }
.section-title { font-size: 42px; font-weight: 700; }
.card-title { font-size: 24px; font-weight: 600; }
.body-text { font-size: 18px; font-weight: 400; line-height: 1.8; }

/* 제목 내 키워드 강조 */
.highlight { color: #E8943A; font-weight: 900; }

/* 풀블리드 이미지 */
.full-bleed { width: 100%; margin: 0; padding: 0; }
.full-bleed img { width: 100%; height: auto; display: block; }

/* 배경 이미지 + 그라데이션 오버레이 */
.hero {
  background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%),
              url('styling-shot.jpg') center/cover;
}

/* 카드 디자인 */
.card {
  background: #FAFAF5;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

/* 라벨 태그 */
.label {
  display: inline-block;
  background: #E8943A;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

/* 장식적 따옴표 */
.quote::before {
  content: "\201C";
  font-size: 120px;
  color: rgba(255,255,255,0.2);
  position: absolute;
  top: -20px;
  left: 20px;
}

/* 숫자 강조 */
.stat-number {
  font-family: 'Gmarket Sans', sans-serif;
  font-size: 64px;
  font-weight: 700;
  color: #E8943A;
}
```

## Playwright 캡처 설정
```typescript
await page.setViewportSize({ width: 860, height: 1200 });
// deviceScaleFactor: 2 = 레티나급 (1720px 실제 출력)
// deviceScaleFactor: 3 = 인쇄급 (2580px 실제 출력)
const browser = await chromium.launch();
const context = await browser.newContext({
  deviceScaleFactor: 2,
  viewport: { width: 860, height: 1200 }
});
const page = await context.newPage();
await page.setContent(html, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'output.png', fullPage: true });
```
