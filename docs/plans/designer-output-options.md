# 디자이너 편집용 결과물 — 3가지 방안 비교

> 현재 PDF는 레이어가 합쳐져 편집 불가. HTML 편집은 디자이너 워크플로우에 부적합.
> 디자이너가 실제로 편집 가능한 형태의 결과물이 필요.

---

## 공통 전제

- HTML/PDF는 **클라이언트 미리보기 용도**로만 유지 (편집 불가)
- 편집용 파일은 별도 생성 → designer.zip에 포함
- 기존 데이터 활용: `refined-copy.json` (텍스트) + `style-guide.json` (스타일) + 이미지 소재 11장
- Playwright에서 `getBoundingClientRect()`로 각 요소 절대 좌표 추출 (이미 구현된 Playwright 인스턴스 재활용)

---

## 방안 A: PSD 자동 생성

### 포토샵에서 열었을 때 구조
```
📁 고메코나_소금빵.psd (860 × 7500px)
│
├── 📁 [그룹] 01_hero
│   ├── 🖼️ hero_background.png ── 배경 이미지 레이어
│   ├── T "인생 소금빵" ────────── 텍스트 레이어 (편집 가능)
│   └── T "천연발효종 24시간..." ─ 텍스트 레이어
│
├── 📁 [그룹] 02_brand_story
│   ├── 🖼️ styling_shot_01.jpg ── 스타일링 이미지
│   ├── T "60년 전통의 맛" ────── 텍스트
│   └── T 본문 텍스트 ─────────── 텍스트
│
├── 📁 [그룹] 03_key_benefit
│   ├── 🎨 배경 그라데이션 ──────── 단색/그라데이션 레이어
│   ├── T "원주 고구마" ─────────── 항목 제목
│   └── T "조엄선생이 처음..." ──── 항목 본문
│
├── ... (섹션별 8~9개 그룹)
│
└── 📁 [그룹] 09_cta
    └── T "지금 주문하세요"
```

### 디자이너 편집 경험
- 포토샵에서 `.psd` 더블클릭 → 바로 열림
- **텍스트 레이어 더블클릭 → 즉시 수정** (폰트/크기/색상 변경)
- 이미지 레이어 선택 → 교체/이동/리사이즈
- 그룹 접기/열기/순서 변경/삭제
- **가장 익숙한 워크플로우** — 추가 학습 비용 0

### 구현 방식
```
1. Playwright로 HTML 렌더
2. page.evaluate()로 각 요소 절대 좌표 + computed style 추출
3. ag-psd 라이브러리로 PSD 구조 조립:
   - 섹션별 그룹 레이어
   - 텍스트 레이어: 내용 + 폰트명 + 크기 + 색상 + 위치
   - 이미지 레이어: PNG/JPG 버퍼 + 위치 + 크기
4. writePsdBuffer() → .psd 파일 저장
```

### 기술 스택
- `ag-psd` (MIT 라이선스, 58개 코드 스니펫, 활성 유지 중)
- 기존 Playwright 인스턴스 재활용 (추가 의존성 최소)

### 제약 사항
- **CSS 효과 부분 재현**: `box-shadow`, `border-radius`, 그라데이션 배경 → 래스터 이미지 레이어로 대체
- **폰트 매칭**: PSD 텍스트 레이어에는 폰트 "이름"만 저장. 디자이너 PC에 해당 폰트 설치 필요 (Google Fonts ZIP 동봉)
- **반응형 → 고정 좌표**: clamp() CSS를 860px 렌더 기준 고정 픽셀로 변환

### 구현 파일
| 파일 | 작업 |
|------|------|
| `agents/psd-builder.ts` | 신규 — PSD 생성 에이전트 |
| `agents/exporter.ts` | 수정 — PDF 제거, PSD 생성 호출 추가 |
| `package.json` | `ag-psd`, `@napi-rs/canvas` 추가 |

### 예상 비용 / 시간
- 구현: 3~4일
- 런타임 추가 비용: 0원 (로컬 처리)
- 파일 크기: ~30~50MB/건

---

## 방안 B: 레이어 분리 키트 (PNG + JSON)

### 결과물 구조
```
📁 고메코나_소금빵_layers/
│
├── 📋 manifest.json ────────── 메타데이터 (위치/크기/폰트/색상)
├── 📋 style-guide.json ──────── 디자인 토큰
│
├── 📁 sections/ ────────────── 섹션별 통합 이미지
│   ├── 01_hero.png
│   ├── 02_brand_story.png
│   └── ... (8~9장)
│
├── 📁 backgrounds/ ─────────── 배경 분리
│   ├── 01_hero_bg.png
│   ├── 03_gradient_bg.png
│   └── ...
│
├── 📁 photos/ ──────────────── 제품 이미지 원본
│   ├── styling_shot_01.jpg
│   ├── styling_shot_02.jpg
│   └── ... (6장)
│
├── 📁 layers/ ──────────────── 레이어 이미지
│   ├── hero_background.png
│   ├── hero_with_typo.png
│   └── break_image.png
│
└── 📁 fonts/ ───────────────── 사용 폰트 전체
    ├── NotoSansKR-Bold.woff2
    └── ...
```

### manifest.json 예시
```json
{
  "canvasWidth": 860,
  "canvasHeight": 7500,
  "sections": [
    {
      "name": "hero",
      "index": 0,
      "bounds": { "top": 0, "left": 0, "width": 860, "height": 900 },
      "backgroundImage": "backgrounds/01_hero_bg.png",
      "elements": [
        {
          "type": "text",
          "content": "인생 소금빵",
          "bounds": { "top": 320, "left": 180, "width": 500, "height": 80 },
          "style": {
            "fontFamily": "Noto Sans KR",
            "fontSize": 48,
            "fontWeight": 900,
            "color": "#FFFFFF",
            "textAlign": "center"
          }
        },
        {
          "type": "image",
          "src": "layers/hero_with_typo.png",
          "bounds": { "top": 0, "left": 0, "width": 860, "height": 900 }
        }
      ]
    }
  ]
}
```

### 디자이너 편집 경험
1. `manifest.json` 확인 → 전체 구조 파악
2. 포토샵/피그마에서 `canvasWidth × canvasHeight` 새 파일 생성
3. `backgrounds/` → 배경 레이어로 배치
4. `photos/` → 이미지 요소 배치
5. 텍스트는 manifest의 위치/폰트 정보 보고 직접 타이핑
6. **수작업 조합 필요** — PSD보다 번거롭지만 자유도 최고

### 구현 방식
```
1. Playwright로 HTML 렌더 → 각 요소 getBoundingClientRect()
2. 섹션별 배경을 별도 캡처 (텍스트 제거 후)
3. manifest.json에 모든 요소의 위치/스타일/이미지 경로 기록
4. fonts/ 디렉토리에 사용 폰트 전체 포함
5. ZIP으로 패키징
```

### 제약 사항
- **디자이너 수작업 필요**: manifest 보고 수동 배치
- **텍스트 래스터 불가**: manifest에 텍스트 정보만 있고 이미지가 아님 → 배치는 디자이너 몫
- **배경 분리 한계**: CSS 그라데이션 → 래스터 캡처로 대체

### 구현 파일
| 파일 | 작업 |
|------|------|
| `agents/layer-kit-builder.ts` | 신규 — manifest + 소재 정리 |
| `agents/exporter.ts` | 수정 — layer kit 생성 호출 |

### 예상 비용 / 시간
- 구현: 2일
- 런타임 추가 비용: 0원
- 파일 크기: ~60~80MB/건 (원본 이미지 포함)

---

## 방안 C: Figma Import SVG

### 결과물 구조
```
📁 고메코나_소금빵_figma/
│
├── 📋 import-guide.md ────── Figma import 가이드
│
├── 📁 sections/ ─────────── 섹션별 SVG (벡터 텍스트 유지)
│   ├── 01_hero.svg
│   ├── 02_brand_story.svg
│   └── ... (8~9개)
│
├── 📁 photos/ ───────────── 이미지 소재 (SVG에서 참조)
│   ├── styling_shot_01.jpg
│   └── ...
│
└── 📁 fonts/ ────────────── 사용 폰트
    └── ...
```

### 각 SVG 내부 구조
```xml
<svg width="860" height="900" xmlns="http://www.w3.org/2000/svg">
  <!-- 배경 -->
  <image href="photos/hero_background.png" width="860" height="900"/>

  <!-- 텍스트 (벡터 — Figma에서 편집 가능) -->
  <text x="430" y="350" font-family="Noto Sans KR" font-size="48"
        font-weight="900" fill="#FFFFFF" text-anchor="middle">
    인생 소금빵
  </text>

  <text x="430" y="420" font-family="KoPub Batang" font-size="18"
        fill="rgba(255,255,255,0.8)" text-anchor="middle">
    천연발효종 24시간 저온 숙성
  </text>
</svg>
```

### 디자이너 편집 경험
1. Figma → File → Import → SVG 선택
2. **텍스트가 벡터로 유지** → 직접 더블클릭 편집
3. 이미지는 embed → 교체 가능
4. Figma의 Auto Layout/Component 전환 가능
5. **Figma 사용자에게 최적** — Illustrator에서도 동작

### 구현 방식
```
1. Playwright로 HTML 렌더 → 각 요소 좌표 + computed style 추출
2. 섹션별 SVG 문자열 생성:
   - 배경 이미지 → <image> 태그
   - 텍스트 → <text> 태그 (벡터)
   - 아이콘 → <text> 또는 <path>
3. 이미지는 SVG에 inline base64 또는 별도 파일 참조
4. ZIP으로 패키징
```

### 제약 사항
- **Figma/Illustrator 필수**: SVG를 포토샵에서 열면 래스터로 변환됨
- **복잡한 레이아웃 재현 한계**: CSS grid/flexbox → SVG 수동 좌표 변환
- **이미지 품질**: SVG 내 base64 embed 시 파일 크기 폭증 → 별도 참조 방식 권장
- **한글 폰트**: SVG에 font-family 지정하지만 디자이너 PC에 폰트 필요

### 구현 파일
| 파일 | 작업 |
|------|------|
| `agents/svg-builder.ts` | 신규 — 섹션별 SVG 생성 |
| `agents/exporter.ts` | 수정 — SVG 생성 호출 |

### 예상 비용 / 시간
- 구현: 2~3일
- 런타임 추가 비용: 0원
- 파일 크기: ~20~40MB/건

---

## 3가지 방안 비교 요약

| 기준 | A. PSD | B. 레이어 키트 | C. Figma SVG |
|------|--------|---------------|-------------|
| **디자이너 친화도** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **편집 즉시성** | 바로 편집 | 수동 조합 필요 | import 후 편집 |
| **텍스트 편집** | ✅ 텍스트 레이어 | ❌ 수동 타이핑 | ✅ 벡터 텍스트 |
| **이미지 교체** | ✅ 레이어 교체 | ✅ 파일 교체 | ✅ embed 교체 |
| **필요 도구** | Photoshop | 아무거나 | Figma/Illustrator |
| **구현 난이도** | 높음 (3~4일) | 낮음 (2일) | 중간 (2~3일) |
| **파일 크기** | 30~50MB | 60~80MB | 20~40MB |
| **레이아웃 정확도** | 높음 (좌표 정확) | 중간 (manifest) | 중간 (SVG 좌표) |
| **추가 비용** | 0원 | 0원 | 0원 |

---

## 추천

### 포토샵 사용 디자이너 → 방안 A (PSD)
- 가장 자연스러운 워크플로우, 추가 학습 비용 0
- 구현 난이도는 높지만 1회 구현 후 모든 프로젝트에 자동 적용

### Figma 사용 디자이너 → 방안 C (SVG)
- Figma에서 바로 import → 편집 가능
- 텍스트 벡터 유지로 편집성 높음

### 범용 (도구 불문) → 방안 B (레이어 키트)
- 어떤 도구든 사용 가능하지만 수동 조합 필요
- 가장 빠르게 구현 가능

### 복합 → A + C 조합
- PSD + SVG 모두 생성 → 디자이너가 선호 도구로 선택
- 구현: 5~6일

---

## 공통 변경 사항 (어떤 방안이든)

- `agents/exporter.ts` — PDF 생성 제거
- Playwright에서 요소별 좌표 추출 로직 추가
- designer.zip 구조 변경 (HTML → PSD/SVG/레이어키트)
- 현재 HTML은 **웹 미리보기 전용**으로 유지
