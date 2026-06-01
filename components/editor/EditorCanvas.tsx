'use client'

import { useRef, useEffect, useCallback } from 'react'
import { sendToIframe, listenFromIframe } from '@/lib/editor/postMessageBridge'
import type { EditorCommand, EditorEvent } from '@/lib/editor/editorTypes'

interface EditorCanvasProps {
  projectId: string
  selectedSectionIndex: number | null
  onSectionClick: (index: number) => void
  pendingCommands: EditorCommand[]
}

export default function EditorCanvas({
  projectId,
  selectedSectionIndex,
  onSectionClick,
  pendingCommands,
}: EditorCanvasProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const readyRef = useRef(false)

  const handleEvent = useCallback((event: EditorEvent) => {
    if (event.type === 'READY') {
      readyRef.current = true
    } else if (event.type === 'SECTION_CLICK') {
      onSectionClick(event.sectionIndex)
    }
  }, [onSectionClick])

  // iframe 이벤트 수신
  useEffect(() => {
    return listenFromIframe(handleEvent)
  }, [handleEvent])

  // 선택된 섹션 하이라이트
  useEffect(() => {
    if (!readyRef.current) return
    if (selectedSectionIndex !== null) {
      sendToIframe(iframeRef.current, { type: 'HIGHLIGHT_SECTION', sectionIndex: selectedSectionIndex })
    } else {
      sendToIframe(iframeRef.current, { type: 'CLEAR_HIGHLIGHT' })
    }
  }, [selectedSectionIndex])

  // 편집 명령 전송
  useEffect(() => {
    if (!readyRef.current || pendingCommands.length === 0) return
    const last = pendingCommands[pendingCommands.length - 1]
    sendToIframe(iframeRef.current, last)
  }, [pendingCommands])

  return (
    <div className="relative flex-1 bg-neutral-900 overflow-hidden flex items-start justify-center p-6">
      <div className="relative w-[460px] bg-white rounded-lg shadow-2xl overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
        <iframe
          ref={iframeRef}
          src={`/api/designs/${projectId}/html`}
          className="w-full h-full border-0"
          title="상세페이지 미리보기"
        />
      </div>
    </div>
  )
}
