import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const repositories = {
  'packages/state': 'state',
  'packages/ui': 'ui',
  'templates/base': 'template',
  'templates/shop': 'template-shop',
}

test('the parent pins four public repositories as gitlinks', () => {
  for (const [path, name] of Object.entries(repositories)) {
    const index = execFileSync('git', ['ls-files', '--stage', path], {
      cwd: root,
      encoding: 'utf8',
    })
    assert.match(index, /^160000 /, path)
    const remote = execFileSync('git', ['config', '-f', '.gitmodules', `submodule.${path}.url`], {
      cwd: root,
      encoding: 'utf8',
    }).trim()
    assert.equal(remote, `https://github.com/comwit/${name}.git`)
    assert.ok(existsSync(join(root, path, 'package.json')), `${path}: initialized source`)
  }
})

test('both template snapshots match their original public files', () => {
  for (const dir of ['templates/base', 'templates/shop']) {
    const manifest = JSON.parse(readFileSync(join(root, dir, 'PUBLIC_SOURCE.json'), 'utf8'))
    for (const [file, hash] of Object.entries(manifest.files)) {
      assert.equal(
        createHash('sha256')
          .update(readFileSync(join(root, dir, file)))
          .digest('hex'),
        hash,
        `${dir}/${file}`
      )
    }
    assert.ok(existsSync(join(root, dir, 'pnpm-lock.yaml')))
    assert.ok(existsSync(join(root, dir, 'pnpm-workspace.yaml')))
    assert.ok(!existsSync(join(root, dir, '.env')), 'no real environment file in the checkout')
  }
})

test('the installed parent workspace excludes independent template applications', () => {
  const packages = JSON.parse(
    execFileSync('pnpm', ['list', '-r', '--depth', '-1', '--json'], { cwd: root, encoding: 'utf8' })
  )
  assert.ok(packages.some((item) => item.name === '@comwit/state'))
  assert.ok(packages.some((item) => item.name === '@comwit/ui'))
  assert.ok(packages.some((item) => item.name === 'storybook'))
  assert.ok(!packages.some((item) => /\/templates\/(base|shop)(\/|$)/.test(item.path)))
  for (const dir of ['packages/state', 'packages/ui']) {
    assert.ok(existsSync(join(root, dir, 'pnpm-lock.yaml')))
    assert.ok(existsSync(join(root, dir, 'tsconfig.base.json')))
  }
})
