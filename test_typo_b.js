// 방법 B: Gemini에게 배경 이미지를 보여주고 "여기에 어울리는 타이포 포함 완성본" 요청
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const sharp = require('sharp');
const { execFileSync } = require('child_process');

const envContent = fs.readFileSync('.env.local', 'utf8');
const API_KEY = envContent.split('\n').find(l => l.startsWith('GEMINI_API_KEY=')).split('=')[1].trim();
const ai = new GoogleGenAI({ apiKey: API_KEY });

(async () => {
  console.log('=== 방법 B: 배경에 타이포 추가 요청 ===');

  // 이전에 만든 배경+제품 이미지 로드
  const bgImage = (await sharp('/tmp/hero_bg_only.png').resize(1200).jpeg({quality:90}).toBuffer()).toString('base64');
  // 레퍼런스 (파리바게뜨급 타이포 스타일 참고)
  const refBreadnco = (await sharp('/tmp/pinterest_refs/bakery_13.jpg').resize(800).jpeg({quality:85}).toBuffer()).toString('base64');

  const prompt = [
    'You are a Korean typography and graphic design expert.',
    '',
    '[Image 1] is a bakery product hero image WITHOUT any text. This is the background.',
    '[Image 2] is a reference for the style of typography I want — study how bread&co uses elegant, professional Korean + English mixed typography.',
    '',
    'Add professional Korean typography to Image 1 to create a finished product detail page hero.',
    '',
    'TYPOGRAPHY TO ADD:',
    '',
    'TOP AREA (upper portion of image):',
    '- Brand: "고메코나 베이커리" — small, elegant, white or cream, with subtle letter-spacing',
    '',
    'BOTTOM AREA (lower portion, on the darker gradient area):',
    '- Sub-label: "천연발효종 앙버터소금빵" — small, warm amber, wide letter-spacing, uppercase feel',
    '- Main headline: "아빠가 딸에게 먹이는 빵," — HUGE, bold, white, impactful serif',
    '- Second line: "그 마음 그대로 구웠습니다" — large, white, elegant serif',
    '- Supporting: "당일생산 · 당일판매 · 오늘 구운 빵만 보내드립니다" — small, light gray',
    '- Trust badges row: HACCP 인증 | 무첨가 | 당일발송 — small rounded badges',
    '',
    'TYPOGRAPHY STYLE RULES:',
    '- The main headline must be GRAPHIC DESIGN quality — not just typed text',
    '- Beautiful Korean serif font with proper weight and spacing',
    '- Text should integrate naturally with the image — proper shadows, contrast',
    '- The text layout should feel like a premium Korean food advertisement',
    '- Study the bread&co reference for the level of typography quality expected',
    '',
    'CRITICAL:',
    '- Keep the original background image EXACTLY as is — only ADD typography on top',
    '- Do not change or regenerate the product photos or background',
    '- The result should look like a professional designer added text to this photo',
    '- Make the Korean text BEAUTIFUL — this is the most important requirement',
  ].join('\n');

  console.log('Gemini Pro — 배경에 타이포 추가...');

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: [
      { text: prompt },
      { inlineData: { mimeType: 'image/jpeg', data: bgImage } },
      { inlineData: { mimeType: 'image/jpeg', data: refBreadnco } },
    ],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: { imageSize: '4K' },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const buf = Buffer.from(part.inlineData.data, 'base64');
      fs.writeFileSync('/tmp/hero_methodB.png', buf);
      const meta = await sharp(buf).metadata();
      console.log('방법 B 완료:', (buf.length/1024).toFixed(0), 'KB,', meta.width + 'x' + meta.height);
      execFileSync('open', ['/tmp/hero_methodB.png']);
      return;
    }
    if (part.text) console.log('Text:', part.text.substring(0, 200));
  }
  console.log('이미지 없음');
})().catch(e => console.error('ERROR:', e.message ? e.message.substring(0, 500) : String(e)));
