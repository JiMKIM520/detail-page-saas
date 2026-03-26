import { StatusBadge } from './StatusBadge'
import type { ProjectStatus } from '@/lib/status-machine'

interface ProjectCardProps {
  id: string
  company_name: string
  category: string
  platform_name: string
  status: ProjectStatus
  created_at: string
}

export function ProjectCard({ company_name, category, platform_name, status, created_at }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-xl border p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{company_name}</h3>
          <p className="text-sm text-gray-500">{platform_name} · {category}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <p className="text-xs text-gray-400">
        의뢰일: {new Date(created_at).toLocaleDateString('ko-KR')}
      </p>
    </div>
  )
}
