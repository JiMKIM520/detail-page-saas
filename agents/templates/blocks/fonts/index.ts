/**
 * 클라이언트 제공 폰트 매니페스트 + getFontFace 헬퍼.
 * woff2 파일은 drive/ 서브디렉토리에 f01~f36으로 복사됨 (티몬몬소리체 f04 제외 — 한글 글리프 0).
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
 * 클라이언트 드라이브 제공 폰트 매니페스트 — 35종 (f04 티몬몬소리체 제외).
 * key = CSS family 정식명 (정규화명), file = drive/fNN.woff2 (FONTS_DIR 기준 상대경로)
 */
export const CLIENT_FONT_MANIFEST: Record<string, ClientFontManifestEntry> = {
  '프리텐다드':           { cssFamily: '프리텐다드',           file: 'drive/f01.woff2', weight: 700 },
  '평창평화체':           { cssFamily: '평창평화체',           file: 'drive/f02.woff2', weight: 400 },
  '페이퍼로지':           { cssFamily: '페이퍼로지',           file: 'drive/f03.woff2', weight: 700 },
  // f04 티몬몬소리체 제외 — 한글 글리프 0개
  '카페24 클래식타입':     { cssFamily: '카페24 클래식타입',     file: 'drive/f05.woff2', weight: 400 },
  '카페24 빛나는별':       { cssFamily: '카페24 빛나는별',       file: 'drive/f06.woff2', weight: 400 },
  '카페24 아네모네':       { cssFamily: '카페24 아네모네',       file: 'drive/f07.woff2', weight: 400 },
  '카페24 당당해':         { cssFamily: '카페24 당당해',         file: 'drive/f08.woff2', weight: 400 },
  '카페24 써라운드':       { cssFamily: '카페24 써라운드',       file: 'drive/f09.woff2', weight: 400 },
  '창원단감아삭체':        { cssFamily: '창원단감아삭체',        file: 'drive/f10.woff2', weight: 400 },
  '카페24 단정해':         { cssFamily: '카페24 단정해',         file: 'drive/f11.woff2', weight: 400 },
  '지마켓 산스':           { cssFamily: '지마켓 산스',           file: 'drive/f12.woff2', weight: 700 },
  '영양군 음식디미방체':    { cssFamily: '영양군 음식디미방체',    file: 'drive/f13.woff2', weight: 400 },
  'Rufina':               { cssFamily: 'Rufina',               file: 'drive/f14.woff2', weight: 400 },
  'Apollo':               { cssFamily: 'Apollo',               file: 'drive/f15.woff2', weight: 400 },
  'High Summit':          { cssFamily: 'High Summit',          file: 'drive/f16.woff2', weight: 400 },
  'Gontserrat':           { cssFamily: 'Gontserrat',           file: 'drive/f17.woff2', weight: 400 },
  'Quentin':              { cssFamily: 'Quentin',              file: 'drive/f18.woff2', weight: 400 },
  '영도체':               { cssFamily: '영도체',               file: 'drive/f19.woff2', weight: 400 },
  '여기어때 잘난체':       { cssFamily: '여기어때 잘난체',       file: 'drive/f20.woff2', weight: 700 },
  'Belgiano':             { cssFamily: 'Belgiano',             file: 'drive/f21.woff2', weight: 400 },
  '어그로체':             { cssFamily: '어그로체',             file: 'drive/f22.woff2', weight: 700 },
  '안성탕면체':           { cssFamily: '안성탕면체',           file: 'drive/f23.woff2', weight: 400 },
  '수성혜정체':           { cssFamily: '수성혜정체',           file: 'drive/f24.woff2', weight: 400 },
  '상주곶감체':           { cssFamily: '상주곶감체',           file: 'drive/f25.woff2', weight: 400 },
  '빛고을광주체':         { cssFamily: '빛고을광주체',         file: 'drive/f26.woff2', weight: 400 },
  '마루 부리':            { cssFamily: '마루 부리',            file: 'drive/f27.woff2', weight: 700 },
  '문경감홍사과체':        { cssFamily: '문경감홍사과체',        file: 'drive/f28.woff2', weight: 400 },
  '나눔스퀘어':           { cssFamily: '나눔스퀘어',           file: 'drive/f29.woff2', weight: 700 },
  '땅스부대찌개체':        { cssFamily: '땅스부대찌개체',        file: 'drive/f30.woff2', weight: 400 },
  '나눔 부장님 눈치체':    { cssFamily: '나눔 부장님 눈치체',    file: 'drive/f31.woff2', weight: 400 },
  '나눔브러쉬':           { cssFamily: '나눔브러쉬',           file: 'drive/f32.woff2', weight: 400 },
  '나눔명조':             { cssFamily: '나눔명조',             file: 'drive/f33.woff2', weight: 700 },
  'tvN 즐거운이야기':      { cssFamily: 'tvN 즐거운이야기',      file: 'drive/f34.woff2', weight: 700 },
  'SUIT':                 { cssFamily: 'SUIT',                 file: 'drive/f35.woff2', weight: 700 },
  '가나초콜릿체':          { cssFamily: '가나초콜릿체',          file: 'drive/f36.woff2', weight: 400 },
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
