import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Compass, Home, Leaf, Sprout } from 'lucide-react'
import appConfig from '@/config/appConfig.json'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#F0F7E6] via-white to-[#E8F4FC]">
      <div
        className="pointer-events-none absolute -left-24 top-16 size-72 rounded-full bg-gr-primary/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-10 size-80 rounded-full bg-gr-secondary/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 size-96 -translate-x-1/2 rounded-full bg-gr-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-center gap-2">
          <Image
            src={appConfig.app_logo}
            alt={appConfig.app_name}
            width={44}
            height={44}
            className="size-11"
          />
          <span className="text-xl font-bold text-gr-text-dark">{appConfig.app_name}</span>
        </div>

        <div className="mb-8 flex size-24 items-center justify-center rounded-full border border-gr-primary/25 bg-white/80 shadow-sm backdrop-blur-sm">
          <Sprout className="size-11 text-gr-primary" strokeWidth={1.75} aria-hidden="true" />
        </div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gr-primary">
          Page not found
        </p>

        <h1 className="mb-4 bg-gradient-to-r from-gr-primary-hover via-gr-primary to-gr-secondary bg-clip-text text-center text-7xl font-black leading-none text-transparent sm:text-8xl">
          404
        </h1>

        <h2 className="mb-3 text-center text-2xl font-bold text-gr-text-dark sm:text-3xl">
          This page has gone to seed
        </h2>

        <p className="mb-10 max-w-lg text-center text-base leading-relaxed text-gr-text-muted sm:text-lg">
          The page you are looking for may have moved, been removed, or never existed.
          Let us help you find your way back to growth.
        </p>

        <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="h-11 px-6">
            <Link href="/">
              <Home className="size-4" aria-hidden="true" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 px-6">
            <Link href="/internships">
              <Compass className="size-4" aria-hidden="true" />
              Explore Internships
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid w-full max-w-xl gap-4 sm:grid-cols-2">
          <Link
            href="/about"
            className="group rounded-2xl border border-gr-border bg-white/70 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-gr-primary/40 hover:shadow-md"
          >
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-gr-primary-light text-gr-primary transition-colors group-hover:bg-gr-primary group-hover:text-white">
              <Leaf className="size-5" aria-hidden="true" />
            </div>
            <p className="font-semibold text-gr-text-dark">About GreenRoot</p>
            <p className="mt-1 text-sm text-gr-text-muted">Learn how we connect students worldwide.</p>
          </Link>

          <Link
            href="/contact"
            className="group rounded-2xl border border-gr-border bg-white/70 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-[#549FE3]/40 hover:shadow-md"
          >
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-[#E8F4FC] text-gr-secondary transition-colors group-hover:bg-gr-secondary group-hover:text-white">
              <ArrowLeft className="size-5" aria-hidden="true" />
            </div>
            <p className="font-semibold text-gr-text-dark">Need help?</p>
            <p className="mt-1 text-sm text-gr-text-muted">Reach out and we will point you in the right direction.</p>
          </Link>
        </div>

        <p className="mt-10 text-center text-xs text-[#9CA3AF]">
          {appConfig.footer_text}
        </p>
      </div>
    </div>
  )
}
