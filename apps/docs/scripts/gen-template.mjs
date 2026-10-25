import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
const source = fileURLToPath(new URL('../../../templates/base/', import.meta.url))
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]
  )
}
const guides = [
  join(source, 'AGENTS.md'),
  ...files(join(source, 'src')).filter((name) => name.endsWith('.ai.md')),
  join(source, '.storybook/stories/.ai.md'),
  join(source, '.storybook/stories/design-system/design.mdx'),
]
const config = JSON.parse(readFileSync(join(source, '.oxlintrc.json'), 'utf8'))
const rules = new Set(
  [config, ...config.overrides].flatMap((item) =>
    Object.entries(item.rules)
      .filter(([name, value]) => name.startsWith('custom/') && value !== 'off')
      .map(([name]) => name)
  )
)
const skills = readdirSync(join(source, '.agents/skills'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()
const stats = {
  guideLines: guides.reduce(
    (sum, name) =>
      sum +
      readFileSync(name, 'utf8')
        .split('\n')
        .filter((line) => line.trim()).length,
    0
  ),
  rules: rules.size,
  skills: skills.length,
}
writeFileSync(
  new URL('../lib/template-stats.json', import.meta.url),
  JSON.stringify(stats, null, 2) + '\n'
)
console.log('Template metrics generated from the pinned templates/base source.')
