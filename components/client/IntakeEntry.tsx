'use client'

/**
 * 의뢰 전 첫 화면 진입점.
 *
 * 임시저장은 localStorage에만 있어 서버 렌더 시점에는 알 수 없다. 그래서 이 컴포넌트가
 * 마운트 후 확인해, 작성하던 내용이 있으면 이어쓰기를, 없으면 시작 버튼만 보여준다.
 * (제출을 마친 기업은 이 화면에 오지 않는다 — 서버에서 제출본 화면으로 보낸다)
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'

const DRAFT_KEY = 'detailai_intake_draft'

interface DraftPeek {
  companyName?: string
  productName?: string
  savedAt?: string
}

/** 사람이 읽는 상대 시각 — "방금", "3시간 전", 하루 넘으면 날짜 */
function formatSavedAt(iso?: string): string {
  if (!iso) return ''
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const min = Math.floor((Date.now() - t) / 60000)
  if (min < 1) return '방금 저장'
  if (min < 60) return `${min}분 전 저장`
  if (min < 60 * 24) return `${Math.floor(min / 60)}시간 전 저장`
  return `${new Date(t).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 저장`
}

export function IntakeEntry({ usageExhausted }: { usageExhausted: boolean }) {
  // null = 아직 확인 전(깜빡임 방지), undefined = 임시저장 없음
  const [draft, setDraft] = useState<DraftPeek | null | undefined>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return setDraft(undefined)
      const d = JSON.parse(raw) as Record<string, unknown>
      // 회사명·제품명이 모두 비어 있으면 사실상 빈 초안 — 없는 것으로 본다
      const companyName = typeof d.company_name === 'string' ? d.company_name : ''
      const productName = typeof d.product_name === 'string' ? d.product_name : ''
      if (!companyName && !productName) return setDraft(undefined)
      setDraft({
        companyName,
        productName,
        savedAt: typeof d.savedAt === 'string' ? d.savedAt : undefined,
      })
    } catch {
      setDraft(undefined)
    }
  }, [])

  if (draft === null) {
    return <div className="h-56 rounded-2xl border border-border border-dashed bg-surface" aria-hidden />
  }

  if (usageExhausted) {
    return (
      <div className="text-center py-20 bg-surface rounded-2xl border border-border border-dashed">
        <p className="text-sm text-text-tertiary">이미 의뢰를 완료하셨습니다.</p>
      </div>
    )
  }

  // ── 작성하던 내용이 있는 경우 ──────────────────────────────────────
  if (draft) {
    return (
      <div className="bg-surface rounded-2xl border border-primary-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold bg-primary-50 text-primary-700 px-2 py-0.5 rounded-md">
            작성 중
          </span>
          {draft.savedAt && (
            <span className="text-xs text-text-tertiary">{formatSavedAt(draft.savedAt)}</span>
          )}
        </div>
        <h2 className="text-lg font-bold text-text-primary">
          {draft.companyName || draft.productName || '작성하던 의뢰서'}
        </h2>
        <p className="text-sm text-text-tertiary mt-1 mb-5">
          작성하던 내용이 이 브라우저에 저장되어 있습니다. 이어서 작성해 제출해 주세요.
        </p>
        <Link
          href="/intake"
          className="inline-flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-primary-700 shadow-sm hover:shadow-md transition-all"
        >
          이어서 작성하기
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>
    )
  }

  // ── 아직 시작 전 ────────────────────────────────────────────────
  return (
    <div className="text-center py-24 bg-surface rounded-2xl border border-border border-dashed">
      <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <p className="text-sm text-text-tertiary mb-6">상세페이지 제작을 의뢰해 주세요</p>
      <Link
        href="/intake"
        className="inline-flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-primary-700 shadow-sm transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        디자인 의뢰 시작하기
      </Link>
    </div>
  )
}
