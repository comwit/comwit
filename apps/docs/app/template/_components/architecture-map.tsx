import { useTranslations } from 'next-intl'
import { FileTextIcon, FolderIcon } from '@comwit/ui/icons'

type Entry = { name: string; file?: boolean; children?: Entry[] }

const TREE: Entry[] = [
  { name: 'AGENTS.md', file: true },
  { name: '.agents/skills/' },
  { name: 'eslint-rules/' },
  { name: '.storybook/' },
  {
    name: 'src/',
    children: [
      { name: 'app/' },
      {
        name: 'services/',
        children: [
          { name: 'app/', children: [{ name: 'page/' }, { name: 'state/' }, { name: 'api/' }] },
          { name: 'admin/' },
        ],
      },
      { name: 'server/repository/' },
      { name: 'lib/' },
    ],
  },
]

function FolderTree({ entries }: { entries: Entry[] }) {
  return (
    <ul className="tp-folder-branches">
      {entries.map((entry) => (
        <li key={entry.name}>
          <div className="tp-folder-name">
            {entry.file ? (
              <FileTextIcon size={18} aria-hidden />
            ) : (
              <FolderIcon size={18} aria-hidden />
            )}
            <code>{entry.name}</code>
          </div>
          {entry.children && <FolderTree entries={entry.children} />}
        </li>
      ))}
    </ul>
  )
}

// Snapshot of packages/template/template, 2026-10-22:
// 1,318 nonblank lines in AGENTS.md, src/**/*.ai.md, services/design.md and
// .storybook/stories/.ai.md (10 guides; skill stubs excluded).
// 25 unique enabled custom/* rules across .oxlintrc.json rules and overrides.
// 3 canonical .agents/skills/*/SKILL.md files.
const METRICS = [
  { value: '1,300+', unit: 'templateLines', title: 'templateGuideCount', why: 'templateGuideWhy' },
  { value: '25', unit: 'templateItems', title: 'templateRuleCount', why: 'templateRuleWhy' },
  { value: '3', unit: 'templateItems', title: 'templateSkillCount', why: 'templateSkillWhy' },
] as const

export function ArchitectureMap() {
  const t = useTranslations('Copy')

  return (
    <section className="tp-blueprint" aria-label={t('templateBlueprintLabel')}>
      <div className="tp-folder-tree">
        <div className="tp-folder-root">
          <FolderIcon size={24} aria-hidden />
          <strong>my-app/</strong>
        </div>
        <FolderTree entries={TREE} />
      </div>
      <dl className="tp-metrics">
        {METRICS.map((metric) => (
          <div className="tp-metric" key={metric.title}>
            <dt>{t(metric.title)}</dt>
            <dd>
              <strong>{metric.value}</strong>
              <span>{t(metric.unit)}</span>
            </dd>
            <dd className="tp-metric-why">{t(metric.why)}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
