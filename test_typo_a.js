// 방법 A: Gemini로 한글 타이포만 따로 생성 → 배경에 합성
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const sharp = require('sharp');
const { execFileSync } = require('child_process');

const envContent = fs.readFileSync('.env.local', 'utf8');
const API_KEY = envContent.split('\n').find(l => l.startsWith('GEMINI_API_KEY=')).split('=')[1].trim();
const ai = new GoogleGenAI({ apiKey: API_KEY });

(async () => {
  console.log('=== 방법 A: 타이포 따로 생성 → 합성 ===');

  // Step 1: Gemini Pro로 한글 타이포만 생성
  const typoPrompt = [
    'Create ONLY Korean typography design on a pure white background.',
    'This will be overlaid on a bakery product photo, so the background must be PURE WHITE (#FFFFFF).',
    '',
    'Design the following Korean text as graphic design typography:',
    '',
    'Line 1 (small, top): 천연발효종 앙버터소금빵',
    '- Size: small, elegant, wide letter-spacing',
    '- Color: warm amber/brown (#C4813A)',
    '- Style: clean sans-serif',
    '',
    'Line 2 (MAIN, center): 아빠가 딸에게 먹이는 빵,',
    '- Size: VERY LARGE, bold, impactful',
    '- Color: dark brown (#3B2106)',
    '- Style: bold serif with visual weight, like a movie poster title',
    '- Each character should have graphic design quality',
    '',
    'Line 3 (large, below): 그 마음 그대로 구웠습니다',
    '- Size: large but smaller than line 2',
    '- Color: dark brown (#3B2106)',
    '- Style: serif, elegant',
    '',
    'Line 4 (small, bottom): 당일생산 · 당일판매 · 오늘 구운 빵만 보내드립니다',
    '- Size: small',
    '- Color: medium gray (#8B7364)',
    '',
    'CRITICAL RULES:',
    '- Background must be PURE WHITE — no gradients, no textures, no decorations',
    '- Only the text, nothing else',
    '- Typography should look DESIGNED — different sizes, weights create visual hierarchy',
    '- Think Korean food brand poster typography — professional, premium',
    '- Centered alignment',
    '- Image dimensions: approximately 860px wide x 500px tall',
  ].join('\n');

  console.log('타이포 생성 중...');
  const typoResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: [{ text: typoPrompt }],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: { imageSize: '4K' },
    },
  });

  let typoBuffer = null;
  for (const part of typoResponse.candidates[0].content.parts) {
    if (part.inlineData) {
      typoBuffer = Buffer.from(part.inlineData.data, 'base64');
      fs.writeFileSync('/tmp/typo_only.png', typoBuffer);
      const meta = await sharp(typoBuffer).metadata();
      console.log('타이포 생성:', (typoBuffer.length/1024).toFixed(0), 'KB,', meta.width + 'x' + meta.height);
    }
  }
  if (!typoBuffer) { console.log('타이포 생성 실패'); return; }

  // Step 2: 배경 이미지 로드 (이전에 만든 것)
  const bgBuffer = await sharp('/tmp/hero_bg_only.png')
    .resize(860, 1200, { fit: 'cover', position: 'center' })
    .toBuffer();

  // Step 3: 타이포를 리사이즈해서 하단에 합성
  const typoResized = await sharp(typoBuffer)
    .resize(760, null, { fit: 'inside' })
    .toBuffer();
  const typoMeta = await sharp(typoResized).metadata();

  // 하단 그라데이션 오버레이 생성
  const gradientSvg = `<svg width="860" height="1200">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
        <stop offset="45%" stop-color="rgba(0,0,0,0)"/>
        <stop offset="75%" stop-color="rgba(30,15,5,0.5)"/>
        <stop offset="100%" stop-color="rgba(30,15,5,0.85)"/>
      </linearGradient>
    </defs>
    <rect width="860" height="1200" fill="url(#g)"/>
  </svg>`;

  const final = await sharp(bgBuffer)
    .composite([
      { input: Buffer.from(gradientSvg), gravity: 'northwest' },
      {
        input: typoResized,
        left: Math.round((860 - typoMeta.width) / 2),
        top: Math.round(1200 - typoMeta.height - 80),
      },
    ])
    .png()
    .toBuffer();

  fs.writeFileSync('/tmp/hero_methodA.png', final);
  console.log('방법 A 완료:', (final.length/1024).toFixed(0), 'KB');
  execFileSync('open', ['/tmp/typo_only.png']);
  execFileSync('open', ['/tmp/hero_methodA.png']);
})().catch(e => console.error('ERROR:', e.message ? e.message.substring(0, 500) : String(e)));
