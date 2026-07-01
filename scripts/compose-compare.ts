/** 3개 테스트 제품 × 3회 조합 — 확장 라이브러리(195변형)의 상세페이지 다양성/품질 비교.
 *  실행: env -u ANTHROPIC_API_KEY npx tsx scripts/compose-compare.ts  (전역키 충돌 시)
 *        또는 npx tsx scripts/compose-compare.ts */
import { writeFileSync } from 'node:fs'
import { runBlocksComposer, type BlocksComposerInput } from '../agents/blocks-composer'
import { presetForCategory } from '../agents/templates/blocks'
import type { ProjectBrief } from '../agents/types'

const OUT = '/private/tmp/claude-501/-Users-jinman-Desktop-Projects/c6721d8e-b5e9-4289-9352-1b38f8ca898e/scratchpad/compare'
const B = 'http://localhost:8899'
const IMAGES = {
  hero: `${B}/ph-a.png`,
  lifestyle: [`${B}/ph-b.png`, `${B}/ph-d.png`],
  cutout: `${B}/ph-a.png`,
  section: [`${B}/ph-c.png`, `${B}/ph-b.png`, `${B}/ph-d.png`],
}

interface P { id: string; brief: ProjectBrief }
const products: P[] = [
  {
    id: 'kokodang',
    brief: {
      projectId: 'kokodang',
      productName: '코코댕 순순스틱',
      category: '반려동물',
      platform: '스마트스토어',
      targetAudience: '식이 알러지가 있는 반려견 보호자, 순한 식물성 간식을 찾는 20~50대',
      keyHighlights: [
        '코코넛·우뭇가사리 등 딱 3가지 이하 순한 식재료 — 알러지 걱정 NO',
        '코코넛과 한천은 단백질 함량이 낮아 식이역반응 가능성이 적음',
        '콕콕 박힌 코코넛 과육에서 씹을 때마다 터지는 고소함',
        '냉동은 아이스크림처럼, 해동은 말랑스틱으로 다채롭게 급여',
        '식품연구원 엄마가 알러지견을 기르며 개발한 순하고 맛있는 식물성 간식',
      ],
      brandColors: ['#8FBF9F', '#F3EEE3', '#4A5B3C'],
      styleDirection: '아기자기하고 귀엽고 편안한 반려동물 간식. 따뜻한 sand 톤. hero→원료·성분·급여법·후기·마무리 구성.',
      toneKeywords: ['순한', '귀여운', '편안한', '믿을 수 있는'],
      requiredContent: { phrases: ['알러지 걱정 NO', '순순스틱'], images: [], certifications: [] },
      restrictions: { styles: [], colors: [], words: [] },
      generatedAt: '2026-07-01T00:00:00.000Z',
    },
  },
  {
    id: 'hwangtae',
    brief: {
      projectId: 'hwangtae',
      productName: '청국콩을 먹은 황태과립',
      category: '건강기능식품',
      platform: '스마트스토어',
      targetAudience: '건강을 챙기는 40~60대, 간편한 단백질·숙취해소 식품을 찾는 소비자',
      keyHighlights: [
        '청정 대관령 덕장 120일 자연건조 통황태 60% + 무공해 발효 청국콩 40%',
        '단백질 63.9g(1일 기준 116%) — 고단백·저지방·담백한 맛',
        '5g×20포 개별 스틱포장으로 언제 어디서나 간편 섭취',
        '발효 청국콩의 천연 유산균이 소화를 돕고 장 건강에 기여',
        '메티오닌 등 아미노산 풍부 — 간 보호·숙취 해소에 탁월',
      ],
      brandColors: ['#3A6B8A', '#EAF1F5', '#20303A'],
      styleDirection: '친환경적이고 가독성 좋고 편안한 건강기능식품. cobalt 프리미엄. 성분표·수치강조·인증·상품구성 활용.',
      toneKeywords: ['정직한', '건강한', '전통있는', '신뢰할 수 있는'],
      requiredContent: { phrases: ['통황태 60%', '단백질'], images: [], certifications: [] },
      restrictions: { styles: [], colors: [], words: [] },
      generatedAt: '2026-07-01T00:00:00.000Z',
    },
  },
  {
    id: 'publisher',
    brief: {
      projectId: 'publisher',
      productName: 'switch 여름 핸드크림 (더퍼블리셔 CHAPTER 02)',
      category: '뷰티/화장품',
      platform: '스마트스토어',
      targetAudience: '감성적이고 트렌디한 20~40대, 계절 향과 산뜻한 사용감을 중시하는 소비자',
      keyHighlights: [
        '베르가못·스윗오렌지 탑, 로즈 앱솔루트·블랙페퍼 베이스의 청량하고 우아한 그래스 향',
        '가볍고 시원한 쿨링 로션 제형 — 빠른 흡수, 끈적임 없는 산뜻함',
        '100% 순수 아로마 오일 블렌딩 (영국 Absolute Aromas 상위 5% 오일 선별)',
        '카렌듈라·감태·해양심층수 등 피부 진정·보습·탄력 성분',
        '계절마다 새로운 시즈널 포뮬라를 발행하는 라이프스타일 에센셜 브랜드',
      ],
      brandColors: ['#6E7FB0', '#F1EEF6', '#2A2740'],
      styleDirection: '감성적·친환경·트렌디한 뷰티. cobalt 프리미엄, 에디토리얼 무드. 향 노트·성분·사용감·브랜드스토리 활용.',
      toneKeywords: ['감성적인', '우아한', '트렌디한', '깨끗한'],
      requiredContent: { phrases: ['쿨링 로션 제형', '순수 아로마 오일'], images: [], certifications: [] },
      restrictions: { styles: [], colors: [], words: [] },
      generatedAt: '2026-07-01T00:00:00.000Z',
    },
  },
]

async function compose(p: P, v: number): Promise<string[]> {
  const input: BlocksComposerInput = {
    brief: p.brief,
    images: IMAGES,
    brandColors: p.brief.brandColors,
    preferredPreset: presetForCategory(p.brief.category),
    outputDir: OUT,
  }
  const res = await runBlocksComposer(input)
  if (!res.success || !res.data) throw new Error(`${p.id} v${v} 실패: ${res.error}`)
  writeFileSync(`${OUT}/${p.id}-v${v}.html`, res.data.html)
  return res.data.usedVariants
}

void (async () => {
  const jobs = products.flatMap((p) => [1, 2, 3].map((v) => ({ p, v })))
  const results = await Promise.all(
    jobs.map(async ({ p, v }) => {
      try {
        const used = await compose(p, v)
        return { id: `${p.id}-v${v}`, ok: true, blocks: used.length, used }
      } catch (e) {
        return { id: `${p.id}-v${v}`, ok: false, err: (e as Error).message }
      }
    }),
  )
  for (const r of results) {
    if (r.ok) console.log(`✓ ${r.id} — ${r.blocks} blocks: ${r.used!.join(', ')}`)
    else console.log(`✗ ${r.id}: ${r.err}`)
  }
  writeFileSync(`${OUT}/_compose-results.json`, JSON.stringify(results, null, 2))
  console.log(`\n완료 — 성공 ${results.filter((r) => r.ok).length}/${results.length}`)
})()
