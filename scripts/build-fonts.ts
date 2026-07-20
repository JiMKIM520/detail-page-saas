#!/usr/bin/env npx tsx
/**
 * 클라이언트 제공 폰트 → 한글+라틴 서브셋 woff2 변환 스크립트
 *
 * Usage:
 *   npx tsx scripts/build-fonts.ts
 *   npx tsx scripts/build-fonts.ts --src /path/to/font-dir
 *
 * 의존: pip3 install fonttools brotli
 * 출력: agents/templates/blocks/fonts/*.woff2 (각 700KB 이하 목표)
 *
 * 우선 6종만 변환. 나머지 8종은 매니페스트 이름 등록만.
 * 변환 확장: PRIORITY_FONTS 배열에 항목 추가 후 재실행.
 */

import { spawnSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

// ── 설정 ─────────────────────────────────────────────────────────────────────

const PYFTSUBSET = '/Users/jinman/Library/Python/3.9/bin/pyftsubset'

/** 한글 완성형 + 한글 자모 + 한글 호환 자모 + 기본 라틴 + 숫자·기호 */
const UNICODE_RANGES = 'U+0020-007E,U+00A0-00FF,U+AC00-D7A3,U+1100-11FF,U+3130-318F'

/** 클라이언트 폰트 소스 루트 (인수로 오버라이드 가능) */
const DEFAULT_SRC = '/private/tmp/claude-501/-Users-jinman-Desktop-Projects/c6fe271b-61a6-44b4-8ca3-5fe55a4882cd/scratchpad/client-fonts/1. 타이틀폰트'

/** woff2 출력 디렉토리 */
const OUTPUT_DIR = path.join(process.cwd(), 'agents/templates/blocks/fonts')

// ── 변환 대상 6종 ─────────────────────────────────────────────────────────────

interface FontJob {
  /** 소스 폴더명 (DEFAULT_SRC 기준) */
  folder: string
  /** 폴더 내 변환할 파일 (Bold 우선, 없으면 Regular) */
  sourceFile: string
  /** 출력 woff2 파일명 */
  outputFile: string
  /** CSS font-family 선언 명 */
  cssFamily: string
  /** CSS font-weight */
  weight: number
}

const PRIORITY_FONTS: FontJob[] = [
  // ── 기존 6종 (이미 변환 완료, 재실행 시 덮어씀) ──────────────────────────────
  {
    folder: 'SUIT',
    sourceFile: 'SUIT-Bold.otf',
    outputFile: 'SUIT-Bold.woff2',
    cssFamily: 'SUIT',
    weight: 700,
  },
  {
    folder: '나눔스퀘어',
    sourceFile: 'NanumSquareB.otf',
    outputFile: 'NanumSquare-Bold.woff2',
    cssFamily: 'NanumSquare',
    weight: 700,
  },
  {
    folder: '나눔명조',
    sourceFile: 'NanumMyeongjoBold.otf',
    outputFile: 'NanumMyeongjo-Bold.woff2',
    cssFamily: 'Nanum Myeongjo',
    weight: 700,
  },
  {
    folder: '마루 부리',
    sourceFile: 'MaruBuri-Bold.ttf',
    outputFile: 'MaruBuri-Bold.woff2',
    cssFamily: 'MaruBuri',
    weight: 700,
  },
  {
    folder: '가나초콜릿체',
    sourceFile: 'Ghanachocolate.ttf',
    outputFile: 'Ghanachocolate.woff2',
    cssFamily: '가나초콜릿체',
    weight: 400,
  },
  {
    folder: 'tvN 즐거운이야기',
    sourceFile: 'tvN 즐거운이야기 Bold.ttf',
    outputFile: 'tvN-Bold.woff2',
    cssFamily: 'tvN 즐거운이야기',
    weight: 700,
  },
  // ── 추가 변환 (클라이언트 제공 전량) ────────────────────────────────────────
  // 나눔브러쉬 — 손글씨 포인트 (handFont 역할)
  {
    folder: '나눔브러쉬',
    sourceFile: 'NanumBrush.otf',
    outputFile: 'NanumBrush-Regular.woff2',
    cssFamily: 'NanumBrushScript',
    weight: 400,
  },
  // 나눔손글씨 부장님 눈치체 — 서브셋 결과 2.96MB (> 700KB 한도) → 스킵
  // 땅스부대찌개체 — SVG 테이블 포함 폰트라 lxml 없이는 pyftsubset 실패 → 스킵
  // 문경감홍사과체 — 지역 특화 디스플레이
  {
    folder: '문경감홍사과체폰트파일',
    sourceFile: 'Mungyeong-Gamhong-Apple.otf',
    outputFile: 'Mungyeong-Bold.woff2',
    cssFamily: '문경감홍사과체',
    weight: 400,
  },
  // 빛고을광주체 — 도시 감성 디스플레이
  {
    folder: '빛고을광주체',
    sourceFile: '빛고을광주_Bold.ttf',
    outputFile: 'Bitgoeul-Bold.woff2',
    cssFamily: '빛고을광주체',
    weight: 700,
  },
  // 상주곶감체 — 전통/감성 디스플레이 (대표 1웨이트 Gotgam 계열)
  {
    folder: '상주곶감체',
    sourceFile: 'SANGJU Gotgam.ttf',
    outputFile: 'SangjuGotgam.woff2',
    cssFamily: '상주곶감체',
    weight: 400,
  },
  // 더페이스샵 잉크립퀴드체 — .exe 전용 배포라 변환 불가 (스킵)
  // 수성혜정체_윈도우용 — 소스 파일 없음 (스킵)
]

// ── 유틸 ─────────────────────────────────────────────────────────────────────

function bytesToKB(n: number): string {
  return (n / 1024).toFixed(1) + 'KB'
}

function convertFont(srcPath: string, outPath: string, _job: FontJob): boolean {
  // spawnSync (not exec) — args passed as array, no shell interpolation
  const result = spawnSync(
    PYFTSUBSET,
    [
      srcPath,
      `--unicodes=${UNICODE_RANGES}`,
      `--flavor=woff2`,
      `--output-file=${outPath}`,
      '--no-hinting',
      '--desubroutinize',
    ],
    { encoding: 'utf8' },
  )

  if (result.status !== 0) {
    const stderr = (result.stderr ?? '').slice(0, 300)
    if (stderr) console.error(`  [오류] ${stderr}`)
    return false
  }
  return true
}

// ── 메인 ─────────────────────────────────────────────────────────────────────

function main(): void {
  // --src 인수 파싱
  const srcArg = process.argv.indexOf('--src')
  const srcRoot = srcArg >= 0 ? process.argv[srcArg + 1] : DEFAULT_SRC

  if (!fs.existsSync(srcRoot)) {
    console.error(`[build-fonts] 소스 디렉토리 없음: ${srcRoot}`)
    process.exit(1)
  }
  if (!fs.existsSync(PYFTSUBSET)) {
    console.error(`[build-fonts] pyftsubset 없음: ${PYFTSUBSET}`)
    console.error('  → pip3 install fonttools brotli 실행 후 재시도')
    process.exit(1)
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  console.log('[build-fonts] 시작')
  console.log(`  소스: ${srcRoot}`)
  console.log(`  출력: ${OUTPUT_DIR}`)
  console.log(`  유니코드: ${UNICODE_RANGES}\n`)

  const results: Array<{ job: FontJob; ok: boolean; sizeKB?: string }> = []

  for (const job of PRIORITY_FONTS) {
    const srcPath = path.join(srcRoot, job.folder, job.sourceFile)
    const outPath = path.join(OUTPUT_DIR, job.outputFile)

    process.stdout.write(`  [${job.cssFamily}] ${job.sourceFile} → ${job.outputFile} ...`)

    if (!fs.existsSync(srcPath)) {
      console.log(' ✗ 소스 없음')
      results.push({ job, ok: false })
      continue
    }

    const ok = convertFont(srcPath, outPath, job)
    if (ok && fs.existsSync(outPath)) {
      const size = fs.statSync(outPath).size
      const sizeKB = bytesToKB(size)
      const warn = size > 700 * 1024 ? ' ⚠ 700KB 초과' : ''
      console.log(` ✓ ${sizeKB}${warn}`)
      results.push({ job, ok: true, sizeKB })
    } else {
      console.log(' ✗ 실패')
      results.push({ job, ok: false })
    }
  }

  // 결과 요약
  const succeeded = results.filter((r) => r.ok)
  const failed = results.filter((r) => !r.ok)

  console.log('\n── 결과 요약 ──────────────────────────────────')
  console.log(`성공: ${succeeded.length}종 / 실패: ${failed.length}종`)
  if (succeeded.length > 0) {
    console.log('\n  파일명                       CSS Family              Weight  크기')
    console.log('  ──────────────────────────── ──────────────────────── ──────  ──────')
    for (const { job, sizeKB } of succeeded) {
      const f = job.outputFile.padEnd(28)
      const c = job.cssFamily.padEnd(24)
      console.log(`  ${f} ${c} ${String(job.weight).padEnd(7)} ${sizeKB}`)
    }
  }
  if (failed.length > 0) {
    console.log('\n  실패:')
    for (const { job } of failed) console.log(`  - ${job.cssFamily} (${job.sourceFile})`)
  }

  if (failed.length > 0) process.exit(1)
}

main()
