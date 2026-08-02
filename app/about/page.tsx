import Link from 'next/link'
import Image from 'next/image'
import {
  Leaf,
  Globe,
  HandHeart,
  Briefcase,
  Scale,
  Handshake,
  GraduationCap,
  ArrowUpRight,
  Sprout,
  Compass,
  Sun,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const storyChapters = [
  {
    step: '01',
    title: 'The seed',
    label: 'Why we began',
    icon: Sprout,
    body: 'Agriculture students were ready to grow — but the path to real, international experience felt distant, confusing, and out of reach. GreenRoot began as a simple belief: opportunity should travel as freely as ambition.',
  },
  {
    step: '02',
    title: 'The roots',
    label: 'How we work',
    icon: Compass,
    body: 'We carefully curate internships with farms and agri organizations worldwide — pairing students with mentors, clear expectations, and hands-on learning that turns classroom knowledge into field confidence.',
  },
  {
    step: '03',
    title: 'The canopy',
    label: 'What we promise',
    icon: Sun,
    body: 'Every placement is built on transparency and trust. No guesswork, no empty listings — just meaningful experience that helps the next generation of agri-professionals stand taller in a changing world.',
  },
]

const pillars = [
  {
    title: 'Mission',
    icon: Leaf,
    text: 'Open trusted global internships so agriculture students can learn, innovate, and grow into confident professionals.',
  },
  {
    title: 'Vision',
    icon: Globe,
    text: 'Become the platform students and industry leaders trust most to connect talent with worldwide agri opportunity.',
  },
  {
    title: 'Promise',
    icon: HandHeart,
    text: 'Curate every internship for quality and clarity — so every student walks into real experience, not uncertainty.',
  },
]

const stats = [
  { value: '5000+', label: 'Students placed' },
  { value: '24', label: 'Countries reached' },
  { value: '200+', label: 'Partner firms' },
]

const founders = [
  {
    name: 'Mr. Sunil Landkar',
    role: 'Co-founder & CEO',
    email: 'sunil@go2agro.com',
    mobile: '+91 7972537388',
    image: 'https://picsum.photos/400/500?random=42',
  },
]

const teamMembers = [
  {
    name: 'Shubham Jaydeokar',
    role: 'Tech Lead',
    image: 'https://picsum.photos/400/500?random=50',
  },
  {
    name: 'Kasturi Pawde',
    role: 'Design Head',
    image: 'https://picsum.photos/400/500?random=51',
  },
]

const advisors = [
  {
    name: 'Mr. Abraham Yehunda',
    roleLine1: 'CEO Israel-India Initiative',
    roleLine2: 'Advisor - International Associate',
    image: 'https://picsum.photos/80/80?random=43',
  },
  {
    name: 'Giri & Jadhav Associate',
    roleLine1: 'Advisor - Finance & Tax',
    roleLine2: null,
    icon: 'briefcase' as const,
  },
  {
    name: 'Mr. Sharad Pabale',
    roleLine1: 'CEO Israel-India Initiative',
    roleLine2: 'Advisor - International Associate',
    image: 'https://picsum.photos/80/80?random=45',
  },
  {
    name: 'Radhika Sakseria',
    roleLine1: 'Advocate',
    roleLine2: null,
    icon: 'scale' as const,
  },
]

const goals = [
  {
    icon: Globe,
    title: 'Wider horizons',
    text: 'Open internship pathways in more countries each year.',
  },
  {
    icon: Handshake,
    title: 'Deeper partnerships',
    text: 'Grow with leading farms and agricultural organizations.',
  },
  {
    icon: GraduationCap,
    title: 'Ready for the field',
    text: 'Help students leave with practical, career-ready skills.',
  },
  {
    icon: Leaf,
    title: 'Grow responsibly',
    text: 'Champion sustainable and innovative farming practices.',
  },
]

export default function About() {
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
                  Our story · GreenRoot
                </p>
                <h1 className="font-bold text-4xl sm:text-5xl lg:text-[3.25rem] text-[#1F2A14] leading-[1.08] tracking-tight">
                  We grow careers{' '}
                  <span className="text-[#A3D32F]">the way nature does</span>
                  {' '}— patiently, globally, with purpose.
                </h1>
                <p className="text-base md:text-lg text-[#5A6750] leading-relaxed max-w-lg">
                  GreenRoot is where agriculture students meet the world. We open
                  doors to international internships so tomorrow&apos;s agri
                  leaders can learn in the field, not just from textbooks.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <Link
                    href="/internships"
                    className="inline-flex items-center justify-center gap-2 bg-[#A3D32F] text-[#1F2A14] rounded-2xl px-6 py-3.5 text-sm font-semibold hover:bg-[#92C120] transition-colors"
                  >
                    Explore internships
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="#our-story"
                    className="inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-medium text-[#3D4A32] bg-white/80 border border-[#D5E0C8] hover:border-[#A3D32F] transition-colors"
                  >
                    Read our story
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 h-[340px] sm:h-[400px]">
                <div className="relative row-span-2 rounded-3xl overflow-hidden bg-[#E4EED4]">
                  <Image
                    src="https://picsum.photos/700/800?random=40"
                    alt="Students learning in an agricultural field"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    priority
                  />
                </div>
                <div className="relative rounded-3xl overflow-hidden bg-[#D6EAF8]">
                  <Image
                    src="https://picsum.photos/400/300?random=49"
                    alt="Greenhouse research"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="rounded-3xl bg-[#A3D32F] p-5 flex flex-col justify-between">
                  <Sprout className="w-6 h-6 text-[#1F2A14]" />
                  <div>
                    <p className="font-bold text-3xl text-[#1F2A14] tracking-tight">
                      5000+
                    </p>
                    <p className="text-xs font-medium text-[#1F2A14]/75 mt-1 leading-snug">
                      students guided into global agri careers
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
              Our story
            </p>
            <h2 className="font-bold text-3xl md:text-4xl text-[#1F2A14] tracking-tight leading-tight mb-4">
              Grown from a gap. Guided by a greener future.
            </h2>
            <p className="text-[15px] md:text-base text-[#5A6750] leading-relaxed">
              The best agriculture careers aren&apos;t built in isolation —
              they&apos;re cultivated across borders, mentors, and seasons of
              real practice. Here&apos;s how GreenRoot took root.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {storyChapters.map((chapter, index) => {
              const Icon = chapter.icon
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
              What drives us
            </p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <h2 className="font-bold text-2xl md:text-3xl text-[#1F2A14] tracking-tight leading-tight max-w-xl">
                Mission, vision & promise — in one breath.
              </h2>
              <p className="text-sm text-[#1F2A14]/75 leading-relaxed md:max-w-xs md:text-right">
                Three commitments that shape every internship we share.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pillars.map((pillar) => {
              const Icon = pillar.icon
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
                  The people
                </p>
                <h2 className="font-bold text-3xl md:text-4xl text-[#1F2A14] tracking-tight leading-tight">
                  Hands that plant. Minds that guide.
                </h2>
              </div>
              <p className="text-[15px] text-[#5A6750] leading-relaxed md:max-w-sm md:text-right">
                Founders, team leads, and advisors who blend agronomy,
                education, and operations — so every student journey feels
                personal and possible.
              </p>
            </div>

            {/* Founder — large */}
            <div className="mb-5">
              {founders.map((person) => (
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

            {/* Team + advisors — equal small cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {advisors.map((advisor) => (
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

              {teamMembers.map((person) => (
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
                Looking ahead
              </p>
              <h2 className="font-bold text-3xl md:text-4xl text-[#1F2A14] tracking-tight leading-tight">
                Where we&apos;re growing next
              </h2>
            </div>
            <p className="text-[15px] text-[#5A6750] leading-relaxed md:max-w-md md:text-right">
              Our north star is simple: make global agricultural learning
              accessible, trustworthy, and transformative — for every student
              willing to grow.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="relative min-h-[280px] lg:min-h-full rounded-3xl overflow-hidden bg-[#E4EED4]">
              <Image
                src="https://picsum.photos/700/700?random=47"
                alt="Greenhouse and field collaboration"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {goals.map((goal, index) => {
                const Icon = goal.icon
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
                  Your turn to grow
                </p>
                <h2 className="font-bold text-3xl sm:text-4xl text-[#1F2A14] leading-tight tracking-tight mb-4">
                  Ready to plant the next chapter of your agri career?
                </h2>
                <p className="text-[15px] text-[#5A6750] leading-relaxed max-w-lg mb-7">
                  Browse curated international internships — or create an
                  account and start your application today.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/internships"
                    className="inline-flex items-center justify-center gap-2 bg-[#A3D32F] text-[#1F2A14] rounded-2xl px-6 py-3.5 text-sm font-semibold hover:bg-[#92C120] transition-colors"
                  >
                    Browse Internships
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-medium text-[#3D4A32] bg-white border border-[#D5E0C8] hover:border-[#A3D32F] transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              </div>

              <div className="relative hidden lg:block h-[260px]">
                <div className="absolute inset-0 rounded-2xl overflow-hidden border border-white/60">
                  <Image
                    src="https://picsum.photos/500/400?random=48"
                    alt="Student ready for an agriculture internship"
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
