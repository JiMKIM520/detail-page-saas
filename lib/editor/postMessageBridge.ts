'use client'

import type { EditorCommand, EditorEvent } from './editorTypes'

const ALLOWED_ORIGIN = typeof window !== 'undefined' ? window.location.origin : ''

/** iframe에 EditorCommand 전송 (origin 제한, wildcard 금지) */
export function sendToIframe(iframe: HTMLIFrameElement | null, command: EditorCommand): void {
  if (!iframe?.contentWindow || !ALLOWED_ORIGIN) return
  iframe.contentWindow.postMessage(command, ALLOWED_ORIGIN)
}

/** iframe에서 오는 EditorEvent를 수신하는 리스너 등록. origin 검증 포함. cleanup 함수 반환. */
export function listenFromIframe(handler: (event: EditorEvent) => void): () => void {
  function onMessage(e: MessageEvent) {
    if (ALLOWED_ORIGIN && e.origin !== ALLOWED_ORIGIN) return
    const data = e.data
    if (!data || typeof data !== 'object' || !data.type) return
    if (data.type === 'SECTION_CLICK' || data.type === 'READY') {
      handler(data as EditorEvent)
    }
  }
  window.addEventListener('message', onMessage)
  return () => window.removeEventListener('message', onMessage)
}
