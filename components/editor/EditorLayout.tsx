'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { RefinedCopy, StyleGuide, Script } from '@/agents/types'
import type { IconMappingJson } from '@/agents/icon-mapper'
import type { EditorCommand } from '@/lib/editor/editorTypes'
import { useEditorStore } from '@/lib/editor/useEditorStore'
import EditorCanvas from './EditorCanvas'
import SectionEditor from './SectionEditor'
import StyleEditor from './StyleEditor'

interface EditorLayoutProps {
  projectId: string
  initialCopy: RefinedCopy
  initialStyleGuide: StyleGuide
  script: Script
  iconMapping: IconMappingJson
}

type SidebarTab = 'sections' | 'style'

export default function EditorLayout({
  projectId,
  initialCopy,
  initialStyleGuide,
}: EditorLayoutProps) {
  const {
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
  } = useEditorStore(initialCopy, initialStyleGuide)

  const [tab, setTab] = useState<SidebarTab>('sections')
  const [commands, setCommands] = useState<EditorCommand[]>([])
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // iframe에 명령 전송 + 편집 상태 업데이트
  const handleUpdateText = useCallback((field: 'headline' | 'subheadline' | 'body', value: string) => {
    if (state.selectedSectionIndex === null) return
    updateText(state.selectedSectionIndex, field, value)
    setCommands(prev => [...prev, { type: 'UPDATE_SECTION_TEXT', sectionIndex: state.selectedSectionIndex!, field, value }])
  }, [state.selectedSectionIndex, updateText])

  const handleUpdateItem = useCallback((itemIndex: number, field: 'label' | 'value', value: string) => {
    if (state.selectedSectionIndex === null) return
    updateItem(state.selectedSectionIndex, itemIndex, field, value)
    setCommands(prev => [...prev, { type: 'UPDATE_ITEM_TEXT', sectionIndex: state.selectedSectionIndex!, itemIndex, field, value }])
  }, [state.selectedSectionIndex, updateItem])

  const handleUpdateColor = useCallback((varName: string, value: string) => {
    updateCssVar(varName, value)
    setCommands(prev => [...prev, { type: 'UPDATE_CSS_VAR', varName, value }])
  }, [updateCssVar])

  const handleUpdateFont = useCallback((varName: string, value: string) => {
    updateFont(varName, value)
    setCommands(prev => [...prev, { type: 'UPDATE_CSS_VAR', varName, value }])
  }, [updateFont])

  // 박스 스타일 (radius, shadow) — StyleGuide.decorativeElements에 저장 + iframe에 CSS 변수 전달
  const handleUpdateDecorative = useCallback((varName: string, value: string) => {
    const varToField: Record<string, 'cornerRadius' | 'shadows' | 'dividerStyle'> = {
      '--radius': 'cornerRadius',
      '--shadow': 'shadows',
    }
    const field = varToField[varName]
    if (field) updateDecorative(field, value)
    setCommands(prev => [...prev, { type: 'UPDATE_CSS_VAR', varName, value }])
  }, [updateDecorative])

  // 섹션 순서 변경
  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_SECTIONS', fromIndex, toIndex })
  }, [dispatch])

  // 이미지 교체
  const handleReplaceImage = useCallback((sectionIndex: number, imageIndex: number, dataUrl: string) => {
    setCommands(prev => [...prev, { type: 'REPLACE_IMAGE', sectionIndex, imageIndex, dataUrl }])
  }, [])

  // 자동저장 (2초 debounce, draft only)
  useEffect(() => {
    if (!state.isDirty) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true)
      try {
        await fetch(`/api/designs/${projectId}/copy`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            copy: state.editedCopy,
            styleGuide: state.editedStyleGuide,
            regenerateHtml: false,
          }),
        })
        setSaveStatus('saved')
      } catch {
        setSaveStatus('error')
      } finally {
        setSaving(false)
      }
    }, 2000)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [state.isDirty, state.editedCopy, state.editedStyleGuide, projectId, setSaving, setSaveStatus])

  // 전체 저장 (HTML 재생성 포함)
  const handleFullSave = async () => {
    setSaving(true)
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/designs/${projectId}/copy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          copy: state.editedCopy,
          styleGuide: state.editedStyleGuide,
          regenerateHtml: true,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaveStatus('saved')
      // iframe 새로고침
      setCommands(prev => [...prev, { type: 'CLEAR_HIGHLIGHT' }])
      window.location.reload()
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const selectedSection = state.selectedSectionIndex !== null
    ? state.editedCopy.sections[state.selectedSectionIndex]
    : null

  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900 shrink-0">
        <div className="flex items-center gap-3">
          <a href={`/designer/${projectId}`} className="text-neutral-400 hover:text-neutral-200 text-sm">&larr; 검수 페이지</a>
          <span className="text-neutral-600">|</span>
          <h1 className="text-sm font-semibold">상세페이지 에디터</h1>
          <span className="text-xs text-neutral-500 font-mono">{projectId.slice(0, 8)}</span>
        </div>
        <div className="flex items-center gap-3">
          {state.saveStatus === 'saved' && <span className="text-xs text-green-400">저장됨</span>}
          {state.saveStatus === 'saving' && <span className="text-xs text-yellow-400">저장 중...</span>}
          {state.saveStatus === 'error' && <span className="text-xs text-red-400">저장 실패</span>}
          {state.isDirty && <span className="text-xs text-neutral-500">변경사항 있음</span>}
          <button
            onClick={resetToOriginal}
            disabled={!state.isDirty}
            className="px-3 py-1.5 text-xs border border-neutral-700 rounded-lg hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            되돌리기
          </button>
          <button
            onClick={handleFullSave}
            disabled={state.isSaving || !state.isDirty}
            className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {state.isSaving ? '저장 중...' : 'HTML 재생성 + 저장'}
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas (center) */}
        <EditorCanvas
          projectId={projectId}
          selectedSectionIndex={state.selectedSectionIndex}
          onSectionClick={selectSection}
          pendingCommands={commands}
        />

        {/* Sidebar (right) */}
        <aside className="w-80 border-l border-neutral-800 bg-neutral-900 flex flex-col shrink-0">
          {/* Tab switcher */}
          <div className="flex border-b border-neutral-800 shrink-0">
            <button
              onClick={() => setTab('sections')}
              className={`flex-1 py-2.5 text-xs font-medium ${tab === 'sections' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              섹션 편집
            </button>
            <button
              onClick={() => setTab('style')}
              className={`flex-1 py-2.5 text-xs font-medium ${tab === 'style' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              스타일
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            {tab === 'sections' && (
              <>
                {selectedSection ? (
                  <SectionEditor
                    section={selectedSection}
                    sectionIndex={state.selectedSectionIndex!}
                    onUpdateText={handleUpdateText}
                    onUpdateItem={handleUpdateItem}
                    onReplaceImage={handleReplaceImage}
                  />
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-400 mb-4">미리보기에서 섹션을 클릭하세요</p>
                    {state.editedCopy.sections.map((sec, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleReorder(i, i - 1)}
                            disabled={i === 0}
                            className="text-neutral-500 hover:text-neutral-200 disabled:opacity-20 p-0.5"
                            title="위로"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                          </button>
                          <button
                            onClick={() => handleReorder(i, i + 1)}
                            disabled={i === state.editedCopy.sections.length - 1}
                            className="text-neutral-500 hover:text-neutral-200 disabled:opacity-20 p-0.5"
                            title="아래로"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                          </button>
                        </div>
                        <button
                          onClick={() => selectSection(i)}
                          className="flex-1 text-left px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm text-neutral-200 flex items-center gap-2"
                        >
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-neutral-700 text-xs font-bold text-neutral-400">{i + 1}</span>
                          <span className="truncate">{sec.sectionType}</span>
                          <span className="ml-auto text-xs text-neutral-500 truncate max-w-[120px]">{sec.headline.slice(0, 20)}</span>
                        </button>
                        <button
                          onClick={() => { if (confirm(`"${sec.sectionType}" 섹션을 삭제하시겠습니까?`)) dispatch({ type: 'DELETE_SECTION', sectionIndex: i }) }}
                          className="text-neutral-600 hover:text-red-400 p-1 shrink-0"
                          title="섹션 삭제"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {selectedSection && (
                  <button
                    onClick={() => selectSection(null)}
                    className="mt-4 w-full text-center text-xs text-neutral-500 hover:text-neutral-300 py-2"
                  >
                    &larr; 섹션 목록으로
                  </button>
                )}
              </>
            )}

            {tab === 'style' && (
              <StyleEditor
                styleGuide={state.editedStyleGuide}
                onUpdateColor={handleUpdateColor}
                onUpdateFont={handleUpdateFont}
                onUpdateCssVar={handleUpdateDecorative}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
