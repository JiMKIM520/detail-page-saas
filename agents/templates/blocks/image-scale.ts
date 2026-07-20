/**
 * 변형별 이미지 면적 등급 — CSS 정적 분석.
 *
 * 왜 필요한가: 히어로 선택 경로(heroStyle 풀 → LLM)에 "사진이 얼마나 크게 쓰이는가"라는
 * 정보가 어디에도 없다. 카탈로그 라인(id·아키타입·imageSlots·톤·높이·설명)에도 없어서
 * LLM이 260×280px 위젯형과 풀블리드를 동등하게 취급했다 — 히어로가 빈약해진 직접 원인(2026-07-21).
 *
 * 왜 정적 분석인가: 실측하려면 변형마다 스키마에 맞는 샘플 데이터가 필요한데 598종 중
 * 55종만 데이터가 있다(variant-meta의 _measured). 등급 구분(large/medium/small)에는
 * 선언된 크기만으로 충분하다 — 순위만 맞으면 되고 정확한 px는 I10 검사기가 실측한다.
 */

export type ImageScale = 'large' | 'medium' | 'small' | 'none'

/** 이미지를 렌더하는 선언 블록으로 볼 만한 신호 */
const IMAGE_HINT = /object-fit\s*:\s*cover|object-fit\s*:\s*contain|background-image/

/**
 * 변형 CSS에서 이미지 표시 크기 등급을 추정한다.
 *
 * large  — 컨테이너를 가득 채우는 사진: inset:0 커버, 또는 width:100%와 height≥400px
 * medium — 폭이 넓거나(≥60% 상당) 높이가 큰 고정 프레임
 * small  — 300px 미만 고정 박스에 갇힌 사진(위젯형)
 * none   — 이미지 렌더 신호가 없음
 *
 * 순수 함수.
 */
export function detectImageScale(css: string, imageSlots: number): ImageScale {
  if (imageSlots <= 0) return 'none'

  // 최내곽 선언 블록 단위로 검사 — 셀렉터 이름은 변형마다 달라 신뢰할 수 없다
  const blocks = css.match(/\{[^{}]*\}/g) ?? []
  let best: ImageScale = 'none'
  const rank: Record<ImageScale, number> = { none: 0, small: 1, medium: 2, large: 3 }
  const bump = (s: ImageScale) => {
    if (rank[s] > rank[best]) best = s
  }

  for (const raw of blocks) {
    const body = raw.slice(1, -1)
    const hasImageHint = IMAGE_HINT.test(body)
    const fullInset = /inset\s*:\s*0/.test(body) && /position\s*:\s*absolute/.test(body)
    const widthFull = /width\s*:\s*100%/.test(body)
    const heightPx = [...body.matchAll(/height\s*:\s*(\d+)px/g)].map((m) => parseInt(m[1], 10))
    const widthPx = [...body.matchAll(/width\s*:\s*(\d+)px/g)].map((m) => parseInt(m[1], 10))
    const maxH = heightPx.length ? Math.max(...heightPx) : 0
    const maxW = widthPx.length ? Math.max(...widthPx) : 0

    if (hasImageHint && fullInset) {
      bump('large')
      continue
    }
    if (hasImageHint && widthFull && maxH >= 400) {
      bump('large')
      continue
    }
    if (hasImageHint || maxW > 0 || maxH > 0) {
      // 이미지 프레임으로 보이는 고정 박스
      if (hasImageHint && maxW > 0 && maxW < 300) {
        bump('small')
        continue
      }
      if (hasImageHint && (maxH >= 400 || maxW >= 400)) {
        bump('medium')
        continue
      }
      if (hasImageHint) bump('medium')
    }
  }

  // 이미지 슬롯이 있는데 아무 신호도 못 찾았으면 보수적으로 medium — 오탐으로 교체를 유발하지 않는다
  return best === 'none' ? 'medium' : best
}
