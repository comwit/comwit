import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { sources, sourceFiles, publicFile } from '../src/source.js'

for (const [templateName, { canonical, bundled }] of Object.entries(sources)) {
  assert.ok(
    existsSync(join(canonical, 'package.json')),
    `Initialize templates/${templateName} before verification`
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
  if (templateName === 'shop') {
    for (const required of [
      'src/server/db/schema.ts',
      '.agents/skills/shop-setup/SKILL.md',
      '.agents/skills/shop-setup/assets/catalog.json',
    ])
      assert.ok(files.includes(required), `Shop template must include ${required}`)
  }
  if (templateName === 'course') {
    for (const required of [
      'src/server/db/schema.ts',
      '.agents/skills/course-setup/SKILL.md',
      'docs/course-resources.md',
    ])
      assert.ok(files.includes(required), `Course template must include ${required}`)
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
  console.log(
    `Verified ${Object.keys(manifest.files).length} ${templateName} source files and canonical packaging.`
  )
}
