import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import sharp from 'sharp'

const assets = new URL('../assets/shop-gallery/', import.meta.url)
const gallery = JSON.parse(readFileSync(new URL('captures.json', assets), 'utf8'))
const { catalog } = JSON.parse(
  readFileSync(new URL('./shop-reference.json', import.meta.url), 'utf8')
)

test('every catalog brand has distinct desktop and mobile home and collection captures', () => {
  assert.deepEqual(gallery.brands.map((b) => b.id).sort(), catalog.brands.map((b) => b.id).sort())
  const files = new Set()
  for (const brand of gallery.brands) {
    assert.deepEqual(brand.screens.map((s) => `${s.kind}-${s.device}`).sort(), [
      'collection-desktop',
      'collection-mobile',
      'home-desktop',
      'home-mobile',
    ])
    for (const screen of brand.screens) {
      assert.match(screen.file, /^[a-z0-9-]+\.webp$/)
      assert.ok(!files.has(screen.file), 'capture files must be unique')
      files.add(screen.file)
    }
  }
})

test('captures retain public same-site URLs and dated navigation provenance', () => {
  for (const brand of gallery.brands) {
    const original = catalog.brands.find((b) => b.id === brand.id)
    for (const screen of brand.screens) {
      const url = new URL(screen.url)
      assert.equal(url.origin, new URL(original.url).origin)
      assert.equal(url.pathname, screen.kind === 'home' ? '/' : '/products')
      assert.equal(screen.discoveredFrom, original.url)
      assert.ok(Number.isFinite(Date.parse(screen.capturedAt)))
      if (screen.kind === 'collection') assert.ok(screen.linkText)
    }
  }
})

test('all screenshot bytes and dimensions match their provenance manifest', async () => {
  for (const brand of gallery.brands) {
    for (const screen of brand.screens) {
      const bytes = readFileSync(new URL(screen.file, assets))
      assert.equal(createHash('sha256').update(bytes).digest('hex'), screen.sha256)
      const { width, height } = await sharp(bytes).metadata()
      assert.deepEqual({ width, height }, screen.viewport)
      assert.equal(width, screen.device === 'mobile' ? 390 : 1440)
    }
  }
})
