import { foodPrompt } from './food'
import { healthFoodPrompt } from './health-food'
import { beautyPrompt } from './beauty'
import { fashionPrompt } from './fashion'
import { livingPrompt } from './living'
import { electronicsPrompt } from './electronics'
import { petPrompt } from './pet'

export type { CategoryPrompt } from './types'

export const CATEGORIES = new Map([
  ['food', foodPrompt],
  ['health-food', healthFoodPrompt],
  ['beauty', beautyPrompt],
  ['fashion', fashionPrompt],
  ['living', livingPrompt],
  ['electronics', electronicsPrompt],
  ['pet', petPrompt],
])

export function getCategoryPrompt(slug: string) {
  return CATEGORIES.get(slug)
}
