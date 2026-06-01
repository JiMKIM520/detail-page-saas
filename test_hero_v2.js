const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const sharp = require('sharp');
const { execFileSync } = require('child_process');

const envContent = fs.readFileSync('.env.local', 'utf8');
const API_KEY = envContent.split('\n').find(l => l.startsWith('GEMINI_API_KEY=')).split('=')[1].trim();
const ai = new GoogleGenAI({ apiKey: API_KEY });

(async () => {
  // 레퍼런스: 브레댄코 (가장 프로페셔널)
  const refBreadnco = (await sharp('/tmp/pinterest_refs/bakery_13.jpg').resize(900).jpeg({quality:90}).toBuffer()).toString('base64');
  // 레퍼런스: 유하픽 소금빵 포스터 (클린 한글 타이포)
  const refYuha = (await sharp('/tmp/pinterest_refs/bakery_9.jpg').resize(900).jpeg({quality:90}).toBuffer()).toString('base64');
  // 우리 스타일링샷
  const styling = (await sharp('/tmp/shot1_closeup.png').resize(1200).jpeg({quality:85}).toBuffer()).toString('base64');
  // 우리 누끼컷
  const nuki = (await sharp('/Users/jinman/Downloads/상세페이지ai개발/쌀과밀(소금빵)/누끼_01.png').resize(1000).png().toBuffer()).toString('base64');

  console.log('이미지 4개 로드 완료');

  const prompt = [
    'You are a senior Korean graphic designer at a top Seoul design agency.',
    'Create a HERO IMAGE for a Korean artisan bakery product detail page.',
    '',
    '== STYLE REFERENCES ==',
    '[Image 1] is a bread&co poster — study its professional composition:',
    '- Warm brown gradient background with natural texture',
    '- Products arranged on real wooden props (not floating)',
    '- Elegant mixed typography (English accent + Korean description)',
    '- Brand logo placed naturally at bottom-right',
    '- Overall: warm, premium, like a magazine food ad',
    '',
    '[Image 2] is a clean Korean bakery poster — study its typography:',
    '- Bold, designed Korean headline "소금빵" with brush-stroke energy',
    '- Clean hierarchy: sub-line → main headline → description → brand',
    '- White background with product as the star',
    '- Minimalist but impactful',
    '',
    '== PRODUCT IMAGES ==',
    '[Image 3] is our actual styling photo — use this as the hero product shot.',
    '[Image 4] is the product nuki cut — use for additional product placement.',
    '',
    '== DESIGN BRIEF ==',
    'Brand: 고메코나 베이커리 (Gomecona Bakery)',
    'Product: Artisan salt bread (앙버터소금빵)',
    'Dimensions: 860px wide × 1200px tall (9:16 vertical)',
    '',
    'BACKGROUND:',
    '- Warm, textured gradient — cream to soft amber (#F5E6C8 → #D4A574)',
    '- Subtle organic texture like craft paper or linen',
    '- NOT flat solid color — must have depth and warmth',
    '- Think bread&co poster background quality',
    '',
    'PRODUCT PLACEMENT:',
    '- Use the styling photo (Image 3) as the main visual — large, center-right',
    '- The bread should look natural and appetizing, not pasted on',
    '- Arrange like the bread&co poster — products on natural surfaces',
    '',
    'TYPOGRAPHY (MOST IMPORTANT):',
    '- Top area: "고메코나 베이커리" brand name (small, elegant)',
    '- Sub-line: "천연발효종 앙버터소금빵" (medium, warm amber, spaced)',
    '- MAIN HEADLINE: "아빠가 딸에게 먹이는 빵" (LARGE, bold Korean serif)',
    '- Second line: "그 마음 그대로 구웠습니다" (slightly smaller)',
    '- The headline must be DESIGNED like the 소금빵 poster — bold, impactful,',
    '  with visual weight. Not just typed text.',
    '- Bottom: "당일생산 · 당일판매" (small, warm gray)',
    '',
    'QUALITY STANDARD:',
    '- Must look like bread&co or Paris Baguette level design',
    '- Professional graphic design, not AI-generated feel',
    '- Warm, trustworthy, premium artisan brand',
    '- Every element intentionally placed — nothing random or generic',
    '- This is a finished commercial design piece, not a draft',
  ].join('\n');

  console.log('Gemini Pro — 레퍼런스 기반 히어로 v2 (4K)...');

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: [
      { text: prompt },
      { inlineData: { mimeType: 'image/jpeg', data: refBreadnco } },
      { inlineData: { mimeType: 'image/jpeg', data: refYuha } },
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
      fs.writeFileSync('/tmp/hero_v2_ref.png', buf);
      const meta = await sharp(buf).metadata();
      console.log('SUCCESS!', (buf.length/1024).toFixed(0), 'KB,', meta.width + 'x' + meta.height);
      execFileSync('open', ['/tmp/hero_v2_ref.png']);
      return;
    }
    if (part.text) console.log('Text:', part.text.substring(0, 200));
  }
  console.log('이미지 없음');
})().catch(e => console.error('ERROR:', e.message ? e.message.substring(0, 500) : String(e)));
