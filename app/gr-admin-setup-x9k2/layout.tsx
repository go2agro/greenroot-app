import type { ReactNode } from 'react'
import { internalPageMetadata } from '@/lib/site-metadata'

export const metadata = internalPageMetadata.adminSetup

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
