#!/usr/bin/env node
// NFR-C3: gzip size of everything the kit ships (dist/*.js + *.css), measured minified like the apps' webpack
// production build ships it (terser for JS, csso for CSS). Upper bound: the apps tree-shake unused views on top.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { minify } = require('terser');
const csso = require('csso');

const limitKb = Number(process.argv[2] || 60);
const files = [];
(function walk(dir) {
  fs.readdirSync(dir).forEach((name) => {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) { walk(full); } else if (/\.(js|css)$/.test(name)) { files.push(full); }
  });
}(path.join(__dirname, '..', 'dist')));

(async () => {
  let raw = 0;
  let min = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    // eslint-disable-next-line no-await-in-loop
    const out = f.endsWith('.js') ? (await minify(src, { module: true })).code : csso.minify(src).css;
    raw += zlib.gzipSync(src).length;
    min += zlib.gzipSync(out).length;
  }
  const kb = min / 1024;
  process.stdout.write(`kit dist: ${files.length} files, ${kb.toFixed(1)} kB gzip minified (${(raw / 1024).toFixed(1)} kB unminified), limit ${limitKb} kB\n`);
  process.exit(kb <= limitKb ? 0 : 1);
})();
