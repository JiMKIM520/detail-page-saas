import { createClient } from '@/lib/supabase/server'
import { ShootingList } from '@/components/photography/ShootingList'
import { notFound } from 'next/navigation'

export default async function PhotographyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('project_id', id)
    .order('photo_type')

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">{project.company_name}</h1>
      <p className="text-sm text-gray-500 mb-6">촬영 리스트 및 사진 업로드</p>
      <ShootingList projectId={id} photos={photos ?? []} />
    </div>
  )
}
