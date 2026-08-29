"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { LogOut } from 'lucide-react'

export default function AdminSettings() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Settings</h1>
          
          <div className="mt-8">
            <Button
              onClick={() => setShowLogoutDialog(true)}
              disabled={isLoggingOut}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        icon={<LogOut strokeWidth={1.5} />}
        title="Logout Account?"
        description="Are you sure you want to log out from your account? You can always log back in."
        confirmText="Log out"
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
        loadingText="Logging out..."
      />
    </div>
  )
}
