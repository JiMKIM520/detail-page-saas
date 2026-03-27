'use client'

interface ProtectedImageProps {
  src: string
  alt: string
  className?: string
}

export function ProtectedImage({ src, alt, className }: ProtectedImageProps) {
  return (
    <div
      className="relative select-none"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
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
