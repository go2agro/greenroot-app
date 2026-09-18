'use client'

import { motion } from 'framer-motion'
import { MOTION_DURATION, MOTION_EASE, MOTION_OFFSET_Y } from '@/lib/motion/config'

export default function PageMotion({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: MOTION_OFFSET_Y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION_DURATION, ease: MOTION_EASE }}
    >
      {children}
    </motion.div>
  )
}
