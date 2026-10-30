import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
const source =
  process.env.COMWIT_COURSE_SOURCE ||
  fileURLToPath(new URL('../../../templates/course/', import.meta.url))
const reference = JSON.parse(readFileSync(join(source, 'docs/course-reference.json'), 'utf8'))
const hash = (p) => createHash('sha256').update(readFileSync(p)).digest('hex')
for (const [file, digest] of Object.entries(reference.schemaFiles))
  if (hash(join(source, file)) !== digest) throw new Error('Stale course schema export: ' + file)
const out = fileURLToPath(new URL('../public/template/course/', import.meta.url))
mkdirSync(out, { recursive: true })
const expected = new Set()
const adminDir = join(source, 'docs/screenshots')
const admin = JSON.parse(readFileSync(join(adminDir, 'manifest.json'), 'utf8'))
for (const screen of admin) {
  if (screen.file.includes('/') || hash(join(adminDir, screen.file)) !== screen.sha256)
    throw new Error('Invalid admin screenshot')
  copyFileSync(join(adminDir, screen.file), join(out, screen.file))
  expected.add(screen.file)
}
// Example site captures are docs-only; the course branch ships no example catalog.
const galleryDir = fileURLToPath(new URL('../assets/course-gallery/', import.meta.url))
const gallery = JSON.parse(readFileSync(join(galleryDir, 'captures.json'), 'utf8'))
for (const brand of gallery.brands)
  for (const screen of brand.screens) {
    if (
      !/^[a-z0-9-]+\.webp$/.test(screen.file) ||
      new URL(screen.url).origin !== new URL(brand.url).origin ||
      hash(join(galleryDir, screen.file)) !== screen.sha256
    )
      throw new Error('Invalid gallery screenshot: ' + screen.file)
    copyFileSync(join(galleryDir, screen.file), join(out, screen.file))
    expected.add(screen.file)
  }
copyFileSync(join(galleryDir, 'captures.json'), join(out, 'gallery.json'))
expected.add('gallery.json')
for (const file of readdirSync(out)) if (!expected.has(file)) rmSync(join(out, file))
writeFileSync(
  new URL('../lib/course-reference.json', import.meta.url),
  JSON.stringify(
    {
      ...reference,
      admin,
      sourceCommit: execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], {
        encoding: 'utf8',
      }).trim(),
    },
    null,
    2
  ) + '\n'
)
console.log(
  `Course docs generated: ${reference.tables.length} tables, ${gallery.brands.length} examples, ${admin.length} admin screenshots.`
)
