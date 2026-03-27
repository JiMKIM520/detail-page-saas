import { generateDesignForProject } from '@/lib/ai/generate-design'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: Request) {
  const { project_id } = await request.json()
  await generateDesignForProject(project_id)
  return NextResponse.json({ success: true })
}
