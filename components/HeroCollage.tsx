'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

type HeroCollageImage = {
  src: string
  alt: string
  imageClassName?: string
  frameWidth?: number
  frameHeight?: number
}

type HeroCollageProps = {
  topRight: HeroCollageImage
  bottomLeft: HeroCollageImage
  center: HeroCollageImage
  className?: string
}

/**
 * All three images share one orbit at the same speed, 120° apart.
 * Their center points always form an equilateral triangle (side = ORBIT_RADIUS × √3).
 *
 * No-overlap rule for upright rectangles: width and height must each be
 * less than that side length, at every rotation angle.
 */
const ORBIT_DURATION = 28
const ORBIT_RADIUS = 42
const DEFAULT_FRAME_WIDTH = 50
const DEFAULT_FRAME_HEIGHT = 38

type OrbitPlanet = {
  image: HeroCollageImage
  startAngle: number
  priority?: boolean
  slotClassName?: string
}

type OrbitRingConfig = {
  radius: number
  variant: 'solid' | 'dotted' | 'dashed'
  pulseDelay: number
}

const ORBIT_RINGS: OrbitRingConfig[] = [
  { radius: 28, variant: 'solid', pulseDelay: 0 },
  { radius: ORBIT_RADIUS, variant: 'dotted', pulseDelay: 0.5 },
  { radius: 54, variant: 'dashed', pulseDelay: 1 },
]

/** Equilateral triangle vertices on the orbit — 120° apart. */
const PLANET_SLOTS: Omit<OrbitPlanet, 'image'>[] = [
  { startAngle: -90, priority: true, slotClassName: 'object-center' },
  { startAngle: 30 },
  { startAngle: 150 },
]

const RING_BORDER_CLASS: Record<OrbitRingConfig['variant'], string> = {
  solid: 'border-solid',
  dotted: 'border-dotted',
  dashed: 'border-dashed',
}

function getFrameSize(image: HeroCollageImage) {
  return {
    width: image.frameWidth ?? DEFAULT_FRAME_WIDTH,
    height: image.frameHeight ?? DEFAULT_FRAME_HEIGHT,
  }
}

function getImageClassName(image: HeroCollageImage, slotClassName?: string) {
  return ['object-cover', slotClassName, image.imageClassName].filter(Boolean).join(' ')
}

function planetFrameStyle(orbitDiameter: number, frameWidth: number, frameHeight: number) {
  return {
    width: `${(frameWidth / orbitDiameter) * 100}%`,
    height: `${(frameHeight / orbitDiameter) * 100}%`,
    transform: 'translate(-50%, -50%)',
  }
}

function OrbitRings({ shouldAnimate }: { shouldAnimate: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      {ORBIT_RINGS.map((ring) => (
        <motion.div
          key={ring.radius}
          className={`absolute rounded-full border-2 border-gr-primary/45 ${RING_BORDER_CLASS[ring.variant]}`}
          style={{
            width: `${ring.radius * 2}%`,
            height: `${ring.radius * 2}%`,
          }}
          animate={
            shouldAnimate
              ? {
                  scale: [1, 1.02, 1],
                  opacity: [0.5, 0.9, 0.5],
                }
              : { opacity: 0.7 }
          }
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: ring.pulseDelay,
          }}
        />
      ))}

      <motion.div
        className="absolute size-2 rounded-full bg-gr-primary/35"
        animate={
          shouldAnimate
            ? {
                scale: [1, 1.35, 1],
                opacity: [0.4, 0.85, 0.4],
              }
            : { opacity: 0.6 }
        }
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

type OrbitingPlanetProps = OrbitPlanet & {
  shouldAnimate: boolean
}

function OrbitingPlanet({
  image,
  startAngle,
  priority,
  slotClassName,
  shouldAnimate,
}: OrbitingPlanetProps) {
  const orbitDiameter = ORBIT_RADIUS * 2
  const { width: frameWidth, height: frameHeight } = getFrameSize(image)
  const imageClassName = getImageClassName(image, slotClassName)

  if (!shouldAnimate) {
    const rad = (startAngle * Math.PI) / 180
    const x = 50 + ORBIT_RADIUS * Math.cos(rad)
    const y = 50 + ORBIT_RADIUS * Math.sin(rad)

    return (
      <div
        className="absolute overflow-hidden rounded-xl shadow-lg relative"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: `${frameWidth}%`,
          height: `${frameHeight}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          className={imageClassName}
        />
      </div>
    )
  }

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        width: `${orbitDiameter}%`,
        height: `${orbitDiameter}%`,
        marginLeft: `-${ORBIT_RADIUS}%`,
        marginTop: `-${ORBIT_RADIUS}%`,
      }}
      initial={{ rotate: startAngle }}
      animate={{ rotate: startAngle + 360 }}
      transition={{
        duration: ORBIT_DURATION,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <motion.div
        className="absolute left-1/2 top-0 overflow-hidden rounded-xl shadow-lg relative"
        style={planetFrameStyle(orbitDiameter, frameWidth, frameHeight)}
        initial={{ rotate: -startAngle }}
        animate={{ rotate: -(startAngle + 360) }}
        transition={{
          duration: ORBIT_DURATION,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          className={imageClassName}
        />
      </motion.div>
    </motion.div>
  )
}

export default function HeroCollage({
  topRight,
  bottomLeft,
  center,
  className = 'relative mx-auto aspect-square w-full max-w-[420px] sm:max-w-[460px] md:size-[520px] md:max-w-none md:shrink-0',
}: HeroCollageProps) {
  const prefersReducedMotion = useReducedMotion()
  const shouldAnimate = !prefersReducedMotion

  const images = [center, topRight, bottomLeft]

  const planets: OrbitPlanet[] = PLANET_SLOTS.map((slot, index) => ({
    ...slot,
    image: images[index],
  }))

  return (
    <div className={className}>
      <OrbitRings shouldAnimate={shouldAnimate} />

      {planets.map((planet) => (
        <OrbitingPlanet key={planet.image.src} {...planet} shouldAnimate={shouldAnimate} />
      ))}
    </div>
  )
}
