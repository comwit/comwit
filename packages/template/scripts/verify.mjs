import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { canonical, bundled, sourceFiles, publicFile } from '../src/source.js'

assert.ok(
  existsSync(join(canonical, 'package.json')),
  'Initialize templates/base before verification'
)
const files = sourceFiles(canonical)
for (const required of [
  'AGENTS.md',
  '.mcp.json',
  '.tools/dev.js',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'src/lib/server-action/build/index-loader.cjs',
]) {
  assert.ok(files.includes(required), `Canonical template must include ${required}`)
}
const manifest = JSON.parse(readFileSync(join(canonical, 'PUBLIC_SOURCE.json'), 'utf8'))
for (const [name, digest] of Object.entries(manifest.files)) {
  assert.ok(publicFile(name), `Private file in snapshot: ${name}`)
  assert.equal(
    createHash('sha256')
      .update(readFileSync(join(canonical, name)))
      .digest('hex'),
    digest,
    `Source snapshot changed: ${name}`
  )
}
if (existsSync(join(bundled, 'package.json'))) {
  assert.deepEqual(
    sourceFiles(bundled)
      .map((name) => (name === '_gitignore' ? '.gitignore' : name))
      .sort(),
    files
  )
  for (const name of files)
    assert.deepEqual(
      readFileSync(join(bundled, name === '.gitignore' ? '_gitignore' : name)),
      readFileSync(join(canonical, name)),
      `Stale bundled file: ${name}`
    )
}
console.log(`Verified ${Object.keys(manifest.files).length} source files and canonical packaging.`)
