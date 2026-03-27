interface Design {
  id: string
  preview_url: string | null
  output_url: string | null
}

export function DesignPreview({ design }: { design: Design | null }) {
  if (!design) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-xl border border-border border-dashed">
        <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-violet-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
          </svg>
        </div>
        <p className="text-text-tertiary text-sm">디자인 생성 중...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {design.preview_url && (
        <div className="rounded-xl border border-border overflow-hidden shadow-card">
          <img src={design.preview_url} alt="디자인 미리보기" className="w-full" />
        </div>
      )}
      {design.output_url && (
        <a href={design.output_url} download
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-semibold bg-primary-50 px-4 py-2 rounded-lg hover:bg-primary-100 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          최종 파일 다운로드
        </a>
      )}
    </div>
  )
}
