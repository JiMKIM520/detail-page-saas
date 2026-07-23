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

  async function post(url: string, body: Record<string, unknown>, timeoutMs = 850_000): Promise<Record<string, unknown>> {
    // 클라이언트 타임아웃 — 서버(Vercel maxDuration 800s)가 조용히 끊겨도 fetch가 무한
    // 대기(hang)하며 파이프라인 전체가 침묵 정지하던 실사례(럽앤 ④ 배치 5). 명시 에러로 전환.
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), timeoutMs)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctl.signal,
      })
      const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
      if (!res.ok && res.status !== 409) {
        throw new Error(typeof json.error === 'string' ? json.error : `HTTP ${res.status}`)
      }
      return json
    } catch (e) {
      if ((e as Error).name === 'AbortError') throw new Error(`요청 시간 초과(${Math.round(timeoutMs / 1000)}s) — 서버 처리 지연`)
      throw e
    } finally {
      clearTimeout(timer)
    }
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

  /** 잡 큐 실행(진동벨 구조) — 등록만 하고 워커(Railway) 완료를 폴링한다.
   *  기획 5~7분·조립 10~20분이 Vercel 800초 한도를 초과해 침묵 실패하던 실측 문제의
   *  구조적 해법: 실행은 시간 제한 없는 외부 워커가 담당(scripts/worker.ts). */
  async function runViaJob(kind: 'planning' | 'shots' | 'draft', stepKey: StepKey, label: string, etaMin: string): Promise<void> {
    setStep(stepKey, 'running')
    log(`${label} 잡 등록…`)
    const reg = (await post('/api/jobs', { project_id: projectId, kind })) as { job?: { id: string }; deduped?: boolean }
    if (!reg.job) throw new Error('잡 등록 실패')
    log(reg.deduped ? `이미 진행 중인 ${label} 잡에 연결` : `${label} 잡 등록 완료 — 워커 실행 대기 (예상 ${etaMin})`)
    const jobId = reg.job.id
    const startedAt = Date.now()
    let lastStatus = ''
    for (;;) {
      await new Promise((r) => setTimeout(r, 5000))
      if (Date.now() - startedAt > 45 * 60_000) throw new Error(`${label} 잡 45분 초과 — 워커 상태를 확인하세요`)
      const res = await fetch(`/api/jobs?project_id=${projectId}`)
      const { jobs } = (await res.json()) as { jobs?: { id: string; status: string; note?: string; error?: string }[] }
      const job = jobs?.find((j) => j.id === jobId)
      if (!job) continue
      if (job.status !== lastStatus) {
        lastStatus = job.status
        if (job.status === 'running') log(`${label} 실행 중…`)
      }
      if (job.status === 'done') { log(`${label} 완료${job.note ? ` — ${job.note}` : ''}`); break }
      if (job.status === 'failed') throw new Error(`${label} 실패: ${(job.error ?? '원인 미상').slice(0, 140)}`)
    }
    setStep(stepKey, 'done')
  }

  async function runPlanning(): Promise<void> {
    await runViaJob('planning', 'planning', '디자인 기획', '5~8분')
  }

  async function runShots(): Promise<void> {
    setShotProgress(null)
    await runViaJob('shots', 'shots', '스타일링샷 생성', '10~25분')
  }

  async function runDraft(): Promise<void> {
    await runViaJob('draft', 'draft', '초안 조립', '8~20분')
    log('디자이너 페이지에서 초안을 확인하세요')
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
