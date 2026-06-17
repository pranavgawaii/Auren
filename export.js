const puppeteer = require('puppeteer-core');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');

async function exportDeck() {
  console.log('Starting high-fidelity export...');

  // 1. Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1 // Dropped from 2 to 1. Massive 4K images trigger aggressive compression/blurring when imported into Google Slides. 1080p native bypasses this.
    }
  });

  const page = await browser.newPage();
  const filePath = `file://${path.resolve(__dirname, 'PitchDeck/v2.html')}`;
  
  console.log('Loading deck from:', filePath);
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  // 2. Inject CSS/JS to lock the layout strictly to 1920x1080 without responsive scaling
  await page.evaluate(() => {
    // Disable responsive scaling script
    window.removeEventListener('resize', adjustScale);
    
    // Hide navigation overlays
    const navLeft = document.getElementById('nav-left');
    const navRight = document.getElementById('nav-right');
    if (navLeft) navLeft.style.display = 'none';
    if (navRight) navRight.style.display = 'none';

    // Remove the scale transform to enforce native 1920x1080
    const deck = document.getElementById('deck-container');
    deck.style.transform = 'none';
    deck.style.boxShadow = 'none';
    deck.style.border = 'none';
    deck.style.margin = '0';
    deck.style.position = 'absolute';
    deck.style.top = '0';
    deck.style.left = '0';

    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.background = '#FFFFFF';
  });

  // Get total slides
  const slideCount = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log(`Found ${slideCount} slides. Capturing snapshots...`);

  const snapshots = [];

  for (let i = 0; i < slideCount; i++) {
    // Navigate to slide
    await page.evaluate((index) => {
      currentSlide = index; // Modifies the global variable directly
      updateSlides();
    }, i);

    // Wait for opacity transition (0.3s defined in CSS)
    await new Promise(r => setTimeout(r, 600));

    const buffer = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });

    snapshots.push(buffer);
    console.log(`Captured slide ${i + 1}/${slideCount}`);
  }

  // 3. Generate PDF natively via Puppeteer (Preserves clickable links and selectable text!)
  console.log('Generating Native PDF with clickable links...');
  // Force print media type to apply the @media print CSS
  await page.emulateMediaType('print');
  await page.pdf({
    path: path.join(__dirname, 'PitchDeck', 'Auren_Pitch_Deck.pdf'),
    width: 1920,
    height: 1080,
    printBackground: true
  });
  console.log('✅ Auren_Pitch_Deck.pdf created with clickable links.');
  
  await browser.close();

  // 4. Generate PPTX (Still uses screenshots for exact layout fidelity)
  console.log('Generating PPTX...');
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';

  for (let i = 0; i < snapshots.length; i++) {
    const slide = pres.addSlide();
    const tempFileName = `temp_slide_${i}.png`;
    fs.writeFileSync(tempFileName, snapshots[i]);
    
    slide.addImage({
      path: tempFileName,
      x: 0,
      y: 0,
      w: '100%',
      h: '100%'
    });
  }

  await pres.writeFile({ fileName: path.join(__dirname, 'PitchDeck', 'Auren_Pitch_Deck.pptx') });
  console.log('✅ Auren_Pitch_Deck.pptx created in PitchDeck folder.');

  // Cleanup temp files
  for (let i = 0; i < snapshots.length; i++) {
    fs.unlinkSync(`temp_slide_${i}.png`);
  }
}

exportDeck().catch(console.error);
