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
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const storyCards = [
  {
    title: 'Our Mission',
    icon: Leaf,
    description:
      'Empower agriculture students by providing access to trusted international internships that foster learning, innovation, and career growth.',
  },
  {
    title: 'Our Vision',
    icon: Globe,
    description:
      "To become the world's most trusted platform connecting future agri-professionals with global opportunities and industry leaders.",
  },
  {
    title: 'Our Promise',
    icon: HandHeart,
    description:
      'Every internship on GreenRoot is carefully curated to ensure transparency, quality, and valuable real-world experience for every student.',
  },
]

const stats = [
  { value: '5000+', label: 'Students Placed' },
  { value: '24', label: 'Countries Impacted' },
  { value: '200+', label: 'Partner Firms' },
]

const founders = [
  {
    name: 'Mr. Omkar Echake',
    role: 'Co-founder & Managing Director',
    email: 'omkar@go2agro.com',
    mobile: '+91 7738394086',
    image: 'https://picsum.photos/400/300?random=41',
  },
  {
    name: 'Mr. Sunil Landkar',
    role: 'Co-founder & CEO',
    email: 'sunil@go2agro.com',
    mobile: '+91 7972537388',
    image: 'https://picsum.photos/400/300?random=42',
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
    text: 'Expand internships across more countries.',
  },
  {
    icon: Handshake,
    text: 'Build partnerships with leading agricultural organizations.',
  },
  {
    icon: GraduationCap,
    text: 'Support students in developing practical, career-ready skills.',
  },
  {
    icon: Leaf,
    text: 'Promote sustainable and innovative farming practices worldwide.',
  },
]

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar activeLink="about" />

      {/* HERO */}
      <section className="w-full py-16 px-8 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-bold text-4xl md:text-5xl text-[#1A1A1A] mb-4 leading-tight">
              Growing Global Careers in Agriculture
            </h1>
            <p className="text-gray-600 text-base mb-8 leading-relaxed">
              GreenRoot connects aspiring agricultural students with world-class
              international internships, practical training, and career
              opportunities, empowering the next generation of agri-professionals.
            </p>
            <Link
              href="/internships"
              className="inline-block bg-[#8DC63F] text-white rounded-lg px-6 py-3 font-semibold hover:bg-[#7DB62F] transition-colors"
            >
              Browse Internships
            </Link>
          </div>
          <div className="relative w-full h-[350px]">
            <Image
              src="https://picsum.photos/600/400?random=40"
              alt="People working in an agricultural field"
              fill
              className="rounded-2xl object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="px-8 md:px-16 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-bold text-3xl text-[#1A1A1A] mb-2">Our Story</h2>
          <p className="text-gray-500 text-sm mb-12">
            Tracing our roots from a local startup to a global platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {storyCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.title}
                  className="bg-white border border-[#EEEEEE] rounded-2xl p-6"
                >
                  <div className="w-12 h-12 rounded-full bg-[#E8F5D6] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#8DC63F]" />
                  </div>
                  <h3 className="font-bold text-lg text-[#1A1A1A] mt-4 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-[#8DC63F] py-12 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`text-center text-white py-4 md:py-0 ${
                index < stats.length - 1
                  ? 'md:border-r md:border-white/30'
                  : ''
              }`}
            >
              <p className="font-bold text-4xl md:text-5xl">{stat.value}</p>
              <p className="text-sm mt-2 opacity-90">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE MINDS BEHIND GREENROOT */}
      <section className="px-8 md:px-16 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-bold text-3xl text-[#1A1A1A] mb-2">
            The Minds Behind GreenRoot
          </h2>
          <p className="text-gray-500 text-sm mb-12">
            A diverse group of agronomists, educators, and tech innovators.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {founders.map((person) => (
              <div
                key={person.name}
                className="bg-white border border-[#EEEEEE] rounded-2xl overflow-hidden"
              >
                <div className="relative h-64 w-full">
                  <Image
                    src={person.image}
                    alt={person.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900">{person.name}</h3>
                  <p className="text-sm text-[#8DC63F] font-medium mt-1">
                    {person.role}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Email: {person.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    Mobile No: {person.mobile}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advisors.map((advisor) => (
              <div
                key={advisor.name}
                className="bg-white border border-[#EEEEEE] rounded-2xl p-4 flex items-center gap-4"
              >
                {'image' in advisor && advisor.image ? (
                  <div className="relative w-16 h-16 shrink-0">
                    <Image
                      src={advisor.image}
                      alt={advisor.name}
                      fill
                      className="rounded-xl object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : advisor.icon === 'briefcase' ? (
                  <div className="w-16 h-16 shrink-0 rounded-xl bg-[#E8F5D6] flex items-center justify-center">
                    <Briefcase className="w-7 h-7 text-[#8DC63F]" />
                  </div>
                ) : (
                  <div className="w-16 h-16 shrink-0 rounded-xl bg-black flex items-center justify-center">
                    <Scale className="w-7 h-7 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {advisor.name}
                  </h3>
                  <p className="text-xs text-gray-500">{advisor.roleLine1}</p>
                  {advisor.roleLine2 && (
                    <p className="text-xs text-[#8DC63F] font-medium">
                      {advisor.roleLine2}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION & GOALS */}
      <section className="px-8 md:px-16 py-16 bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-bold text-3xl text-[#1A1A1A] mb-2">
            Vision & Goals
          </h2>
          <p className="text-gray-500 text-sm mb-12 max-w-2xl">
            To become the leading platform connecting aspiring agriculture
            professionals with global learning opportunities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <div className="hidden md:block relative min-h-[400px] rounded-2xl overflow-hidden">
              <Image
                src="https://picsum.photos/500/400?random=47"
                alt="Scientists working in a greenhouse"
                fill
                className="object-cover rounded-2xl"
                sizes="50vw"
              />
            </div>

            <div className="flex flex-col">
              {goals.map((goal) => {
                const Icon = goal.icon
                return (
                  <div
                    key={goal.text}
                    className="bg-white border border-[#EEEEEE] rounded-xl p-4 mb-3 flex items-center gap-4 border-r-4 border-r-[#8DC63F]"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#E8F5D6] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#8DC63F]" />
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      {goal.text}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="mx-8 md:mx-16 my-16">
        <div className="max-w-7xl mx-auto bg-[#F0F7E6] rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <div className="p-10">
              <h2 className="font-bold text-3xl text-gray-900">
                Ready to Start Your
              </h2>
              <h2 className="font-bold text-3xl text-[#8DC63F]">
                Global Agriculture Journey?
              </h2>
              <p className="text-gray-500 text-sm mt-3 mb-6">
                Join thousands of students and companies growing the future of
                agriculture.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/internships"
                  className="inline-block bg-[#8DC63F] text-white rounded-lg px-5 py-2.5 font-semibold hover:bg-[#7DB62F] transition-colors text-center"
                >
                  Browse Internships
                </Link>
                <Link
                  href="/signup"
                  className="inline-block border border-gray-300 text-gray-700 rounded-lg px-5 py-2.5 font-medium hover:border-[#8DC63F] transition-colors text-center"
                >
                  Create Account
                </Link>
              </div>
            </div>

            <div className="relative hidden md:block h-[280px] overflow-hidden">
              <div className="absolute top-6 right-10 w-40 h-40 bg-[#8DC63F]/30 rounded-full" />
              <div className="absolute bottom-4 right-28 w-3 h-3 bg-blue-400 rounded-full" />
              <div className="absolute top-10 right-36 w-2 h-2 bg-[#8DC63F] rounded-full" />
              <div className="absolute inset-0 flex items-end justify-center">
                <div className="relative w-[280px] h-[260px]">
                  <Image
                    src="https://picsum.photos/400/300?random=48"
                    alt="Graduate ready for agriculture career"
                    fill
                    className="object-cover object-top rounded-t-2xl"
                    sizes="280px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
