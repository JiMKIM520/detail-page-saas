'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  user_profiles: { name: string } | null
}

export function CommentSection({ projectId }: { projectId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?project_id=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null)
    })
  }, [supabase.auth])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, content: content.trim() }),
      })
      if (res.ok) {
        setContent('')
        await fetchComments()
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-100 rounded w-24" />
          <div className="h-20 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="text-base font-semibold text-text-primary mb-4">
        코멘트
        {comments.length > 0 && (
          <span className="ml-2 text-sm font-normal text-text-tertiary">
            {comments.length}
          </span>
        )}
      </h3>

      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => {
            const isOwn = comment.user_id === currentUserId
            const displayName =
              comment.user_profiles?.name ??
              (isOwn ? '나' : '담당자')

            return (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary-700">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {displayName}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {new Date(comment.created_at).toLocaleDateString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-text-tertiary mb-6">
          아직 코멘트가 없습니다. 첫 번째 코멘트를 남겨보세요.
        </p>
      )}

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="코멘트를 입력하세요..."
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="inline-flex items-center gap-2 bg-primary-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                전송 중...
              </>
            ) : (
              '코멘트 남기기'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
