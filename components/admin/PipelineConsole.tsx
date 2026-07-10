'use client'

/**
 * 관리자 파이프라인 콘솔 (Sprint 11)
 * 그동안 로컬 e2e 러너로만 가능하던 전체 파이프라인 실행을 웹에서 단계별/원클릭으로.
 * 각 단계는 기존 API 라우트를 그대로 호출하고, Vercel 타임아웃을 넘는 스타일링샷은
 * 배치(2컷씩) 오케스트레이션으로 나눠 부른다. 상태 정렬은 /api/admin/pipeline/advance.
 */

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PipelineConsoleProps {
  projectId: string
  status: string
}

type StepKey = 'script' | 'approve' | 'planning' | 'shots' | 'draft'
type StepState = 'idle' | 'running' | 'done' | 'error'

const STEPS: { key: StepKey; label: string; desc: string }[] = [
  { key: 'script', label: '① 스크립트 생성', desc: '인테이크 → 판매 스크립트 (재실행 시 재생성)' },
  { key: 'approve', label: '② 스크립트 승인', desc: 'script_review → script_approved' },
  { key: 'planning', label: '③ 디자인 기획', desc: '아트디렉터 + 청사진 + 컷 프롬프트 (2~5분)' },
  { key: 'shots', label: '④ 스타일링샷 생성', desc: '니즈 컷 생성 — 2컷씩 배치 실행' },
  { key: 'draft', label: '⑤ 초안 생성', desc: '블록 조립 + 품질 게이트 (4~7분)' },
]

export function PipelineConsole({ projectId, status }: PipelineConsoleProps) {
  const [steps, setSteps] = useState<Record<StepKey, StepState>>({
    script: 'idle', approve: 'idle', planning: 'idle', shots: 'idle', draft: 'idle',
  })
  const [logs, setLogs] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [shotProgress, setShotProgress] = useState<string | null>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  function log(line: string): void {
    const ts = new Date().toLocaleTimeString('ko-KR', { hour12: false })
    setLogs((prev) => [...prev, `[${ts}] ${line}`])
    setTimeout(() => logRef.current?.scrollTo({ top: logRef.current.scrollHeight }), 50)
  }

  function setStep(key: StepKey, state: StepState): void {
    setSteps((prev) => ({ ...prev, [key]: state }))
  }

  async function post(url: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (!res.ok && res.status !== 409) {
      throw new Error(typeof json.error === 'string' ? json.error : `HTTP ${res.status}`)
    }
    return json
  }

  async function advance(to: string): Promise<void> {
    const r = await post('/api/admin/pipeline/advance', { project_id: projectId, to })
    if (r.forced) log(`상태 정렬(강제): → ${to}`)
    else if (!r.skipped) log(`상태 전이: → ${to}`)
  }

  async function runScript(): Promise<void> {
    setStep('script', 'running')
    log('스크립트 생성 시작 (2~4분)…')
    await advance('script_review') // 재생성 대비: script_generating 전이가 유효한 상태로 정렬
    await post('/api/scripts/generate', { project_id: projectId })
    log('스크립트 생성 완료 → script_review')
    setStep('script', 'done')
  }

  async function runApprove(): Promise<void> {
    setStep('approve', 'running')
    const r = await post('/api/scripts/review', { project_id: projectId, action: 'approve' })
    log(r.error ? `승인 스킵(${String(r.error).slice(0, 60)}) → 상태 정렬로 대체` : '스크립트 승인 완료')
    await advance('script_approved')
    setStep('approve', 'done')
  }

  async function runPlanning(): Promise<void> {
    setStep('planning', 'running')
    log('디자인 기획 시작 (아트디렉터 → 청사진 → 컷 프롬프트)…')
    await post('/api/designs/planning', { project_id: projectId })
    log('디자인 기획 완료')
    setStep('planning', 'done')
  }

  async function runShots(): Promise<void> {
    setStep('shots', 'running')
    const listRes = await fetch(`/api/photography/generate-shots?project_id=${projectId}`)
    const list = (await listRes.json()) as { total?: number; names?: { name: string; prominence: string }[] }
    const total = list.total ?? 0
    if (total === 0) throw new Error('컷 프롬프트가 없습니다 — 디자인 기획을 먼저 실행하세요')
    log(`스타일링샷 ${total}컷 — 2컷씩 배치 생성`)
    const BATCH = 2
    for (let from = 0; from < total; from += BATCH) {
      setShotProgress(`${Math.min(from + BATCH, total)} / ${total}`)
      const r = (await post('/api/photography/generate-shots', {
        project_id: projectId, from, count: BATCH,
      })) as { shots?: unknown[]; errors?: string[] }
      const okCount = r.shots?.length ?? 0
      log(`  컷 ${from + 1}~${Math.min(from + BATCH, total)}: 성공 ${okCount}${r.errors?.length ? ` / 실패 ${r.errors.length}` : ''}`)
      for (const e of r.errors ?? []) log(`    ✗ ${String(e).slice(0, 90)}`)
    }
    setShotProgress(null)
    await advance('prompt_ready')
    await advance('photo_uploaded')
    log('스타일링샷 완료 → photo_uploaded')
    setStep('shots', 'done')
  }

  async function runDraft(): Promise<void> {
    setStep('draft', 'running')
    await advance('photo_uploaded')
    log('초안 생성 시작 (블록 조립 + 품질 게이트, 4~7분)…')
    await post('/api/designs/generate', { project_id: projectId })
    log('초안 생성 완료 — 디자이너 페이지에서 확인하세요')
    setStep('draft', 'done')
  }

  const RUNNERS: Record<StepKey, () => Promise<void>> = {
    script: runScript, approve: runApprove, planning: runPlanning, shots: runShots, draft: runDraft,
  }

  async function runStep(key: StepKey): Promise<void> {
    if (busy) return
    setBusy(true)
    try {
      await RUNNERS[key]()
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      log(`✗ 실패: ${msg}`)
      setStep(key, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function runAll(): Promise<void> {
    if (busy) return
    setBusy(true)
    log('=== 전체 파이프라인 실행 시작 ===')
    try {
      for (const { key } of STEPS) {
        await RUNNERS[key]()
      }
      log('=== 전체 완료 ===')
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      log(`✗ 중단: ${msg}`)
    } finally {
      setBusy(false)
    }
  }

  const stateBadge: Record<StepState, string> = {
    idle: 'bg-slate-100 text-slate-500',
    running: 'bg-amber-100 text-amber-700 animate-pulse',
    done: 'bg-emerald-100 text-emerald-700',
    error: 'bg-red-100 text-red-700',
  }
  const stateLabel: Record<StepState, string> = { idle: '대기', running: '실행 중', done: '완료', error: '실패' }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">파이프라인 실행</h2>
          <p className="text-xs text-text-tertiary mt-0.5">현재 상태: <span className="font-mono">{status}</span></p>
        </div>
        <button
          onClick={runAll}
          disabled={busy}
          className="bg-slate-800 text-white rounded-xl px-5 py-2.5 font-semibold hover:bg-slate-900 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? '실행 중…' : '▶ 전체 실행 (①→⑤)'}
        </button>
      </div>

      <div className="grid gap-2">
        {STEPS.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center gap-3 bg-white border border-border rounded-xl px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">{label}</p>
              <p className="text-xs text-text-tertiary truncate">
                {desc}
                {key === 'shots' && shotProgress ? ` — ${shotProgress}` : ''}
              </p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-lg font-medium whitespace-nowrap ${stateBadge[steps[key]]}`}>
              {stateLabel[steps[key]]}
            </span>
            <button
              onClick={() => runStep(key)}
              disabled={busy}
              className="text-xs border border-border rounded-lg px-3 py-1.5 hover:border-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              단계 실행
            </button>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold text-text-secondary mb-1.5">실행 로그</p>
        <div
          ref={logRef}
          className="bg-slate-950 text-slate-200 rounded-xl p-3 h-64 overflow-y-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap"
        >
          {logs.length === 0 ? <span className="text-slate-500">아직 실행 이력이 없습니다.</span> : logs.join('\n')}
        </div>
      </div>
    </div>
  )
}
