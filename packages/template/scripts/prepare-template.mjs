import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { sources, sourceFiles } from '../src/source.js'

const provenance = {}
for (const [name, source] of Object.entries(sources)) {
  const { canonical, bundled, repository, branch } = source
  if (!existsSync(join(canonical, 'package.json')))
    throw new Error(
      'Initialize templates/' +
        name +
        ' with git submodule update --init --recursive before packing create-comwit.'
    )
  if (execFileSync('git', ['-C', canonical, 'status', '--porcelain'], { encoding: 'utf8' }).trim())
    throw new Error(`Commit ${name} template changes before packing create-comwit`)
  const files = sourceFiles(canonical)
  rmSync(bundled, { recursive: true, force: true })
  for (const file of files) {
    const out = join(bundled, file === '.gitignore' ? '_gitignore' : file)
    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, readFileSync(join(canonical, file)))
  }
  provenance[name] = {
    repository,
    branch,
    commit: execFileSync('git', ['-C', canonical, 'rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).trim(),
    files: files.length,
  }
  console.log(`Prepared ${files.length} ${name} files for create-comwit.`)
}
writeFileSync(
  new URL('../template-sources.json', import.meta.url),
  JSON.stringify(provenance, null, 2) + '\n'
)
