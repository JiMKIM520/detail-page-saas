'use client'
import { thumbUrl } from '@/lib/image'
import { useEffect, useState } from 'react'
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
  const [notice, setNotice] = useState('')
  const [polling, setPolling] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [custom, setCustom] = useState('')
  const [adding, setAdding] = useState(false)
  const router = useRouter()

  /** 자유 문장으로 컷 한 장 추가 — 기존 톤에 맞춰 서버가 규격으로 옮겨 생성한다 */
  async function addShot() {
    const wanted = custom.trim()
    if (!wanted || adding) return
    setAdding(true); setErr(''); setNotice('')
    try {
      const res = await fetch('/api/photography/custom-shot', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, request: wanted }),
      })
      const json = await res.json()
      if (!res.ok) { setErr(json.error || '생성에 실패했습니다.'); return }
      setCustom('')
      setNotice(`"${wanted}" 컷을 만들었습니다.`)
      router.refresh()
    } catch (e) {
      setErr('네트워크 오류: ' + String(e).slice(0, 120))
    } finally {
      setAdding(false)
    }
  }

  /** 원본(변환 안 거친 공개 URL)을 받아 저장. cross-origin이라 <a download>가 무시돼 blob로 강제한다. */
  async function download(shot: Shot) {
    setBusy(shot.name)
    try {
      const res = await fetch(shot.url, { cache: 'no-store' })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const blob = await res.blob()
      const href = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = href
      a.download = `${shot.name}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(href)
    } catch {
      window.open(shot.url, '_blank', 'noopener')
    } finally {
      setBusy(null)
    }
  }

  // 컷이 20장을 넘어 Vercel 함수 안에서 완주할 수 없다(300초 초과 → 무응답).
  // 워커에 등록만 하고, 완료는 폴링으로 받는다.
  async function generate() {
    setLoading(true); setErr(''); setNotice('')
    try {
      const res = await fetch('/api/photography/queue-shots', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })
      const json = await res.json()
      if (!res.ok) { setErr(json.error || 'AI 생성 요청에 실패했습니다.'); return }
      setNotice(json.message ?? '생성을 시작했습니다.')
      setPolling(true)
    } catch (e) {
      setErr('네트워크 오류: ' + String(e).slice(0, 120))
    } finally {
      setLoading(false)
    }
  }

  // 워커가 컷을 올리는 동안 목록을 되살린다 — 잡이 끝나면 서버가 새 목록을 내려준다
  useEffect(() => {
    if (!polling) return
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh()
    }, 15_000)
    return () => clearInterval(id)
  }, [polling, router])

  // 서버가 새 컷을 내려주면 화면에 반영
  useEffect(() => { setShots(initialShots) }, [initialShots])

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
            <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />요청 중…</>
          ) : polling ? (
            <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />생성 중…</>
          ) : (shots.length > 0 ? 'AI로 재생성' : 'AI로 생성')}
        </button>
      </div>
      <p className="text-xs text-text-tertiary mb-4">
        기획안의 스타일링 프롬프트로 Gemini가 제품 사진을 참조해 직접 생성합니다. (외부 업로드 불필요)
        컷 수가 많아 10~20분 걸리며, 창을 닫아도 계속 진행됩니다.
      </p>

      {!hasPrompts && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          스타일링 프롬프트가 아직 준비되지 않았습니다. 디자인 기획 단계를 먼저 완료하세요.
        </p>
      )}
      {err && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-3">{err}</p>
      )}
      {notice && !err && (
        <p className="text-sm text-primary-700 bg-primary-50 border border-primary-200 rounded-lg px-4 py-3 mb-3">
          {notice} 완료되면 아래 목록이 자동으로 채워집니다.
        </p>
      )}

      {/* 작업 중 필요한 컷을 말로 요청해 한 장만 추가로 만든다 */}
      {hasPrompts && (
        <div className="mb-4 rounded-lg border border-border bg-surface-hover p-4">
          <label htmlFor="custom-shot" className="block text-sm font-semibold text-text-primary mb-1">
            컷 추가 요청
          </label>
          <p className="text-xs text-text-tertiary mb-2.5">
            필요한 장면을 문장으로 적어주세요. 이 기획의 톤과 제품 사진에 맞춰 한 장 생성합니다.
          </p>
          <div className="flex gap-2">
            <input
              id="custom-shot"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) addShot() }}
              placeholder="예: 제품을 손으로 들고 있는 컷"
              maxLength={500}
              disabled={adding}
              className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
            />
            <button
              onClick={addShot}
              disabled={adding || !custom.trim()}
              className="shrink-0 inline-flex items-center gap-2 bg-text-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {adding ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />만드는 중…</>
              ) : '한 장 생성'}
            </button>
          </div>
        </div>
      )}

      {shots.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {shots.map((s, i) => (
            <figure key={i} className="rounded-lg overflow-hidden border border-border bg-white group relative">
              <img src={thumbUrl(s.url, 500)} alt={s.name} className="w-full aspect-[3/4] object-cover" loading="lazy" />
              <figcaption className="text-xs text-text-tertiary px-2.5 py-2 truncate">{s.name}</figcaption>
              {/* 다운로드 수단이 없어 화면 썸네일을 우클릭 저장하게 되고, 그러면 축소본을 받게 된다 */}
              <button
                onClick={() => download(s)}
                disabled={busy === s.name}
                className="absolute inset-x-2 bottom-9 opacity-0 group-hover:opacity-100 transition-opacity bg-text-primary/90 text-white text-xs font-medium rounded-lg py-1.5 disabled:opacity-60"
              >
                {busy === s.name ? '저장 중…' : '⤓ 원본 다운로드'}
              </button>
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
