'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Staff { id: string; name: string | null; role: string }

interface AssignPanelProps {
  projectId: string
  designerId: string | null
}

const selectCls =
  'w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'

/**
 * 담당 디자이너 배정 (역할 통합 후 단일 담당자).
 * 기획자/디자이너 분리는 폐기 — 관리자가 담당 디자이너 1명만 배정한다.
 */
export function AssignPanel({ projectId, designerId }: AssignPanelProps) {
  const [designers, setDesigners] = useState<Staff[]>([])
  const [designer, setDesigner] = useState(designerId ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let active = true
    fetch('/api/admin/staff')
      .then((r) => r.json())
      .then((d: { planners?: Staff[]; designers?: Staff[] }) => {
        if (!active) return
        // 역할 통합: planners/designers 합쳐 중복 제거 후 전원 후보로
        const merged = [...(d.designers ?? []), ...(d.planners ?? [])]
        const seen = new Set<string>()
        setDesigners(merged.filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true))))
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  async function save() {
    setLoading(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch(`/api/projects/${projectId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planner_id: null, designer_id: designer || null }),
      })
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(d.error || `요청 실패 (${res.status})`)
      }
      setSaved(true)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : '처리 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-5 space-y-3">
      <h3 className="font-semibold text-text-primary text-sm">담당 디자이너 배정</h3>
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">담당 디자이너</label>
        <select value={designer} onChange={(e) => { setDesigner(e.target.value); setSaved(false) }} className={selectCls}>
          <option value="">미배정</option>
          {designers.map((d) => (
            <option key={d.id} value={d.id}>{d.name ?? d.id.slice(0, 8)}</option>
          ))}
        </select>
      </div>
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
      <button
        onClick={save}
        disabled={loading}
        className="w-full bg-primary-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all"
      >
        {loading ? '저장 중...' : saved ? '저장됨 ✓' : '배정 저장'}
      </button>
    </div>
  )
}
