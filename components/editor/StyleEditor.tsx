'use client'

import { COLOR_VARS, FONT_VARS, AVAILABLE_FONTS } from '@/lib/editor/editorTypes'
import type { StyleGuide } from '@/agents/types'

interface StyleEditorProps {
  styleGuide: StyleGuide
  onUpdateColor: (varName: string, value: string) => void
  onUpdateFont: (varName: string, value: string) => void
  onUpdateCssVar: (varName: string, value: string) => void
}

const colorKeyMap: Record<string, keyof StyleGuide['colors']> = {
  '--color-primary': 'primary',
  '--color-secondary': 'secondary',
  '--color-surface1': 'surface1',
  '--color-surface2': 'surface2',
  '--color-accent': 'accent',
  '--color-text-dark': 'textDark',
  '--color-text-light': 'textLight',
}

const fontKeyMap: Record<string, keyof StyleGuide['typography']> = {
  '--font-headline': 'headlineFont',
  '--font-body': 'bodyFont',
  '--font-story': 'storyFont',
  '--font-accent': 'accentFont',
}

/** 박스 스타일 슬라이더 정의 (패딩 등은 Phase B에서 추가) */
const BOX_STYLE_VARS = [
  { name: '--radius', label: '모서리 둥글기', min: 0, max: 24, unit: 'px', defaultVal: '8px' },
] as const

function parseNumericCss(value: string): number {
  return parseInt(value.replace(/[^0-9.-]/g, ''), 10) || 0
}

export default function StyleEditor({ styleGuide, onUpdateColor, onUpdateFont, onUpdateCssVar }: StyleEditorProps) {
  return (
    <div className="space-y-6">
      {/* 색상 */}
      <div>
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">{COLOR_VARS.label}</h3>
        <div className="space-y-2">
          {COLOR_VARS.vars.map((v) => {
            const key = colorKeyMap[v.name]
            const currentValue = key ? styleGuide.colors[key] : '#000000'
            return (
              <div key={v.name} className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentValue}
                  onChange={(e) => onUpdateColor(v.name, e.target.value)}
                  className="w-8 h-8 rounded border border-neutral-600 cursor-pointer bg-transparent"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-neutral-200">{v.label}</div>
                  <div className="text-xs text-neutral-500 font-mono">{currentValue}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 폰트 */}
      <div>
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">{FONT_VARS.label}</h3>
        <div className="space-y-3">
          {FONT_VARS.vars.map((v) => {
            const key = fontKeyMap[v.name]
            const currentFont = key ? (styleGuide.typography[key] as string) : ''
            // 현재 폰트에서 첫 번째 폰트 패밀리 추출
            const primaryFont = currentFont.split(',')[0].replace(/['"]/g, '').trim()
            return (
              <div key={v.name}>
                <label className="block text-sm text-neutral-200 mb-1">{v.label}</label>
                <select
                  value={primaryFont}
                  onChange={(e) => onUpdateFont(v.name, `'${e.target.value}', sans-serif`)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {!AVAILABLE_FONTS.includes(primaryFont as typeof AVAILABLE_FONTS[number]) && (
                    <option value={primaryFont}>{primaryFont} (현재)</option>
                  )}
                  {AVAILABLE_FONTS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      </div>

      {/* 박스 스타일 */}
      <div>
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">박스 스타일</h3>
        <div className="space-y-4">
          {BOX_STYLE_VARS.map((v) => {
            const currentVal = parseNumericCss(styleGuide.decorativeElements?.cornerRadius ?? v.defaultVal)
            return (
              <div key={v.name}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-neutral-200">{v.label}</label>
                  <span className="text-xs text-neutral-500 font-mono">{currentVal}{v.unit}</span>
                </div>
                <input
                  type="range"
                  min={v.min}
                  max={v.max}
                  value={currentVal}
                  onChange={(e) => onUpdateCssVar(v.name, `${e.target.value}${v.unit}`)}
                  className="w-full accent-indigo-500"
                />
              </div>
            )
          })}

          {/* 그림자 토글 */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-neutral-200">카드 그림자</label>
            <button
              onClick={() => {
                const hasShadow = (styleGuide.decorativeElements?.shadows ?? '').includes('rgba')
                onUpdateCssVar('--shadow', hasShadow ? 'none' : '0 4px 12px rgba(0,0,0,0.08)')
              }}
              className={`w-10 h-6 rounded-full transition-colors ${
                (styleGuide.decorativeElements?.shadows ?? '').includes('rgba')
                  ? 'bg-indigo-600'
                  : 'bg-neutral-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-1 ${
                (styleGuide.decorativeElements?.shadows ?? '').includes('rgba')
                  ? 'translate-x-4'
                  : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
