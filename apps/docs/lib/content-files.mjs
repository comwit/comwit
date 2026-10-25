import { readdirSync } from 'node:fs'
import { join } from 'node:path'

// Archive metadata (including macOS AppleDouble ._* files) is never a document.
export function listMdxFiles(directory, recursive = false) {
  const files = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    if (entry.isDirectory()) {
      if (recursive) {
        files.push(
          ...listMdxFiles(join(directory, entry.name), true).map((file) => `${entry.name}/${file}`)
        )
      }
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      files.push(entry.name)
    }
  }
  return files.sort()
}
