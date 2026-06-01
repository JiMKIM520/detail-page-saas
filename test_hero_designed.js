const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const sharp = require('sharp');
const { execFileSync } = require('child_process');

const envContent = fs.readFileSync('.env.local', 'utf8');
const API_KEY = envContent.split('\n').find(l => l.startsWith('GEMINI_API_KEY=')).split('=')[1].trim();
const ai = new GoogleGenAI({ apiKey: API_KEY });

(async () => {
  // 스타일링샷 + 누끼컷 로드
  const styling = (await sharp('/tmp/shot1_closeup.png').resize(1200).jpeg({quality:85}).toBuffer()).toString('base64');
  const nuki = (await sharp('/Users/jinman/Downloads/상세페이지ai개발/쌀과밀(소금빵)/누끼_01.png').resize(1000).png().toBuffer()).toString('base64');
  // 레퍼런스 (송사부 소보로 — 디자인된 타이포 참고)
  const ref = (await sharp('/Users/jinman/Desktop/Projects/Product-Detail-Page-Automation/docs/references/식품/식품_13.jpg').resize(800).jpeg({quality:85}).toBuffer()).toString('base64');

  console.log('이미지 3개 로드 완료');

  const prompt = [
    'Create a Korean bakery product detail page HERO IMAGE.',
    '',
    'This is a single graphic design image (860px wide, 1200px tall) for a Korean ecommerce product page.',
    'It must look like it was designed by a professional Korean graphic designer — like the reference image style.',
    '',
    '[REFERENCE IMAGE 1] is a real Korean food product page design. Study its style:',
    '- How the Korean typography is DESIGNED (not just typed) — different sizes, bold strokes, shadow effects',
    '- How the product photo is composed with the background naturally',
    '- How color blocks and organic shapes create visual interest',
    '- The overall warm, premium, editorial feel',
    '',
    '[REFERENCE IMAGE 2] is our actual product styling photo (salt bread on wooden board).',
    '[REFERENCE IMAGE 3] is the product nuki cut (background removed).',
    '',
    'Design a hero image with these elements:',
    '',
    'BACKGROUND: Warm cream-to-amber gradient (#F5E6C8 to #C4813A). Organic curved shapes.',
    'Not flat — textured, layered, with depth.',
    '',
    'PRODUCT: Use the provided styling photo and nuki cut. Place the bread prominently.',
    'The bread should look like it belongs in the composition, not pasted on.',
    '',
    'KOREAN TYPOGRAPHY (this is the most important part):',
    '- Small brand text: 고메코나 베이커리 (top area, subtle)',
    '- Sub-headline: 천연발효종 앙버터소금빵 (medium, warm amber)',
    '- MAIN HEADLINE: 아빠가 딸에게 먹이는 빵 (HUGE, designed Korean text)',
    '- Second line: 그 마음 그대로 구웠습니다 (large)',
    '- The main headline must be GRAPHIC DESIGN — not just typed text.',
    '  Think of it like a movie poster title or Paris Baguette promotional poster.',
    '  Bold, impactful, with visual weight. Each character matters.',
    '',
    'TRUST BADGES: Small row at bottom — HACCP 인증 | 무첨가 | 당일발송',
    '',
    'STYLE: Korean premium food brand poster. Warm, trustworthy, artisan.',
    'Like the reference image quality — professional graphic design, not AI-generated feel.',
    'NOT a website. NOT a wireframe. A finished graphic design piece.',
  ].join('\n');

  console.log('Gemini Pro — 디자인된 히어로 생성 (4K)...');

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: [
      { text: prompt },
      { inlineData: { mimeType: 'image/jpeg', data: ref } },
      { inlineData: { mimeType: 'image/jpeg', data: styling } },
      { inlineData: { mimeType: 'image/png', data: nuki } },
    ],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: { imageSize: '4K' },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const buf = Buffer.from(part.inlineData.data, 'base64');
      fs.writeFileSync('/tmp/hero_designed_v1.png', buf);
      const meta = await sharp(buf).metadata();
      console.log('SUCCESS!', (buf.length/1024).toFixed(0), 'KB,', meta.width + 'x' + meta.height);
      execFileSync('open', ['/tmp/hero_designed_v1.png']);
      return;
    }
    if (part.text) console.log('Text:', part.text.substring(0, 200));
  }
  console.log('이미지 없음');
})().catch(e => console.error('ERROR:', e.message ? e.message.substring(0, 500) : String(e)));
