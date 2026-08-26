"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AtSign, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { signUp } from '@/lib/auth'
import { BTN_SIGNUP } from '@/lib/appConfig'
import { getMessage } from '@/lib/messages'
import Image from 'next/image'
import Link from 'next/link'
import AuthLeftPanel from '@/components/AuthLeftPanel'

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setEmailError('')
    setPasswordError('')
    setConfirmPasswordError('')

    let hasError = false

    if (!validateEmail(email)) {
      setEmailError('Invalid email address')
      hasError = true
    }

    if (password.length < 8) {
      setPasswordError('Password must atleast be of 8 characters')
      hasError = true
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords don't match")
      hasError = true
    }

    if (hasError) return

    setIsLoading(true)

    try {
      const { data, error } = await signUp(email, password)
      
      if (error) {
        setPasswordError(error.message || getMessage('error', 'signup'))
        setIsLoading(false)
        return
      }

      if (data) {
        router.push('/student/dashboard')
      }
    } catch (error) {
      setPasswordError(getMessage('error', 'generic'))
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full">
      <AuthLeftPanel />

      {/* Right Panel */}
      <div className="w-full lg:w-[60%] h-full bg-white flex items-center justify-center px-6 sm:px-12 py-10">
        <div className="w-full max-w-[460px]">
          {/* Logo - visible on all screens */}
          <div className="flex items-center gap-2 mb-8">
            <Image 
              src="/greenroot-logo.svg" 
              alt="GreenRoot" 
              width={32} 
              height={32}
            />
            <span className="text-2xl font-bold text-gray-900">GreenRoot</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2">Create Your Account</h2>
          <p className="text-sm text-gray-500 mb-6">
            Start your journey in international paid internship today.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (emailError) setEmailError('')
                  }}
                  placeholder="example@email.com"
                  disabled={isLoading}
                  className={`w-full bg-[#F5F5F5] rounded-lg py-3 pl-12 pr-4 text-sm sm:text-base outline-none transition-all ${
                    emailError ? 'border-2 border-red-500' : 'border-0'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>
              {emailError && (
                <p className="text-[#DC2626] text-sm mt-1">{emailError}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-baseline gap-1 mb-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <span className="text-xs text-[#DC2626]">
                  (Must contain at least 8 characters)*
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (passwordError) setPasswordError('')
                  }}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={`w-full bg-[#F5F5F5] rounded-lg py-3 pl-12 pr-12 text-sm sm:text-base outline-none transition-all ${
                    passwordError ? 'border-2 border-red-500' : 'border-0'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-[#DC2626] text-sm mt-1">{passwordError}</p>
              )}
            </div>

            {/* Re-enter Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Re-enter password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (confirmPasswordError) setConfirmPasswordError('')
                  }}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={`w-full bg-[#F5F5F5] rounded-lg py-3 pl-12 pr-12 text-sm sm:text-base outline-none transition-all ${
                    confirmPasswordError ? 'border-2 border-red-500' : 'border-0'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-[#DC2626] text-sm mt-1">{confirmPasswordError}</p>
              )}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#8DC63F] text-white rounded-lg py-3 text-base font-semibold hover:bg-[#7DB62F] transition-colors disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                BTN_SIGNUP
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/login" className="text-[#8DC63F] hover:underline">
              Login here.
            </Link>
          </p>

          {/* Footer */}
          <p className="text-xs text-gray-400 text-center mt-8 sm:mt-12">
            © 2026 GreenRoot Student Internship Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
