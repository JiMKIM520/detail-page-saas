/**
 * 조합형 블록 시스템 — 코어 타입.
 *
 * 개념: 상세페이지 = 아키타입(섹션 종류) × 변형(variant) 들의 조합.
 *  - 아키타입: hero, checkpoint, compare ... (섹션의 "역할")
 *  - 변형: 같은 아키타입의 서로 다른 디자인 (hero-centered, hero-editorial ...)
 *  - 페이지: PageSpec(토큰 + 정렬된 블록[변형id + 슬롯데이터]) → composer.renderPage() → HTML
 *
 * 피그마 템플릿 200개를 흡수할 때: 각 섹션을 아키타입으로 분류하고, 중복 아닌 디자인만
 * 새 변형으로 추가한다. 그릇(변형)이 늘수록 AI 컴포저가 만들 수 있는 페이지 다양성이 커진다.
 */
import type { z } from 'zod'

/** 섹션의 역할(아키타입). 피그마 인제스천 시 각 섹션이 이 중 하나로 분류된다. */
export type BlockArchetype =
  | 'hero' // 첫 화면 (브랜드 + 제품 + 핵심 가치)
  | 'recommend' // 추천 대상 소개 (다크/리본)
  | 'checklist' // 체크 리스트 (타겟/특징)
  | 'strip' // 얇은 구분 띠
  | 'checkpoint' // 핵심 요약 카드/리스트
  | 'point' // 포인트 헤더 + 강조 사진
  | 'feature' // 단일 강조 비주얼 (풀블리드/씰)
  | 'reason' // 질문/이유 제시
  | 'ingredient' // 원료/성분 소개
  | 'usage' // 사용법/스텝 가이드
  | 'lineup' // 상품 구성/패키지(가격)
  | 'equation' // 비주얼 등식 (A + B = C)
  | 'callout' // 강조 배너/인용
  | 'story' // 브랜드 스토리 (사진 + 카피)
  | 'cert' // 인증/품질 씰
  | 'review' // 고객 리뷰/사회적 증거
  | 'faq' // 자주 묻는 질문
  | 'shipping' // 배송 안내
  | 'stats' // 수치/성과 강조
  | 'gallery' // 옵션/갤러리 쇼케이스
  | 'banner' // 시즈널/이벤트 배너
  | 'event' // 이벤트/쿠폰 프로모션
  | 'discount' // 할인/특가 임팩트
  | 'detail' // 제품 상세 서술(에디토리얼)
  | 'compare' // 2단 비교 (조리법 등)
  | 'spec' // 제품 상세 정보 테이블
  | 'closing' // 마무리 히어로/CTA
  | 'cs' // 고객센터/운영시간/교환환불 안내
  | 'promo' // 프로모션 캠페인 (비대칭 카드/스캐터)
  | 'award' // 수상/권위 (No.1 엠블럼/트로피)

/** 페이지 전역 디자인 토큰. composer가 :root CSS 변수로 주입한다. */
export interface Tokens {
  bg: string // 페이지 배경
  paper: string // 카드/상승 표면
  ink: string // 본문 텍스트
  ink2: string // 보조 텍스트
  muted: string // 3차 텍스트
  accent: string // 포인트 색
  accentDark: string // 포인트 어두운 톤
  brand: string // 다크 섹션/뱃지용 진한 브랜드색
  line: string // 헤어라인/구분선
  // 폰트 패밀리 (CSS font-family 값). 로드되는 웹폰트 중에서 선택.
  fontDisplay: string // 디스플레이 헤드라인
  fontBody: string // 본문
  fontSerif: string // 명조/세리프
  fontHand: string // 손글씨(말풍선/태그)
  // ── 형태 토큰 (Sprint 6) — 전부 선택적. 미지정 시 현행 렌더와 픽셀 동일.
  rScale?: number // 곡률 배율: 0=직각 · 1=현행 · 1.6=라운드. 변형 CSS의 calc(var(--r-scale,1)*Npx)가 소비
  photoShape?: string // 시그니처 대형 사진 프레임 border-radius 값 — 지정 시 페이지 전체 형태 언어 통일
  padX?: number // 섹션 가로 패딩(px). 현행 56 — 여백 리듬(48 밀도 ↔ 64 에디토리얼)
  emDark?: string // 다크(brand 배경) 섹션 안 .em 강조색 — accent를 밝혀 brand 대비 4.5:1 보장 (황태 callout 저대비 실사례)
}

/** 변형 render에 주입되는 컨텍스트(escape 유틸 + 토큰 + 아이콘). */
export interface RenderCtx {
  tokens: Tokens
  esc: (s: string | undefined) => string
  richSafe: (s: string | undefined) => string
  icon: (name: string) => string
}

/**
 * 블록 변형 정의. 하나의 디자인 = 하나의 BlockVariant.
 * - schema: 슬롯 데이터 검증(zod). AI 컴포저 출력 계약.
 * - css: 이 변형 전용 CSS (클래스 접두사로 충돌 방지). 사용 시 1회만 주입(id로 dedup).
 * - render: 슬롯 데이터 → 완성된 <section> HTML.
 */
export interface BlockVariant<T = unknown> {
  id: string // 전역 고유 (예: 'hero-centered')
  archetype: BlockArchetype
  styleTags: string[] // 'warm' | 'editorial' | 'playful' | 'minimal' ... (컴포저 선택용)
  imageSlots: number // 필요한 이미지 수 (이미지 예산/AI 선택용)
  describe: string // AI 컴포저가 이 변형을 고를 때 참고할 설명
  schema: z.ZodType<T>
  css: string
  render: (data: T, ctx: RenderCtx) => string
}

/** 페이지 한 칸 = 변형 + 그 변형의 슬롯 데이터. */
export interface PageBlock {
  variantId: string
  data: unknown
  /** 씬 번호(1~7) — 청사진 경로에서 blocks-composer가 결정적으로 부여. 데모·스모크 경로는 undefined(렌더 무변). */
  sceneId?: number
}

/** 페이지 전체 사양. AI 컴포저의 출력이자 renderPage의 입력. */
export interface PageSpec {
  meta: { product: string; category: string; styleDirection?: string }
  tokens: Tokens
  width?: number // 기본 872
  blocks: PageBlock[]
}

/**
 * 변형 작성 헬퍼 — 전체 타입을 유지한 채 정의한다.
 * 레지스트리는 이질적 변형을 모아야 하므로 BlockVariant<any>로 보관하지만,
 * 작성 시에는 defineBlock<T>로 슬롯 데이터 타입을 강제한다.
 */
export function defineBlock<T>(variant: BlockVariant<T>): BlockVariant<T> {
  return variant
}
