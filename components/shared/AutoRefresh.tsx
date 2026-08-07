'use client'

/**
 * 생성 중 상태에서 화면을 주기적으로 되살린다.
 *
 * 무거운 작업은 Railway 워커가 처리하므로(lib/enqueue.ts) 웹은 요청 직후 즉시 응답한다.
 * 그 결과 운영자가 완료를 알려면 수동 새로고침을 해야 했다 — 진행 중인 동안만 폴링해
 * 상태가 바뀌면 자동으로 다음 화면이 뜨게 한다.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AutoRefreshProps {
  /** 폴링 간격(ms). 워커 폴링이 10초 주기라 그보다 조금 길게 잡는다. */
  intervalMs?: number
}

export function AutoRefresh({ intervalMs = 12_000 }: AutoRefreshProps) {
  const router = useRouter()

  useEffect(() => {
    // 탭이 백그라운드면 굳이 서버를 두드리지 않는다
    const tick = () => {
      if (document.visibilityState === 'visible') router.refresh()
    }
    const id = setInterval(tick, intervalMs)
    return () => clearInterval(id)
  }, [router, intervalMs])

  return null
}
