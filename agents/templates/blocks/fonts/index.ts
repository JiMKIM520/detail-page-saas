/**
 * 클라이언트 제공 폰트 매니페스트 + getFontFace 헬퍼.
 * woff2 파일은 scripts/build-fonts.ts 실행으로 생성 (한글+라틴 서브셋).
 * src는 base64 데이터 URI — 산출 HTML이 독립 파일·스토리지 서빙이라 상대경로 불가.
 */
import * as fs from 'fs'
import * as path from 'path'

// tsx v4+ provides __dirname in ESM context
const FONTS_DIR: string = __dirname

export interface ClientFontManifestEntry {
  /** CSS font-family 선언 명 */
  cssFamily: string
  /** woff2 파일명 (fonts/ 디렉토리 기준). undefined = 매니페스트 등록만 (변환 미완) */
  file?: string
  /** @font-face font-weight */
  weight: number
}

/**
 * 클라이언트 제공 폰트 매니페스트.
 * key = CSS family name (CSS font-family 속성에서 쓰는 정식 명)
 *
 * 우선 6종: SUIT, NanumSquare, Nanum Myeongjo, MaruBuri, 가나초콜릿체, tvN 즐거운이야기
 * 나머지 8종: 매니페스트 이름만 등록 — scripts/build-fonts.ts 재실행으로 file 추가 가능
 */
export const CLIENT_FONT_MANIFEST: Record<string, ClientFontManifestEntry> = {
  // ── 우선 6종 (woff2 변환 완료) ────────────────────────────────────────────
  'SUIT':                { cssFamily: 'SUIT',                file: 'SUIT-Bold.woff2',         weight: 700 },
  'NanumSquare':         { cssFamily: 'NanumSquare',         file: 'NanumSquare-Bold.woff2',  weight: 700 },
  'Nanum Myeongjo':      { cssFamily: 'Nanum Myeongjo',      file: 'NanumMyeongjo-Bold.woff2',weight: 700 },
  'MaruBuri':            { cssFamily: 'MaruBuri',            file: 'MaruBuri-Bold.woff2',     weight: 700 },
  '가나초콜릿체':          { cssFamily: '가나초콜릿체',          file: 'Ghanachocolate.woff2',    weight: 400 },
  'tvN 즐거운이야기':      { cssFamily: 'tvN 즐거운이야기',      file: 'tvN-Bold.woff2',          weight: 700 },

  // ── 매니페스트 등록만 (스크립트 재실행으로 file 추가) ────────────────────
  'NanumBrushScript':    { cssFamily: 'NanumBrushScript',    weight: 400 },
  '나눔 부장님 눈치체':    { cssFamily: '나눔 부장님 눈치체',    weight: 400 },
  '더페이스샵 잉크립퀴드체': { cssFamily: '더페이스샵 잉크립퀴드체', weight: 400 },
  '땅스부대찌개체':        { cssFamily: '땅스부대찌개체',        weight: 400 },
  '문경감홍사과체':        { cssFamily: '문경감홍사과체',        weight: 400 },
  '빛고을광주체':          { cssFamily: '빛고을광주체',          weight: 400 },
  '상주곶감체':            { cssFamily: '상주곶감체',            weight: 400 },
  '수성혜정체':            { cssFamily: '수성혜정체',            weight: 400 },
}

/**
 * CSS family 이름과 woff2 파일명·가중치를 받아 @font-face 블록(데이터 URI)을 반환.
 * 파일이 없으면 null (woff2 미생성 → 폴백 동작 유지).
 */
export function getFontFaceByFile(cssFamily: string, woff2File: string, weight: number): string | null {
  const filePath = path.join(FONTS_DIR, woff2File)
  if (!fs.existsSync(filePath)) return null
  const data = fs.readFileSync(filePath)
  const b64 = data.toString('base64')
  return `@font-face{font-family:'${cssFamily}';font-weight:${weight};font-display:swap;src:url('data:font/woff2;base64,${b64}') format('woff2')}`
}

/**
 * CSS family 이름으로 매니페스트를 조회해 @font-face 블록 반환.
 * 미등록 또는 file 미지정 시 null.
 */
export function getFontFace(family: string): string | null {
  const entry = CLIENT_FONT_MANIFEST[family]
  if (!entry?.file) return null
  return getFontFaceByFile(entry.cssFamily, entry.file, entry.weight)
}
