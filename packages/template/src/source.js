import { existsSync, readdirSync, lstatSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
export const canonical = join(here, '../../../templates/base')
export const bundled = join(here, '../template')
export const shopCanonical = join(here, '../../../templates/shop')
export const shopBundled = join(here, '../shop-template')
export const sources = {
  base: { canonical, bundled, repository: 'https://github.com/comwit/template' },
  shop: {
    canonical: shopCanonical,
    bundled: shopBundled,
    repository: 'https://github.com/comwit/template-shop',
  },
}
export function sourceFor(name = 'base') {
  const source = sources[name]
  if (!source) throw new Error(`Unknown template: ${name}`)
  return existsSync(join(source.canonical, 'package.json')) ? source.canonical : source.bundled
}
export const templateSource = sourceFor()

export function publicFile(name) {
  const parts = name.split('/')
  const base = parts.at(-1)
  return (
    !parts.some((part) =>
      [
        '.git',
        'node_modules',
        '.next',
        '.next-dev',
        'dist',
        'storybook-static',
        '.records',
        '.pnpm-store',
        'coverage',
        'uploads',
        '.vercel',
      ].includes(part)
    ) &&
    !(base.startsWith('.env') && base !== '.env.example') &&
    !['.dev.vars', 'AGENTS.override.md', 'CLAUDE.local.md'].includes(base) &&
    !/\.(db|sqlite3?|pem|key|log|tsbuildinfo)$/.test(base)
  )
}

export function sourceFiles(root = templateSource) {
  if (Object.values(sources).some((source) => root === source.canonical)) {
    // Git supplies the source inventory; ignored local credentials and build output never enter it.
    return [
      ...new Set(
        execFileSync(
          'git',
          ['-C', root, 'ls-files', '--cached', '--others', '--exclude-standard', '-z'],
          { encoding: 'utf8' }
        ).split('\0')
      ),
    ]
      .filter(
        (name) =>
          name &&
          publicFile(name) &&
          existsSync(join(root, name)) &&
          lstatSync(join(root, name)).isFile()
      )
      .sort()
  }
  const files = []
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      const name = relative(root, path).replaceAll('\\', '/')
      if (!publicFile(name)) continue
      if (entry.isDirectory()) walk(path)
      else if (entry.isFile()) files.push(name)
    }
  }
  walk(root)
  return files.sort()
}
