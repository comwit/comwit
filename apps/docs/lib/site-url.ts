const configured = new URL(process.env.SITE_URL || 'http://localhost:3000')
if (
  !['http:', 'https:'].includes(configured.protocol) ||
  configured.username ||
  configured.password
) {
  throw new Error('SITE_URL must be an HTTP(S) URL without credentials')
}

export const siteOrigin = configured.origin
export const siteHost = configured.host
export const siteUrl = (path: string) => new URL(path, `${siteOrigin}/`).href
