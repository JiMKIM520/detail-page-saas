'use client'

import { useState } from 'react'
import { BulkRegisterModal } from '@/components/admin/BulkRegisterModal'

export function BulkRegisterButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        일괄 등록
      </button>
      <BulkRegisterModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
