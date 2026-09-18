import type { ReactNode } from 'react'
import { partnerPageMetadata } from '@/lib/site-metadata'

export const metadata = partnerPageMetadata.applicationDetail

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
