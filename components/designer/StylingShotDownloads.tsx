'use client'

import { useState } from 'react'

interface Shot {
  name: string
  url: string
}

/**
 * 디자이너용 스타일링샷 다운로드 그리드.
 * Supabase 공개 URL은 cross-origin이라 <a download>가 무시되므로 fetch→blob로 강제 저장.
 */
export function StylingShotDownloads({ shots }: { shots: Shot[] }) {
  const [busy, setBusy] = useState<string | null>(null)

  if (shots.length === 0) {
    return (
      <p className="text-xs text-text-tertiary text-center py-6 border border-dashed border-border rounded-lg">
        아직 생성된 스타일링샷이 없습니다. ‘스타일링샷 제작’ 단계에서 먼저 생성하세요.
      </p>
    )
  }

  async function download(shot: Shot) {
    setBusy(shot.name)
    try {
      const res = await fetch(shot.url, { cache: 'no-store' })
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

  return (
    <div className="grid grid-cols-3 gap-3">
      {shots.map((s) => (
        <figure key={s.name} className="rounded-lg overflow-hidden border border-border bg-white group relative">
          <img src={s.url} alt={s.name} className="w-full aspect-[3/4] object-cover" />
          <figcaption className="text-[11px] text-text-tertiary px-2 py-1.5 truncate">{s.name}</figcaption>
          <button
            onClick={() => download(s)}
            disabled={busy === s.name}
            className="absolute inset-x-2 bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-text-primary/90 text-white text-xs font-medium rounded-lg py-1.5 disabled:opacity-60"
          >
            {busy === s.name ? '저장 중…' : '⤓ 다운로드'}
          </button>
        </figure>
      ))}
    </div>
  )
}
