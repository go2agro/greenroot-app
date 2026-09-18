'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import {
  MOTION_DURATION,
  MOTION_EASE,
  MOTION_OFFSET_Y,
  MOTION_STAGGER,
} from '@/lib/motion/config'

export function MotionStagger({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-48px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: MOTION_STAGGER } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function MotionStaggerItem({
  children,
  className,
  ...props
}: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: MOTION_OFFSET_Y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: MOTION_DURATION, ease: MOTION_EASE },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
