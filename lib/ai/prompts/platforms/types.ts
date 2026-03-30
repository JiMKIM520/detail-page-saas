export interface PlatformPrompt {
  slug: string
  name: string
  imageSpecs: {
    width: number
    maxHeight?: number
    maxFileSize: string
    thumbnailSize?: string
    formats: string
  }
  targetAudience: string
  layoutRules: string
  conversionTips: string
  commonMistakes: string
}
