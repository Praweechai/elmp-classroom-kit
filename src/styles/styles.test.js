import fs from 'fs';
import path from 'path';

// Guard: the stylesheet must keep every component's rules (0.9.0 shipped a cut-off file).
describe('classroom.css', () => {
  const css = fs.readFileSync(path.join(__dirname, 'classroom.css'), 'utf8');

  it('has the rules of every kit part and balanced braces', () => {
    ['.cls-btn {', '.cls-header', '.cls-pill', '.cls-cert {', '.cls-outline__row', '.cls-drawer {', '.cls-hero {',
      '.cls-certprev', '.cls-finished {', '.cls-player-bar {',
      // Plan 4 kit 1.0
      '.cls-shell {', '.cls-side {', '.cls-topbar {', '.cls-dash {', '.cls-dcard {', '.cls-gauge {', '.cls-stat {', '.cls-banner {',
      '.cls-deadline {', '.cls-streak__week', '.cls-ctable {', '.cls-cstatus', '.cls-quiz {', '.cls-search {'].forEach((rule) => expect(css).toContain(rule));
    expect(css.split('{').length).toBe(css.split('}').length);
  });
});
