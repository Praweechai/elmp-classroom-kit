// One screenshot per story × width (1440 / 390 / 360) × language (EN / TH). Doc 08 §1, NFR-C5.
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const index = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'storybook-static', 'index.json'), 'utf8'));
const stories = Object.values(index.entries).filter((e) => e.type === 'story');
const WIDTHS = [1440, 1024, 390, 360]; // Plan 4 adds 1024 (collapsed sidebar), doc 07 definition of done

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

// Big screens (P5-6: at 1900 px the page sat on the left with an empty strip on the right).
// Any max-width box must be centred in its parent: spare room split evenly, never piled on one side.
[1920, 2560].forEach((width) => {
  stories.forEach((story) => {
    test(`${story.id} wide ${width}: no one-sided empty space`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: 'networkidle' });
      await page.locator('#storybook-root > *').first().waitFor();
      const lopsided = await page.evaluate(() => [...document.querySelectorAll('#storybook-root *')].filter((el) => {
        const cs = getComputedStyle(el);
        if (cs.maxWidth === 'none' || cs.display === 'none' || cs.position !== 'static') { return false; }
        const p = el.parentElement; const r = el.getBoundingClientRect(); const pr = p.getBoundingClientRect();
        const pcs = getComputedStyle(p);
        const inner = pr.width - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight);
        if (inner - r.width < 120 || (/flex/.test(pcs.display) && !/column/.test(pcs.flexDirection))) { return false; }
        if (r.width < 600) { return false; }
        const left = r.left - pr.left - parseFloat(pcs.paddingLeft);
        const right = pr.right - parseFloat(pcs.paddingRight) - r.right;
        return Math.abs(left - right) > 24;
      }).map((el) => `${el.tagName}.${el.className}`));
      expect(lopsided, 'wide boxes centred (no empty strip on one side)').toEqual([]);
    });
  });
});
