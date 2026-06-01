import { GoogleAuth } from 'google-auth-library'

function getProjectId() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
  if (!projectId) throw new Error('GOOGLE_CLOUD_PROJECT_ID is required')
  return projectId
}

async function getAccessToken(): Promise<string> {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  let auth: GoogleAuth
  if (keyJson) {
    const credentials = JSON.parse(keyJson)
    auth = new GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/cloud-platform'] })
  } else {
    auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] })
  }
  const client = await auth.getClient()
  const token = await client.getAccessToken()
  if (!token.token) throw new Error('Failed to get access token')
  return token.token
}

async function imagenPredict(body: object): Promise<string> {
  const projectId = getProjectId()
  const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict`
  const token = await getAccessToken()

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Imagen API error ${res.status}: ${errText.slice(0, 300)}`)
  }

  const data = await res.json()
  const base64 = data.predictions?.[0]?.bytesBase64Encoded
  if (!base64) throw new Error(`Imagen: No image in response (predictions empty — safety filter or prompt issue)`)
  return base64
}

// 텍스트 프롬프트만으로 이미지 생성
export async function generateProductImage(prompt: string): Promise<Buffer> {
  const base64 = await imagenPredict({
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: '9:16',
      safetyFilterLevel: 'block_few',
      personGeneration: 'dont_allow',
    },
  })
  return Buffer.from(base64, 'base64')
}

// 누끼컷을 subject reference로 사용해 스타일링 이미지 생성
// Subject reference 미지원 시 텍스트 기반 생성으로 fallback
export async function generateStyledImage(
  prompt: string,
  referenceBase64: string,
): Promise<Buffer> {
  try {
    const base64 = await imagenPredict({
      instances: [{
        prompt,
        referenceImages: [{
          referenceType: 'REFERENCE_TYPE_SUBJECT',
          referenceId: 1,
          referenceImage: { bytesBase64Encoded: referenceBase64 },
        }],
      }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '9:16',
        safetyFilterLevel: 'block_few',
        personGeneration: 'dont_allow',
      },
    })
    return Buffer.from(base64, 'base64')
  } catch (err) {
    console.warn('[imagen] Subject reference failed, falling back to text-only:', String(err).slice(0, 200))
    return generateProductImage(prompt)
  }
}
