'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ScriptSection {
  type: string
  title?: string
  subtitle?: string
  image_description?: string
  items?: Array<{ title: string; description: string }>
  steps?: string[]
  text?: string
}

interface ScriptContent {
  sections: ScriptSection[]
  shooting_requirements?: {
    nukki_shots?: string[]
    styling_shots?: string[]
  }
  tone: string
  color_suggestion: string
}

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero',
  benefits: '핵심 장점',
  features: '상세 스펙',
  social_proof: '사회적 증거',
  comparison: '비교',
  how_to_use: '사용법',
  cta: 'CTA',
}

interface ScriptViewerProps {
  content: ScriptContent
  projectId: string
  scriptId: string
}

export function ScriptViewer({ content, projectId, scriptId }: ScriptViewerProps) {
  const router = useRouter()
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draftSection, setDraftSection] = useState<ScriptSection | null>(null)
  const [saving, setSaving] = useState(false)

  function startEdit(index: number) {
    setDraftSection(JSON.parse(JSON.stringify(content.sections[index])))
    setEditingIndex(index)
  }

  function cancelEdit() {
    setEditingIndex(null)
    setDraftSection(null)
  }

  async function saveSection(index: number) {
    if (!draftSection) return
    setSaving(true)
    const updatedSections = content.sections.map((s, i) => (i === index ? draftSection : s))
    const updatedContent = { ...content, sections: updatedSections }
    await fetch('/api/scripts/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        script_id: scriptId,
        action: 'edit',
        notes: { content: updatedContent, memo: '' },
      }),
    })
    setSaving(false)
    setEditingIndex(null)
    setDraftSection(null)
    router.refresh()
  }

  function updateDraftItem(itemIndex: number, field: 'title' | 'description', value: string) {
    if (!draftSection || !draftSection.items) return
    const updatedItems = draftSection.items.map((item, i) =>
      i === itemIndex ? { ...item, [field]: value } : item
    )
    setDraftSection({ ...draftSection, items: updatedItems })
  }

  function updateDraftStep(stepIndex: number, value: string) {
    if (!draftSection || !draftSection.steps) return
    const updatedSteps = draftSection.steps.map((s, i) => (i === stepIndex ? value : s))
    setDraftSection({ ...draftSection, steps: updatedSteps })
  }

  return (
    <div className="space-y-5">
      {content.sections.map((section, i) => {
        const isEditing = editingIndex === i
        const draft = isEditing ? draftSection! : section

        return (
          <div key={i} className="bg-surface rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-md uppercase tracking-wide">
                  {SECTION_LABELS[section.type] || section.type}
                </span>
                <span className="text-xs text-text-tertiary">Section {i + 1}</span>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => startEdit(i)}
                  className="flex items-center gap-1 text-xs text-text-tertiary hover:text-primary-600 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                  편집
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelEdit}
                    className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => saveSection(i)}
                    disabled={saving}
                    className="text-xs bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-all"
                  >
                    {saving ? '저장 중...' : '저장'}
                  </button>
                </div>
              )}
            </div>

            {draft.title !== undefined && (
              isEditing ? (
                <input
                  value={draft.title}
                  onChange={e => setDraftSection({ ...draftSection!, title: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-base font-bold text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-1"
                />
              ) : (
                <h3 className="text-base font-bold text-text-primary">{section.title}</h3>
              )
            )}

            {draft.subtitle !== undefined && (
              isEditing ? (
                <textarea
                  value={draft.subtitle}
                  onChange={e => setDraftSection({ ...draftSection!, subtitle: e.target.value })}
                  rows={2}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-secondary bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none mt-1"
                />
              ) : (
                <p className="text-sm text-text-secondary mt-1">{section.subtitle}</p>
              )
            )}

            {section.image_description && (
              <div className="mt-3 flex items-start gap-2 bg-primary-50 rounded-lg px-3 py-2.5">
                <svg className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                <p className="text-sm text-primary-700">{section.image_description}</p>
              </div>
            )}

            {draft.items && draft.items.length > 0 && (
              <div className="mt-3 space-y-2">
                {draft.items.map((item, j) => (
                  isEditing ? (
                    <div key={j} className="pl-3 border-l-2 border-primary-200 space-y-1">
                      <input
                        value={item.title}
                        onChange={e => updateDraftItem(j, 'title', e.target.value)}
                        className="w-full border border-border rounded-lg px-3 py-1.5 text-sm font-semibold text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <textarea
                        value={item.description}
                        onChange={e => updateDraftItem(j, 'description', e.target.value)}
                        rows={2}
                        className="w-full border border-border rounded-lg px-3 py-1.5 text-sm text-text-secondary bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                    </div>
                  ) : (
                    <div key={j} className="pl-3 border-l-2 border-primary-200">
                      <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                      <p className="text-sm text-text-secondary">{item.description}</p>
                    </div>
                  )
                ))}
              </div>
            )}

            {draft.steps && (
              <ol className="mt-3 space-y-1.5">
                {draft.steps.map((step, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                      {j + 1}
                    </span>
                    {isEditing ? (
                      <textarea
                        value={step}
                        onChange={e => updateDraftStep(j, e.target.value)}
                        rows={2}
                        className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm text-text-secondary bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                    ) : (
                      step
                    )}
                  </li>
                ))}
              </ol>
            )}

            {draft.text !== undefined && (
              isEditing ? (
                <textarea
                  value={draft.text}
                  onChange={e => setDraftSection({ ...draftSection!, text: e.target.value })}
                  rows={3}
                  className="w-full mt-3 border border-border rounded-lg px-3 py-2 text-sm text-text-secondary bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              ) : (
                section.text && <p className="text-sm text-text-secondary mt-2">{section.text}</p>
              )
            )}
          </div>
        )
      })}

      <div className="bg-primary-50 rounded-xl border border-primary-200 p-5">
        <h4 className="font-semibold text-primary-900 mb-4">촬영 요구사항</h4>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-semibold text-primary-800 mb-2">누끼 컷</p>
            <ul className="space-y-1.5">
              {(content.shooting_requirements?.nukki_shots ?? []).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-primary-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-primary-800 mb-2">스타일링 컷</p>
            <ul className="space-y-1.5">
              {(content.shooting_requirements?.styling_shots ?? []).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-primary-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-6 text-sm bg-surface rounded-xl border border-border p-4">
        <div>
          <span className="text-text-tertiary">톤앤매너</span>
          <p className="font-semibold text-text-primary mt-0.5">{content.tone}</p>
        </div>
        <div className="w-px bg-border" />
        <div>
          <span className="text-text-tertiary">컬러 제안</span>
          <p className="font-semibold text-text-primary mt-0.5">{content.color_suggestion}</p>
        </div>
      </div>
    </div>
  )
}
