import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { canonical, bundled, sourceFiles } from '../src/source.js'

if (!existsSync(join(canonical, 'package.json'))) {
  throw new Error(
    'Initialize templates/base with git submodule update --init --recursive before packing create-comwit.'
  )
}
const files = sourceFiles(canonical)
rmSync(bundled, { recursive: true, force: true })
for (const name of files) {
  const out = join(bundled, name === '.gitignore' ? '_gitignore' : name)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, readFileSync(join(canonical, name)))
}
console.log(`Prepared ${files.length} files from templates/base for create-comwit.`)
