// Kit 2.1 motion budget (doc 10 V-1.04, acceptance A-V20): with the CPU slowed 4× (a low-end phone), the page
// entrance and hover effects keep frames inside one 60 Hz frame. p95 frame time ≤ 17 ms (16.7 ms budget; the
// 0.3 ms is rAF timer jitter). Runs on GitHub Actions against the built Storybook, Chromium only.
const { test, expect } = require('@playwright/test');

test.use({ reducedMotion: 'no-preference' });

const STORIES = ['plan-5-my-learning--v-2', 'plan-5-progress--v-2', 'plan-5-grades--part-2'];
const P95_MS = 17;

const p95 = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(s.length * 0.95))];
};
const take = (page) => page.evaluate(() => { const f = window.elmpFrames.slice(1); window.elmpFrames = []; return f; });

STORIES.forEach((id) => {
  test(`${id}: entrance + hover p95 ≤ ${P95_MS} ms at 4× CPU`, async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'CPU throttling needs Chromium');
    // frame recorder from the first moment of the page: gaps between requestAnimationFrame callbacks
    await page.addInitScript(() => {
      window.elmpFrames = [];
      let last = performance.now();
      const tick = (now) => { window.elmpFrames.push(now - last); last = now; requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    // 1) page entrance: from the moment the story is on screen (script loading is not part of the animation)
    await page.goto(`/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'domcontentloaded' });
    await page.locator('#storybook-root .cls3-rise').first().waitFor();
    await take(page);
    await page.waitForTimeout(1500);
    const enter = await take(page);

    // 2) hover across tiles, cards, rows, requirement rows, hero
    const targets = page.locator('.cls3-tile, .cls3-course, .cls3-row, .cls3-req, .cls3-resume');
    const n = Math.min(await targets.count(), 10);
    for (let i = 0; i < n; i += 1) {
      await targets.nth(i).hover(); // eslint-disable-line no-await-in-loop
      await page.waitForTimeout(250); // eslint-disable-line no-await-in-loop
    }
    const hover = await take(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });

    const report = { enter: p95(enter).toFixed(1), hover: p95(hover).toFixed(1), frames: enter.length + hover.length };
    test.info().annotations.push({ type: 'frame p95 (ms)', description: JSON.stringify(report) });
    console.log(`${id} frame p95 ms`, report); // eslint-disable-line no-console
    expect(enter.length, 'frames recorded').toBeGreaterThan(30);
    expect(p95(enter), `entrance p95 ${report.enter} ms`).toBeLessThanOrEqual(P95_MS);
    expect(p95(hover), `hover p95 ${report.hover} ms`).toBeLessThanOrEqual(P95_MS);
  });
});
