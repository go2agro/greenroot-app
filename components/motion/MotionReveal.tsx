'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { MOTION_DURATION, MOTION_EASE, MOTION_OFFSET_Y } from '@/lib/motion/config'

type MotionRevealProps = HTMLMotionProps<'div'> & {
  delay?: number
}

export default function MotionReveal({
  children,
  delay = 0,
  className,
  ...props
}: MotionRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: MOTION_OFFSET_Y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: MOTION_DURATION, delay, ease: MOTION_EASE }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
