export interface IntakeFileView {
  id: string
  file_type: string
  file_name: string
  isImage: boolean
  url: string | null
}

interface SubmittedIntakeProps {
  companyName: string
  brandName: string | null
  category: string | null
  platformName: string
  productHighlights: string | null
  productName: string | null
  productDescription: string | null
  // jsonb 컬럼 — 레거시 데이터는 배열/문자열/null 혼재 가능
  sellingPoints: string[] | string | null
  designPreference: string | null
  // jsonb 컬럼 — 레거시 데이터는 배열/문자열 혼재 가능
  targetAudience: string[] | string | null
  homepageUrl: string | null
  detailPageUrl: string | null
  referenceNotes: string | null
  files: IntakeFileView[]
  createdAt: string
}

const FILE_TYPE_LABELS: Record<string, string> = {
  product_photo: '제품 사진',
  brochure: '브랜드 소개서',
  detail_capture: '기존 상세페이지 캡처',
  brand_logo: '브랜드 로고',
  reference_design: '레퍼런스 디자인',
  other: '기타 자료',
}

/** reference_notes 앞에 자동 삽입된 [타겟 고객층: ...] 라인을 제거(타겟은 별도 표시) */
function cleanNotes(notes: string | null): string {
  if (!notes) return ''
  return notes
    .split('\n')
    .filter(line => !line.trim().startsWith('[타겟 고객층:'))
    .join('\n')
    .trim()
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <span
          key={item}
          className="inline-flex items-center rounded-full bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 border border-primary-100"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-4 py-3 border-b border-border/60 last:border-b-0">
      <dt className="text-xs font-medium text-text-tertiary sm:pt-0.5">{label}</dt>
      <dd className="text-sm text-text-primary leading-relaxed break-words">{children}</dd>
    </div>
  )
}

export function SubmittedIntake({
  companyName,
  brandName,
  category,
  platformName,
  productHighlights,
  productName,
  productDescription,
  sellingPoints,
  designPreference,
  targetAudience,
  homepageUrl,
  detailPageUrl,
  referenceNotes,
  files,
  createdAt,
}: SubmittedIntakeProps) {
  const styleWords = (designPreference ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  // 배열/문자열/null 모두 안전하게 칩 배열로 정규화
  const audience: string[] = Array.isArray(targetAudience)
    ? targetAudience.filter(Boolean)
    : typeof targetAudience === 'string' && targetAudience.trim()
      ? targetAudience.split(',').map(s => s.trim()).filter(Boolean)
      : []
  const notes = cleanNotes(referenceNotes)
  // 셀링 포인트 — 배열/문자열/null 모두 안전하게 정규화
  const points: string[] = Array.isArray(sellingPoints)
    ? sellingPoints.filter(Boolean)
    : typeof sellingPoints === 'string' && sellingPoints.trim()
      ? sellingPoints.split('\n').map(s => s.trim()).filter(Boolean)
      : []

  // 파일 타입별 그룹화 (표시 순서 고정)
  const TYPE_ORDER = ['product_photo', 'brand_logo', 'detail_capture', 'brochure', 'reference_design', 'other']
  const grouped = TYPE_ORDER
    .map(type => ({ type, items: files.filter(f => f.file_type === type) }))
    .filter(g => g.items.length > 0)
  // 알 수 없는 타입 폴백
  const known = new Set(TYPE_ORDER)
  const unknownFiles = files.filter(f => !known.has(f.file_type))

  return (
    <details open className="group bg-surface rounded-xl border border-border overflow-hidden">
      <summary className="flex items-center justify-between gap-3 px-6 py-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden hover:bg-surface-active/50 transition-colors">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
          <div>
            <h2 className="text-sm font-bold text-text-primary">내가 제출한 내용</h2>
            <p className="text-[11px] text-text-tertiary">
              제출일 {new Date(createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <svg className="w-5 h-5 text-text-tertiary transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </summary>

      <div className="px-6 pb-6 pt-1">
        <dl>
          <Row label="기업명">{companyName}</Row>
          {brandName && <Row label="브랜드명">{brandName}</Row>}
          <Row label="카테고리 / 플랫폼">
            {(category ?? '-')} · {platformName}
          </Row>
          {productName && <Row label="제품명">{productName}</Row>}
          {productDescription && (
            <Row label="제품 소개">
              <p className="whitespace-pre-wrap">{productDescription}</p>
            </Row>
          )}
          {points.length > 0 && (
            <Row label="셀링 포인트">
              <ul className="list-disc list-inside space-y-0.5">
                {points.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </Row>
          )}
          {productHighlights && (
            <Row label="회사 소개">
              <p className="whitespace-pre-wrap">{productHighlights}</p>
            </Row>
          )}
          {styleWords.length > 0 && (
            <Row label="디자인 스타일"><Chips items={styleWords} /></Row>
          )}
          {audience.length > 0 && (
            <Row label="타겟 고객층"><Chips items={audience} /></Row>
          )}
          {homepageUrl && (
            <Row label="홈페이지">
              <a href={homepageUrl} target="_blank" rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline underline-offset-2 break-all">
                {homepageUrl}
              </a>
            </Row>
          )}
          {detailPageUrl && (
            <Row label="기존 상세페이지">
              <a href={detailPageUrl} target="_blank" rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline underline-offset-2 break-all">
                {detailPageUrl}
              </a>
            </Row>
          )}
          {notes && (
            <Row label="참고 사항">
              <p className="whitespace-pre-wrap">{notes}</p>
            </Row>
          )}
        </dl>

        {/* 업로드한 파일 */}
        {(grouped.length > 0 || unknownFiles.length > 0) && (
          <div className="mt-5 pt-5 border-t border-border/60">
            <p className="text-xs font-medium text-text-tertiary mb-3">첨부한 파일</p>
            <div className="space-y-4">
              {[...grouped, ...(unknownFiles.length ? [{ type: '__unknown', items: unknownFiles }] : [])].map(group => (
                <div key={group.type}>
                  <p className="text-[11px] font-semibold text-text-secondary mb-2">
                    {FILE_TYPE_LABELS[group.type] ?? '기타 자료'} <span className="text-text-tertiary font-normal">{group.items.length}개</span>
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {group.items.map(file =>
                      file.isImage && file.url ? (
                        <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer"
                          className="group/thumb relative aspect-square rounded-lg overflow-hidden border border-border bg-surface-active block">
                          {/* 사용자 본인 업로드 이미지 — 보호 불필요 */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={file.url} alt={file.file_name}
                            className="w-full h-full object-cover transition-transform group-hover/thumb:scale-105" />
                        </a>
                      ) : (
                        <div key={file.id}
                          className="aspect-square rounded-lg border border-border bg-surface-active flex flex-col items-center justify-center gap-1.5 p-2 text-center">
                          <svg className="w-5 h-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          <span className="text-[10px] text-text-tertiary leading-tight line-clamp-2 break-all">{file.file_name}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </details>
  )
}
