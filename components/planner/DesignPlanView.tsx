'use client'

/**
 * 디자인 기획 검수 뷰
 * StyleGuide를 시각적으로 표시 — 색 팔레트, 폰트 4역할, 레이아웃 패턴, 추천 템플릿, 디자인 노트
 */

import type { StyleGuide, LayoutPattern } from '@/agents/types'

interface DesignPlanViewProps {
  styleGuide: StyleGuide | null
}

// ─── 색 팔레트 레이블 ───────────────────────────────────────────────
const COLOR_LABELS: Array<{ key: keyof StyleGuide['colors']; label: string }> = [
  { key: 'primary',   label: '프라이머리' },
  { key: 'secondary', label: '세컨더리' },
  { key: 'surface1',  label: '서피스 1' },
  { key: 'surface2',  label: '서피스 2' },
  { key: 'surface3',  label: '서피스 3' },
  { key: 'textDark',  label: '본문 다크' },
  { key: 'textLight', label: '본문 라이트' },
  { key: 'accent',    label: '포인트' },
]

// ─── 폰트 역할 레이블 ───────────────────────────────────────────────
const FONT_ROLES: Array<{ key: keyof StyleGuide['typography']; label: string; desc: string }> = [
  { key: 'headlineFont', label: 'Headline', desc: '핵심 헤드라인' },
  { key: 'storyFont',    label: 'Story',    desc: '브랜드 스토리' },
  { key: 'bodyFont',     label: 'Body',     desc: '본문 텍스트' },
  { key: 'accentFont',   label: 'Accent',   desc: '강조 포인트' },
]

// ─── 레이아웃 패턴 한국어 레이블 ────────────────────────────────────
const PATTERN_LABELS: Record<string, string> = {
  'full-bleed-hero':          '풀블리드 히어로',
  'left-image-right-text':    '이미지 좌 + 텍스트 우',
  'right-image-left-text':    '이미지 우 + 텍스트 좌',
  'full-bleed-sensory':       '풀블리드 감각',
  'dark-story-centered':      '다크 스토리 센터',
  'numbered-steps-horizontal':'번호 스텝 가로',
  'grid-info-cards':          '그리드 카드',
  'photo-gallery-strip':      '사진 갤러리 띠',
  'masonry-gallery':          '메이슨리 갤러리',
  'split-text-heavy':         '텍스트 중심 분할',
  'centered-statement':       '센터 선언문',
  'icon-feature-row':         '아이콘 피처 행',
  'comparison-table':         '비교 테이블',
  'timeline-vertical':        '수직 타임라인',
  'full-bleed-overlay':       '풀블리드 오버레이',
  'testimonial-quote':        '인용 후기',
}

// ─── 대비색 계산 (HEX → 흰/검 판별) ────────────────────────────────
function contrastColor(hex: string): string {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return '#000000'
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  // sRGB luminance
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum > 128 ? '#1a1a1a' : '#ffffff'
}

// ─── 색 스와치 ───────────────────────────────────────────────────────
function ColorSwatch({ hex, label }: { hex: string; label: string }) {
  const text = contrastColor(hex)
  return (
    <div className="flex flex-col gap-1">
      <div
        className="w-full h-12 rounded-lg border border-border flex items-end p-1.5"
        style={{ backgroundColor: hex }}
      >
        <span className="text-[10px] font-mono leading-none" style={{ color: text }}>
          {hex.toUpperCase()}
        </span>
      </div>
      <span className="text-[11px] text-text-tertiary text-center">{label}</span>
    </div>
  )
}

// ─── 레이아웃 패턴 행 ───────────────────────────────────────────────
function PatternRow({ pattern }: { pattern: LayoutPattern }) {
  const label = PATTERN_LABELS[pattern.pattern] ?? pattern.pattern
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className="w-5 h-5 bg-primary-100 text-primary-700 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">{pattern.section}</span>
          <span className="text-xs text-text-tertiary">·</span>
          <span className="text-sm font-semibold text-text-primary">{label}</span>
        </div>
        <p className="text-xs text-text-secondary mt-0.5 truncate">{pattern.backgroundStyle}</p>
      </div>
    </div>
  )
}

// ─── 로딩 플레이스홀더 ──────────────────────────────────────────────
function LoadingPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-surface rounded-xl border border-border border-dashed">
      <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-violet-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
        </svg>
      </div>
      <p className="text-text-tertiary text-sm font-medium">디자인 기획 생성 중...</p>
      <p className="text-text-tertiary text-xs mt-1">Art Director 에이전트가 스타일 가이드를 작성하고 있습니다</p>
    </div>
  )
}

// ─── 메인 컴포넌트 ──────────────────────────────────────────────────
export function DesignPlanView({ styleGuide }: DesignPlanViewProps) {
  if (!styleGuide) return <LoadingPlaceholder />

  const { brand, colors, typography, layoutPatterns, selectedTemplateId, designNotes } = styleGuide

  return (
    <div className="space-y-5">
      {/* 헤더 — 브랜드 정보 */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-md uppercase tracking-wide">
                디자인 기획
              </span>
              {selectedTemplateId && (
                <span className="text-xs bg-surface-active text-text-secondary px-2 py-0.5 rounded-md">
                  템플릿: {selectedTemplateId}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-text-primary">{brand.name}</h2>
            <p className="text-sm text-text-secondary mt-0.5">{brand.targetEmotion}</p>
          </div>
        </div>

        {/* 무드 키워드 태그 */}
        {brand.moodKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {brand.moodKeywords.map(kw => (
              <span key={kw} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-200">
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 색 팔레트 — 8색 스와치 */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">컬러 팔레트</h3>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_LABELS.map(({ key, label }) => (
            <ColorSwatch key={key} hex={colors[key]} label={label} />
          ))}
        </div>
      </div>

      {/* 타이포그래피 — 4역할 */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">타이포그래피</h3>
        <div className="space-y-2">
          {FONT_ROLES.map(({ key, label, desc }) => {
            const fontName = typography[key] as string
            return (
              <div key={key} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="w-16 flex-shrink-0">
                  <span className="text-[10px] font-semibold bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded uppercase tracking-wide">
                    {label}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{fontName}</p>
                  <p className="text-xs text-text-tertiary">{desc}</p>
                </div>
              </div>
            )
          })}
        </div>
        {/* 타이포 수치 */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {(Object.entries(typography.sizes) as [string, number][]).map(([name, size]) => (
            <div key={name} className="bg-surface-active rounded-lg p-2">
              <p className="text-xs text-text-tertiary uppercase tracking-wide">{name}</p>
              <p className="text-sm font-bold text-text-primary">{size}px</p>
            </div>
          ))}
        </div>
      </div>

      {/* 레이아웃 패턴 — 섹션별 */}
      {layoutPatterns.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-1">레이아웃 패턴</h3>
          <p className="text-xs text-text-tertiary mb-3">섹션별 권장 레이아웃 · 총 {layoutPatterns.length}섹션</p>
          <div>
            {layoutPatterns.map((lp, i) => (
              <PatternRow key={`${lp.section}-${i}`} pattern={lp} />
            ))}
          </div>
        </div>
      )}

      {/* 디자인 노트 */}
      {designNotes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-amber-800 mb-1">디자인 노트</p>
              <p className="text-sm text-amber-700 whitespace-pre-wrap">{designNotes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
