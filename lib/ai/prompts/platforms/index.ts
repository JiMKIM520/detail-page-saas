import { PlatformPrompt } from './types'
import { smartstorePrompt } from './smartstore'
import { coupangPrompt } from './coupang'
import { elevenStPrompt } from './11st'
import { gmarketPrompt } from './gmarket'
import { kakaoPrompt } from './kakao'
import { ohousePrompt } from './ohouse'
import { musinsaPrompt } from './musinsa'
import { wemakepricePrompt } from './wemakeprice'
import { ssgPrompt } from './ssg'

export const PLATFORMS: Record<string, PlatformPrompt> = {
  smartstore: smartstorePrompt,
  coupang: coupangPrompt,
  '11st': elevenStPrompt,
  gmarket: gmarketPrompt,
  kakao: kakaoPrompt,
  ohouse: ohousePrompt,
  musinsa: musinsaPrompt,
  wemakeprice: wemakepricePrompt,
  ssg: ssgPrompt,
}

export function getPlatformPrompt(slug: string): PlatformPrompt | undefined {
  return PLATFORMS[slug]
}

export type { PlatformPrompt } from './types'
