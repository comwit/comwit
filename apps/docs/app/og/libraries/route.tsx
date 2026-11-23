import { siteHost } from '@/lib/site-url'
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

export const dynamic = 'force-static'

const paper = '#dcfa54'
const ink = '#171b12'
const products = [
  { id: 'state', title: 'State', detail: 'React state management' },
  { id: 'ui', title: 'UI', detail: 'React components' },
  { id: 'template', title: 'Template', detail: 'Next.js full-stack starter' },
]

async function png(asset: string, width: number, color?: [number, number, number]) {
  let image = sharp(path.join(process.cwd(), 'public', asset))
    .resize(width)
    .ensureAlpha()
  // Reproduce the landing's currentColor masks while preserving each mark's alpha.
  if (color) image = image.linear([0, 0, 0, 1], [...color, 0])
  const buffer = await image.png().toBuffer()
  return `data:image/png;base64,${buffer.toString('base64')}`
}

function EmbeddedImage({ src, width, height }: { src: string; width: number; height: number }) {
  // This image is embedded in the generated social card.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={width} height={height} style={{ flexShrink: 0 }} />
}

function Arrow({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M8 24 24 8M8 8h16v16" stroke={paper} strokeWidth="2" />
    </svg>
  )
}

export async function GET() {
  const [headlineFont, bodyFont, boldFont, art, wordmark, marks] = await Promise.all([
    readFile(path.join(process.cwd(), 'app/og/assets/ArchivoBlack-Regular.ttf')),
    readFile(path.join(process.cwd(), 'app/og/assets/Manrope-Regular.ttf')),
    readFile(path.join(process.cwd(), 'app/og/assets/Manrope-ExtraBold.ttf')),
    png('art/comwit-play-sculpture.webp', 1200),
    png('brand/comwit-wordmark.svg', 300),
    Promise.all(
      products.map(async (product) => ({
        header: await png(`brand/${product.id}-mark-monochrome.png`, 48, [23, 27, 18]),
        card: await png(`brand/${product.id}-mark-monochrome.png`, 104, [220, 250, 84]),
      }))
    ),
  ])

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: paper,
        color: ink,
        fontFamily: 'Manrope',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 76,
          padding: '0 42px',
          borderBottom: '1px solid #171b1230',
        }}
      >
        <EmbeddedImage src={wordmark} width={130} height={28} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          {products.map((product, index) => (
            <div
              key={product.id}
              style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 15 }}
            >
              <EmbeddedImage src={marks[index].header} width={24} height={24} />
              <span>{product.title}</span>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'absolute',
          top: 100,
          left: 40,
          right: 54,
          fontFamily: 'Archivo',
          fontSize: 244,
          letterSpacing: -18,
          lineHeight: 1,
        }}
      >
        {'COMWIT'.split('').map((letter, index) => (
          <span key={index}>{letter}</span>
        ))}
      </div>
      <div style={{ display: 'flex', position: 'absolute', top: 150, right: 40 }}>
        <EmbeddedImage src={art} width={540} height={360} />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          top: 340,
          left: 42,
          fontSize: 40,
          letterSpacing: -2.2,
          lineHeight: 1.18,
        }}
      >
        <span>Help your LLM</span>
        <span>write better code.</span>
        <span style={{ marginTop: 16, fontSize: 15, letterSpacing: -0.4 }}>{siteHost}</span>
      </div>
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 40,
          right: 40,
          bottom: 24,
          height: 100,
          background: ink,
          color: paper,
        }}
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '33.333333%',
              padding: '20px 24px',
              gap: 16,
              borderLeft: index === 0 ? 'none' : '1px solid #ffffff30',
            }}
          >
            <EmbeddedImage src={marks[index].card} width={44} height={44} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>
                {product.title}
              </span>
              <span style={{ fontSize: 13, color: '#e8e9df', whiteSpace: 'nowrap' }}>
                {product.detail}
              </span>
            </div>
            <div style={{ display: 'flex', marginLeft: 'auto', flexShrink: 0 }}>
              <Arrow />
            </div>
          </div>
        ))}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Archivo', data: headlineFont, style: 'normal', weight: 400 },
        { name: 'Manrope', data: bodyFont, style: 'normal', weight: 400 },
        { name: 'Manrope', data: boldFont, style: 'normal', weight: 800 },
      ],
    }
  )
}
