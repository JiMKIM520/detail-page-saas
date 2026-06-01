/**
 * DetailAI 핵심 운영 흐름 E2E 테스트
 *
 * 실행 전 준비:
 *   1. npm install --save-dev @playwright/test
 *   2. npx playwright install chromium
 *   3. 개발 서버 기동: npm run dev
 *   4. (관리자 테스트용) 환경변수 설정:
 *        ADMIN_EMAIL=admin@example.com
 *        ADMIN_PASSWORD=사업자등록번호(하이픈 제거)
 *   5. 실행: npx playwright test tests/e2e/auth-flow.spec.ts
 *
 * proxy.ts 기준 라우팅:
 *   PUBLIC_PATHS  = ['/login', '/admin', '/signup', '/api/auth/', '/salt-bread']
 *   ADMIN_PATHS   = ['/planner', '/designer', '/photography', '/users']
 *   미인증 비공개 경로 → /login 리다이렉트
 *   인증됐으나 role !== 'admin' → /projects 리다이렉트
 */
import { test, expect } from '@playwright/test'

// ────────────────────────────────────────────────
// 시나리오 ①  미인증 상태로 ADMIN_PATH 접근
//   → proxy.ts: user 없음 → NextResponse.redirect('/login')
// ────────────────────────────────────────────────
test('미인증 시 /photography 접근 → /login 리다이렉트', async ({ page }) => {
  // 쿠키/세션 없는 새 컨텍스트에서 직접 이동
  await page.goto('/photography', { waitUntil: 'networkidle' })

  // 리다이렉트 후 URL이 /login 이어야 함
  await expect(page).toHaveURL('/login')
})

test('미인증 시 /planner 접근 → /login 리다이렉트', async ({ page }) => {
  await page.goto('/planner', { waitUntil: 'networkidle' })
  await expect(page).toHaveURL('/login')
})

test('미인증 시 /designer 접근 → /login 리다이렉트', async ({ page }) => {
  await page.goto('/designer', { waitUntil: 'networkidle' })
  await expect(page).toHaveURL('/login')
})

test('미인증 시 /users 접근 → /login 리다이렉트', async ({ page }) => {
  await page.goto('/users', { waitUntil: 'networkidle' })
  await expect(page).toHaveURL('/login')
})

test('미인증 시 클라이언트 경로 /projects 접근 → /login 리다이렉트', async ({ page }) => {
  await page.goto('/projects', { waitUntil: 'networkidle' })
  await expect(page).toHaveURL('/login')
})

// ────────────────────────────────────────────────
// 시나리오 ②  /login 페이지 렌더 검증
//   PUBLIC_PATHS에 포함 → 인증 없이 접근 가능
// ────────────────────────────────────────────────
test('/login 페이지 렌더 — 이메일·사업자등록번호 필드 노출', async ({ page }) => {
  await page.goto('/login')

  // 페이지 제목 확인 (login/page.tsx: <h1>DetailAI</h1>)
  await expect(page.locator('h1')).toHaveText('DetailAI')

  // 이메일 입력 필드
  const emailInput = page.locator('input[type="email"]')
  await expect(emailInput).toBeVisible()
  await expect(emailInput).toHaveAttribute('placeholder', 'email@example.com')

  // 사업자등록번호 입력 필드 (type="text")
  const bnInput = page.locator('input[type="text"]')
  await expect(bnInput).toBeVisible()
  await expect(bnInput).toHaveAttribute('placeholder', '000-00-00000')

  // 로그인 버튼
  const submitBtn = page.locator('button[type="submit"]')
  await expect(submitBtn).toBeVisible()
  await expect(submitBtn).toHaveText('로그인')
})

test('/login 잘못된 자격증명 → 에러 메시지 표시', async ({ page }) => {
  await page.goto('/login')

  // 존재하지 않는 계정으로 시도
  await page.locator('input[type="email"]').fill('nonexistent@example.com')
  await page.locator('input[type="text"]').fill('000-00-00000')
  await page.locator('button[type="submit"]').click()

  // login/page.tsx: setError('이메일 또는 사업자등록번호가 올바르지 않습니다.')
  const errorMsg = page.locator('text=이메일 또는 사업자등록번호가 올바르지 않습니다.')
  await expect(errorMsg).toBeVisible({ timeout: 10_000 })
})

// ────────────────────────────────────────────────
// 시나리오 ③  관리자 로그인 후 /planner 접근
//   실제 Supabase 계정 필요 → env 없으면 skip
// ────────────────────────────────────────────────
test('관리자 로그인 후 /planner 접근 — 대시보드 렌더', async ({ page }) => {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  // TODO: 실계정 환경변수(ADMIN_EMAIL, ADMIN_PASSWORD) 설정 후 skip 조건 제거
  if (!adminEmail || !adminPassword) {
    test.skip(true, 'ADMIN_EMAIL / ADMIN_PASSWORD 환경변수 미설정 — 실계정 필요')
    return
  }

  // 로그인 수행
  await page.goto('/login')
  await page.locator('input[type="email"]').fill(adminEmail)
  await page.locator('input[type="text"]').fill(adminPassword)
  await page.locator('button[type="submit"]').click()

  // login/page.tsx: role === 'admin' → router.push('/planner')
  await expect(page).toHaveURL('/planner', { timeout: 15_000 })

  // planner/page.tsx: <h1>스크립트 검수</h1>
  await expect(page.locator('h1')).toHaveText('스크립트 검수')
})

test('관리자 로그인 후 /photography 접근 — 촬영 관리 렌더', async ({ page }) => {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  // TODO: 실계정 환경변수 설정 후 skip 조건 제거
  if (!adminEmail || !adminPassword) {
    test.skip(true, 'ADMIN_EMAIL / ADMIN_PASSWORD 환경변수 미설정 — 실계정 필요')
    return
  }

  // 로그인
  await page.goto('/login')
  await page.locator('input[type="email"]').fill(adminEmail)
  await page.locator('input[type="text"]').fill(adminPassword)
  await page.locator('button[type="submit"]').click()

  // /planner로 이동 확인 후 /photography 직접 이동
  await expect(page).toHaveURL('/planner', { timeout: 15_000 })
  await page.goto('/photography')

  // photography/page.tsx: <h1>촬영 관리</h1>
  await expect(page.locator('h1')).toHaveText('촬영 관리')
})

// ────────────────────────────────────────────────
// 추가: PUBLIC_PATHS 접근 — 인증 없이도 200 응답
// ────────────────────────────────────────────────
test('PUBLIC_PATH /login — 미인증 직접 접근 허용 (리다이렉트 없음)', async ({ page }) => {
  const response = await page.goto('/login')
  // 리다이렉트 루프 없이 정상 응답
  expect(response?.status()).toBe(200)
  await expect(page).toHaveURL('/login')
})
