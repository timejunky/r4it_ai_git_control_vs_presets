/**
 * Export repaired AKC chrome palettes into this catalog (no indent keys, no gzip).
 *
 * Primary origin is presets/*.json. After `npx tsc -p .` in vsextension, compiled
 * PRESETS overlay matching ids (part3–part5 indent-stripped).
 *
 *   node ./tools/export_from_akc.cjs
 */
const fs = require('fs');
const path = require('path');

const ORIGIN_REPO = 'https://github.com/timejunky/r4it_ai_git_control_vs_presets';
const AKC_PRESETS = path.resolve(__dirname, '../../r4it_ai_keep_clean_vs/vsextension/out/webview/presets.js');
const AKC_MEDIA = path.resolve(__dirname, '../../r4it_ai_keep_clean_vs/vsextension/media/akc-preset-catalog.json');
const OUT_DIR = path.resolve(__dirname, '../presets');
const CATALOG_PATH = path.resolve(__dirname, '../catalog.json');
const INDEX_PATH = path.resolve(__dirname, '../index.json');

function slugFile(id) {
  const s = String(id || 'preset')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return s || 'preset';
}

function chromeColors(colors) {
  const out = {};
  for (const [key, value] of Object.entries(colors || {})) {
    if (key.startsWith('editorIndentGuide.') || key.startsWith('editorBracketHighlight.')) continue;
    if (typeof value === 'string' && value.trim()) out[key] = value.trim();
  }
  return out;
}

function toCatalogEntry(preset, file) {
  const id = String(preset.id || '').trim();
  const category = preset.category === 'dark' ? 'dark' : 'standard';
  return {
    id,
    name: String(preset.title || preset.name || id),
    title: String(preset.title || preset.name || id),
    type: category === 'dark' ? 'dark' : 'light',
    description: String(preset.description || ''),
    category,
    sourceKind: 'akc-catalog',
    sourceOrigin: `${ORIGIN_REPO}/blob/main/presets/${file}`,
    colors: chromeColors(preset.colors),
  };
}

function loadExistingFiles() {
  const byId = new Map();
  if (!fs.existsSync(OUT_DIR)) return byId;
  for (const name of fs.readdirSync(OUT_DIR)) {
    if (!name.endsWith('.json')) continue;
    try {
      const rec = JSON.parse(fs.readFileSync(path.join(OUT_DIR, name), 'utf8'));
      const id = String(rec.id || '').trim();
      if (id) byId.set(id, rec);
    } catch {
      // skip broken files
    }
  }
  return byId;
}

function overlayCompiledAkc(byId) {
  if (!fs.existsSync(AKC_PRESETS)) {
    console.warn('AKC compile missing; keeping existing presets/*.json. Run npx tsc -p . in vsextension to overlay part3–part5.');
    return;
  }
  const { PRESETS } = require(AKC_PRESETS);
  if (!Array.isArray(PRESETS)) return;
  for (const preset of PRESETS) {
    const id = String(preset.id || '').trim();
    if (!id) continue;
    const file = `${slugFile(id)}.json`;
    const next = toCatalogEntry(preset, file);
    const prev = byId.get(id);
    byId.set(id, prev ? { ...prev, ...next, colors: { ...(prev.colors || {}), ...next.colors } } : next);
  }
}

function main() {
  const byId = loadExistingFiles();
  overlayCompiledAkc(byId);
  if (byId.size === 0) {
    console.error('No presets to export');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const name of fs.readdirSync(OUT_DIR)) {
    if (name.endsWith('.json')) fs.unlinkSync(path.join(OUT_DIR, name));
  }

  const files = [];
  const presets = [];
  for (const rec of [...byId.values()].sort((a, b) => String(a.id).localeCompare(String(b.id)))) {
    const file = `${slugFile(rec.id)}.json`;
    const body = toCatalogEntry(rec, file);
    fs.writeFileSync(path.join(OUT_DIR, file), `${JSON.stringify(body, null, 2)}\n`, 'utf8');
    files.push({ id: body.id, file, category: body.category });
    presets.push(body);
  }

  const catalog = {
    schemaVersion: 1,
    source: ORIGIN_REPO,
    license: 'copyright-all-rights-reserved',
    generatedAt: new Date().toISOString(),
    count: presets.length,
    presets,
  };
  const catalogText = `${JSON.stringify(catalog, null, 2)}\n`;
  fs.writeFileSync(CATALOG_PATH, catalogText, 'utf8');
  fs.writeFileSync(
    INDEX_PATH,
    `${JSON.stringify({ schemaVersion: 1, source: ORIGIN_REPO, count: files.length, files }, null, 2)}\n`,
    'utf8'
  );
  fs.mkdirSync(path.dirname(AKC_MEDIA), { recursive: true });
  fs.writeFileSync(AKC_MEDIA, catalogText, 'utf8');
  console.log(`Wrote ${presets.length} files to presets/, catalog.json, index.json, and AKC media fallback`);
}

main();
