'use client';

import { PageTransition } from '@/components/PageTransition';
import { ReactNode } from 'react';

interface TemplateProps {
  children: ReactNode;
}

export default function Template({ children }: TemplateProps) {
  return <PageTransition>{children}</PageTransition>;
}
