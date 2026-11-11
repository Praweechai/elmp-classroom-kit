#!/usr/bin/env node
// NFR-C3 / NFR-5d: gzip size of the kit as the apps ship it. Bundles exactly the exports the two forks import
// (scripts/fork-imports.json — keep it in step with the forks) from dist/, tree-shaken and minified like the apps'
// webpack production build; React, react-intl, prop-types, Paragon and frontend-platform are the apps' own.
// Also prints the old upper bound (every dist file, even views no fork uses any more) for comparison.
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const esbuild = require('esbuild');
const { minify } = require('terser');
const csso = require('csso');

const limitKb = Number(process.argv[2] || 100);
const dist = path.join(__dirname, '..', 'dist');
const imports = require('./fork-imports.json');

async function upperBound() {
  const files = [];
  (function walk(dir) {
    fs.readdirSync(dir).forEach((name) => {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) { walk(full); } else if (/\.(js|css)$/.test(name)) { files.push(full); }
    });
  }(dist));
  let min = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    // eslint-disable-next-line no-await-in-loop
    const out = f.endsWith('.js') ? (await minify(src, { module: true })).code : csso.minify(src).css;
    min += zlib.gzipSync(out).length;
  }
  return { files: files.length, kb: min / 1024 };
}

async function shipped() {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-size-'));
  const entry = path.join(out, 'entry.js');
  fs.writeFileSync(entry, `export { ${imports.join(', ')} } from ${JSON.stringify(path.join(dist, 'index.js'))};\n`);
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    minify: true,
    outdir: path.join(out, 'out'),
    loader: { '.js': 'jsx' },
    external: ['react', 'react-dom', 'react/*', 'react-intl', 'prop-types', '@openedx/*', '@edx/*'],
    logLevel: 'error',
  });
  const gz = (f) => (fs.existsSync(f) ? zlib.gzipSync(fs.readFileSync(f)).length : 0);
  const js = gz(path.join(out, 'out', 'entry.js'));
  const css = gz(path.join(out, 'out', 'entry.css'));
  fs.rmSync(out, { recursive: true, force: true });
  return { js: js / 1024, css: css / 1024, kb: (js + css) / 1024 };
}

(async () => {
  const s = await shipped();
  const u = await upperBound();
  process.stdout.write(
    `kit shipped to the forks: ${s.kb.toFixed(1)} kB gzip (JS ${s.js.toFixed(1)} + CSS ${s.css.toFixed(1)}), limit ${limitKb} kB\n`
    + `upper bound, all ${u.files} dist files: ${u.kb.toFixed(1)} kB (info only)\n`,
  );
  process.exit(s.kb <= limitKb ? 0 : 1);
})();
