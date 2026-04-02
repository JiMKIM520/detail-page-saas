interface ScriptSection {
  type: string
  title?: string
  subtitle?: string
  image_description?: string
  items?: Array<{ title: string; description: string }>
  steps?: string[]
  text?: string
}

interface ScriptContent {
  sections: ScriptSection[]
  tone?: string
  color_suggestion?: string
}

const SECTION_LABELS: Record<string, string> = {
  hero: '헤드라인',
  benefits: '핵심 장점',
  features: '상세 스펙',
  social_proof: '사회적 증거',
  comparison: '비교',
  how_to_use: '사용법',
  cta: 'CTA',
}

function renderSection(section: ScriptSection, heroImageBase64?: string): string {
  const label = SECTION_LABELS[section.type] || section.type.toUpperCase()
  let content = ''

  if (section.type === 'hero' && heroImageBase64) {
    content += `<div class="hero-image"><img src="data:image/png;base64,${heroImageBase64}" alt="상품 이미지" /></div>`
  }

  if (section.title) {
    content += `<h2 class="section-title">${section.title}</h2>`
  }
  if (section.subtitle) {
    content += `<p class="section-subtitle">${section.subtitle}</p>`
  }
  if (section.text) {
    content += `<p class="section-text">${section.text}</p>`
  }
  if (section.items && section.items.length > 0) {
    content += `<ul class="items-list">${section.items.map(item =>
      `<li><strong>${item.title}</strong><span>${item.description}</span></li>`
    ).join('')}</ul>`
  }
  if (section.steps && section.steps.length > 0) {
    content += `<ol class="steps-list">${section.steps.map(step =>
      `<li>${step}</li>`
    ).join('')}</ol>`
  }
  if (section.image_description) {
    content += `<div class="image-desc">📸 이미지 설명: ${section.image_description}</div>`
  }

  return `
    <div class="section" data-type="${section.type}">
      <div class="section-badge">${label}</div>
      ${content}
    </div>`
}

export function buildDesignHtml(
  content: ScriptContent,
  project: { company_name: string },
  heroImageBase64?: string
): string {
  const sections = content.sections || []
  const primaryColor = content.color_suggestion?.match(/#[0-9a-fA-F]{6}/)?.[0] ?? '#4f46e5'

  const sectionsHtml = sections.map((s, i) =>
    renderSection(s, i === 0 ? heroImageBase64 : undefined)
  ).join('\n')

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${project.company_name} — 상세페이지 기획안</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root { --primary: ${primaryColor}; --primary-light: ${primaryColor}22; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Noto Sans KR', sans-serif; font-size: 14px; color: #1a1a2e; background: #fff; }
    .header { background: var(--primary); color: white; padding: 32px 40px; text-align: center; }
    .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
    .header .meta { font-size: 13px; opacity: 0.85; }
    .tone-bar { display: flex; gap: 24px; padding: 14px 40px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    .tone-bar span { color: #6b7280; }
    .tone-bar strong { color: #111827; }
    .section { padding: 36px 40px; border-bottom: 1px solid #e5e7eb; page-break-inside: avoid; }
    .section:last-child { border-bottom: none; }
    .section-badge { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--primary); background: var(--primary-light); border: 1px solid var(--primary); border-radius: 4px; padding: 3px 10px; margin-bottom: 16px; }
    .section-title { font-size: 22px; font-weight: 700; color: #111827; line-height: 1.4; margin-bottom: 10px; }
    .section-subtitle { font-size: 15px; color: #4b5563; line-height: 1.7; margin-bottom: 10px; }
    .section-text { font-size: 14px; color: #4b5563; line-height: 1.8; }
    .hero-image { margin-bottom: 20px; border-radius: 8px; overflow: hidden; }
    .hero-image img { width: 100%; max-height: 400px; object-fit: cover; }
    .image-desc { background: #f0f4ff; border-left: 3px solid var(--primary); padding: 10px 14px; font-size: 13px; color: #4b5563; border-radius: 0 6px 6px 0; margin-top: 12px; }
    .items-list { list-style: none; margin-top: 12px; display: flex; flex-direction: column; gap: 10px; }
    .items-list li { display: flex; flex-direction: column; gap: 3px; padding: 12px 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
    .items-list li strong { font-size: 14px; font-weight: 600; color: #111827; }
    .items-list li span { font-size: 13px; color: #6b7280; line-height: 1.6; }
    .steps-list { margin-top: 12px; padding-left: 20px; display: flex; flex-direction: column; gap: 8px; }
    .steps-list li { font-size: 14px; color: #374151; line-height: 1.7; padding: 8px 12px; background: #f9fafb; border-radius: 6px; }
    .footer { padding: 20px 40px; text-align: center; font-size: 12px; color: #9ca3af; background: #f9fafb; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${project.company_name}</h1>
    <div class="meta">상세페이지 기획안 — AI 생성 초안</div>
  </div>
  <div class="tone-bar">
    <div><span>톤앤매너 &nbsp;</span><strong>${content.tone ?? '—'}</strong></div>
    <div><span>컬러 제안 &nbsp;</span><strong>${content.color_suggestion ?? '—'}</strong></div>
  </div>
  ${sectionsHtml}
  <div class="footer">DetailAI — AI 상세페이지 자동화 · 관리자 리터치 후 최종 납품</div>
</body>
</html>`
}
