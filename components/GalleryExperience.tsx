'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Camera,
  Expand,
  Sparkles,
  X,
} from 'lucide-react'
import type { GalleryContent, GalleryPhoto } from '@/lib/gallery'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

const CATEGORY_LABELS: Record<string, string> = {
  'international-training': 'International Training',
  'field-training': 'Field Training',
  'student-moments': 'Student Moments',
  'on-the-farm': 'On the Farm',
  events: 'Events',
}

function getTileClass(photo: GalleryPhoto, index: number): string {
  if (photo.featured) {
    return 'col-span-2 row-span-2 md:col-span-2 md:row-span-2'
  }
  if (index % 9 === 4) {
    return 'col-span-2 row-span-1 md:col-span-2 md:row-span-1'
  }
  if (index % 7 === 3) {
    return 'col-span-1 row-span-2 md:col-span-1 md:row-span-2'
  }
  return 'col-span-1 row-span-1'
}

function MarqueeStrip({ photos }: { photos: GalleryPhoto[] }) {
  const strip = photos.slice(0, 12)
  const doubled = [...strip, ...strip]

  return (
    <div className="relative mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#1F2A14] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#1F2A14] to-transparent" />
      <motion.div
        className="flex gap-3 py-3 px-3"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((photo, index) => (
          <div
            key={`${photo.id}-${index}`}
            className="relative h-24 w-36 shrink-0 overflow-hidden rounded-xl border border-white/15"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover"
              sizes="144px"
            />
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default function GalleryExperience({ content }: { content: GalleryContent }) {
  const { hero, categories, photos, cta } = content
  const [activeCategory, setActiveCategory] = useState('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'all') return photos
    return photos.filter((photo) => photo.category === activeCategory)
  }, [activeCategory, photos])

  const featuredPhotos = useMemo(
    () => photos.filter((photo) => photo.featured).slice(0, 12),
    [photos]
  )

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)
  }, [lightboxIndex, filteredPhotos.length])

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex(
      (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length
    )
  }, [lightboxIndex, filteredPhotos.length])

  useEffect(() => {
    if (lightboxIndex === null) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') goNext()
      if (event.key === 'ArrowLeft') goPrev()
      if (event.key === 'Escape') closeLightbox()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightboxIndex, goNext, goPrev, closeLightbox])

  const activePhoto =
    lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1F2A14] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gr-primary/25 blur-3xl" />
          <div className="absolute top-1/2 -left-32 h-96 w-96 rounded-full bg-[#3B82F6]/15 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-gr-primary/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 md:pt-20 md:pb-20">
          <div className="grid lg:grid-cols-2 gap-10 items-end">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gr-primary mb-5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {hero.eyebrow}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="font-bold text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-tight"
              >
                {hero.heading}{' '}
                <span className="text-gr-primary">{hero.headingHighlight}</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-5 text-base md:text-lg text-white/65 leading-relaxed max-w-xl"
              >
                {hero.description}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <Link
                  href={hero.cta.href}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gr-primary px-6 py-3.5 text-sm font-semibold text-[#1F2A14] hover:bg-gr-primary-hover transition-colors"
                >
                  {hero.cta.label}
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/70 backdrop-blur-sm">
                  <Camera className="w-4 h-4 text-gr-primary" />
                  <span className="font-semibold text-white">{photos.length}</span>
                  photos from GreenRoot programmes
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:grid grid-cols-3 gap-3"
            >
              {featuredPhotos.slice(0, 3).map((photo, index) => (
                <div
                  key={photo.id}
                  className={`relative overflow-hidden rounded-2xl border border-white/10 ${
                    index === 1 ? 'col-span-1 row-span-2 h-[280px]' : 'h-[132px]'
                  }`}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    sizes="200px"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F2A14]/70 via-transparent to-transparent" />
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <MarqueeStrip photos={featuredPhotos} />
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-40 border-b border-[#DCE6D0] bg-[#F7FAF2]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((category) => {
              const count =
                category.id === 'all'
                  ? photos.length
                  : photos.filter((p) => p.category === category.id).length
              const isActive = activeCategory === category.id

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#1F2A14] text-white shadow-md'
                      : 'bg-white text-[#4F5E48] border border-[#DCE6D0] hover:border-gr-primary hover:text-[#1F2A14]'
                  }`}
                >
                  {category.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
                      isActive ? 'bg-white/15 text-white' : 'bg-[#EAF5D4] text-[#5A6750]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mosaic grid */}
      <section className="bg-[#F7FAF2] py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-[130px] sm:auto-rows-[160px] md:auto-rows-[180px] gap-3 md:gap-4"
            >
              {filteredPhotos.map((photo, index) => (
                <motion.button
                  key={photo.id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(index * 0.02, 0.4) }}
                  onClick={() => openLightbox(index)}
                  className={`group relative overflow-hidden rounded-2xl md:rounded-3xl bg-[#E4EED4] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gr-primary focus-visible:ring-offset-2 ${getTileClass(photo, index)}`}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F2A14]/80 via-[#1F2A14]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gr-primary mb-1">
                      {CATEGORY_LABELS[photo.category] ?? photo.category}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs md:text-sm font-medium text-white line-clamp-1">
                        View full photo
                      </p>
                      <Expand className="w-4 h-4 text-white shrink-0" />
                    </div>
                  </div>
                  {photo.featured && (
                    <div className="absolute top-3 left-3 rounded-full bg-gr-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1F2A14]">
                      Featured
                    </div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredPhotos.length === 0 && (
            <div className="rounded-3xl border border-dashed border-[#DCE6D0] bg-white px-6 py-16 text-center">
              <p className="text-[#5A6750]">No photos in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EAF5D4] via-white to-[#D6EAF8] border border-[#DCE6D0] p-8 md:p-12">
            <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-gr-primary/20 blur-3xl pointer-events-none" />
            <div className="relative max-w-2xl">
              <h2 className="font-bold text-3xl md:text-4xl text-[#1F2A14] tracking-tight">
                {cta.heading}
              </h2>
              <p className="mt-4 text-[#5A6750] leading-relaxed">{cta.description}</p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href={cta.primaryCta.href}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gr-primary px-6 py-3.5 text-sm font-semibold text-[#1F2A14] hover:bg-gr-primary-hover transition-colors"
                >
                  {cta.primaryCta.label}
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href={cta.secondaryCta.href}
                  className="inline-flex items-center justify-center rounded-2xl border border-[#D5E0C8] bg-white px-6 py-3.5 text-sm font-medium text-[#3D4A32] hover:border-gr-primary transition-colors"
                >
                  {cta.secondaryCta.label}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Dialog
        open={lightboxIndex !== null}
        onOpenChange={(open) => !open && closeLightbox()}
      >
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-black/85"
          className="max-w-[96vw] sm:max-w-[96vw] w-full h-[92vh] p-0 border-0 bg-[#0f1410]/95 backdrop-blur-xl overflow-hidden"
        >
          <DialogTitle className="sr-only">Gallery photo viewer</DialogTitle>
          {activePhoto && lightboxIndex !== null && (
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-white/10">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gr-primary">
                    {CATEGORY_LABELS[activePhoto.category] ?? activePhoto.category}
                  </p>
                  <p className="text-sm text-white/60 tabular-nums">
                    {lightboxIndex + 1} / {filteredPhotos.length}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Close gallery"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative flex-1 min-h-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePhoto.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 p-4 md:p-8"
                  >
                    <div className="relative h-full w-full">
                      <Image
                        src={activePhoto.src}
                        alt={activePhoto.alt}
                        fill
                        className="object-contain"
                        sizes="96vw"
                        priority
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>

                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
                  aria-label="Previous photo"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
                  aria-label="Next photo"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
