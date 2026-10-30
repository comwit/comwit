import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import sharp from 'sharp'

const assets = new URL('../assets/course-gallery/', import.meta.url)
const gallery = JSON.parse(readFileSync(new URL('captures.json', assets), 'utf8'))
const kinds = ['courses', 'detail', 'home']
const screens = kinds.flatMap((kind) => [`${kind}-desktop`, `${kind}-mobile`]).sort()

test('every course example has desktop and mobile home, course list and course detail captures', () => {
  assert.equal(gallery.brands.length, 5)
  const files = new Set()
  for (const brand of gallery.brands) {
    assert.deepEqual(brand.screens.map((s) => `${s.kind}-${s.device}`).sort(), screens)
    for (const screen of brand.screens) {
      assert.match(screen.file, /^[a-z0-9-]+\.webp$/)
      assert.ok(!files.has(screen.file), 'capture files must be unique')
      files.add(screen.file)
    }
  }
})

test('captures retain public same-site URLs and dated navigation provenance', () => {
  for (const brand of gallery.brands)
    for (const screen of brand.screens) {
      const url = new URL(screen.url)
      assert.equal(url.origin, new URL(brand.url).origin)
      if (screen.kind === 'home') assert.equal(url.pathname, '/')
      if (screen.kind === 'courses') assert.equal(url.pathname, '/courses')
      if (screen.kind === 'detail') assert.match(url.pathname, /^\/courses\/[^/]+$/)
      if (screen.kind !== 'home') assert.ok(screen.linkText)
      assert.equal(new URL(screen.discoveredFrom).origin, url.origin)
      assert.ok(Number.isFinite(Date.parse(screen.capturedAt)))
    }
})

test('all screenshot bytes and dimensions match their provenance manifest', async () => {
  for (const brand of gallery.brands)
    for (const screen of brand.screens) {
      const bytes = readFileSync(new URL(screen.file, assets))
      assert.equal(createHash('sha256').update(bytes).digest('hex'), screen.sha256)
      const { width, height } = await sharp(bytes).metadata()
      assert.deepEqual({ width, height }, screen.viewport)
      assert.equal(width, screen.device === 'mobile' ? 390 : 1440)
    }
})
