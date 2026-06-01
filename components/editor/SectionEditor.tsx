'use client'

import { useRef } from 'react'
import type { RefinedCopy } from '@/agents/types'

interface SectionEditorProps {
  section: RefinedCopy['sections'][number]
  sectionIndex: number
  onUpdateText: (field: 'headline' | 'subheadline' | 'body', value: string) => void
  onUpdateItem: (itemIndex: number, field: 'label' | 'value', value: string) => void
  onReplaceImage?: (sectionIndex: number, imageIndex: number, dataUrl: string) => void
}

export default function SectionEditor({
  section,
  sectionIndex,
  onUpdateText,
  onUpdateItem,
  onReplaceImage,
}: SectionEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingImageIndex = useRef(0)

  function handleFileSelect(imageIndex: number) {
    pendingImageIndex.current = imageIndex
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !onReplaceImage) return
    const reader = new FileReader()
    reader.onload = () => {
      onReplaceImage(sectionIndex, pendingImageIndex.current, reader.result as string)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }
  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-600 text-white text-xs font-bold">
          {sectionIndex + 1}
        </span>
        <span className="text-sm font-medium text-neutral-300">{section.sectionType}</span>
      </div>

      {/* Headline */}
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1">헤드라인</label>
        <textarea
          value={section.headline}
          onChange={(e) => onUpdateText('headline', e.target.value)}
          rows={2}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Subheadline */}
      {section.subheadline !== undefined && (
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1">서브헤드라인</label>
          <textarea
            value={section.subheadline ?? ''}
            onChange={(e) => onUpdateText('subheadline', e.target.value)}
            rows={2}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Body */}
      {section.body !== undefined && (
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1">본문</label>
          <textarea
            value={section.body ?? ''}
            onChange={(e) => onUpdateText('body', e.target.value)}
            rows={3}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Items */}
      {section.items && section.items.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-2">항목</label>
          <div className="space-y-3">
            {section.items.map((item, i) => (
              <div key={i} className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 space-y-2">
                <input
                  value={item.label}
                  onChange={(e) => onUpdateItem(i, 'label', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-600 rounded px-2 py-1 text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="제목"
                />
                <textarea
                  value={item.value}
                  onChange={(e) => onUpdateItem(i, 'value', e.target.value)}
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-600 rounded px-2 py-1 text-sm text-neutral-100 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="내용"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 이미지 교체 */}
      {onReplaceImage && (
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-2">이미지</label>
          <button
            onClick={() => handleFileSelect(0)}
            className="w-full flex items-center gap-3 px-3 py-3 bg-neutral-800 border border-neutral-700 border-dashed rounded-lg hover:bg-neutral-750 hover:border-neutral-500 transition-colors"
          >
            <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span className="text-sm text-neutral-400">클릭하여 이미지 교체</span>
          </button>
        </div>
      )}
    </div>
  )
}
