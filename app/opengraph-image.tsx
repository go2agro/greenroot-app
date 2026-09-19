import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const BRAND_GREEN = '#8DC63F'
const BRAND_ORANGE = '#F5802D'

export const alt = 'GreenRoot — Global Farm Internships for Agriculture Students'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const logoSvg = await readFile(
    join(process.cwd(), 'public/greenroot-logo.svg'),
    'utf8'
  )
  const logoSrc = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          padding: 64,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 48,
          }}
        >
          <img src={logoSrc} width={160} height={182} alt="" />
          <span
            style={{
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            <span style={{ color: BRAND_GREEN }}>Green</span>
            <span style={{ color: BRAND_ORANGE }}>Root</span>
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
