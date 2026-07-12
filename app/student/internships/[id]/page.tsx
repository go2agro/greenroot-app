"use client"

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  MapPin, 
  CalendarDays, 
  Clock, 
  CreditCard, 
  Briefcase,
  Settings2,
  Droplets,
  Layers,
  BarChart3,
  Leaf,
  FlaskConical,
  Droplet,
  Wheat,
  ArrowLeft
} from 'lucide-react'
import { getInternshipById } from '@/lib/internships'
import { startApplication } from '@/lib/studentApplications'
import { toast } from 'sonner'

interface Internship {
  id: string
  title: string
  subtitle?: string
  country: string
  city?: string
  image_url?: string
  secondary_image_url?: string
  start_date?: string
  duration_months?: number
  stipend_monthly?: number
  work_mode?: string
  long_description?: string
  key_responsibilities?: string | string[]
  skills_learned?: string | { icon: string; name: string }[]
  eligibility_requirements?: string | string[]
  stipend_benefits?: string | string[]
  badge?: string
  flag_emoji?: string
}

const iconMap = {
  Settings2,
  Droplets,
  Layers,
  BarChart3,
  Leaf,
  FlaskConical,
  Droplet,
  Wheat
}

export default function StudentInternshipDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [internship, setInternship] = useState<Internship | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    async function fetchData() {
      console.log('Fetching internship with ID:', id)
      const { data: internshipData, error: internshipError } = await getInternshipById(id)
      
      if (internshipError) {
        console.error('Error fetching internship:', internshipError)
      }
      
      console.log('Internship data:', internshipData)
      
      if (internshipData) {
        setInternship(internshipData)
      }
      
      setLoading(false)
    }
    
    fetchData()
  }, [id])

  const handleApply = async () => {
    if (!internship || applying) return
    
    setApplying(true)
    const result = await startApplication(internship.id)
    
    if (result.error) {
      toast.error(result.error.message || 'Failed to start application')
      setApplying(false)
    } else {
      const applicationId = result.data?.id
      if (applicationId) {
        router.push(`/student/applications/${applicationId}`)
      }
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBA'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const parseArray = (data: string | string[] | undefined): string[] => {
    if (!data) return []
    if (Array.isArray(data)) return data
    try {
      const parsed = JSON.parse(data)
      return Array.isArray(parsed) ? parsed : [data]
    } catch {
      return data.split('\n').filter(line => line.trim())
    }
  }

  const parseSkills = (data: string | { icon: string; name: string }[] | undefined): { icon: string; name: string }[] => {
    if (!data) return []
    if (Array.isArray(data)) return data
    try {
      const parsed = JSON.parse(data)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Internship not found</div>
        </div>
      </div>
    )
  }

  const responsibilities = parseArray(internship.key_responsibilities)
  const skills = parseSkills(internship.skills_learned)
  const eligibility = parseArray(internship.eligibility_requirements)
  const benefits = parseArray(internship.stipend_benefits)

  const responsibilityIcons = [Settings2, Droplets, Layers, BarChart3]

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative flex items-center justify-center">
            <button
              onClick={() => router.back()}
              className="absolute left-0 flex items-center gap-2 text-gray-600 hover:text-[#8DC63F] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            
            <Link href="/student/dashboard" className="flex items-center gap-2">
              <Image 
                src="/greenroot-logo.svg" 
                alt="GreenRoot" 
                width={32} 
                height={32}
                priority
              />
              <span className="text-xl font-bold text-gray-900">GreenRoot</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[300px] md:h-[450px]">
        <Image
          src={internship.image_url || `https://picsum.photos/seed/${internship.id}/1920/900`}
          alt={internship.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute inset-x-0 bottom-0 flex justify-center px-8 pb-8">
          <div className="flex flex-col items-center text-center gap-4 max-w-3xl">
            <div className="flex items-center gap-2 text-white text-sm">
              <MapPin className="w-4 h-4" />
              <span className="flex items-center gap-2">
                {internship.flag_emoji && <span className="text-3xl">{internship.flag_emoji}</span>}
                <span className="text-base">{internship.country}</span>
              </span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-bold text-white">
              {internship.title}
            </h1>
            
            <button
              onClick={handleApply}
              disabled={applying}
              className="bg-[#8DC63F] text-white rounded-lg px-8 py-3 font-semibold hover:bg-[#7AB62F] transition-colors disabled:opacity-50"
            >
              {applying ? 'Applying...' : 'Apply Now'}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full bg-white border-b border-[#EEEEEE] py-6">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">START DATE</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(internship.start_date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">DURATION</p>
                <p className="text-sm font-semibold text-gray-900">{internship.duration_months || 'N/A'} Months</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">STIPEND</p>
                <p className="text-sm font-semibold text-gray-900">
                  {internship.stipend_monthly 
                    ? `₹${internship.stipend_monthly.toLocaleString('en-IN')}/month` 
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">WORK MODE</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">{internship.work_mode || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <h2 className="font-bold text-xl mb-4 text-[#1A1A1A]">About this Internship</h2>
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
          {internship.long_description || 'No description available.'}
        </p>
      </div>

      {responsibilities.length > 0 && (
        <div className="max-w-7xl mx-auto px-8 py-10">
          <h2 className="font-bold text-xl mb-4 text-[#1A1A1A]">Key Responsibilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {responsibilities.map((resp, idx) => {
              const IconComponent = responsibilityIcons[idx % responsibilityIcons.length]
              return (
                <div key={idx} className="bg-[#F0F7E6] rounded-xl p-4 flex items-start gap-3">
                  <IconComponent className="w-5 h-5 text-[#8DC63F] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{resp}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div className="max-w-7xl mx-auto px-8 py-10">
          <h2 className="font-bold text-xl mb-4 text-[#1A1A1A]">Skills you&apos;ll learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative h-72 rounded-2xl overflow-hidden">
              <Image
                src={internship.secondary_image_url || `https://picsum.photos/seed/${internship.id}-2/600/400`}
                alt="Skills"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              {skills.map((skill, idx) => {
                const IconComponent = iconMap[skill.icon as keyof typeof iconMap] || Leaf
                return (
                  <div key={idx} className="bg-white border border-[#EEEEEE] rounded-xl p-4 mb-3 flex items-center gap-3">
                    <IconComponent className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-800">{skill.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-bold text-xl mb-4 text-[#1A1A1A]">Eligibility</h2>
            <div className="bg-white border-l-4 border-[#8DC63F] rounded-r-xl p-6 shadow-sm">
              {eligibility.length > 0 ? (
                eligibility.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                    <span className="mt-1.5">•</span>
                    <span>{req}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">No specific requirements listed.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-xl mb-4 text-[#1A1A1A]">Stipend Details</h2>
            <div className="bg-white border-l-4 border-[#8DC63F] rounded-r-xl p-6 shadow-sm">
              <p className="font-semibold text-gray-900 mb-2">Monthly Stipend</p>
              <p className="text-sm text-gray-600 mb-4">
                {internship.stipend_monthly 
                  ? `₹${internship.stipend_monthly.toLocaleString('en-IN')}/month` 
                  : 'To be discussed'}
              </p>
              {benefits.length > 0 && (
                <>
                  <p className="font-medium text-gray-900 mb-2">Additional benefits may include:</p>
                  {benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                      <span className="mt-1.5">•</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 mb-10">
        <div className="bg-[#F0F7E6] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">Ready to Start?</h3>
            <p className="text-sm text-gray-500">Take the first step toward your global agriculture career.</p>
          </div>
          <button
            onClick={handleApply}
            disabled={applying}
            className="bg-[#8DC63F] text-white rounded-lg px-6 py-3 font-semibold hover:bg-[#7AB62F] transition-colors whitespace-nowrap disabled:opacity-50 w-full md:w-auto"
          >
            {applying ? 'Applying...' : 'Apply Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
