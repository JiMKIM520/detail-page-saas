'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * 사무국 ↔ 디자이너 내부 메모.
 *
 * 사업자 코멘트(수정요구)와 분리된 채널이다. /api/comments GET은 관리자·디자이너에게만
 * 전체 role을 돌려주므로(기업에는 role='client'만) 여기 남긴 메모는 기업 화면에 뜨지 않는다.
 */

interface Note {
  id: string
  content: string
  created_at: string
  role: string | null
  user_profiles?: { name: string | null }
}

const ROLE_LABELS: Record<string, string> = {
  admin: '사무국',
  designer: '디자이너',
  client: '사업자',
}

export function InternalNotes({ projectId }: { projectId: string }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?project_id=${projectId}`)
      if (!res.ok) throw new Error('메모를 불러오지 못했습니다')
      const data: Note[] = await res.json()
      // 사업자 수정요구는 위쪽 전용 블록에서 보여주므로 여기선 내부 메모만 남긴다
      setNotes(data.filter(n => n.role && n.role !== 'client'))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '메모를 불러오지 못했습니다')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { load() }, [load])

  const submit = async () => {
    const content = draft.trim()
    if (!content || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, content }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? '메모 등록에 실패했습니다')
      }
      setDraft('')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : '메모 등록에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-1">사무국 · 디자이너 메모</h3>
      <p className="text-xs text-text-tertiary mb-3">내부 공유용입니다. 기업 화면에는 보이지 않습니다.</p>

      {loading ? (
        <p className="text-sm text-text-tertiary">불러오는 중…</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-text-tertiary">아직 남긴 메모가 없습니다.</p>
      ) : (
        <ul className="space-y-3 mb-4">
          {notes.map(n => (
            <li key={n.id} className="text-sm border-l-2 border-primary-200 pl-3">
              <p className="text-text-secondary whitespace-pre-wrap">{n.content}</p>
              <p className="text-xs text-text-tertiary mt-1">
                {ROLE_LABELS[n.role ?? ''] ?? '작성자'}
                {n.user_profiles?.name ? ` · ${n.user_profiles.name}` : ''}
                {' · '}
                {new Date(n.created_at).toLocaleString('ko-KR')}
              </p>
            </li>
          ))}
        </ul>
      )}

      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        rows={3}
        placeholder="작업 지시나 공유할 내용을 남겨주세요"
        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={submit}
          disabled={!draft.trim() || submitting}
          className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? '등록 중…' : '메모 남기기'}
        </button>
      </div>
    </div>
  )
}
