'use client'

import { useReducer, useCallback } from 'react'
import type { RefinedCopy, StyleGuide } from '@/agents/types'
import type { EditorStore, EditorAction } from './editorTypes'

function editorReducer(state: EditorStore, action: EditorAction): EditorStore {
  switch (action.type) {
    case 'SELECT_SECTION':
      return { ...state, selectedSectionIndex: action.index }

    case 'UPDATE_TEXT': {
      const sections = state.editedCopy.sections.map((sec, i) => {
        if (i !== action.sectionIndex) return sec
        return { ...sec, [action.field]: action.value }
      })
      return {
        ...state,
        editedCopy: { ...state.editedCopy, sections },
        isDirty: true,
        saveStatus: 'idle',
      }
    }

    case 'UPDATE_ITEM': {
      const sections = state.editedCopy.sections.map((sec, i) => {
        if (i !== action.sectionIndex || !sec.items) return sec
        const items = sec.items.map((item, j) => {
          if (j !== action.itemIndex) return item
          return { ...item, [action.field]: action.value }
        })
        return { ...sec, items }
      })
      return {
        ...state,
        editedCopy: { ...state.editedCopy, sections },
        isDirty: true,
        saveStatus: 'idle',
      }
    }

    case 'UPDATE_CSS_VAR': {
      const colors = { ...state.editedStyleGuide.colors } as Record<string, string>
      const varToColorKey: Record<string, string> = {
        '--color-primary': 'primary',
        '--color-secondary': 'secondary',
        '--color-surface1': 'surface1',
        '--color-surface2': 'surface2',
        '--color-surface3': 'surface3',
        '--color-accent': 'accent',
        '--color-text-dark': 'textDark',
        '--color-text-light': 'textLight',
      }
      const key = varToColorKey[action.varName]
      if (key) colors[key] = action.value
      return {
        ...state,
        editedStyleGuide: {
          ...state.editedStyleGuide,
          colors: colors as StyleGuide['colors'],
        },
        isDirty: true,
        saveStatus: 'idle',
      }
    }

    case 'UPDATE_DECORATIVE': {
      return {
        ...state,
        editedStyleGuide: {
          ...state.editedStyleGuide,
          decorativeElements: {
            ...state.editedStyleGuide.decorativeElements,
            [action.field]: action.value,
          },
        },
        isDirty: true,
        saveStatus: 'idle',
      }
    }

    case 'UPDATE_FONT': {
      const typography = { ...state.editedStyleGuide.typography }
      const varToFontKey: Record<string, keyof typeof typography> = {
        '--font-headline': 'headlineFont',
        '--font-body': 'bodyFont',
        '--font-story': 'storyFont',
        '--font-accent': 'accentFont',
      }
      const key = varToFontKey[action.varName]
      if (key) (typography as Record<string, unknown>)[key] = action.value
      return {
        ...state,
        editedStyleGuide: { ...state.editedStyleGuide, typography },
        isDirty: true,
        saveStatus: 'idle',
      }
    }

    case 'SET_SAVING':
      return { ...state, isSaving: action.isSaving }

    case 'SET_SAVE_STATUS':
      return {
        ...state,
        saveStatus: action.status,
        isDirty: action.status === 'saved' ? false : state.isDirty,
      }

    case 'REORDER_SECTIONS': {
      const { fromIndex, toIndex } = action
      if (toIndex < 0 || toIndex >= state.editedCopy.sections.length) return state
      const sections = state.editedCopy.sections.map((s, i) =>
        i === fromIndex ? state.editedCopy.sections[toIndex] :
        i === toIndex ? state.editedCopy.sections[fromIndex] : s
      )
      return {
        ...state,
        editedCopy: { ...state.editedCopy, sections },
        isDirty: true,
        saveStatus: 'idle',
        selectedSectionIndex: null,
      }
    }

    case 'DELETE_SECTION': {
      const sections = state.editedCopy.sections.filter((_, i) => i !== action.sectionIndex)
      return {
        ...state,
        editedCopy: { ...state.editedCopy, sections },
        isDirty: true,
        saveStatus: 'idle',
        selectedSectionIndex: null,
      }
    }

    case 'RESET_TO_ORIGINAL':
      return {
        ...state,
        editedCopy: structuredClone(state.originalCopy),
        editedStyleGuide: structuredClone(state.originalStyleGuide),
        isDirty: false,
        saveStatus: 'idle',
        selectedSectionIndex: null,
      }

    default:
      return state
  }
}

export function useEditorStore(initialCopy: RefinedCopy, initialStyleGuide: StyleGuide) {
  const initialState: EditorStore = {
    originalCopy: initialCopy,
    originalStyleGuide: initialStyleGuide,
    editedCopy: structuredClone(initialCopy),
    editedStyleGuide: structuredClone(initialStyleGuide),
    selectedSectionIndex: null,
    isDirty: false,
    isSaving: false,
    saveStatus: 'idle',
  }

  const [state, dispatch] = useReducer(editorReducer, initialState)

  const selectSection = useCallback((index: number | null) => {
    dispatch({ type: 'SELECT_SECTION', index })
  }, [])

  const updateText = useCallback((sectionIndex: number, field: 'headline' | 'subheadline' | 'body', value: string) => {
    dispatch({ type: 'UPDATE_TEXT', sectionIndex, field, value })
  }, [])

  const updateItem = useCallback((sectionIndex: number, itemIndex: number, field: 'label' | 'value', value: string) => {
    dispatch({ type: 'UPDATE_ITEM', sectionIndex, itemIndex, field, value })
  }, [])

  const updateCssVar = useCallback((varName: string, value: string) => {
    dispatch({ type: 'UPDATE_CSS_VAR', varName, value })
  }, [])

  const updateFont = useCallback((varName: string, value: string) => {
    dispatch({ type: 'UPDATE_FONT', varName, value })
  }, [])

  const updateDecorative = useCallback((field: 'cornerRadius' | 'shadows' | 'dividerStyle', value: string) => {
    dispatch({ type: 'UPDATE_DECORATIVE', field, value })
  }, [])

  const setSaving = useCallback((isSaving: boolean) => {
    dispatch({ type: 'SET_SAVING', isSaving })
  }, [])

  const setSaveStatus = useCallback((status: EditorStore['saveStatus']) => {
    dispatch({ type: 'SET_SAVE_STATUS', status })
  }, [])

  const resetToOriginal = useCallback(() => {
    dispatch({ type: 'RESET_TO_ORIGINAL' })
  }, [])

  return {
    state,
    dispatch,
    selectSection,
    updateText,
    updateItem,
    updateCssVar,
    updateFont,
    updateDecorative,
    setSaving,
    setSaveStatus,
    resetToOriginal,
  }
}
