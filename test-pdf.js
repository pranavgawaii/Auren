const puppeteer = require('puppeteer-core');
const path = require('path');

async function testPdf() {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const page = await browser.newPage();
  await page.goto(`file://${path.resolve(__dirname, 'PitchDeck/pitch-deck.html')}`, { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    document.getElementById('nav-left').style.display = 'none';
    document.getElementById('nav-right').style.display = 'none';
  });

  await page.pdf({
    path: 'PitchDeck/native_test.pdf',
    width: 1920,
    height: 1080,
    printBackground: true
  });
  await browser.close();
  console.log("Done");
}
testPdf().catch(console.error);
