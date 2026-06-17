/**
 * 아이콘 시트 — 등록된 모든 라인 아이콘을 한 장에 렌더해 시각 검증.
 * 실행: node_modules/.bin/tsx scripts/blocks-icon-sheet.ts → /tmp/spike/icon-sheet.html
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { getIcon, ICON_NAMES } from '../agents/templates/blocks/shared'

const cells = ICON_NAMES.map(
  (name) => `
  <div class="cell">
    <span class="ico">${getIcon(name)}</span>
    <span class="lab">${name}</span>
  </div>`,
).join('')

const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><style>
  body{margin:0;background:#F3F5FF;font-family:'Pretendard',sans-serif;padding:40px}
  h1{font-size:20px;color:#1B1B2E;margin:0 0 24px}
  .grid{display:grid;grid-template-columns:repeat(6,1fr);gap:20px;max-width:900px}
  .cell{background:#fff;border:1px solid #DDE4FF;border-radius:16px;padding:18px 10px;text-align:center;box-shadow:0 8px 20px rgba(0,0,0,.05)}
  .ico{display:grid;place-items:center;width:48px;height:48px;margin:0 auto;color:#5874D7}
  .ico svg{width:34px;height:34px}
  .lab{display:block;margin-top:10px;font-size:13px;color:#33344F}
</style></head><body>
  <h1>Block Icons — ${ICON_NAMES.length}종 (color=accent)</h1>
  <div class="grid">${cells}</div>
</body></html>`

mkdirSync('/tmp/spike', { recursive: true })
writeFileSync('/tmp/spike/icon-sheet.html', html)
console.log(`아이콘 ${ICON_NAMES.length}종 → /tmp/spike/icon-sheet.html`)
console.log('icons:', ICON_NAMES.join(', '))
