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
  shooting_requirements: {
    nukki_shots: string[]
    styling_shots: string[]
  }
  tone: string
  color_suggestion: string
}

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero',
  benefits: '핵심 장점',
  features: '상세 스펙',
  social_proof: '사회적 증거',
  comparison: '비교',
  how_to_use: '사용법',
  cta: 'CTA',
}

export function ScriptViewer({ content }: { content: ScriptContent }) {
  return (
    <div className="space-y-5">
      {content.sections.map((section, i) => (
        <div key={i} className="bg-surface rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-md uppercase tracking-wide">
              {SECTION_LABELS[section.type] || section.type}
            </span>
            <span className="text-xs text-text-tertiary">Section {i + 1}</span>
          </div>
          {section.title && (
            <h3 className="text-base font-bold text-text-primary">{section.title}</h3>
          )}
          {section.subtitle && (
            <p className="text-sm text-text-secondary mt-1">{section.subtitle}</p>
          )}
          {section.image_description && (
            <div className="mt-3 flex items-start gap-2 bg-primary-50 rounded-lg px-3 py-2.5">
              <svg className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              <p className="text-sm text-primary-700">{section.image_description}</p>
            </div>
          )}
          {section.items && section.items.length > 0 && (
            <div className="mt-3 space-y-2">
              {section.items.map((item, j) => (
                <div key={j} className="pl-3 border-l-2 border-primary-200">
                  <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                  <p className="text-sm text-text-secondary">{item.description}</p>
                </div>
              ))}
            </div>
          )}
          {section.steps && (
            <ol className="mt-3 space-y-1.5">
              {section.steps.map((step, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    {j + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          )}
        </div>
      ))}

      <div className="bg-primary-50 rounded-xl border border-primary-200 p-5">
        <h4 className="font-semibold text-primary-900 mb-4">촬영 요구사항</h4>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-semibold text-primary-800 mb-2">누끼 컷</p>
            <ul className="space-y-1.5">
              {content.shooting_requirements.nukki_shots.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-primary-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-primary-800 mb-2">스타일링 컷</p>
            <ul className="space-y-1.5">
              {content.shooting_requirements.styling_shots.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-primary-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-6 text-sm bg-surface rounded-xl border border-border p-4">
        <div>
          <span className="text-text-tertiary">톤앤매너</span>
          <p className="font-semibold text-text-primary mt-0.5">{content.tone}</p>
        </div>
        <div className="w-px bg-border" />
        <div>
          <span className="text-text-tertiary">컬러 제안</span>
          <p className="font-semibold text-text-primary mt-0.5">{content.color_suggestion}</p>
        </div>
      </div>
    </div>
  )
}
