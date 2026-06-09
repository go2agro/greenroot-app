import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return proxyRequest(request, resolvedParams.path)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return proxyRequest(request, resolvedParams.path)
}

async function proxyRequest(request: NextRequest, path: string[]) {
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
  const pathname = `/${path.join('/')}`
  const search = request.nextUrl.search
  const url = `${host}${pathname}${search}`

  const headers = new Headers(request.headers)
  headers.set('host', new URL(host).host)

  const response = await fetch(url, {
    method: request.method,
    headers,
    body: request.method !== 'GET' ? await request.text() : undefined,
  })

  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  })
}