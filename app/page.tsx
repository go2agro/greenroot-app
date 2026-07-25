'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Globe, 
  Settings, 
  Briefcase, 
  UserCheck, 
  User, 
  CheckCircle, 
  CircleHelp
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

export default function Home() {
  const [featured, setFeatured] = useState<FeaturedInternship[]>([])

  useEffect(() => {
    getTopPaidInternships(3).then((result) => {
      if (result.data) setFeatured(result.data as FeaturedInternship[])
    })
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="w-full py-12 md:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Column */}
            <div className="flex flex-col gap-6">
              <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl text-[#1A1A1A] leading-tight">
                Empowering the Next Generation of{' '}
                <span className="text-[#A3D32F]">Agricultural Leaders</span>
              </h1>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed font-semibold">
                Gain hands-on experience with world-class farms and agricultural 
                organizations across the globe.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/internships" 
                  className="bg-[#A3D32F] text-white rounded-lg px-6 py-3 font-semibold hover:bg-[#92C120] transition-colors text-center"
                >
                  Browse Internships
                </Link>
                <Link 
                  href="/about" 
                  className="border border-gray-300 text-gray-700 rounded-lg px-6 py-3 font-medium hover:border-[#A3D32F] transition-colors text-center"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Column - Image Collage */}
            <div className="relative h-[400px] md:h-[500px]">
              <div className="absolute top-0 right-0 w-[45%] h-[45%] rounded-xl overflow-hidden shadow-lg z-10">
                <Image 
                  src="https://picsum.photos/300/200?random=1" 
                  alt="Agricultural work" 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 w-[45%] h-[45%] rounded-xl overflow-hidden shadow-lg z-10">
                <Image 
                  src="https://picsum.photos/300/200?random=2" 
                  alt="Farm landscape" 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-xl overflow-hidden shadow-xl z-20">
                <Image 
                  src="https://picsum.photos/300/200?random=3" 
                  alt="Students learning" 
                  fill
                  className="object-cover"
                />
              </div>
              {/* Decorative Elements */}
              <div className="absolute top-[10%] left-[5%] w-3 h-3 bg-[#A3D32F] rounded-full"></div>
              <div className="absolute bottom-[15%] right-[10%] w-3 h-3 bg-[#A3D32F] rounded-full"></div>
              <div className="absolute top-[60%] right-[5%] w-4 h-4 border-2 border-[#A3D32F]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="w-full bg-white border-t border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex flex-col items-center justify-center gap-2 pt-8 md:pt-0">
              <AnimatedCounter
                target={300}
                suffix="+"
                className="font-bold text-3xl text-[#549FE3]"
              />
              <div className="text-sm text-gray-600 font-semibold">Total students</div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 pt-8 md:pt-0">
              <AnimatedCounter
                target={5}
                suffix="+"
                padStart={2}
                className="font-bold text-3xl text-[#549FE3]"
              />
              <div className="text-sm text-gray-600 font-semibold">Total countries</div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 pt-8 md:pt-0">
              <AnimatedCounter
                target={8}
                suffix="+"
                padStart={2}
                className="font-bold text-3xl text-[#549FE3]"
              />
              <div className="text-sm text-gray-600 font-semibold">Total Internships</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE GREENROOT */}
      <section id="about" className="w-full py-12 md:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left - Image */}
            <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden">
              <Image 
                src="https://picsum.photos/400/600?random=4" 
                alt="Agriculture" 
                fill
                className="object-cover"
              />
            </div>

            {/* Right - Content */}
            <div className="flex flex-col gap-6">
              <h2 className="font-bold text-2xl md:text-3xl text-[#1A1A1A]">
                Why Choose <span className="text-[#A3D32F]">GreenRoot?</span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 1 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <Globe className="w-8 h-8 text-[#A3D32F] mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">International Experience</h3>
                  <p className="text-sm text-gray-600">Work with global agricultural organizations.</p>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <Settings className="w-8 h-8 text-[#A3D32F] mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">Modern Agriculture</h3>
                  <p className="text-sm text-gray-600">Learn advanced farming technologies.</p>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <Briefcase className="w-8 h-8 text-[#A3D32F] mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">Career Growth</h3>
                  <p className="text-sm text-gray-600">Build valuable industry experience.</p>
                </div>

                {/* Card 4 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <UserCheck className="w-8 h-8 text-[#A3D32F] mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">Expert Guidance</h3>
                  <p className="text-sm text-gray-600">Support throughout the process.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED COUNTRIES */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-[#A3D32F]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-bold text-2xl md:text-3xl text-[#1A1A1A] mb-12">
            Featured <span className="text-[#A3D32F]">Countries</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { flag: '🇩🇰', name: 'Denmark' },
              { flag: '🇩🇪', name: 'Germany' },
              { flag: '🇺🇸', name: 'USA' },
              { flag: '🇮🇱', name: 'Israel' },
              { flag: '🇦🇺', name: 'Australia' },
              { flag: '🇨🇦', name: 'Canada' },
              { flag: '🇮🇹', name: 'Italy' },
              { flag: '🇵🇹', name: 'Portugal' },
              { flag: '🇵🇪', name: 'Peru' },
            ].map((country) => (
              <div 
                key={country.name}
                className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md hover:border hover:border-[#A3D32F] transition-all cursor-pointer border border-gray-100"
              >
                <span className="text-4xl">{country.flag}</span>
                <span className="text-gray-700 font-medium">{country.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-bold text-2xl md:text-3xl text-[#1A1A1A] mb-12">
            How It <span className="text-[#A3D32F]">Works?</span>
          </h2>
          
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-4">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-16 h-16 rounded-full bg-[#A3D32F] flex items-center justify-center text-white">
                <User className="w-8 h-8" />
              </div>
              <p className="text-xs font-semibold text-[#A3D32F] uppercase tracking-wide">Step 1</p>
              <p className="font-medium text-gray-900 text-center">Create Profile</p>
            </div>

            {/* Connector */}
            <div className="hidden md:block flex-1 border-t-2 border-dashed border-[#A3D32F] opacity-40 mt-8"></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-16 h-16 rounded-full bg-[#A3D32F] flex items-center justify-center text-white">
                <Globe className="w-8 h-8" />
              </div>
              <p className="text-xs font-semibold text-[#A3D32F] uppercase tracking-wide">Step 2</p>
              <p className="font-medium text-gray-900 text-center">Browse Internships</p>
            </div>

            {/* Connector */}
            <div className="hidden md:block flex-1 border-t-2 border-dashed border-[#A3D32F] opacity-40 mt-8"></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-16 h-16 rounded-full bg-[#A3D32F] flex items-center justify-center text-white">
                <Briefcase className="w-8 h-8" />
              </div>
              <p className="text-xs font-semibold text-[#A3D32F] uppercase tracking-wide">Step 3</p>
              <p className="font-medium text-gray-900 text-center">Submit Application</p>
            </div>

            {/* Connector */}
            <div className="hidden md:block flex-1 border-t-2 border-dashed border-[#A3D32F] opacity-40 mt-8"></div>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-16 h-16 rounded-full bg-[#A3D32F] flex items-center justify-center text-white">
                <CheckCircle className="w-8 h-8" />
              </div>
              <p className="text-xs font-semibold text-[#A3D32F] uppercase tracking-wide">Step 4</p>
              <p className="font-medium text-gray-900 text-center">Start your Journey!</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED OPPORTUNITIES */}
      <section id="opportunities" className="w-full py-12 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-bold text-2xl md:text-3xl text-[#1A1A1A] mb-12">
            Featured <span className="text-[#A3D32F]">Opportunities</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((internship) => (
              <div
                key={internship.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
              >
                <div className="relative h-48 w-full">
                  <Image 
                    src={internship.image_url || `https://picsum.photos/seed/${internship.id}/400/250`}
                    alt={internship.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <span className="text-base">
                      {getCountryFlag(internship.country, internship.flag_emoji)}
                    </span>
                    <span>{internship.country || 'Global'}</span>
                  </p>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{internship.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {internship.duration_months
                      ? `${internship.duration_months} months`
                      : 'Flexible'}
                    {internship.stipend_monthly
                      ? ` - $ ${internship.stipend_monthly.toLocaleString()} / Month`
                      : ' - Paid Internship'}
                  </p>
                  <Link 
                    href={`/internships/${internship.id}`}
                    className="w-full block text-center bg-[#A3D32F] text-white rounded-lg py-2 hover:bg-[#92C120] transition-colors font-semibold"
                  >
                    Apply Now
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
          <h2 className="font-bold text-2xl md:text-3xl text-[#1A1A1A] mb-12">
            Success <span className="text-[#A3D32F]">Stories</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-[#A3D32F]/10 rounded-xl p-6 shadow-sm border-l-4 border-[#A3D32F]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="font-bold text-gray-600">SJ</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Sarah J.</p>
                  <p className="text-sm text-gray-500">Intern in Denmark</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 italic">
                &quot;GreenRoot didn&apos;t just find me an internship; they found me a career. 
                The mentorship I received in Denmark changed my entire perspective on 
                sustainable dairy farming.&quot;
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-[#A3D32F]/10 rounded-xl p-6 shadow-sm border-l-4 border-[#A3D32F]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="font-bold text-gray-600">MT</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Marcus T.</p>
                  <p className="text-sm text-gray-500">Intern in Singapore</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 italic">
                &quot;The application process was seamless. Within weeks, I was working on a 
                rooftop hydroponics project that combined my love for tech and plants.&quot;
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-[#A3D32F]/10 rounded-xl p-6 shadow-sm border-l-4 border-[#A3D32F]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="font-bold text-gray-600">ER</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Elena R.</p>
                  <p className="text-sm text-gray-500">Intern in Portugal</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 italic">
                &quot;I gained hands-on experience that no textbook could ever provide. 
                GreenRoot is truly bridging the gap for the next generation of ag-leaders.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8 md:gap-12">
            {/* Left Column */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <CircleHelp className="w-12 h-12 text-[#A3D32F]" />
              <h2 className="font-bold text-2xl md:text-3xl text-[#1A1A1A]">
                Frequently Asked <span className="text-[#A3D32F]">Questions</span>
              </h2>
              <p className="text-sm text-gray-600">
                Find answers to the most common questions about GreenRoot internships.
              </p>
            </div>

            {/* Right Column - Accordion */}
            <div className="md:col-span-3 flex flex-col gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="text-left hover:no-underline text-base font-semibold">
                      Who can apply for GreenRoot internships?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-sm">
                      Any agriculture student or recent graduate can apply. We welcome students 
                      from all agricultural disciplines across India.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-2" className="border-none">
                    <AccordionTrigger className="text-left hover:no-underline text-base font-semibold">
                      Which countries offer internship opportunities?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-sm">
                      We currently offer internships in Denmark, Germany, USA, Israel, Australia, 
                      Canada, Italy, Portugal, and Peru.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-3" className="border-none">
                    <AccordionTrigger className="text-left hover:no-underline text-base font-semibold">
                      How do I apply for an internship?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-sm">
                      Create your profile, browse available internships, and submit your application 
                      through our simple 10-step process.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-4" className="border-none">
                    <AccordionTrigger className="text-left hover:no-underline text-base font-semibold">
                      What documents are required to apply?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-sm">
                      You will need your resume, passport copy, academic transcripts, recommendation 
                      letters, and a statement of purpose.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-6">
              <h2 className="font-bold text-3xl md:text-4xl text-[#1A1A1A] leading-tight">
                Ready to Start Your{' '}
                <span className="text-[#A3D32F]">Global Agriculture Journey?</span>
              </h2>
              <p className="text-sm md:text-base text-gray-600">
                Join thousands of students and companies growing the future of agriculture.
              </p>
              <div>
                <Link 
                  href="/internships"
                  className="inline-block bg-[#A3D32F] text-white rounded-lg px-6 py-3 font-semibold hover:bg-[#92C120] transition-colors"
                >
                  Browse Internships
                </Link>
              </div>
            </div>

            {/* Right Image - Hidden on mobile */}
            <div className="hidden md:block relative h-[300px] rounded-xl overflow-hidden">
              <Image 
                src="https://picsum.photos/400/300?random=8" 
                alt="Students in agriculture" 
                fill
                className="object-cover"
              />
              <div className="absolute -top-4 -left-4 w-3 h-3 bg-[#A3D32F] rounded-full"></div>
              <div className="absolute -bottom-4 -right-4 w-3 h-3 bg-[#A3D32F] rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
