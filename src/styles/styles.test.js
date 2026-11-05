import fs from 'fs';
import path from 'path';

// Guard: the stylesheet must keep every component's rules (0.9.0 shipped a cut-off file).
describe('classroom.css', () => {
  const css = fs.readFileSync(path.join(__dirname, 'classroom.css'), 'utf8');

  it('has the rules of every kit part and balanced braces', () => {
    ['.cls-btn {', '.cls-header', '.cls-pill', '.cls-cert {', '.cls-outline__row', '.cls-drawer {', '.cls-hero {',
      '.cls-certprev', '.cls-finished {', '.cls-player-bar {'].forEach((rule) => expect(css).toContain(rule));
    expect(css.split('{').length).toBe(css.split('}').length);
  });
});
