export function RevisionGuide({ used = 0 }: { used?: number }) {
  const rounds = [1, 2]
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-blue-800">수정 안내</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              used >= 2
                ? 'bg-red-100 text-red-700'
                : used === 1
                ? 'bg-amber-100 text-amber-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {used}/2 사용
            </span>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>초안 확인 후 아래 코멘트로 수정 요청이 가능합니다.</li>
            <li>수정은 <span className="font-semibold">1차 · 2차 총 2회</span>까지 가능합니다.</li>
            <li>디자인의 <span className="font-semibold">전체적인 구성은 유지</span>한 상태에서, 문구 변경 및 색상 조정 등 범위 내에서 수정 가능합니다.</li>
          </ul>
          {/* 1차 / 2차 수정 상태 */}
          <div className="flex items-center gap-2 mt-3">
            {rounds.map((r) => {
              const done = used >= r
              const next = used + 1 === r
              return (
                <span
                  key={r}
                  className={`text-xs font-medium rounded-full px-3 py-1 border ${
                    done
                      ? 'bg-blue-600 text-white border-blue-600'
                      : next
                      ? 'bg-white text-blue-700 border-blue-400'
                      : 'bg-white text-blue-300 border-blue-200'
                  }`}
                >
                  {r}차 수정 {done ? '완료' : next ? '가능' : '대기'}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
