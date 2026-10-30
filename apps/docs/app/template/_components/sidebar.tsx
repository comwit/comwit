'use client'

import { Copy, useCopy } from '@/i18n/copy'
import { useTranslations } from 'next-intl'

import { Button } from '@comwit/ui-templates/button'
import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@comwit/ui-templates/select'
import { ListIcon } from '@phosphor-icons/react/dist/csr/List'
import { XIcon } from '@phosphor-icons/react/dist/csr/X'
import type { TemplateDocMeta } from '@/lib/template-docs'

const OVERVIEW = '/template'
// Frontmatter groups stay identical across locales; product template names are translated here.
const templateLabels: Record<string, string> = { shop: 'templateShop', course: 'templateCourse' }
const hrefFor = (doc: TemplateDocMeta) => `/template/docs/${doc.slug}`

function NavContent({ docs, onNavigate }: { docs: TemplateDocMeta[]; onNavigate?: () => void }) {
  const copy = useTranslations('Copy')
  const pathname = usePathname()
  const router = useRouter()
  const templates = Array.from(
    new Map(
      docs.filter((doc) => doc.slug.includes('/')).map((doc) => [doc.slug.split('/')[0], doc.group])
    )
  )
  const selected =
    templates.find(([id]) => pathname.startsWith(`/template/docs/${id}/`))?.[0] ?? 'base'
  const current = docs.filter((doc) =>
    selected === 'base'
      ? !doc.slug.includes('/') && doc.group !== 'Common'
      : doc.slug.startsWith(selected + '/')
  )
  const common = docs.filter((doc) => doc.group === 'Common')
  const link = (doc: TemplateDocMeta) => (
    <Link
      key={doc.slug}
      href={hrefFor(doc)}
      aria-current={pathname === hrefFor(doc) ? 'page' : undefined}
      onClick={onNavigate}
    >
      {doc.title}
    </Link>
  )
  return (
    <nav aria-label={copy('text089')} className="template-nav">
      <Link
        href={OVERVIEW}
        className="template-nav-index"
        aria-current={pathname === OVERVIEW ? 'page' : undefined}
        onClick={onNavigate}
      >
        <Copy id="templateAll" />
      </Link>
      <Select
        value={selected}
        onValueChange={(id) => {
          const first = docs.find((doc) =>
            id === 'base' ? doc.group === 'Base Template' : doc.slug.startsWith(id + '/')
          )
          if (first) router.push(hrefFor(first))
          onNavigate?.()
        }}
      >
        <SelectTrigger className="template-select-trigger" aria-label={copy('templateChoose')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="template-select-menu">
          <SelectItem value="base">
            <Copy id="templateBase" />
          </SelectItem>
          {templates.map(([id, label]) => (
            <SelectItem key={id} value={id}>
              {templateLabels[id] ? <Copy id={templateLabels[id]} /> : label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="template-current-docs">{current.map(link)}</div>
      <details
        className="template-common-links"
        open={common.some((doc) => pathname === hrefFor(doc)) || undefined}
      >
        <summary>
          <Copy id="templateCommon" />
        </summary>
        {common.map(link)}
      </details>
      <a className="template-nav-agent" href="/template/llms.txt" target="_blank" rel="noreferrer">
        llms.txt ↗
      </a>
    </nav>
  )
}

export function Sidebar({ docs }: { docs: TemplateDocMeta[] }) {
  return (
    <aside className="template-sidebar">
      <NavContent docs={docs} />
    </aside>
  )
}

/** Narrow screens: the header's menu button opens the same navigation in a panel. */
export function MobileNav({ docs }: { docs: TemplateDocMeta[] }) {
  const localize = useCopy()

  const [open, setOpen] = React.useState(false)
  // Close the panel after navigation; NavContent's links call onNavigate, so no effect is needed.
  return (
    <>
      <Button
        variant="plain"
        size="none"
        type="button"
        className="template-menu-button"
        aria-label={localize(open ? 'Close navigation' : 'Open navigation')}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <XIcon className="size-5" size={20} aria-hidden="true" />
        ) : (
          <ListIcon className="size-5" size={20} aria-hidden="true" />
        )}
      </Button>
      {open && (
        <div className="template-mobile-nav">
          <NavContent docs={docs} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </>
  )
}
