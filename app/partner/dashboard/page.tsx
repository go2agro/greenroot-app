'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getMyProfile } from '@/lib/profiles'
import { getMyPartnerProfile } from '@/lib/partnerProfiles'
import { signOut } from '@/lib/auth'

export default function PartnerDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<{ role?: string; unique_id?: string } | null>(null)
  const [partnerProfile, setPartnerProfile] = useState<{
    first_name?: string
    last_name?: string
    official_email?: string
  } | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data } = await getMyProfile()

      if (!data || data.role !== 'partner') {
        router.replace('/login')
        return
      }

      setProfile(data)

      const { data: partnerData } = await getMyPartnerProfile()
      setPartnerProfile(partnerData)
      setIsLoading(false)
    }

    loadProfile()
  }, [router])

  async function handleLogout() {
    await signOut()
    router.push('/login')
  }

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#8DC63F]" />
      </div>
    )
  }

  const displayName = [partnerProfile?.first_name, partnerProfile?.last_name]
    .filter(Boolean)
    .join(' ') || 'Partner'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/greenroot-logo.svg" alt="GreenRoot" width={32} height={32} />
          <span className="text-xl font-bold text-gray-900">GreenRoot Partner</span>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
          Welcome, {displayName}
        </h1>
        <p className="text-gray-500 mb-8">
          Partner portal is being set up. More features coming soon.
        </p>

        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Partner ID</p>
            <p className="text-sm font-medium text-gray-900">{profile.unique_id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Official Email</p>
            <p className="text-sm font-medium text-gray-900">{partnerProfile?.official_email}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
