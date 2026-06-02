'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Shot { name: string; url: string }

/**
 * AI 스타일링샷 생성·확인 패널.
 * "프롬프트만 뽑아 외부 업로드"가 아니라, Gemini API로 직접 생성한 스타일링샷을 보여주고 재생성한다.
 */
export function StylingShotGenerator({
  projectId, initialShots, hasPrompts,
}: { projectId: string; initialShots: Shot[]; hasPrompts: boolean }) {
  const [shots, setShots] = useState<Shot[]>(initialShots)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const router = useRouter()

  async function generate() {
    setLoading(true); setErr('')
    try {
      const res = await fetch('/api/photography/generate-shots', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })
      const json = await res.json()
      if (!res.ok) { setErr(json.error || 'AI 생성에 실패했습니다.'); return }
      // 캐시 버스트
      setShots((json.shots as Shot[]).map(s => ({ ...s, url: s.url + '?t=' + Date.now() })))
      router.refresh()
    } catch (e) {
      setErr('네트워크 오류: ' + String(e).slice(0, 120))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-bold text-text-primary">AI 스타일링샷</h3>
        <button
          onClick={generate}
          disabled={loading || !hasPrompts}
          className="inline-flex items-center gap-2 bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />생성 중… (2~3분)</>
          ) : (shots.length > 0 ? 'AI로 재생성' : 'AI로 생성')}
        </button>
      </div>
      <p className="text-xs text-text-tertiary mb-4">
        기획안의 스타일링 프롬프트로 Gemini가 제품 사진을 참조해 직접 생성합니다. (외부 업로드 불필요)
      </p>

      {!hasPrompts && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          스타일링 프롬프트가 아직 준비되지 않았습니다. 디자인 기획 단계를 먼저 완료하세요.
        </p>
      )}
      {err && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-3">{err}</p>
      )}

      {shots.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {shots.map((s, i) => (
            <figure key={i} className="rounded-lg overflow-hidden border border-border bg-white">
              <img src={s.url} alt={s.name} className="w-full aspect-[3/4] object-cover" />
              <figcaption className="text-xs text-text-tertiary px-2.5 py-2 truncate">{s.name}</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        hasPrompts && !loading && (
          <p className="text-sm text-text-tertiary text-center py-10 border border-dashed border-border rounded-lg">
            아직 생성된 스타일링샷이 없습니다. <b>AI로 생성</b>을 눌러주세요.
          </p>
        )
      )}
    </div>
  )
}
