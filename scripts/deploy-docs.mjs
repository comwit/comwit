import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { spawnSync, execFileSync } from 'node:child_process'

const root = fileURLToPath(new URL('../', import.meta.url))
if (execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim()) {
  throw new Error('Commit source changes before building and deploying docs')
}

const required = ['COMWIT_PROJECT', 'COMWIT_APP', 'SITE_URL']
for (const name of required) {
  if (!process.env[name]?.trim()) throw new Error(`Missing deployment configuration: ${name}`)
}
const url = new URL(process.env.SITE_URL)
if (url.protocol !== 'https:' || url.username || url.password) {
  throw new Error('Deployment SITE_URL must be HTTPS without credentials')
}
const artifact = fileURLToPath(new URL('../apps/docs/dist/brrrd/', import.meta.url))
if (!existsSync(`${artifact}/manifest.json`))
  throw new Error('Run pnpm build before deploying docs')
const manifest = JSON.parse(readFileSync(`${artifact}/manifest.json`, 'utf8'))
if (!manifest.artifacts?.some((entry) => entry.packagePath?.includes('content/template/'))) {
  throw new Error('The deployment package is missing the traced documentation content')
}
if (process.argv.includes('--check')) {
  console.log('Deployment target configuration and brrrd docs artifact are valid.')
} else {
  const result = spawnSync(
    'comwit',
    [
      'deploy',
      '--project',
      process.env.COMWIT_PROJECT,
      '--app',
      process.env.COMWIT_APP,
      '--package',
      artifact,
    ],
    { stdio: 'inherit' }
  )
  if (result.error) throw result.error
  process.exitCode = result.status ?? 1
}
