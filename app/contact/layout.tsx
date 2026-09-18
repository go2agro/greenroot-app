import type { ReactNode } from 'react'
import { publicPageMetadata } from '@/lib/site-metadata'

export const metadata = publicPageMetadata.contact

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
