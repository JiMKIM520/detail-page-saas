export interface CategoryPrompt {
  slug: string
  name: string
  legalRules: string
  forbiddenExpressions: { forbidden: string; allowed: string }[]
  requiredSections: string[]
  tone: string
  shootingGuide: string
}
