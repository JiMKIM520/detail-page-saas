/**
 * 섹션 이미지를 세로로 스택하여 PDF 렌더링용 HTML 생성
 * 기존 기획안 스타일 HTML은 제거됨 — Gemini가 섹션별 완성 이미지를 직접 생성
 */
export function buildImageStackHtml(
  sectionImages: Array<{ type: string; base64: string }>,
  canvasWidth: number = 860,
): string {
  const imgs = sectionImages.map(s =>
    `<img src="data:image/png;base64,${s.base64}" style="width:${canvasWidth}px;display:block;" />`
  ).join('\n')

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; }
    body { background: white; width: ${canvasWidth}px; }
    img { width: ${canvasWidth}px; display: block; }
  </style>
</head>
<body>
${imgs}
</body>
</html>`
}
