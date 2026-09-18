import type { ReactNode } from 'react'
import { adminPageMetadata } from '@/lib/site-metadata'

export const metadata = adminPageMetadata.internshipDetail

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
