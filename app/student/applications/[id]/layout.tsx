import type { ReactNode } from 'react'
import { studentPageMetadata } from '@/lib/site-metadata'

export const metadata = studentPageMetadata.applicationDetail

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
