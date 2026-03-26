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

export function ScriptViewer({ content }: { content: ScriptContent }) {
  return (
    <div className="space-y-6">
      {content.sections.map((section, i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-4">
          <span className="text-xs font-mono text-gray-400 uppercase">{section.type}</span>
          {section.title && <h3 className="font-semibold text-gray-900 mt-1">{section.title}</h3>}
          {section.subtitle && <p className="text-gray-600 text-sm">{section.subtitle}</p>}
          {section.image_description && (
            <p className="text-blue-600 text-sm mt-2">📷 {section.image_description}</p>
          )}
          {section.items?.map((item, j) => (
            <div key={j} className="mt-2 pl-3 border-l-2 border-gray-200">
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-gray-500 text-sm">{item.description}</p>
            </div>
          ))}
          {section.steps && (
            <ol className="mt-2 list-decimal list-inside space-y-1 text-sm text-gray-700">
              {section.steps.map((step, j) => <li key={j}>{step}</li>)}
            </ol>
          )}
        </div>
      ))}

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">촬영 요구사항</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-blue-700">누끼 컷</p>
            <ul className="mt-1 space-y-1 text-blue-600">
              {content.shooting_requirements.nukki_shots.map((s, i) => <li key={i}>· {s}</li>)}
            </ul>
          </div>
          <div>
            <p className="font-medium text-blue-700">스타일링 컷</p>
            <ul className="mt-1 space-y-1 text-blue-600">
              {content.shooting_requirements.styling_shots.map((s, i) => <li key={i}>· {s}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-4 text-sm text-gray-600">
        <span>톤앤매너: <strong>{content.tone}</strong></span>
        <span>컬러 제안: <strong>{content.color_suggestion}</strong></span>
      </div>
    </div>
  )
}
