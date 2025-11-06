#!/usr/bin/env node
/**
 * Generate -sm / -md / -lg image variants for images in public/images/products
 * Usage: node scripts/generate-image-variants.js
 *
 * This script uses sharp (already listed as an optional dep). It is idempotent
 * and will skip generating a variant if the destination file already exists.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sizes = [
  { suffix: '-sm', width: 400 },
  { suffix: '-md', width: 800 },
  { suffix: '-lg', width: 1200 }
];

const productsDir = path.join(__dirname, '..', 'public', 'images', 'products');

async function processFile(file) {
  const src = path.join(productsDir, file);
  const parsed = path.parse(file);
  // skip already-variant files (e.g., name-sm.jpg)
  if (/-sm$|-md$|-lg$/i.test(parsed.name)) return null;
  if (!/\.(jpg|jpeg|png|webp)$/i.test(parsed.ext)) return null;

  const base = path.join(productsDir, parsed.name);
  const ext = parsed.ext;
  const results = [];

  for (const s of sizes) {
    const out = `${base}${s.suffix}${ext}`;
    if (fs.existsSync(out)) {
      results.push({ size: s.suffix, status: 'exists', out });
      continue;
    }
    try {
      await sharp(src).resize({ width: s.width }).toFile(out);
      results.push({ size: s.suffix, status: 'created', out });
    } catch (err) {
      results.push({ size: s.suffix, status: 'error', error: err.message });
    }
  }
  return { file, results };
}

async function run() {
  console.log('Scanning', productsDir);
  if (!fs.existsSync(productsDir)) {
    console.error('Directory does not exist:', productsDir);
    process.exit(1);
  }
  const files = fs.readdirSync(productsDir).filter(f => !f.startsWith('.'));
  let processed = 0;
  const report = [];
  for (const f of files) {
    const r = await processFile(f);
    if (r) { report.push(r); processed++; }
  }

  for (const r of report) {
    console.log('\nProcessed:', r.file);
    for (const s of r.results) {
      if (s.status === 'created') console.log(`  [CREATED] ${s.out}`);
      else if (s.status === 'exists') console.log(`  [SKIP] exists ${s.out}`);
      else console.log(`  [ERROR] ${s.size} ${s.error}`);
    }
  }

  console.log(`\nDone. Processed ${processed} source images.`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(2);
});
