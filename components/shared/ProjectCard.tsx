import { StatusBadge } from './StatusBadge'
import type { ProjectStatus } from '@/lib/status-machine'
import Link from 'next/link'

interface ProjectCardProps {
  id: string
  company_name: string
  category: string
  platform_name: string
  status: ProjectStatus
  created_at: string
  href?: string
}

export function ProjectCard({ id, company_name, category, platform_name, status, created_at, href }: ProjectCardProps) {
  const card = (
    <div className="group bg-surface rounded-xl border border-border p-5 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-text-primary group-hover:text-primary-700 transition-colors truncate">
            {company_name}
          </h3>
          <p className="text-sm text-text-tertiary mt-1">
            {platform_name} · {category}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
        <p className="text-xs text-text-tertiary">
          {new Date(created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <svg className="w-4 h-4 text-text-tertiary group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{card}</Link>
  }
  return <Link href={`/projects/${id}`}>{card}</Link>
}
