import { createClient } from '@/lib/supabase/server'
import { IntakeForm } from '@/components/intake/IntakeForm'

export default async function IntakePage() {
  const supabase = await createClient()
  const { data: platforms } = await supabase.from('platforms').select('id, name')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">작업 의뢰하기</h1>
      <p className="text-gray-500 mb-8">기업 정보와 상세페이지 제작 요구사항을 입력해 주세요.</p>
      <IntakeForm platforms={platforms ?? []} />
    </div>
  )
}
