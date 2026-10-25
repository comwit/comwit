import { getLocale } from 'next-intl/server'
import Link from 'next/link'
import { Copy } from '@/i18n/copy'
import { getTemplateDocs } from '@/lib/template-docs'
import { CopyCommand } from './_components/copy-command'
import { ArchitectureMap } from './_components/architecture-map'

export default async function TemplateOverview() {
  const guides = getTemplateDocs(await getLocale())

  return (
    <div className="tp-overview tp-landing">
      <header className="tp-hero">
        <h1>
          <Copy id="templateSimpleHeadline" />
        </h1>
        <div className="tp-hero-actions">
          <CopyCommand command="npm create comwit@latest my-app" />
          <div className="tp-hero-links">
            <Link href="/template/docs/getting-started" className="tp-button">
              <Copy id="templateStart" />
            </Link>
          </div>
        </div>
      </header>

      <ArchitectureMap />

      <section className="tp-section" aria-labelledby="tp-read-title">
        <h2 id="tp-read-title" className="tp-section-title">
          <Copy id="templateGuides" />
        </h2>
        <ul className="tp-read">
          {guides.map((doc) => (
            <li key={doc.slug}>
              <Link href={`/template/docs/${doc.slug}`}>
                <strong>{doc.title}</strong>
                <span aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="tp-footer">
        <Link href="/state/docs">
          <Copy id="text086" />
        </Link>
        <Link href="/ui">
          <Copy id="text087" />
        </Link>
        <a href="https://github.com/comwit/comwit" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="/template/llms.txt">llms.txt</a>
      </footer>
    </div>
  )
}
