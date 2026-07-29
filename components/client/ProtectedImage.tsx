'use client'
import { previewUrl } from '@/lib/image'

interface ProtectedImageProps {
  src: string
  alt: string
  className?: string
  /** 표시 폭(px) — 원본 대신 변환본을 내려받아 트래픽을 줄인다 */
  width?: number
}

export function ProtectedImage({ src, alt, className, width = 1400 }: ProtectedImageProps) {
  return (
    <div
      className="relative select-none"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl(src, width)}
        loading="lazy"
        alt={alt}
        className={className}
        draggable={false}
        style={{ WebkitUserDrag: 'none', userSelect: 'none' } as React.CSSProperties}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
      {/* Transparent overlay to block pointer interactions with the image */}
      <div className="absolute inset-0 z-10" />
    </div>
  )
}
