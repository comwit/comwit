import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { listMdxFiles } from './content-files.mjs'

test('document discovery ignores archive sidecars and hidden directories', () => {
  const root = mkdtempSync(join(tmpdir(), 'comwit-content-'))
  try {
    for (const file of [
      'intro.mdx',
      '._intro.mdx',
      'guide/detail.mdx',
      'guide/._detail.mdx',
      '.cache/hidden.mdx',
      'notes.txt',
    ]) {
      const parts = file.split('/')
      if (parts.length > 1) mkdirSync(join(root, parts[0]), { recursive: true })
      writeFileSync(join(root, file), 'fixture')
    }
    assert.deepEqual(listMdxFiles(root), ['intro.mdx'])
    assert.deepEqual(listMdxFiles(root, true), ['guide/detail.mdx', 'intro.mdx'])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
