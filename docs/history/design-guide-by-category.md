# 상세페이지 디자인 방향 결정 프레임워크

> **원칙**: 고정된 스타일은 없다. 제품·브랜드·클라이언트 요구를 입력받아 매번 방향을 도출한다.  
> **참고**: 카테고리별 섹션 구조·촬영 가이드·법적 규정 → `script-differentiation-guide.md`  
> **작성일**: 2026-04-04

---

## 1. 디자인 방향 결정 입력값

```
1. 카테고리          → 식품 / 뷰티 / 전자제품 / 패션 / 가구 / 건강 / 반려동물 / 스포츠
2. 가격 포지셔닝     → 프리미엄 / 중간 / 가성비
3. 브랜드 성격       → 전통·권위 / 과학·기술 / 자연·유기농 / 트렌디·감성 / 글로벌·모던
4. 주요 타겟         → 연령대 + 라이프스타일 (예: 30-40대 건강 관심 여성)
5. 클라이언트 요청   → 레퍼런스 이미지 / 기피 스타일 / 브랜드 컬러 / 특별 강조 요소
```

---

## 2. 6개 디자인 축 — 입력값으로 각 축 위치 결정

| 축 | ← | → |
|----|---|---|
| 배경 밝기 | 다크·무드 | 브라이트·클린 |
| 색상 온도 | 웜 (따뜻함) | 쿨 (과학적) |
| 이미지 무드 | 감성·스토리 | 정보·기능 |
| 레이아웃 밀도 | 여백 중심 | 정보 밀집 |
| 촬영 스타일 | 라이프스타일 (공간/사람) | 제품 단독 (플로팅/클로즈업) |
| 타이포 성격 | 세리프·클래식 | 산세리프·모던 |

**빠른 결정 로직**
```
프리미엄 + 전통·권위  → 다크 / 웜 / 감성 / 여백 / 세리프
프리미엄 + 과학·기술  → 다크 / 쿨 / 기능 / 여백 / 산세리프
중간가 + 라이프스타일  → 브라이트 / 웜 / 감성 / 중간 / 산세리프
가성비 + 정보 중심    → 브라이트 / 쿨 / 정보 / 밀집 / 산세리프
자연·유기농           → 브라이트 / 웜 / 감성 / 여백 / 라운드산세리프
```

---

## 3. Vertex AI 이미지 프롬프트 템플릿

위 2번에서 결정한 축값을 `[ ]` 안에 채워 사용한다.

**제품 단독 샷**
```
[dramatic dark studio | clean bright white] product photography,
[제품 설명] centered, [소재 특징] material visible,
[single spotlight | soft diffused] lighting,
[레퍼런스 플랫폼명] editorial quality,
no text, no watermark, 4K ultra sharp, photorealistic.
```

**라이프스타일 장면**
```
[warm cozy | clean minimal | dynamic energetic] lifestyle photography,
[제품] in [환경 설명],
[natural window light | golden hour | dramatic studio] lighting,
Korean [카테고리] brand editorial quality, no text, 4K.
```

**성분·소재 클로즈업**
```
Macro photography of [소재/성분],
[white linen | dark slate | natural setting] background,
[warm earthy | cool clinical | fresh natural] tone,
hyper-realistic texture detail, no text, 4K.
```

**인포그래픽 배경**
```
Abstract [molecular | botanical | geometric | flow diagram] visualization,
[색상 팔레트 설명], suitable as background for text overlay,
minimal and clean, no text, 4K.
```

---

## 4. 클라이언트 요청 반영 원칙

1. **레퍼런스 이미지 제공** → 배경 밝기·색온도·밀도 3개 축 파악 후 프롬프트 반영
2. **기피 스타일 명시** → 해당 축에서 반대 방향 선택
3. **브랜드 컬러 있음** → 배경 또는 포인트 컬러로 반드시 포함
4. **특별 강조 요소** → 히어로 이미지에 배치

---

> **레퍼런스**: `docs/references/` — 카테고리별 고퀄리티 상세페이지 스크린샷 및 URL 모음
