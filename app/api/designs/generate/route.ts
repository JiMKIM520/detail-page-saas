import { generateDesignForProject } from '@/lib/ai/generate-design'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { project_id } = await request.json()
  generateDesignForProject(project_id) // fire-and-forget
  return NextResponse.json({ queued: true })
}
