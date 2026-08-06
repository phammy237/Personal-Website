const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  page.on('pageerror', e => console.log('PAGEERROR', e.message));

  // Involvements: check Roles tab separate from Overview/Media
  await page.goto('http://localhost:3000/involvements', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.click('text=View Details');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'C:/Users/phaml/AppData/Local/Temp/claude/C--Users-phaml-my-pham-website-Personal-Website/09bb146a-449e-4e8e-b609-c6f12694aea5/scratchpad/tabs-overview.png' });
  await page.click('button:has-text("roles")');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'C:/Users/phaml/AppData/Local/Temp/claude/C--Users-phaml-my-pham-website-Personal-Website/09bb146a-449e-4e8e-b609-c6f12694aea5/scratchpad/tabs-roles.png' });

  // Biography: Home pin slideshow
  await page.goto('http://localhost:3000/biography', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Begin in Vietnam")');
  await page.waitForTimeout(800);
  await page.click('[aria-label*="Stop 1"]');
  await page.waitForTimeout(500);
  const learnMoreBtn = page.locator('button:has-text("Learn")');
  await learnMoreBtn.first().click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/phaml/AppData/Local/Temp/claude/C--Users-phaml-my-pham-website-Personal-Website/09bb146a-449e-4e8e-b609-c6f12694aea5/scratchpad/home-slideshow.png' });
  await page.click('button[aria-label="Next photo"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'C:/Users/phaml/AppData/Local/Temp/claude/C--Users-phaml-my-pham-website-Personal-Website/09bb146a-449e-4e8e-b609-c6f12694aea5/scratchpad/home-slideshow2.png' });

  await browser.close();
})();
