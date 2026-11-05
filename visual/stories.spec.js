// One screenshot per story × width (1440 / 390 / 360) × language (EN / TH). Doc 08 §1, NFR-C5.
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const index = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'storybook-static', 'index.json'), 'utf8'));
const stories = Object.values(index.entries).filter((e) => e.type === 'story');
const WIDTHS = [1440, 390, 360];

stories.forEach((story) => {
  WIDTHS.forEach((width) => {
    ['en', 'th'].forEach((locale) => {
      test(`${story.id} ${locale} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/iframe.html?id=${story.id}&viewMode=story&globals=locale:${locale}`, { waitUntil: 'networkidle' });
        await page.locator('#storybook-root > *').first().waitFor();
        // Load every web-font weight before the shot; fonts.ready alone can resolve early (flaky text widths).
        await page.evaluate(async () => {
          const faces = ['Inter', 'IBM Plex Sans Thai'].flatMap((f) => [400, 500, 600, 700].map((w) => `${w} 16px "${f}"`));
          await Promise.all(faces.map((f) => document.fonts.load(f, 'Aa ก')));
          await document.fonts.ready;
        });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, 'no horizontal scroll (NFR-C5)').toBeLessThanOrEqual(0);
        await expect(page).toHaveScreenshot(`${story.id}--${locale}-${width}.png`, { fullPage: true });
      });
    });
  });
});
