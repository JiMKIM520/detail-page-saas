import { PredictionServiceClient, helpers } from '@google-cloud/aiplatform'

const client = new PredictionServiceClient()
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID
if (!PROJECT_ID) throw new Error('GOOGLE_CLOUD_PROJECT_ID is required')
const LOCATION = 'us-central1'
const ENDPOINT = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-4.0-generate-preview-05-20`

export async function generateProductImage(prompt: string): Promise<Buffer> {
  const instance = helpers.toValue({ prompt })
  const parameters = helpers.toValue({
    sampleCount: 1,
    aspectRatio: '9:16',
    safetyFilterLevel: 'block_few',
    personGeneration: 'dont_allow',
  })

  const [response] = await client.predict({
    endpoint: ENDPOINT,
    instances: [instance!],
    parameters,
  })

  const prediction = response.predictions?.[0]
  if (!prediction) throw new Error('Imagen 4: No image generated')

  const base64 = (prediction as any).structValue?.fields?.bytesBase64Encoded?.stringValue
  if (!base64) throw new Error('Imagen 4: Missing base64 data')

  return Buffer.from(base64, 'base64')
}
