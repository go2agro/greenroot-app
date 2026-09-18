'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Globe,
  HandHeart,
  Eye,
  Award,
  Briefcase,
  User,
  FileCheck,
  Plane,
  CircleHelp,
  type LucideIcon,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeaturedCountriesMarquee from '@/components/FeaturedCountriesMarquee';
import FeaturesBento from '@/components/FeaturesBento';
import SectionDivider from '@/components/SectionDivider';
import AnimatedCounter from '@/components/AnimatedCounter';
import MotionReveal from '@/components/motion/MotionReveal';
import { MotionStagger, MotionStaggerItem } from '@/components/motion/MotionStagger';
import { getTopPaidInternships } from '@/lib/internships';
import landingConfig from '@/config/pages/landing.json';
import { BTN_APPLY_NOW, DEFAULT_INTERNSHIP_IMAGE } from '@/lib/appConfig';
import { analyticsAttrs } from '@/lib/analytics/attributes';

const FEATURE_ICONS: Record<string, LucideIcon> = {
  integrity: HandHeart,
  transparency: Eye,
  'service-excellence': Award,
  'international-training': Globe,
};

const HOW_IT_WORKS_ICONS: Record<string, LucideIcon> = {
  user: User,
  globe: Globe,
  briefcase: Briefcase,
  fileCheck: FileCheck,
  plane: Plane,
};

const STATS_GRID_CLASS: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

type FeaturedInternship = {
  id: string
  title: string
  country?: string
  duration_months?: number
  stipend_monthly?: number
  image_url?: string
  flag_emoji?: string
}

const getCountryFlag = (country?: string, emoji?: string) => {
  if (emoji) return emoji
  if (!country) return '🌍'

  const countryToCode: { [key: string]: string } = {
    'USA': 'US',
    'United States': 'US',
    'UK': 'GB',
    'United Kingdom': 'GB',
    'Canada': 'CA',
    'Australia': 'AU',
    'India': 'IN',
    'Germany': 'DE',
    'France': 'FR',
    'Italy': 'IT',
    'Spain': 'ES',
    'Netherlands': 'NL',
    'Denmark': 'DK',
    'Portugal': 'PT',
    'Israel': 'IL',
    'Peru': 'PE',
  }

  const code = countryToCode[country] || countryToCode[country.split(',')[0]?.trim()]
  if (!code) return '🌍'
  return String.fromCodePoint(...[...code].map(c => c.charCodeAt(0) + 127397))
}

function SectionHeading({
  prefix,
  highlight,
  className = 'mb-12',
}: {
  prefix: string
  highlight: string
  className?: string
}) {
  return (
    <h2 className={`font-bold text-2xl md:text-3xl text-gr-text-dark ${className}`}>
      {prefix} <span className="text-gr-primary">{highlight}</span>
    </h2>
  )
}

export default function Home() {
  const [featured, setFeatured] = useState<FeaturedInternship[]>([])
  const statsGridClass =
    STATS_GRID_CLASS[landingConfig.stats.length] ?? 'md:grid-cols-3'

  useEffect(() => {
    getTopPaidInternships(3).then((result) => {
      if (result.data) setFeatured(result.data as FeaturedInternship[])
    })
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO */}
      <section className="w-full py-12 md:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <MotionReveal className="flex flex-col gap-6">
              <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl text-gr-text-dark leading-tight">
                {landingConfig.hero.heading_prefix}{' '}
                <span className="text-gr-primary">{landingConfig.hero.heading_highlight}</span>
              </h1>
              <p className="text-sm md:text-base text-gr-text-muted leading-relaxed font-semibold">
                {landingConfig.hero.subheading}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={landingConfig.hero.cta_primary_link}
                  className="bg-gr-primary text-white rounded-lg px-6 py-3 font-semibold hover:bg-gr-primary-hover transition-colors text-center"
                  {...analyticsAttrs({
                    id: 'home_hero_browse_internships',
                    label: landingConfig.hero.cta_primary_text,
                    section: 'home_hero',
                    type: 'marketing_cta',
                  })}
                >
                  {landingConfig.hero.cta_primary_text}
                </Link>
                <Link
                  href={landingConfig.hero.cta_secondary_link}
                  className="border border-gr-border text-gr-text-dark rounded-lg px-6 py-3 font-medium hover:border-gr-primary transition-colors text-center"
                  {...analyticsAttrs({
                    id: 'home_hero_learn_more',
                    label: landingConfig.hero.cta_secondary_text,
                    section: 'home_hero',
                    type: 'marketing_cta',
                  })}
                >
                  {landingConfig.hero.cta_secondary_text}
                </Link>
              </div>
            </MotionReveal>

            <MotionReveal delay={0.08} className="relative h-[400px] md:h-[500px]">
              <div className="absolute top-0 right-0 w-[45%] h-[45%] rounded-xl overflow-hidden shadow-lg z-10">
                <Image
                  src={landingConfig.hero.images.collage_top_right.src}
                  alt={landingConfig.hero.images.collage_top_right.alt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 w-[45%] h-[45%] rounded-xl overflow-hidden shadow-lg z-10">
                <Image
                  src={landingConfig.hero.images.collage_bottom_left.src}
                  alt={landingConfig.hero.images.collage_bottom_left.alt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-xl overflow-hidden shadow-xl z-20">
                <Image
                  src={landingConfig.hero.images.collage_center.src}
                  alt={landingConfig.hero.images.collage_center.alt}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </MotionReveal>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* STATS */}
      <section className="w-full bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`grid grid-cols-1 ${statsGridClass} gap-8 divide-y md:divide-y-0 md:divide-x divide-gr-border`}
          >
            {landingConfig.stats.map((stat, index) => (
              <MotionReveal
                key={index}
                delay={index * 0.08}
                className="flex flex-col items-center justify-center gap-2 pt-8 md:pt-0"
              >
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  padStart={stat.value < 100 ? 2 : undefined}
                  className="font-bold text-3xl text-gr-secondary"
                />
                <div className="text-sm text-gr-text-muted font-semibold">{stat.label}</div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* FEATURES */}
      <section id="about" className="w-full py-12 md:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-8 md:gap-10 md:items-stretch">
            <MotionReveal className="relative mx-auto w-full max-w-[320px] aspect-[3/4] md:mx-0 md:max-w-none md:aspect-auto md:h-full md:min-h-[360px] rounded-3xl overflow-hidden shadow-md">
              <Image
                src={landingConfig.features.image.src}
                alt={landingConfig.features.image.alt}
                fill
                className="object-cover object-center"
              />
            </MotionReveal>

            <div className="flex h-full flex-col gap-6">
              <MotionReveal>
                <h2 className="font-bold text-2xl md:text-3xl text-gr-text-dark">
                  {landingConfig.features.heading_prefix}{' '}
                  <span className="text-gr-primary">{landingConfig.features.heading_highlight}</span>
                </h2>
                <p className="mt-3 text-sm text-gr-text-muted">{landingConfig.features.subheading}</p>
              </MotionReveal>

              <FeaturesBento items={landingConfig.features.items} icons={FEATURE_ICONS} />
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* FEATURED COUNTRIES */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-gr-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal>
          <SectionHeading
            prefix={landingConfig.featuredCountries.heading_prefix}
            highlight={landingConfig.featuredCountries.heading_highlight}
          />
          </MotionReveal>

          <MotionReveal delay={0.08}>
            <FeaturedCountriesMarquee countries={landingConfig.featuredCountries.countries} />
          </MotionReveal>
        </div>
      </section>

      <SectionDivider />

      {/* HOW IT WORKS */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal>
            <SectionHeading
              prefix={landingConfig.howItWorks.heading_prefix}
              highlight={landingConfig.howItWorks.heading_highlight}
            />
          </MotionReveal>

          <MotionStagger className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-3">
            {landingConfig.howItWorks.steps.flatMap((step, index) => {
              const Icon = HOW_IT_WORKS_ICONS[step.icon] ?? User
              const elements = [
                <MotionStaggerItem key={step.id} className="flex flex-col items-center gap-3 flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-full bg-gr-primary flex items-center justify-center text-white">
                    <Icon className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-semibold text-gr-primary uppercase tracking-wide">
                    {step.stepLabel}
                  </p>
                  <p className="font-medium text-gr-text-dark text-center text-sm md:text-base px-1">
                    {step.title}
                  </p>
                </MotionStaggerItem>,
              ]

              if (index < landingConfig.howItWorks.steps.length - 1) {
                elements.push(
                  <div
                    key={`${step.id}-connector`}
                    className="hidden md:block flex-1 border-t-2 border-dashed border-gr-primary opacity-40 mt-8 min-w-4"
                  />
                )
              }

              return elements
            })}
          </MotionStagger>
        </div>
      </section>

      <SectionDivider />

      {/* FEATURED OPPORTUNITIES */}
      <section id="opportunities" className="w-full py-12 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal>
            <SectionHeading
              prefix={landingConfig.featuredOpportunities.heading_prefix}
              highlight={landingConfig.featuredOpportunities.heading_highlight}
            />
          </MotionReveal>

          <MotionStagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((internship) => (
              <MotionStaggerItem
                key={internship.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gr-border overflow-hidden"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={internship.image_url || DEFAULT_INTERNSHIP_IMAGE}
                    alt={internship.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gr-text-muted mb-1 flex items-center gap-2">
                    <span className="text-base">
                      {getCountryFlag(internship.country, internship.flag_emoji)}
                    </span>
                    <span>{internship.country || 'Global'}</span>
                  </p>
                  <h3 className="font-bold text-lg text-gr-text-dark mb-2">{internship.title}</h3>
                  <p className="text-sm text-gr-text-muted mb-4">
                    {internship.duration_months
                      ? `${internship.duration_months} months`
                      : 'Flexible'}
                    {internship.stipend_monthly
                      ? ` - $ ${internship.stipend_monthly.toLocaleString()} / Month`
                      : ' - Paid Internship'}
                  </p>
                  <Link
                    href={`/internships/${internship.id}`}
                    className="w-full block text-center bg-gr-primary text-white rounded-lg py-2 hover:bg-gr-primary-hover transition-colors font-semibold"
                    {...analyticsAttrs({
                      id: `home_featured_internship_${internship.id}`,
                      label: internship.title,
                      section: 'home_featured_opportunities',
                      type: 'internship_cta',
                    })}
                  >
                    {BTN_APPLY_NOW}
                  </Link>
                </div>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </section>

      <SectionDivider />

      {/* SUCCESS STORIES */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal>
            <SectionHeading
              prefix={landingConfig.successStories.heading_prefix}
              highlight={landingConfig.successStories.heading_highlight}
            />
          </MotionReveal>

          <MotionStagger className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {landingConfig.successStories.stories.map((story) => (
              <MotionStaggerItem
                key={story.id}
                className="bg-gr-primary/10 rounded-xl p-6 shadow-sm border-l-4 border-gr-primary"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gr-border flex items-center justify-center">
                    <span className="font-bold text-gr-text-muted">{story.initials}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gr-text-dark">{story.name}</p>
                    <p className="text-sm text-gr-text-muted">{story.role}</p>
                  </div>
                </div>
                <p className="text-sm text-gr-text-muted italic">&quot;{story.quote}&quot;</p>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </section>

      <SectionDivider />

      {/* FAQ */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-gr-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal className="flex flex-col items-center text-center gap-4 mb-10 md:mb-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gr-primary-light">
              <CircleHelp className="h-7 w-7 text-gr-primary" />
            </div>
            <SectionHeading
              prefix={landingConfig.faq.heading_prefix}
              highlight={landingConfig.faq.heading_highlight}
              className="mb-0"
            />
            <p className="max-w-2xl text-sm md:text-base text-gr-text-muted">
              {landingConfig.faq.description}
            </p>
          </MotionReveal>

          <MotionReveal delay={0.08} className="overflow-hidden rounded-2xl border border-gr-border bg-white shadow-sm">
            <Accordion type="single" collapsible className="w-full divide-y divide-gr-border">
              {landingConfig.faq.items.map((item, index) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-none px-5 md:px-6 data-[state=open]:bg-gr-primary-light/40"
                >
                  <AccordionTrigger className="gap-4 py-5 text-left hover:no-underline hover:text-gr-primary [&[data-state=open]]:text-gr-primary">
                    <span className="flex min-w-0 flex-1 items-start gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gr-primary-light text-sm font-bold text-gr-primary">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 text-base md:text-lg font-semibold text-gr-text-dark group-aria-expanded/accordion-trigger:text-gr-primary">
                        {item.question}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 pl-12 md:pl-14 text-sm md:text-base leading-relaxed text-gr-text-muted">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </MotionReveal>
        </div>
      </section>

      <SectionDivider />

      {/* CTA */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <MotionReveal className="flex flex-col gap-6">
              <h2 className="font-bold text-3xl md:text-4xl text-gr-text-dark leading-tight">
                {landingConfig.cta.heading_prefix}{' '}
                <span className="text-gr-primary">{landingConfig.cta.heading_highlight}</span>
              </h2>
              <p className="text-sm md:text-base text-gr-text-muted">
                {landingConfig.cta.subheading}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={landingConfig.cta.primary_button_link}
                  className="inline-block bg-gr-primary text-white rounded-lg px-6 py-3 font-semibold hover:bg-gr-primary-hover transition-colors"
                  {...analyticsAttrs({
                    id: 'home_bottom_browse_internships',
                    label: landingConfig.cta.primary_button_text,
                    section: 'home_bottom_cta',
                    type: 'marketing_cta',
                  })}
                >
                  {landingConfig.cta.primary_button_text}
                </Link>
                <Link
                  href={landingConfig.cta.secondary_button_link}
                  className="inline-block border border-gray-300 text-gray-700 rounded-lg px-6 py-3 font-semibold hover:border-gr-primary transition-colors"
                  {...analyticsAttrs({
                    id: 'home_bottom_create_account',
                    label: landingConfig.cta.secondary_button_text,
                    section: 'home_bottom_cta',
                    type: 'marketing_cta',
                  })}
                >
                  {landingConfig.cta.secondary_button_text}
                </Link>
              </div>
            </MotionReveal>

            <MotionReveal delay={0.08} className="hidden md:block relative h-[300px] rounded-xl overflow-hidden">
              <Image
                src={landingConfig.cta.image.src}
                alt={landingConfig.cta.image.alt}
                fill
                className="object-cover"
              />
            </MotionReveal>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
