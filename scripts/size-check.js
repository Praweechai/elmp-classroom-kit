#!/usr/bin/env node
// NFR-C3: gzip size of everything the kit ships (dist/*.js + *.css), unminified upper bound.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const limitKb = Number(process.argv[2] || 60);
const files = [];
(function walk(dir) {
  fs.readdirSync(dir).forEach((name) => {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) { walk(full); } else if (/\.(js|css)$/.test(name)) { files.push(full); }
  });
}(path.join(__dirname, '..', 'dist')));

const kb = files.reduce((sum, f) => sum + zlib.gzipSync(fs.readFileSync(f)).length, 0) / 1024;
process.stdout.write(`kit dist: ${files.length} files, ${kb.toFixed(1)} kB gzip (limit ${limitKb} kB)\n`);
process.exit(kb <= limitKb ? 0 : 1);
