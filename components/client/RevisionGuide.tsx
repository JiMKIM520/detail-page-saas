export function RevisionGuide() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-800 mb-1">수정 안내</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>초안 확인 후 아래 코멘트로 수정 요청이 가능합니다.</li>
            <li>수정은 <span className="font-semibold">최대 2회</span>까지 가능합니다.</li>
            <li>레이아웃 전면 수정은 불가하며 <span className="font-semibold">문구·색상 조정 수준</span>으로 진행됩니다.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
