'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { updatePassword } from '@/lib/auth'
import { BTN_LOGIN } from '@/lib/appConfig'
import { getMessage } from '@/lib/messages'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isValidSession, setIsValidSession] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowser()
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true)
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    const { error } = await updatePassword(password)

    if (error) {
      setError(getMessage('error', 'generic'))
      setIsLoading(false)
      return
    }

    setIsSuccess(true)
    setIsLoading(false)
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h1>
          <p className="text-gray-600 mb-6">This password reset link is invalid or has expired.</p>
          <Link 
            href="/login" 
            className="inline-block bg-gr-primary text-white rounded-lg px-6 py-2 font-semibold hover:bg-gr-primary-hover transition-colors"
          >
            {BTN_LOGIN}
          </Link>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center" 
          style={{backgroundImage: "url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070')"}}>
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/30"></div>
          <div className="relative z-10 flex flex-col justify-between p-12 text-white">
            <div className="flex items-center gap-2">
              <Image 
                src="/greenroot-logo.svg" 
                alt="GreenRoot" 
                width={40} 
                height={40}
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-4 leading-tight">
                Empowering the next<br />generation of Agri-Leaders.
              </h1>
              <p className="text-gray-200 text-lg">
                Get international paid internships and revolutionise<br />the future of agriculture.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Image 
                src="/greenroot-logo.svg" 
                alt="GreenRoot" 
                width={32} 
                height={32}
              />
              <span className="text-xl font-bold text-gray-900">GreenRoot</span>
            </div>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gr-primary flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Password Updated Successfully
              </h1>
              
              <p className="text-gray-600 mb-2">
                {getMessage('success', 'passwordUpdate')}
              </p>
              <p className="text-gray-600 mb-8">
                You can now sign in using your new password.
              </p>

              <Link 
                href="/login" 
                className="w-full block text-center bg-gr-primary text-white rounded-lg px-6 py-3 font-semibold hover:bg-gr-primary-hover transition-colors"
              >
                {BTN_LOGIN}
              </Link>
            </div>

            <div className="text-center text-xs text-gray-400 mt-8">
              © 2024 GreenRoot Student Internship Portal. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center" 
        style={{backgroundImage: "url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070')"}}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/30"></div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2">
            <Image 
              src="/greenroot-logo.svg" 
              alt="GreenRoot" 
              width={40} 
              height={40}
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Empowering the next<br />generation of Agri-Leaders.
            </h1>
            <p className="text-gray-200 text-lg">
              Get international paid internships and revolutionise<br />the future of agriculture.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Image 
              src="/greenroot-logo.svg" 
              alt="GreenRoot" 
              width={32} 
              height={32}
            />
            <span className="text-xl font-bold text-gray-900">GreenRoot</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-sm text-gray-600">Please enter your new password here:</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gr-primary text-white font-semibold rounded-lg hover:bg-gr-primary-hover transition-colors"
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>

          <div className="text-center text-xs text-gray-400 mt-8">
            © 2024 GreenRoot Student Internship Portal. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}