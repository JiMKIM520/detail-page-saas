/**
 * 에디터 타입 정의
 */
import type { RefinedCopy, StyleGuide } from '@/agents/types'

// ── 에디터 상태 ──────────────────────────────────────────────

export interface EditorStore {
  originalCopy: RefinedCopy
  originalStyleGuide: StyleGuide

  editedCopy: RefinedCopy
  editedStyleGuide: StyleGuide

  selectedSectionIndex: number | null
  isDirty: boolean
  isSaving: boolean
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
}

export type EditorAction =
  | { type: 'SELECT_SECTION'; index: number | null }
  | { type: 'UPDATE_TEXT'; sectionIndex: number; field: 'headline' | 'subheadline' | 'body'; value: string }
  | { type: 'UPDATE_ITEM'; sectionIndex: number; itemIndex: number; field: 'label' | 'value'; value: string }
  | { type: 'UPDATE_CSS_VAR'; varName: string; value: string }
  | { type: 'UPDATE_FONT'; varName: string; value: string }
  | { type: 'UPDATE_DECORATIVE'; field: 'cornerRadius' | 'shadows' | 'dividerStyle'; value: string }
  | { type: 'SET_SAVING'; isSaving: boolean }
  | { type: 'SET_SAVE_STATUS'; status: EditorStore['saveStatus'] }
  | { type: 'REORDER_SECTIONS'; fromIndex: number; toIndex: number }
  | { type: 'DELETE_SECTION'; sectionIndex: number }
  | { type: 'RESET_TO_ORIGINAL' }

// ── postMessage 프로토콜 ─────────────────────────────────────

/** Parent → iframe (명령) */
export type EditorCommand =
  | { type: 'UPDATE_SECTION_TEXT'; sectionIndex: number; field: 'headline' | 'subheadline' | 'body'; value: string }
  | { type: 'UPDATE_ITEM_TEXT'; sectionIndex: number; itemIndex: number; field: 'label' | 'value'; value: string }
  | { type: 'UPDATE_CSS_VAR'; varName: string; value: string }
  | { type: 'HIGHLIGHT_SECTION'; sectionIndex: number }
  | { type: 'REPLACE_IMAGE'; sectionIndex: number; imageIndex: number; dataUrl: string }
  | { type: 'CLEAR_HIGHLIGHT' }

/** iframe → Parent (이벤트) */
export type EditorEvent =
  | { type: 'SECTION_CLICK'; sectionIndex: number; sectionType: string; pattern: string }
  | { type: 'READY' }

// ── CSS 변수 그룹 ────────────────────────────────────────────

export interface CssVarGroup {
  label: string
  vars: {
    name: string
    label: string
    type: 'color' | 'font'
  }[]
}

export const COLOR_VARS: CssVarGroup = {
  label: '색상',
  vars: [
    { name: '--color-primary', label: '메인 색상', type: 'color' },
    { name: '--color-secondary', label: '보조 색상', type: 'color' },
    { name: '--color-surface1', label: '배경 1', type: 'color' },
    { name: '--color-surface2', label: '배경 2', type: 'color' },
    { name: '--color-accent', label: '강조 색상', type: 'color' },
    { name: '--color-text-dark', label: '텍스트 (어두운)', type: 'color' },
    { name: '--color-text-light', label: '텍스트 (밝은)', type: 'color' },
  ],
}

export const FONT_VARS: CssVarGroup = {
  label: '폰트',
  vars: [
    { name: '--font-headline', label: '헤드라인 폰트', type: 'font' },
    { name: '--font-body', label: '본문 폰트', type: 'font' },
    { name: '--font-story', label: '스토리 폰트', type: 'font' },
    { name: '--font-accent', label: '액센트 폰트', type: 'font' },
  ],
}

/** 에디터에서 선택 가능한 Google Fonts 목록 */
export const AVAILABLE_FONTS = [
  'Noto Sans KR',
  'Noto Serif KR',
  'Gothic A1',
  'Nanum Gothic',
  'Nanum Myeongjo',
  'Nanum Brush Script',
  'Nanum Pen Script',
  'Black Han Sans',
  'Do Hyeon',
  'Jua',
  'Gamja Flower',
  'Sunflower',
  'Song Myung',
] as const
