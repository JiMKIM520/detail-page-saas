import { PredictionServiceClient, helpers } from '@google-cloud/aiplatform'

let _client: PredictionServiceClient | null = null

function getClient() {
  if (!_client) {
    const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    if (keyJson) {
      const credentials = JSON.parse(keyJson)
      _client = new PredictionServiceClient({ credentials })
    } else {
      // Falls back to GOOGLE_APPLICATION_CREDENTIALS file path
      _client = new PredictionServiceClient()
    }
  }
  return _client
}

function getEndpoint() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
  if (!projectId) throw new Error('GOOGLE_CLOUD_PROJECT_ID is required')
  return `projects/${projectId}/locations/us-central1/publishers/google/models/imagen-4.0-generate-preview-05-20`
}

export async function generateProductImage(prompt: string): Promise<Buffer> {
  const client = getClient()
  const instance = helpers.toValue({ prompt })
  const parameters = helpers.toValue({
    sampleCount: 1,
    aspectRatio: '9:16',
    safetyFilterLevel: 'block_few',
    personGeneration: 'dont_allow',
  })

  const [response] = await client.predict({
    endpoint: getEndpoint(),
    instances: [instance!],
    parameters,
  })

  const prediction = response.predictions?.[0]
  if (!prediction) throw new Error('Imagen 4: No image generated')

  const base64 = (prediction as any).structValue?.fields?.bytesBase64Encoded?.stringValue
  if (!base64) throw new Error('Imagen 4: Missing base64 data')

  return Buffer.from(base64, 'base64')
}
