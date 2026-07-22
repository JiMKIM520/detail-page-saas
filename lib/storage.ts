/**
 * Supabase Storage 래퍼
 *
 * 전략: 에이전트(agents/)는 로컬 파일시스템(/tmp 또는 output/)에 그대로 쓰고,
 * 파이프라인 완료 후 이 모듈로 결과물을 Supabase Storage에 일괄 업로드.
 * 웹앱은 Storage public URL로 읽기.
 */
import { createServiceClient } from '@/lib/supabase/service'
import * as fs from 'fs'
import * as path from 'path'

const DESIGNS_BUCKET = 'designs'

// ── 기본 Storage 헬퍼 ───────────────────────────────────────────

/** 파일을 Storage에 업로드. 이미 존재하면 upsert. */
export async function uploadToStorage(
  storagePath: string,
  buffer: Buffer,
  contentType: string,
  bucket = DESIGNS_BUCKET
): Promise<string> {
  const supabase = createServiceClient()
  // HTML(초안)은 재생성·수정마다 같은 경로를 덮어쓰므로 CDN 캐시가 이전 버전을 반환하면 안 된다
  // (cacheControl 미지정 시 기본 3600s 캐시 → 재생성 후에도 구버전이 /draft에 나오는 실사례).
  // 이미지는 URL이 고유(파일명 기반)라 캐시해도 안전.
  const cacheControl = contentType.includes('html') ? '0' : '3600'
  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buffer, { contentType, upsert: true, cacheControl })

  if (error) throw new Error(`Storage upload failed: ${storagePath} — ${error.message}`)

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath)
  return data.publicUrl
}

/** Storage에서 파일 다운로드 → Buffer 반환 */
export async function downloadFromStorage(
  storagePath: string,
  bucket = DESIGNS_BUCKET
): Promise<Buffer> {
  const supabase = createServiceClient()
  const { data, error } = await supabase.storage.from(bucket).download(storagePath)
  if (error || !data) throw new Error(`Storage download failed: ${storagePath} — ${error?.message}`)
  return Buffer.from(await data.arrayBuffer())
}

/** Storage public URL 반환 */
export function getPublicUrl(storagePath: string, bucket = DESIGNS_BUCKET): string {
  const supabase = createServiceClient()
  return supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl
}

// ── 파이프라인 결과물 일괄 업로드 ─────────────────────────────────

/** MIME 타입 추론 */
function mimeFromExt(ext: string): string {
  const map: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.html': 'text/html',
    '.json': 'application/json',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.css': 'text/css',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
    '.md': 'text/markdown',
  }
  return map[ext.toLowerCase()] ?? 'application/octet-stream'
}

/** 디렉토리를 재귀적으로 순회하며 모든 파일 경로 반환 */
function walkDir(dir: string): string[] {
  const results: string[] = []
  if (!fs.existsSync(dir)) return results
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walkDir(full))
    } else {
      results.push(full)
    }
  }
  return results
}

export interface UploadResult {
  totalFiles: number
  uploadedFiles: number
  urls: Record<string, string>
  errors: string[]
}

/**
 * 파이프라인 output 디렉토리를 Supabase Storage에 일괄 업로드.
 *
 * Storage 경로: projects/{projectId}/{relativePath}
 * 예: projects/512266a3/4_final/index.html
 *
 * @param projectId - 프로젝트 ID
 * @param outputDir - 로컬 output 디렉토리 (e.g., output/512266a3)
 * @param includePatterns - 업로드할 파일 패턴 (기본: 주요 산출물만)
 */
export async function uploadPipelineOutput(
  projectId: string,
  outputDir: string,
  includePatterns?: RegExp[]
): Promise<UploadResult> {
  const defaultPatterns = [
    /4_final\/index\.html$/,        // HTML
    /5_export\/.*\.(png|pdf|zip)$/,  // Export 산출물
    /5_export\/designer\//,          // Designer 패키지
    /style-guide\.json$/,            // 스타일 가이드
    /refined-copy\.json$/,           // 편집 카피
    /1_script\/script\.json$/,       // 스크립트
    /icons\/icon-mapping\.json$/,    // 아이콘 매핑
    /2_styling_shots\//,             // 스타일링샷
    /3_layer_images\//,              // 레이어 이미지
    /final-report\.json$/,           // 최종 리포트
  ]
  const patterns = includePatterns ?? defaultPatterns

  const allFiles = walkDir(outputDir)
  const filesToUpload = allFiles.filter(f => {
    const rel = path.relative(outputDir, f)
    return patterns.some(p => p.test(rel))
  })

  const result: UploadResult = {
    totalFiles: filesToUpload.length,
    uploadedFiles: 0,
    urls: {},
    errors: [],
  }

  for (const filePath of filesToUpload) {
    const relativePath = path.relative(outputDir, filePath)
    const storagePath = `projects/${projectId}/${relativePath}`
    const ext = path.extname(filePath)
    const contentType = mimeFromExt(ext)

    try {
      const buffer = fs.readFileSync(filePath)
      const url = await uploadToStorage(storagePath, buffer, contentType)
      result.urls[relativePath] = url
      result.uploadedFiles++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      result.errors.push(`${relativePath}: ${msg}`)
    }
  }

  return result
}

/**
 * designs 테이블에 결과물 URL 업데이트.
 * uploadPipelineOutput() 이후 호출.
 */
export async function updateDesignUrls(
  projectId: string,
  urls: Record<string, string>
): Promise<void> {
  const supabase = createServiceClient()

  // 히어로 이미지 URL (미리보기용)
  const heroKey = Object.keys(urls).find(k => k.includes('mobile') && k.includes('detail_page.png'))
  const pdfKey = Object.keys(urls).find(k => k.includes('mobile') && k.includes('detail_page.pdf'))
  const htmlKey = Object.keys(urls).find(k => k.includes('4_final/index.html'))

  // section_images 빌드
  const sectionImages = Object.entries(urls)
    .filter(([k]) => k.includes('sections/') && k.endsWith('.png'))
    .map(([k, url]) => ({
      type: path.basename(k, '.png'),
      url,
    }))

  // ZIP URLs
  const mobileZip = Object.keys(urls).find(k => k.endsWith('mobile.zip'))
  const pcZip = Object.keys(urls).find(k => k.endsWith('pc.zip'))
  const designerZip = Object.keys(urls).find(k => k.endsWith('designer.zip'))

  const updateData: Record<string, unknown> = {
    designer_status: 'pending',
  }
  if (heroKey) updateData.preview_url = urls[heroKey]
  if (pdfKey) updateData.preview_pdf_url = urls[pdfKey]
  if (sectionImages.length > 0) updateData.section_images = sectionImages

  // output_urls에 ZIP/HTML 경로 저장 (JSON).
  // 주의: designs 테이블에 edited_html_url 컬럼이 없어 과거 insert가 조용히 실패했음 → html은 output_url JSON에 보관.
  const outputUrls: Record<string, string> = {}
  if (htmlKey) outputUrls.html = urls[htmlKey]
  if (mobileZip) outputUrls.mobile_zip = urls[mobileZip]
  if (pcZip) outputUrls.pc_zip = urls[pcZip]
  if (designerZip) outputUrls.designer_zip = urls[designerZip]
  if (Object.keys(outputUrls).length > 0) {
    updateData.output_url = JSON.stringify(outputUrls)
  }

  // upsert: 기존 design이 있으면 업데이트, 없으면 생성
  const { data: existing } = await supabase
    .from('designs')
    .select('id')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) {
    const { error } = await supabase.from('designs').update(updateData).eq('id', existing.id)
    if (error) throw new Error(`designs 업데이트 실패: ${error.message}`)
  } else {
    const { error } = await supabase.from('designs').insert({
      project_id: projectId,
      ...updateData,
    })
    if (error) throw new Error(`designs 생성 실패: ${error.message}`)
  }
}
