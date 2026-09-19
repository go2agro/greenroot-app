import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import appConfig from '@/config/appConfig.json'

export const alt = `${appConfig.app_name} — Global Farm Internships for Agriculture Students`
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1F2A14 0%, #2D3A1F 50%, #1F2A14 100%)',
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: 640,
            }}
          >
            <span
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: '#A3D32F',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {appConfig.app_name}
            </span>
            <span
              style={{
                marginTop: 20,
                fontSize: 26,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.88)',
                lineHeight: 1.45,
              }}
            >
              {appConfig.app_tagline}
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
