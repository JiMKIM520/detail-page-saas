/**
 * Playwright 최소 설정
 *
 * 실행 방법:
 *   1. 의존성 설치: npm install --save-dev @playwright/test
 *   2. 브라우저 설치: npx playwright install chromium
 *   3. 개발 서버 실행: npm run dev  (별도 터미널)
 *   4. 테스트 실행: npx playwright test
 *   5. UI 모드: npx playwright test --ui
 *
 * 주의: ADMIN_EMAIL / ADMIN_PASSWORD 환경변수 없으면 관리자 테스트는 skip됨
 */
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // 테스트 디렉토리
  testDir: './tests/e2e',

  // 각 테스트 타임아웃 (ms)
  timeout: 30_000,

  // 기대값 타임아웃
  expect: {
    timeout: 5_000,
  },

  // 실패 시 재시도 없음 (CI에서는 1회 재시도 권장)
  retries: 0,

  // 병렬 실행 비활성화 — 인증 세션 충돌 방지
  workers: 1,

  // 리포터
  reporter: 'list',

  use: {
    // 개발 서버 baseURL
    baseURL: 'http://localhost:3000',

    // 실패 시 스크린샷 캡처
    screenshot: 'only-on-failure',

    // 트레이스 — 실패 시에만
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
