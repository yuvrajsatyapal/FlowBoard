/**
 * generate-og.mjs
 *
 * Converts public/og-image.svg → public/og-image.png (1200×630).
 *
 * Uses @resvg/resvg-js which:
 *  - Ships pre-built native binaries (Linux x64, macOS arm64/x64, Windows)
 *  - Bundles its own SVG renderer — no system librsvg dependency
 *  - Works in Vercel's Amazon Linux build environment out of the box
 *
 * Run:  node scripts/generate-og.mjs
 * Auto: Called by the `build` npm script before vite build.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'public', 'og-image.svg')
const pngPath = join(root, 'public', 'og-image.png')

if (!existsSync(svgPath)) {
  console.error('[generate-og] public/og-image.svg not found — skipping.')
  process.exit(0)
}

const { Resvg } = await import('@resvg/resvg-js')

const svg = readFileSync(svgPath, 'utf-8')

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  // Embed a subset of fonts for text rendering in CI environments.
  // The SVG uses Arial/Helvetica/sans-serif; resvg will substitute with
  // its bundled font when system fonts are unavailable (e.g. Vercel Linux).
  font: {
    loadSystemFonts: true,
    defaultFontFamily: 'Arial',
  },
})

const rendered = resvg.render()
const pngBuffer = rendered.asPng()

writeFileSync(pngPath, pngBuffer)

const kb = (pngBuffer.length / 1024).toFixed(1)
console.log(`[generate-og] ✓ public/og-image.png — ${kb} kB (1200×630)`)
