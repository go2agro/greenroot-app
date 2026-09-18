import type { ReactNode } from 'react'
import { partnerPageMetadata } from '@/lib/site-metadata'

export const metadata = partnerPageMetadata.notifications

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
