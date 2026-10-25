import { listMdxFiles } from './content-files.mjs'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDir = (locale: string) =>
  path.join(process.cwd(), 'content', locale === 'ko' ? 'ko' : '', 'state')

export interface DocMeta {
  title: string
  slug: string
  group?: string
  order: number
}

export interface Doc extends DocMeta {
  content: string
}

function filePathToSlug(filePath: string): string {
  return filePath.replace(/\.mdx$/, '').replace(/(^|\/)index$/, '')
}

export function getAllDocs(locale = 'en'): DocMeta[] {
  const files = listMdxFiles(contentDir(locale), true)
  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(contentDir(locale), file), 'utf-8')
      const { data } = matter(raw)
      const slug = (data.slug as string) || filePathToSlug(file)
      return {
        title: data.title as string,
        slug,
        group: data.group as string | undefined,
        order: (data.order as number) ?? 999,
      }
    })
    .sort((a, b) => a.order - b.order)
}

export function getDocBySlug(slug: string, locale = 'en'): Doc | null {
  const files = listMdxFiles(contentDir(locale), true)
  for (const file of files) {
    const raw = fs.readFileSync(path.join(contentDir(locale), file), 'utf-8')
    const { data, content } = matter(raw)
    const fileSlug = (data.slug as string) || filePathToSlug(file)
    if (fileSlug === slug || (slug === '' && filePathToSlug(file) === 'index')) {
      return {
        title: data.title as string,
        slug: fileSlug,
        group: data.group as string | undefined,
        order: (data.order as number) ?? 999,
        content,
      }
    }
  }
  return null
}
