'use client'

import React, { useState } from 'react'
import type { StylingPromptsOutput, StylingFinalPrompt } from '@/agents/styling-shots'

interface StylingPromptPanelProps {
  data: StylingPromptsOutput | null
}

type CopyState = 'idle' | 'copied' | 'error'

/** 개별 shot 카드 — 프롬프트 복사 버튼 포함 */
function ShotCard({ shot }: { shot: StylingFinalPrompt }): React.ReactElement {
  const [copyState, setCopyState] = useState<CopyState>('idle')

  async function handleCopy(): Promise<void> {
    // 1차: navigator.clipboard (HTTPS + 포커스 필요)
    try {
      await navigator.clipboard.writeText(shot.finalPrompt)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
      return
    } catch {
      // 2차 폴백: textarea + execCommand (구형/비보안 컨텍스트)
      try {
        const ta = document.createElement('textarea')
        ta.value = shot.finalPrompt
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        setCopyState('copied')
        setTimeout(() => setCopyState('idle'), 2000)
      } catch {
        // 둘 다 실패 — 운영자에게 명시적 알림 (조용히 삼키지 않음)
        setCopyState('error')
        setTimeout(() => setCopyState('idle'), 3000)
      }
    }
  }

  const btnClass =
    copyState === 'copied'
      ? 'bg-green-500/10 text-green-600 border border-green-500/20'
      : copyState === 'error'
        ? 'bg-red-500/10 text-red-600 border border-red-500/20'
        : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover'

  return (
    <div className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-3">
      {/* shot 헤더 */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-text-primary">{shot.name}</p>
          <p className="text-xs text-text-tertiary mt-0.5">{shot.composition}</p>
        </div>
        <button
          onClick={handleCopy}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${btnClass}`}
        >
          {copyState === 'copied' ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              복사 완료
            </>
          ) : copyState === 'error' ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              복사 실패 — 직접 선택
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              복사
            </>
          )}
        </button>
      </div>

      {/* 완성 프롬프트 코드블록 */}
      <pre className="text-xs text-text-secondary bg-background rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed border border-border/50 font-mono">
        {shot.finalPrompt}
      </pre>
    </div>
  )
}

/** 운영자 스타일링샷 프롬프트 패널 */
export function StylingPromptPanel({ data }: StylingPromptPanelProps): React.ReactElement {
  // 프롬프트 미생성 상태
  if (!data) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 flex flex-col items-center justify-center gap-2 min-h-[120px]">
        <svg className="w-5 h-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-text-tertiary">프롬프트 준비 중입니다. 기획 파이프라인 완료 후 표시됩니다.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 운영자 가이드 안내문 */}
      <div className="rounded-lg border border-border bg-surface p-4 flex gap-3">
        <svg className="w-5 h-5 shrink-0 text-violet-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-sm text-text-secondary leading-relaxed">{data.operatorGuide}</p>
      </div>

      {/* 누끼 레퍼런스 이미지 목록 */}
      {data.nukkiReferenceImages.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">누끼 레퍼런스 이미지 (외부 모델 첨부용)</p>
          <ul className="flex flex-col gap-1">
            {data.nukkiReferenceImages.map((imgPath) => (
              <li key={imgPath} className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 shrink-0 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className="text-xs text-text-secondary font-mono break-all">{imgPath}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 샷별 프롬프트 카드 목록 */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
          스타일링샷 프롬프트 ({data.shots.length}개)
        </p>
        {data.shots.map((shot) => (
          <ShotCard key={shot.filename} shot={shot} />
        ))}
      </div>

      {/* 생성 시각 — Invalid Date 방어 + 로케일 차이로 인한 hydration mismatch 억제
          (서버 UTC vs 클라이언트 로컬 TZ 포맷 차이는 표시상 무해) */}
      {(() => {
        const d = new Date(data.generatedAt)
        const label = isNaN(d.getTime()) ? '-' : d.toLocaleString('ko-KR')
        return <p suppressHydrationWarning className="text-xs text-text-tertiary text-right">생성: {label}</p>
      })()}
    </div>
  )
}
