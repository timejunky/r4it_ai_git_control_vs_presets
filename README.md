# AKC preset catalog

GitHub: [timejunky/r4it_ai_git_control_vs_presets](https://github.com/timejunky/r4it_ai_git_control_vs_presets)

Public repository. **Copyright, all rights reserved** — not MIT. See [LICENSE](LICENSE).

This is the **origin** for AKC workspace chrome palettes. AI Keep Clean loads **`catalog.json`** from GitHub (one file, not a zip). It still **repairs on load** (Settings card `editorWidget.*`, input, title, buttons, …). Indent-guide palettes are not published here; matching builtin ids keep indent keys from the extension.

## Public ≠ free to copy as a product

Anyone can open the files. That does not license a competing theme pack. The collection, titles, and JSON are copyrighted. Hand-copying a hex into your own editor is a different, limited fact; republishing this catalog is not allowed.

Tinted/base24 stays a third-party dump.

## What AKC does on load

sanitize → augment → compensate → validate → targeted repair

Contrast SSOT lives in the extension. Re-load after an AKC update picks up new pairs.

## Files AKC fetches

1. **`catalog.json`** — single index (`schemaVersion`, `presets[]`). This is the loader path.
2. **`presets/<id>.json`** — one file per palette (Contents API fallback).
3. **`index.json`** — file list only.

## File format

```json
{
  "id": "flower-meadow-light",
  "name": "Flower Meadow",
  "title": "Flower Meadow",
  "type": "light",
  "description": "…",
  "category": "standard",
  "sourceKind": "akc-catalog",
  "sourceOrigin": "https://github.com/timejunky/r4it_ai_git_control_vs_presets/blob/main/presets/flower-meadow-light.json",
  "colors": {
    "editor.background": "#f4faf4",
    "editorWidget.background": "#eaf4ea",
    "editorWidget.foreground": "#1a2a1a"
  }
}
```

Local AKC array export (`[{ id, title, colors }]`) is a different document (Import in the UI). No zip.

Regenerate after palette edits (and `npx tsc -p .` in `vsextension` if part3–part5 changed):

```text
node tools/export_from_akc.cjs
```

That writes `presets/*.json`, `catalog.json`, `index.json`, and copies `catalog.json` to AKC `media/akc-preset-catalog.json` (offline fallback). Gzip in the extension is not used.

## Layout

```
catalog.json
index.json
presets/<preset-id>.json
```
