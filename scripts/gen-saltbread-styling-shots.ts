/**
 * 소금빵 스타일링샷 실제 이미지 생성
 *
 * - styling-final-prompts.json 다운로드
 * - [OUTPUT SPECS]/[ROLE] 블록 없으면 buildShotPrompt로 재조립 (개선 프롬프트 적용)
 * - 누끼 4장 다운로드 → base64 변환
 * - 상위 3개 shot을 Gemini Pro로 이미지 생성
 * - designs 버킷 projects/{PID}/styling_real/{filename} 에 업로드
 * - 각 공개 URL 출력
 */
import { createClient } from '@supabase/supabase-js'
import { buildShotPrompt } from '../agents/styling-shots'
import { generateDesignImage } from '../lib/ai/gemini-image'
import type { StylingShot } from '../agents/types'

const PID = 'c0ff7994-4c13-4bbf-9ddd-d621bcfd5096'
const BUCKET = 'designs'

async function downloadBuffer(
  supabase: ReturnType<typeof createClient>,
  path: string
): Promise<Buffer> {
  const { data, error } = await supabase.storage.from(BUCKET).download(path)
  if (error) throw new Error(`download ${path}: ${error.message}`)
  return Buffer.from(await data.arrayBuffer())
}

async function downloadJson(
  supabase: ReturnType<typeof createClient>,
  path: string
): Promise<any> {
  const { data, error } = await supabase.storage.from(BUCKET).download(path)
  if (error) throw new Error(`download json ${path}: ${error.message}`)
  return JSON.parse(await data.text())
}

async function main() {
  const totalStart = Date.now()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ── 1. planning JSON 다운로드 ───────────────────────────────
  console.log('[1/4] planning 파일 다운로드...')
  const [promptsJson, styleGuide] = await Promise.all([
    downloadJson(supabase, `projects/${PID}/planning/styling-final-prompts.json`),
    downloadJson(supabase, `projects/${PID}/planning/style-guide.json`),
  ])

  const brandColorHex: string = styleGuide.colors?.primary ?? '#8B5A2B'
  const shots: any[] = promptsJson.shots ?? []
  const productPreservationRules: string[] = promptsJson.productPreservationRules ?? []

  console.log(`  -> shots: ${shots.length}개, brandColor: ${brandColorHex}`)

  // ── 2. 프롬프트 품질 확인 및 재조립 ──────────────────────────
  const meta = {
    category: 'food',
    platform: '11st',
    brandColorHex,
    aspectRatio: '3:4',
  }

  const top3 = shots.slice(0, 3)
  const finalShots = top3.map((shot: any) => {
    const fp: string = shot.finalPrompt ?? ''
    const isImproved = fp.includes('[OUTPUT SPECS]') && fp.includes('[ROLE]')

    let finalPrompt: string
    if (isImproved) {
      console.log(`  [${shot.name}] 개선 프롬프트 그대로 사용`)
      finalPrompt = fp
    } else {
      console.log(`  [${shot.name}] 구버전 프롬프트 → buildShotPrompt 재조립`)
      // StylingShot 타입으로 맵핑 (JSON 필드가 StylingShot과 호환)
      const shotMeta: StylingShot = {
        name: shot.name,
        filename: shot.filename,
        composition: shot.composition,
        props: shot.props ?? [],
        surface: shot.surface ?? 'Flat lay on dark slate surface',
        lighting: shot.lighting ?? 'Soft natural window light from the left',
        camera: shot.camera ?? 'Canon R5, 100mm macro, f/2.8',
        mood: shot.mood ?? 'Premium, artisanal, warm',
      }
      finalPrompt = buildShotPrompt(shotMeta, productPreservationRules, meta)
    }

    return { ...shot, finalPrompt, isImproved }
  })

  // ── 3. 누끼 로컬 파일 → base64 ──────────────────────────────
  console.log('\n[2/4] 누끼 이미지 로드 (로컬 파일)...')
  const fs = await import('fs')

  // public/salt-bread 경로 우선, 없으면 Downloads 경로 사용
  const nukkiLocalDir = `/Users/jinman/Desktop/Projects/products/detail-page-saas/public/salt-bread`
  const nukkiLocalPaths = [
    `${nukkiLocalDir}/cutout-01.png`,
    `${nukkiLocalDir}/cutout-02.png`,
    `${nukkiLocalDir}/cutout-03.png`,
    `${nukkiLocalDir}/cutout-04.png`,
  ]

  const nukkiBuffers = nukkiLocalPaths.map(p => fs.readFileSync(p))
  const nukkiBase64 = nukkiBuffers.map(buf => buf.toString('base64'))
  console.log(`  -> 누끼 ${nukkiBase64.length}장 준비 완료 (각 ${nukkiBuffers.map(b => (b.length/1024).toFixed(0)+'KB').join(', ')})`)

  // ── 4. Gemini Pro 이미지 생성 + 업로드 ────────────────────────
  console.log('\n[3/4] Gemini Pro 이미지 생성 (상위 3개)...')
  const results: { name: string; filename: string; url: string; durationMs: number; isImproved: boolean }[] = []

  for (let i = 0; i < finalShots.length; i++) {
    const shot = finalShots[i]
    console.log(`\n  [${i + 1}/3] ${shot.name} (${shot.filename})`)
    console.log(`    프롬프트 길이: ${shot.finalPrompt.length}자, 개선버전: ${shot.isImproved}`)

    const shotStart = Date.now()
    try {
      const imageBuffer = await generateDesignImage({
        prompt: shot.finalPrompt,
        referenceImages: nukkiBase64,
        aspectRatio: '3:4',
        model: 'pro',
      })
      const shotMs = Date.now() - shotStart
      console.log(`    -> 이미지 생성 완료 (${(shotMs / 1000).toFixed(1)}s, ${imageBuffer.length} bytes)`)

      // 업로드
      const storagePath = `projects/${PID}/styling_real/${shot.filename}`
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, imageBuffer, {
          contentType: 'image/png',
          upsert: true,
        })
      if (uploadErr) throw new Error(`upload error: ${uploadErr.message}`)

      // 공개 URL
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
      const publicUrl = urlData.publicUrl

      console.log(`    -> 업로드 완료: ${publicUrl}`)
      results.push({ name: shot.name, filename: shot.filename, url: publicUrl, durationMs: shotMs, isImproved: shot.isImproved })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`    -> 실패: ${msg.slice(0, 300)}`)
      results.push({ name: shot.name, filename: shot.filename, url: 'FAILED: ' + msg.slice(0, 100), durationMs: Date.now() - shotStart, isImproved: shot.isImproved })
    }
  }

  // ── 5. 결과 보고 ──────────────────────────────────────────────
  const totalMs = Date.now() - totalStart
  console.log('\n\n========================================')
  console.log('=== 생성 결과 보고 ===')
  console.log('========================================')
  console.log(`총 소요: ${(totalMs / 1000).toFixed(1)}초`)
  console.log(`생성 성공: ${results.filter(r => !r.url.startsWith('FAILED')).length}/${results.length}개\n`)

  for (const r of results) {
    const status = r.url.startsWith('FAILED') ? 'FAIL' : 'OK'
    console.log(`[${status}] ${r.name} (${r.filename})`)
    console.log(`  개선 프롬프트 적용: ${r.isImproved}`)
    console.log(`  소요: ${(r.durationMs / 1000).toFixed(1)}s`)
    console.log(`  URL: ${r.url}`)
    console.log()
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
