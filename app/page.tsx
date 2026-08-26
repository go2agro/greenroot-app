'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Globe,
  Settings,
  Briefcase,
  User,
  CheckCircle,
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
import AnimatedCounter from '@/components/AnimatedCounter';
import { getTopPaidInternships } from '@/lib/internships';
import landingConfig from '@/config/pages/landing.json';
import { BTN_APPLY_NOW, DEFAULT_INTERNSHIP_IMAGE } from '@/lib/appConfig';

const FEATURE_ICONS: Record<string, LucideIcon> = {
  'global-network': Globe,
  'visa-support': Settings,
  'career-growth': Briefcase,
};

const HOW_IT_WORKS_ICONS: Record<string, LucideIcon> = {
  user: User,
  globe: Globe,
  briefcase: Briefcase,
  checkCircle: CheckCircle,
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
            <div className="flex flex-col gap-6">
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
                >
                  {landingConfig.hero.cta_primary_text}
                </Link>
                <Link
                  href={landingConfig.hero.cta_secondary_link}
                  className="border border-gr-border text-gr-text-dark rounded-lg px-6 py-3 font-medium hover:border-gr-primary transition-colors text-center"
                >
                  {landingConfig.hero.cta_secondary_text}
                </Link>
              </div>
            </div>

            <div className="relative h-[400px] md:h-[500px]">
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
                />
              </div>
              <div className="absolute top-[10%] left-[5%] w-3 h-3 bg-gr-primary rounded-full" />
              <div className="absolute bottom-[15%] right-[10%] w-3 h-3 bg-gr-primary rounded-full" />
              <div className="absolute top-[60%] right-[5%] w-4 h-4 border-2 border-gr-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="w-full bg-white border-t border-b border-gr-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`grid grid-cols-1 ${statsGridClass} gap-8 divide-y md:divide-y-0 md:divide-x divide-gr-border`}
          >
            {landingConfig.stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center gap-2 pt-8 md:pt-0"
              >
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  padStart={stat.value < 100 ? 2 : undefined}
                  className="font-bold text-3xl text-gr-secondary"
                />
                <div className="text-sm text-gr-text-muted font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="about" className="w-full py-12 md:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden">
              <Image
                src={landingConfig.features.image.src}
                alt={landingConfig.features.image.alt}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-col gap-6">
              <h2 className="font-bold text-2xl md:text-3xl text-gr-text-dark">
                {landingConfig.features.heading}
              </h2>
              <p className="text-sm text-gr-text-muted">{landingConfig.features.subheading}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {landingConfig.features.items.map((item) => {
                  const Icon = FEATURE_ICONS[item.id] ?? Globe
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gr-border hover:shadow-md transition-shadow"
                    >
                      <Icon className="w-8 h-8 text-gr-primary mb-3" />
                      <h3 className="font-bold text-gr-text-dark mb-1">{item.title}</h3>
                      <p className="text-sm text-gr-text-muted">{item.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED COUNTRIES */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-gr-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            prefix={landingConfig.featuredCountries.heading_prefix}
            highlight={landingConfig.featuredCountries.heading_highlight}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {landingConfig.featuredCountries.countries.map((country) => (
              <div
                key={country.name}
                className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md hover:border hover:border-gr-primary transition-all cursor-pointer border border-gr-border"
              >
                <span className="text-4xl">{country.flag}</span>
                <span className="text-gr-text-dark font-medium">{country.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            prefix={landingConfig.howItWorks.heading_prefix}
            highlight={landingConfig.howItWorks.heading_highlight}
          />

          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-4">
            {landingConfig.howItWorks.steps.flatMap((step, index) => {
              const Icon = HOW_IT_WORKS_ICONS[step.icon] ?? User
              const elements = [
                <div key={step.id} className="flex flex-col items-center gap-3 flex-1">
                  <div className="w-16 h-16 rounded-full bg-gr-primary flex items-center justify-center text-white">
                    <Icon className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-semibold text-gr-primary uppercase tracking-wide">
                    {step.stepLabel}
                  </p>
                  <p className="font-medium text-gr-text-dark text-center">{step.title}</p>
                </div>,
              ]

              if (index < landingConfig.howItWorks.steps.length - 1) {
                elements.push(
                  <div
                    key={`${step.id}-connector`}
                    className="hidden md:block flex-1 border-t-2 border-dashed border-gr-primary opacity-40 mt-8"
                  />
                )
              }

              return elements
            })}
          </div>
        </div>
      </section>

      {/* FEATURED OPPORTUNITIES */}
      <section id="opportunities" className="w-full py-12 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            prefix={landingConfig.featuredOpportunities.heading_prefix}
            highlight={landingConfig.featuredOpportunities.heading_highlight}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((internship) => (
              <div
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
                  >
                    {BTN_APPLY_NOW}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            prefix={landingConfig.successStories.heading_prefix}
            highlight={landingConfig.successStories.heading_highlight}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {landingConfig.successStories.stories.map((story) => (
              <div
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-gr-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8 md:gap-12">
            <div className="md:col-span-2 flex flex-col gap-4">
              <CircleHelp className="w-12 h-12 text-gr-primary" />
              <SectionHeading
                prefix={landingConfig.faq.heading_prefix}
                highlight={landingConfig.faq.heading_highlight}
                className="mb-0"
              />
              <p className="text-sm text-gr-text-muted">{landingConfig.faq.description}</p>
            </div>

            <div className="md:col-span-3 flex flex-col gap-4">
              {landingConfig.faq.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gr-border"
                >
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={item.id} className="border-none">
                      <AccordionTrigger className="text-left hover:no-underline text-base font-semibold">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gr-text-muted text-sm">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="flex flex-col gap-6">
              <h2 className="font-bold text-3xl md:text-4xl text-gr-text-dark leading-tight">
                {landingConfig.cta.heading}
              </h2>
              <p className="text-sm md:text-base text-gr-text-muted">
                {landingConfig.cta.subheading}
              </p>
              <div>
                <Link
                  href={landingConfig.cta.button_link}
                  className="inline-block bg-gr-primary text-white rounded-lg px-6 py-3 font-semibold hover:bg-gr-primary-hover transition-colors"
                >
                  {landingConfig.cta.button_text}
                </Link>
              </div>
            </div>

            <div className="hidden md:block relative h-[300px] rounded-xl overflow-hidden">
              <Image
                src={landingConfig.cta.image.src}
                alt={landingConfig.cta.image.alt}
                fill
                className="object-cover"
              />
              <div className="absolute -top-4 -left-4 w-3 h-3 bg-gr-primary rounded-full" />
              <div className="absolute -bottom-4 -right-4 w-3 h-3 bg-gr-primary rounded-full" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
