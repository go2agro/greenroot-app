import type { ReactNode } from 'react'
import { studentPageMetadata } from '@/lib/site-metadata'

export const metadata = studentPageMetadata.applications

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
