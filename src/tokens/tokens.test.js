const fs = require('fs');
const path = require('path');

const { outputs } = require('../../scripts/build-tokens');
const tokens = require('./tokens');

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe('tokens', () => {
  it.each(tokens.contrastPairs)('%s on %s reaches %s:1 (WCAG AA)', (fg, bg, min) => {
    expect(contrast(tokens.color[fg], tokens.color[bg])).toBeGreaterThanOrEqual(min);
  });

  it('keeps the hospital green from Plan 1 as the only action colour', () => {
    expect(tokens.color.action).toBe('#03692A');
    expect(contrast(tokens.color.action, '#FFFFFF')).toBeGreaterThan(6.8); // 6.87:1, comfortably above AA 4.5:1
  });

  it.each(Object.keys(outputs))('generated %s is up to date (run npm run tokens)', (file) => {
    const current = fs.readFileSync(path.join(__dirname, '../..', file), 'utf8');
    expect(current).toBe(outputs[file]);
  });

  it('maps Paragon primary and brand to the action colour', () => {
    const css = outputs['src/tokens/paragon-theme.css'];
    expect(css).toContain('--pgn-color-primary-base: #03692A;');
    expect(css).toContain('--pgn-color-brand-base: #03692A;');
  });
});
