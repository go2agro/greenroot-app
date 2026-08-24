import Link from 'next/link'
import Image from 'next/image'
import {
  Leaf,
  Globe,
  HandHeart,
  Briefcase,
  Scale,
  GraduationCap,
  ArrowUpRight,
  Sprout,
  Compass,
  Sun,
  Handshake,
  type LucideIcon,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getAboutContent } from '@/lib/about'

const iconMap: Record<string, LucideIcon> = {
  Leaf,
  Globe,
  HandHeart,
  Briefcase,
  Scale,
  GraduationCap,
  Sprout,
  Compass,
  Sun,
  Handshake,
}

function resolveIcon(name: string): LucideIcon {
  return iconMap[name] ?? Leaf
}

export default async function About() {
  const about = await getAboutContent()
  const { hero, stats, story, pillars, team, goals, cta } = about

  return (
    <div className="min-h-screen bg-[#F7FAF2]">
      <Navbar activeLink="about" />

      <main className="w-full">
        {/* Hero */}
        <section className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#E8F5C8_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_left,_#D6EAF8_0%,_transparent_50%)] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-12 md:pb-16">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              <div className="flex flex-col gap-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7BA82A]">
                  {hero.eyebrow}
                </p>
                <h1 className="font-bold text-4xl sm:text-5xl lg:text-[3.25rem] text-[#1F2A14] leading-[1.08] tracking-tight">
                  {hero.heading}{' '}
                  <span className="text-[#A3D32F]">{hero.headingHighlight}</span>
                  {' '}{hero.headingSuffix}
                </h1>
                <p className="text-base md:text-lg text-[#5A6750] leading-relaxed max-w-lg">
                  {hero.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <Link
                    href={hero.primaryCta.href}
                    className="inline-flex items-center justify-center gap-2 bg-[#A3D32F] text-[#1F2A14] rounded-2xl px-6 py-3.5 text-sm font-semibold hover:bg-[#92C120] transition-colors"
                  >
                    {hero.primaryCta.label}
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={hero.secondaryCta.href}
                    className="inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-medium text-[#3D4A32] bg-white/80 border border-[#D5E0C8] hover:border-[#A3D32F] transition-colors"
                  >
                    {hero.secondaryCta.label}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 h-[340px] sm:h-[400px]">
                <div className="relative row-span-2 rounded-3xl overflow-hidden bg-[#E4EED4]">
                  <Image
                    src={hero.images.main}
                    alt={hero.images.mainAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    priority
                  />
                </div>
                <div className="relative rounded-3xl overflow-hidden bg-[#D6EAF8]">
                  <Image
                    src={hero.images.secondary}
                    alt={hero.images.secondaryAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="rounded-3xl bg-[#A3D32F] p-5 flex flex-col justify-between">
                  <Sprout className="w-6 h-6 text-[#1F2A14]" />
                  <div>
                    <p className="font-bold text-3xl text-[#1F2A14] tracking-tight">
                      {hero.highlightStat.value}
                    </p>
                    <p className="text-xs font-medium text-[#1F2A14]/75 mt-1 leading-snug">
                      {hero.highlightStat.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-[#DCE6D0] bg-white/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`flex flex-col items-center text-center ${
                    index < stats.length - 1
                      ? 'sm:border-r sm:border-[#DCE6D0]'
                      : ''
                  }`}
                >
                  <p className="font-bold text-4xl md:text-5xl text-[#1F2A14] tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-sm text-[#6B7A60] mt-2 font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section
          id="our-story"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20"
        >
          <div className="max-w-2xl mb-10 md:mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7BA82A] mb-3">
              {story.eyebrow}
            </p>
            <h2 className="font-bold text-3xl md:text-4xl text-[#1F2A14] tracking-tight leading-tight mb-4">
              {story.heading}
            </h2>
            <p className="text-[15px] md:text-base text-[#5A6750] leading-relaxed">
              {story.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {story.chapters.map((chapter, index) => {
              const Icon = resolveIcon(chapter.icon)
              const tones = [
                'bg-white border border-[#DCE6D0]',
                'bg-[#EAF5D4]',
                'bg-[#E4F0FA]',
              ]

              return (
                <article
                  key={chapter.step}
                  className={`rounded-3xl p-6 sm:p-7 flex flex-col h-full ${tones[index]}`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center border border-[#DCE6D0]/80">
                      <Icon className="w-5 h-5 text-[#A3D32F]" />
                    </div>
                    <span className="text-sm font-bold text-[#A3D32F] tabular-nums">
                      {chapter.step}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7BA82A] mb-2">
                    {chapter.label}
                  </p>
                  <h3 className="font-bold text-xl text-[#1F2A14] mb-3 tracking-tight">
                    {chapter.title}
                  </h3>
                  <p className="text-sm text-[#4F5E48] leading-relaxed mt-auto">
                    {chapter.body}
                  </p>
                </article>
              )
            })}
          </div>
        </section>

        {/* Pillars */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
          <div className="rounded-3xl bg-[#A3D32F] px-6 py-8 sm:px-8 sm:py-9 mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1F2A14]/70 mb-2">
              {pillars.eyebrow}
            </p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <h2 className="font-bold text-2xl md:text-3xl text-[#1F2A14] tracking-tight leading-tight max-w-xl">
                {pillars.heading}
              </h2>
              <p className="text-sm text-[#1F2A14]/75 leading-relaxed md:max-w-xs md:text-right">
                {pillars.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pillars.items.map((pillar) => {
              const Icon = resolveIcon(pillar.icon)
              return (
                <div
                  key={pillar.title}
                  className="rounded-3xl p-6 sm:p-7 bg-white border border-[#DCE6D0] flex flex-col h-full"
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#F0F7E0] flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-[#A3D32F]" />
                  </div>
                  <h3 className="font-bold text-xl text-[#1F2A14] mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-[#5A6750] leading-relaxed">
                    {pillar.text}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Team */}
        <section className="bg-white/60 border-y border-[#DCE6D0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-12">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7BA82A] mb-3">
                  {team.eyebrow}
                </p>
                <h2 className="font-bold text-3xl md:text-4xl text-[#1F2A14] tracking-tight leading-tight">
                  {team.heading}
                </h2>
              </div>
              <p className="text-[15px] text-[#5A6750] leading-relaxed md:max-w-sm md:text-right">
                {team.description}
              </p>
            </div>

            <div className="mb-5">
              {team.founders.map((person) => (
                <article
                  key={person.name}
                  className="rounded-3xl overflow-hidden bg-[#F7FAF2] border border-[#DCE6D0] flex flex-col sm:flex-row"
                >
                  <div className="relative h-72 sm:h-[320px] sm:w-[42%] overflow-hidden bg-[#E4EED4] shrink-0">
                    <Image
                      src={person.image}
                      alt={person.name}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 100vw, 42vw"
                    />
                  </div>
                  <div className="p-6 sm:p-8 md:p-10 flex flex-col flex-1 justify-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7BA82A] mb-2">
                      Founder
                    </p>
                    <h3 className="font-bold text-2xl md:text-3xl text-[#1F2A14]">
                      {person.name}
                    </h3>
                    <p className="text-sm md:text-base font-medium text-[#A3D32F] mt-1 mb-5">
                      {person.role}
                    </p>
                    <div className="space-y-1.5 pt-4 border-t border-[#DCE6D0] max-w-sm">
                      <a
                        href={`mailto:${person.email}`}
                        className="block text-sm text-[#5A6750] hover:text-[#7BA82A] transition-colors"
                      >
                        {person.email}
                      </a>
                      <a
                        href={`tel:${person.mobile.replace(/\s/g, '')}`}
                        className="block text-sm text-[#5A6750] hover:text-[#7BA82A] transition-colors tabular-nums"
                      >
                        {person.mobile}
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {team.advisors.map((advisor) => (
                <article
                  key={advisor.name}
                  className="rounded-3xl bg-[#F7FAF2] border border-[#DCE6D0] p-5 flex gap-4 items-center min-h-[112px]"
                >
                  {'image' in advisor && advisor.image ? (
                    <div className="relative w-14 h-14 shrink-0">
                      <Image
                        src={advisor.image}
                        alt={advisor.name}
                        fill
                        className="rounded-xl object-cover"
                        sizes="56px"
                      />
                    </div>
                  ) : advisor.icon === 'briefcase' ? (
                    <div className="w-14 h-14 shrink-0 rounded-xl bg-[#EAF5D4] flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-[#A3D32F]" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 shrink-0 rounded-xl bg-[#E4F0FA] flex items-center justify-center">
                      <Scale className="w-5 h-5 text-[#549FE3]" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7BA82A] mb-1">
                      Advisor
                    </p>
                    <h3 className="font-semibold text-[#1F2A14] text-sm leading-snug">
                      {advisor.name}
                    </h3>
                    <p className="text-xs text-[#6B7A60] mt-1 leading-relaxed">
                      {advisor.roleLine1}
                    </p>
                    {advisor.roleLine2 && (
                      <p className="text-xs text-[#A3D32F] font-medium mt-0.5">
                        {advisor.roleLine2}
                      </p>
                    )}
                  </div>
                </article>
              ))}

              {team.members.map((person) => (
                <article
                  key={person.name}
                  className="rounded-3xl bg-[#F7FAF2] border border-[#DCE6D0] p-5 flex gap-4 items-center min-h-[112px]"
                >
                  <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-xl bg-[#E4EED4]">
                    <Image
                      src={person.image}
                      alt={person.name}
                      fill
                      className="object-cover object-top"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7BA82A] mb-1">
                      Team
                    </p>
                    <h3 className="font-semibold text-[#1F2A14] text-sm leading-snug">
                      {person.name}
                    </h3>
                    <p className="text-xs text-[#A3D32F] font-medium mt-1">
                      {person.role}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Goals */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-12">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7BA82A] mb-3">
                {goals.eyebrow}
              </p>
              <h2 className="font-bold text-3xl md:text-4xl text-[#1F2A14] tracking-tight leading-tight">
                {goals.heading}
              </h2>
            </div>
            <p className="text-[15px] text-[#5A6750] leading-relaxed md:max-w-md md:text-right">
              {goals.description}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="relative min-h-[280px] lg:min-h-full rounded-3xl overflow-hidden bg-[#E4EED4]">
              <Image
                src={goals.image}
                alt={goals.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {goals.items.map((goal, index) => {
                const Icon = resolveIcon(goal.icon)
                return (
                  <div
                    key={goal.title}
                    className="rounded-3xl bg-white border border-[#DCE6D0] p-6 flex flex-col h-full"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-[#F0F7E0] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#A3D32F]" />
                      </div>
                      <span className="text-xs font-bold text-[#A3D32F] tabular-nums">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-[#1F2A14] mb-2">
                      {goal.title}
                    </h3>
                    <p className="text-sm text-[#5A6750] leading-relaxed">
                      {goal.text}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EAF5D4] via-[#F7FAF2] to-[#D6EAF8] border border-[#DCE6D0]">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#A3D32F]/25 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-[#549FE3]/20 blur-3xl pointer-events-none" />

            <div className="relative grid lg:grid-cols-2 gap-8 items-center p-8 sm:p-10 md:p-12">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7BA82A] mb-3">
                  {cta.eyebrow}
                </p>
                <h2 className="font-bold text-3xl sm:text-4xl text-[#1F2A14] leading-tight tracking-tight mb-4">
                  {cta.heading}
                </h2>
                <p className="text-[15px] text-[#5A6750] leading-relaxed max-w-lg mb-7">
                  {cta.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={cta.primaryCta.href}
                    className="inline-flex items-center justify-center gap-2 bg-[#A3D32F] text-[#1F2A14] rounded-2xl px-6 py-3.5 text-sm font-semibold hover:bg-[#92C120] transition-colors"
                  >
                    {cta.primaryCta.label}
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={cta.secondaryCta.href}
                    className="inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-medium text-[#3D4A32] bg-white border border-[#D5E0C8] hover:border-[#A3D32F] transition-colors"
                  >
                    {cta.secondaryCta.label}
                  </Link>
                </div>
              </div>

              <div className="relative hidden lg:block h-[260px]">
                <div className="absolute inset-0 rounded-2xl overflow-hidden border border-white/60">
                  <Image
                    src={cta.image}
                    alt={cta.imageAlt}
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
