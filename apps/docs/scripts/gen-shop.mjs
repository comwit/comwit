import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
  readdirSync,
  rmSync,
  existsSync,
} from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
const source =
  process.env.COMWIT_SHOP_SOURCE ||
  fileURLToPath(new URL('../../../templates/shop/', import.meta.url))
const assets = join(source, '.agents/skills/shop-setup/assets')
const catalog = JSON.parse(readFileSync(join(assets, 'catalog.json'), 'utf8'))
const schema = JSON.parse(readFileSync(join(source, 'docs/shop-reference.json'), 'utf8'))
const hash = (p) => createHash('sha256').update(readFileSync(p)).digest('hex')
for (const [file, digest] of Object.entries(schema.schemaFiles))
  if (hash(join(source, file)) !== digest) throw new Error('Stale shop schema export: ' + file)
const out = fileURLToPath(new URL('../public/template/shop/', import.meta.url))
mkdirSync(out, { recursive: true })
const expected = new Set(['catalog.json'])
for (const brand of catalog.brands)
  for (const screen of brand.screens) {
    if (screen.file.includes('/') || hash(join(assets, screen.file)) !== screen.sha256)
      throw new Error('Invalid screenshot: ' + screen.file)
    copyFileSync(join(assets, screen.file), join(out, screen.file))
    expected.add(screen.file)
  }
const adminDir = join(source, 'docs/screenshots')
const admin = existsSync(join(adminDir, 'manifest.json'))
  ? JSON.parse(readFileSync(join(adminDir, 'manifest.json'), 'utf8'))
  : []
for (const screen of admin) {
  if (screen.file.includes('/') || hash(join(adminDir, screen.file)) !== screen.sha256)
    throw new Error('Invalid admin screenshot')
  copyFileSync(join(adminDir, screen.file), join(out, screen.file))
  expected.add(screen.file)
}
// Docs-only captures supplement the pinned product catalog without modifying it.
const galleryDir = fileURLToPath(new URL('../assets/shop-gallery/', import.meta.url))
const gallery = JSON.parse(readFileSync(join(galleryDir, 'captures.json'), 'utf8'))
for (const brand of gallery.brands) {
  const original = catalog.brands.find((item) => item.id === brand.id)
  if (!original) throw new Error('Unknown gallery brand: ' + brand.id)
  for (const screen of brand.screens) {
    if (
      !/^[a-z0-9-]+\.webp$/.test(screen.file) ||
      new URL(screen.url).origin !== new URL(original.url).origin ||
      hash(join(galleryDir, screen.file)) !== screen.sha256
    )
      throw new Error('Invalid gallery screenshot: ' + screen.file)
    copyFileSync(join(galleryDir, screen.file), join(out, screen.file))
    expected.add(screen.file)
  }
}
copyFileSync(join(galleryDir, 'captures.json'), join(out, 'gallery.json'))
expected.add('gallery.json')
for (const file of readdirSync(out)) if (!expected.has(file)) rmSync(join(out, file))
writeFileSync(join(out, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n')
writeFileSync(
  new URL('../lib/shop-reference.json', import.meta.url),
  JSON.stringify(
    {
      ...schema,
      catalog,
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
  `Shop docs generated: ${schema.tables.length} tables, ${catalog.brands.length} brands, ${admin.length} admin screenshots.`
)
