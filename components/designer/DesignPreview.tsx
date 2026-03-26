interface Design {
  id: string
  preview_url: string | null
  output_url: string | null
}

export function DesignPreview({ design }: { design: Design | null }) {
  if (!design) return <p className="text-gray-400">디자인 생성 중...</p>
  return (
    <div className="space-y-4">
      {design.preview_url && (
        <img src={design.preview_url} alt="디자인 미리보기"
          className="w-full rounded-xl border shadow-sm" />
      )}
      {design.output_url && (
        <a href={design.output_url} download
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
          최종 파일 다운로드
        </a>
      )}
    </div>
  )
}
