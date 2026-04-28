#!/usr/bin/env node
/**
 * convert-to-webp.mjs
 *
 * Scans a folder for non-WebP images, converts them to WebP via ffmpeg,
 * then deletes the originals.
 *
 * Usage:
 *   node scripts/convert-to-webp.mjs [folder]
 *   pnpm convert:webp [folder]
 *
 * Defaults to C:/Users/Digital Alchemyst/Desktop/article if no folder is given.
 * Requires ffmpeg on PATH.
 */

import { readdirSync, existsSync, unlinkSync } from 'fs'
import { join, extname, basename } from 'path'
import { execSync } from 'child_process'

const CONVERTIBLE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.avif'])
const DEFAULT_FOLDER = 'C:/Users/Digital Alchemyst/Desktop/article'
const QUALITY = 90

const folder = process.argv[2] || DEFAULT_FOLDER

if (!existsSync(folder)) {
  console.error(`Folder not found: ${folder}`)
  process.exit(1)
}

// Verify ffmpeg is available
try {
  execSync('ffmpeg -version', { stdio: 'ignore' })
} catch {
  console.error('ffmpeg not found on PATH. Install it and try again.')
  process.exit(1)
}

const files = readdirSync(folder)
const targets = files.filter(f => CONVERTIBLE_EXTENSIONS.has(extname(f).toLowerCase()))

if (targets.length === 0) {
  console.log('No non-WebP images found — nothing to do.')
  process.exit(0)
}

console.log(`Found ${targets.length} file(s) to convert in: ${folder}\n`)

let converted = 0
let failed = 0

for (const file of targets) {
  const inputPath = join(folder, file)
  const outputName = basename(file, extname(file)) + '.webp'
  const outputPath = join(folder, outputName)

  process.stdout.write(`  Converting: ${file} → ${outputName} ... `)

  try {
    execSync(
      `ffmpeg -i "${inputPath}" -c:v libwebp -quality ${QUALITY} "${outputPath}" -y`,
      { stdio: 'ignore' }
    )

    if (!existsSync(outputPath)) {
      throw new Error('Output file was not created')
    }

    unlinkSync(inputPath)
    console.log('done')
    converted++
  } catch (err) {
    console.log(`FAILED (${err.message})`)
    failed++
  }
}

console.log(`\nDone. ${converted} converted, ${failed} failed.`)
if (failed > 0) process.exit(1)
