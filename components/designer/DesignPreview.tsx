interface Design {
  id: string
  preview_url: string | null
  preview_pdf_url: string | null
  output_url: string | null
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://detail-page-saas.vercel.app'

const OUTPUT_LABELS: Record<string, string> = {
  html: 'HTML 파일',
  mobile_zip: '모바일용 ZIP',
  pc_zip: 'PC용 ZIP',
  designer_zip: '디자이너 ZIP (Figma용)',
}

/**
 * output_url은 JSON 객체 문자열 또는 단일 URL 문자열일 수 있다. 둘 다 다운로드 링크로 변환.
 */
function parseOutputUrls(raw: string): { key: string; label: string; url: string }[] {
  const trimmed = raw.trim()
  if (trimmed.startsWith('{')) {
    try {
      const obj = JSON.parse(trimmed) as Record<string, unknown>
      return Object.entries(obj)
        .filter(([, v]) => typeof v === 'string' && v)
        .map(([key, v]) => ({ key, label: OUTPUT_LABELS[key] ?? key, url: v as string }))
    } catch {
      /* 단일 URL로 처리 */
    }
  }
  return [{ key: 'file', label: '최종 파일 다운로드', url: trimmed }]
}

export function DesignPreview({ design, projectId }: { design: Design | null; projectId: string }) {
  if (!design) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-xl border border-border border-dashed">
        <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
          </svg>
        </div>
        <p className="text-text-tertiary text-sm">아직 생성된 디자인 초안이 없습니다. ‘디자인 생성’을 눌러주세요.</p>
      </div>
    )
  }

  const draftPath = `/draft/${projectId}`
  const draftUrl = `${SITE_URL}${draftPath}`

  return (
    <div className="space-y-4">
      {/* AI 1차 초안 미리보기 (HTML) */}
      <div className="rounded-xl border border-border overflow-hidden shadow-card bg-white">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface">
          <span className="text-sm font-semibold text-text-primary">AI 1차 초안 미리보기</span>
          <a href={draftPath} target="_blank" rel="noopener noreferrer"
            className="text-xs font-medium text-primary-600 hover:text-primary-700">새 탭에서 크게 보기 ↗</a>
        </div>
        <iframe src={draftPath} title="AI 초안 미리보기" className="w-full h-[600px] bg-white" />
      </div>

      {/* Figma 임포트 안내 */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-2">
        <p className="text-sm font-semibold text-indigo-800">Figma로 가져와 리터치하기</p>
        <p className="text-xs text-indigo-700 leading-relaxed">
          Figma에서 <b>html.to.design</b> 플러그인을 실행하고 아래 URL을 붙여넣어 임포트하세요. 편집 가능한 레이어로 들어옵니다.
        </p>
        <input
          readOnly
          defaultValue={draftUrl}
          className="w-full text-xs font-mono bg-white border border-indigo-200 rounded-lg px-3 py-2 text-indigo-900 select-all"
        />
      </div>

      {/* 레거시: PNG 미리보기 / PDF / 다운로드 (있을 때만) */}
      {design.preview_url && (
        <div className="rounded-xl border border-border overflow-hidden shadow-card">
          <img src={design.preview_url} alt="디자인 미리보기" className="w-full" />
        </div>
      )}
      {design.output_url && (
        <div className="flex flex-wrap gap-2">
          {parseOutputUrls(design.output_url).map(({ key, label, url }) => (
            <a key={key} href={url} download target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-semibold bg-primary-50 px-4 py-2 rounded-lg hover:bg-primary-100 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              {label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
