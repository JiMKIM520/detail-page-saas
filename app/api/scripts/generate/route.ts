import { generateScriptForProject } from '@/lib/ai/generate-script'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: Request) {
  const { project_id } = await request.json()
  await generateScriptForProject(project_id)
  return NextResponse.json({ success: true })
}
