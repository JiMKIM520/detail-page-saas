/**
 * 씬 높이 리밸런서 — 실측 섹션 높이로 씬 경계를 다시 나눈다(S2).
 *
 * 왜 결정적으로 푸는가:
 *   씬 높이는 "어느 블록이 어느 씬에 속하는가"의 순수 함수다. 플래너의 사전 추정(estimateHeight)은
 *   폰트 확대·장식 밀도가 렌더 시점에 결정되므로 구조적으로 빗나간다. 실측 후 경계만 옮기면
 *   서사 순서를 건드리지 않고 정확히 맞출 수 있다 — AI 재조립에 맡기면 순서가 흔들린다.
 *
 * 제약:
 *   - 블록 순서 불변(서사 순서는 플래너 소관)
 *   - 씬 개수 불변(S1 = 7씬 고정)
 *   - 씬마다 최소 1블록 → 첫 블록은 항상 씬 1(히어로), 마지막 블록은 항상 씬 N(클로징)
 */

export interface SceneBalanceOptions {
  /** 목표 씬 수 — S1 기본 7 */
  sceneCount: number
  /** 씬 높이 목표 하한(px) — S2 기본 1600 */
  min?: number
  /** 씬 높이 목표 상한(px) — S2 기본 2400 */
  max?: number
  /** 절대 상한(px) — 초과 시 사실상 금지 비용. 기본 2500 */
  hardMax?: number
  /** 씬 래퍼 자체의 여백 등 섹션 높이 합에 더해지는 오버헤드(px) */
  overhead?: number
}

export interface SceneBalanceResult {
  /** 블록별 sceneId(1-base) — 입력 heights와 같은 길이 */
  sceneIds: number[]
  /** 재배분 후 예상 씬 높이 */
  predicted: number[]
  /** 목표 구간[min,max]을 벗어난 씬 수 */
  outOfRange: number
  /** 절대 상한을 넘긴 씬 수 */
  overHard: number
}

/**
 * 씬 하나의 예상 높이에 대한 비용 — 목표 구간에서 벗어난 양의 제곱.
 *
 * 절대 상한 초과에 상수 페널티(BIG)를 쓰면 안 된다: 상수가 지배적이면 DP가 "초과한 씬의 개수"를
 * 최소화하는 방향으로 최적화되어, 큰 블록을 한 씬에 몰아넣는 해가 최적이 된다.
 * 실측(2026-07-21): 총 19,756px·큰 블록 다수인 페이지에서 씬1이 4,081 → 7,971px로 악화됐다.
 * 초과분에 가중치를 주되 연속 함수로 두면 "고르게 분산"이 항상 더 싸다.
 */
function sceneCost(height: number, min: number, max: number, hardMax: number): number {
  if (height > hardMax) return (height - max) ** 2 + (height - hardMax) ** 2 * 12
  if (height > max) return (height - max) ** 2
  if (height < min) return (min - height) ** 2
  return 0
}

/**
 * 섹션 실측 높이를 sceneCount개의 연속 구간으로 분할한다.
 * 구간 합이 [min,max]에 최대한 들어가도록 DP로 최적해를 구한다(O(n²k)).
 * 블록 수가 씬 수보다 적으면 분할 자체가 불가능하므로 null을 반환한다.
 */
export function balanceScenes(
  heights: readonly number[],
  opts: SceneBalanceOptions,
): SceneBalanceResult | null {
  const n = heights.length
  const k = opts.sceneCount
  if (n < k || k < 1) return null

  const min = opts.min ?? 1600
  const max = opts.max ?? 2400
  const hardMax = opts.hardMax ?? 2500
  const overhead = opts.overhead ?? 0

  // prefix[i] = heights[0..i) 합
  const prefix = new Array<number>(n + 1).fill(0)
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + heights[i]
  const segHeight = (a: number, b: number) => prefix[b] - prefix[a] + overhead

  // dp[j][i] = 첫 i개 블록을 j개 씬으로 나눈 최소 비용, cut[j][i] = 그때 마지막 씬의 시작 인덱스
  const dp: number[][] = Array.from({ length: k + 1 }, () => new Array<number>(n + 1).fill(Infinity))
  const cut: number[][] = Array.from({ length: k + 1 }, () => new Array<number>(n + 1).fill(-1))
  dp[0][0] = 0

  for (let j = 1; j <= k; j++) {
    // i = 이 시점까지 소비한 블록 수. 씬마다 최소 1블록이므로 i >= j.
    for (let i = j; i <= n - (k - j); i++) {
      for (let a = j - 1; a < i; a++) {
        const prev = dp[j - 1][a]
        if (prev === Infinity) continue
        const c = prev + sceneCost(segHeight(a, i), min, max, hardMax)
        if (c < dp[j][i]) {
          dp[j][i] = c
          cut[j][i] = a
        }
      }
    }
  }

  if (dp[k][n] === Infinity) return null

  // 역추적 — 씬 경계 시작 인덱스 수집
  const starts: number[] = []
  let i = n
  for (let j = k; j >= 1; j--) {
    const a = cut[j][i]
    starts.unshift(a)
    i = a
  }

  const sceneIds = new Array<number>(n).fill(1)
  const predicted: number[] = []
  for (let j = 0; j < k; j++) {
    const a = starts[j]
    const b = j + 1 < k ? starts[j + 1] : n
    for (let x = a; x < b; x++) sceneIds[x] = j + 1
    predicted.push(segHeight(a, b))
  }

  return {
    sceneIds,
    predicted,
    outOfRange: predicted.filter((h) => h < min || h > max).length,
    overHard: predicted.filter((h) => h > hardMax).length,
  }
}

/**
 * 실측 씬 높이와 섹션 높이로 씬 래퍼 오버헤드(패딩·마진)를 역산한다.
 * 씬별 (씬높이 − 소속 섹션 높이 합)의 중앙값 — 이상치 씬 하나에 끌려가지 않게 평균 대신 중앙값.
 */
export function estimateSceneOverhead(
  sceneHeights: readonly number[],
  sectionHeights: readonly number[],
  sceneOfSection: readonly number[],
): number {
  const sums = new Map<number, number>()
  sectionHeights.forEach((h, idx) => {
    const sid = sceneOfSection[idx]
    sums.set(sid, (sums.get(sid) ?? 0) + h)
  })
  const diffs: number[] = []
  sceneHeights.forEach((sh, idx) => {
    const sum = sums.get(idx + 1)
    if (sum !== undefined && sum > 0) diffs.push(sh - sum)
  })
  if (diffs.length === 0) return 0
  const sorted = [...diffs].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  return Math.round(median)
}
