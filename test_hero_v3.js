const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const sharp = require('sharp');
const { execFileSync } = require('child_process');
const pw = require('playwright-core');

const envContent = fs.readFileSync('.env.local', 'utf8');
const API_KEY = envContent.split('\n').find(l => l.startsWith('GEMINI_API_KEY=')).split('=')[1].trim();
const ai = new GoogleGenAI({ apiKey: API_KEY });

(async () => {
  // === STEP 1: Gemini Pro → 배경+제품 이미지 (텍스트 없이) ===
  console.log('=== Step 1: 배경+제품 이미지 생성 (텍스트 없음) ===');

  const refBreadnco = (await sharp('/tmp/pinterest_refs/bakery_13.jpg').resize(900).jpeg({quality:90}).toBuffer()).toString('base64');
  const styling = (await sharp('/tmp/shot1_closeup.png').resize(1200).jpeg({quality:85}).toBuffer()).toString('base64');
  const nuki = (await sharp('/Users/jinman/Downloads/상세페이지ai개발/쌀과밀(소금빵)/누끼_01.png').resize(1000).png().toBuffer()).toString('base64');

  const bgPrompt = [
    'Create a background image for a Korean premium bakery product detail page hero section.',
    '',
    '[Image 1] Reference: bread&co poster style — study the warm background, product arrangement, overall premium feel.',
    '[Image 2] Our product styling photo — use this as the main product visual.',
    '[Image 3] Product nuki cut — can be used for additional placement.',
    '',
    'REQUIREMENTS:',
    '- Dimensions: 860px wide x 1200px tall',
    '- Warm, textured background: cream-to-amber gradient with craft paper feel',
    '- Product bread arranged naturally on wooden surface/board (like the reference)',
    '- Premium bakery atmosphere — warm lighting, natural props',
    '- Leave TOP 25% relatively clean for brand text overlay',
    '- Leave BOTTOM 40% with darker/gradient area for headline overlay',
    '',
    'CRITICAL: DO NOT include any text, letters, words, or typography in this image.',
    'No Korean text, no English text, no brand names, no labels.',
    'This is ONLY the visual/photo layer. Text will be added separately.',
  ].join('\n');

  const bgResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: [
      { text: bgPrompt },
      { inlineData: { mimeType: 'image/jpeg', data: refBreadnco } },
      { inlineData: { mimeType: 'image/jpeg', data: styling } },
      { inlineData: { mimeType: 'image/png', data: nuki } },
    ],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: { imageSize: '4K' },
    },
  });

  let bgBuffer = null;
  for (const part of bgResponse.candidates[0].content.parts) {
    if (part.inlineData) {
      bgBuffer = Buffer.from(part.inlineData.data, 'base64');
      fs.writeFileSync('/tmp/hero_bg_only.png', bgBuffer);
      const meta = await sharp(bgBuffer).metadata();
      console.log('배경 생성 완료:', (bgBuffer.length/1024).toFixed(0), 'KB,', meta.width + 'x' + meta.height);
    }
  }
  if (!bgBuffer) { console.log('배경 생성 실패'); return; }

  // === STEP 2: 배경을 860px로 리사이즈 ===
  const bgResized = await sharp(bgBuffer)
    .resize(860, 1200, { fit: 'cover', position: 'center' })
    .toBuffer();
  const bgBase64 = bgResized.toString('base64');

  // === STEP 3: HTML/CSS로 디자인된 타이포 오버레이 ===
  console.log('=== Step 2: CSS 디자인 타이포 오버레이 ===');

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=860">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSans.css">
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 860px;
    height: 1200px;
    overflow: hidden;
    position: relative;
    font-family: 'Pretendard', sans-serif;
  }

  .bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  .bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* 하단 그라데이션 강화 */
  .gradient-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: linear-gradient(
      to bottom,
      rgba(0,0,0,0) 0%,
      rgba(0,0,0,0) 40%,
      rgba(30,15,5,0.4) 65%,
      rgba(30,15,5,0.75) 85%,
      rgba(30,15,5,0.9) 100%
    );
  }

  /* 상단 브랜드 */
  .brand {
    position: absolute;
    top: 36px;
    left: 48px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .brand-dot {
    width: 8px;
    height: 8px;
    background: #C4813A;
    border-radius: 50%;
  }
  .brand-name {
    font-family: 'Noto Serif KR', serif;
    font-size: 14px;
    font-weight: 400;
    color: rgba(255,255,255,0.75);
    letter-spacing: 4px;
  }

  /* 헤드라인 영역 */
  .headline-area {
    position: absolute;
    bottom: 80px;
    left: 48px;
    right: 48px;
    z-index: 10;
  }

  .sub-label {
    font-family: 'Pretendard', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #E8A85C;
    letter-spacing: 6px;
    text-transform: uppercase;
    margin-bottom: 20px;
  }

  .main-title {
    font-family: 'Noto Serif KR', serif;
    font-size: 52px;
    font-weight: 900;
    color: #FFFFFF;
    line-height: 1.25;
    margin-bottom: 8px;
    text-shadow: 0 2px 30px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3);
  }
  .main-title .accent {
    color: #F0C78A;
  }

  .sub-title {
    font-family: 'Noto Serif KR', serif;
    font-size: 36px;
    font-weight: 700;
    color: rgba(255,255,255,0.9);
    line-height: 1.35;
    text-shadow: 0 2px 20px rgba(0,0,0,0.3);
    margin-bottom: 24px;
  }

  .divider {
    width: 40px;
    height: 2px;
    background: #C4813A;
    margin-bottom: 20px;
  }

  .desc {
    font-family: 'Pretendard', sans-serif;
    font-size: 15px;
    font-weight: 400;
    color: rgba(255,255,255,0.7);
    letter-spacing: 0.5px;
    margin-bottom: 24px;
  }

  .badges {
    display: flex;
    gap: 10px;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.12);
    padding: 7px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255,255,255,0.85);
    letter-spacing: 0.3px;
  }
</style>
</head>
<body>
  <div class="bg">
    <img src="data:image/png;base64,${bgBase64}" alt="">
  </div>
  <div class="gradient-overlay"></div>

  <div class="brand">
    <div class="brand-dot"></div>
    <span class="brand-name">고메코나 베이커리</span>
  </div>

  <div class="headline-area">
    <div class="sub-label">천연발효종 앙버터소금빵</div>
    <h1 class="main-title">
      <span class="accent">아빠</span>가 딸에게<br>먹이는 빵,
    </h1>
    <h2 class="sub-title">그 마음 그대로<br>구웠습니다</h2>
    <div class="divider"></div>
    <p class="desc">당일생산 · 당일판매 · 오늘 구운 빵만 보내드립니다</p>
    <div class="badges">
      <span class="badge">🏭 HACCP 인증</span>
      <span class="badge">🚫 무첨가</span>
      <span class="badge">📦 당일발송</span>
      <span class="badge">⭐ 4.9점</span>
    </div>
  </div>
</body>
</html>`;

  // === STEP 3: Playwright 캡처 (2x 레티나) ===
  console.log('=== Step 3: Playwright 캡처 ===');
  const browser = await pw.chromium.launch({ headless: true });
  const context = await browser.newContext({
    deviceScaleFactor: 2,
    viewport: { width: 860, height: 1200 }
  });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const finalBuf = await page.screenshot({ type: 'png' });
  fs.writeFileSync('/tmp/hero_v3_final.png', finalBuf);
  await browser.close();

  const finalMeta = await sharp(finalBuf).metadata();
  console.log('최종 히어로:', (finalBuf.length/1024).toFixed(0), 'KB,', finalMeta.width + 'x' + finalMeta.height);

  // 두 이미지 모두 열기
  execFileSync('open', ['/tmp/hero_bg_only.png']);
  execFileSync('open', ['/tmp/hero_v3_final.png']);
  console.log('완료! 배경 + 최종 히어로 열림');
})().catch(e => console.error('ERROR:', e.message ? e.message.substring(0, 500) : String(e)));
