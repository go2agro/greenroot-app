'use client';

import { ReactNode } from 'react';
import PageMotion from '@/components/motion/PageMotion';

interface TemplateProps {
  children: ReactNode;
}

export default function Template({ children }: TemplateProps) {
  return <PageMotion className="flex-1 flex flex-col">{children}</PageMotion>;
}
