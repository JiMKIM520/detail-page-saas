import { generateScriptForProject } from '@/lib/ai/generate-script'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { project_id } = await request.json()
  generateScriptForProject(project_id)
  return NextResponse.json({ queued: true })
}
