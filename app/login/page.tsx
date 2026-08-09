"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AtSign, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { loginUser, signOut } from '@/lib/auth'
import { getMyProfile } from '@/lib/profiles'
import Image from 'next/image'
import Link from 'next/link'
import AuthLeftPanel from '@/components/AuthLeftPanel'

export default function Login() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin' | 'partner'>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function checkSession() {
      const { data } = await getMyProfile()
      if (data?.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (data?.role === 'partner') {
        router.push('/partner/dashboard')
      } else if (data?.role === 'student') {
        router.push('/student/dashboard')
      }
    }
    checkSession()
  }, [])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setEmailError('')
    setPasswordError('')
    setGeneralError('')

    let hasError = false

    if (!validateEmail(email)) {
      setEmailError('Invalid email address')
      hasError = true
    }

    if (password.length < 8) {
      setPasswordError('Password should be atleast 8 characters')
      hasError = true
    }

    if (hasError) return

    setIsLoading(true)

    try {
      const { data, error } = await loginUser(email, password)

      if (error) {
        const message = error.message || 'Invalid email or password. Please try again.'
        setGeneralError(
          message.toLowerCase().includes('invalid login credentials')
            ? 'Invalid email or password. Please try again.'
            : message
        )
        setIsLoading(false)
        return
      }

      if (!data?.profile) {
        setGeneralError('Account setup incomplete. Please contact support.')
        setIsLoading(false)
        return
      }

      if (selectedRole === 'admin' && data.profile.role !== 'admin') {
        await signOut()
        setGeneralError('This account does not have admin access.')
        setIsLoading(false)
        return
      }

      if (selectedRole === 'student' && data.profile.role !== 'student') {
        await signOut()
        setGeneralError('This account is not a student account.')
        setIsLoading(false)
        return
      }

      if (selectedRole === 'partner' && data.profile.role !== 'partner') {
        await signOut()
        setGeneralError('This account does not have partner access.')
        setIsLoading(false)
        return
      }

      const dashboardByRole = {
        admin: '/admin/dashboard',
        partner: '/partner/dashboard',
        student: '/student/dashboard',
      } as const

      router.push(dashboardByRole[data.profile.role as keyof typeof dashboardByRole] ?? '/student/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      setGeneralError('An error occurred. Please try again.')
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

          {/* Welcome Heading */}
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2">Welcome Back!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Please enter your credentials to access this platform.<br />
            Take the first step in exploring your future.
          </p>

          {/* Role Toggle */}
          <div className="w-full bg-[#F0F0F0] rounded-lg p-1 mb-6">
            <div className="grid grid-cols-3 gap-1">
              {(['student', 'admin', 'partner'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`relative py-2.5 rounded-md text-sm sm:text-base transition-colors duration-200 ${
                    selectedRole === role
                      ? 'text-white font-semibold'
                      : 'text-gray-500 font-normal'
                  }`}
                >
                  {selectedRole === role && (
                    <motion.div
                      layoutId="role-bg"
                      className="absolute inset-0 bg-[#8DC63F] rounded-md z-0"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 capitalize">{role}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
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
              <div className="flex justify-end mt-2">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-[#8DC63F] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#8DC63F] text-white rounded-lg py-3 text-base font-semibold hover:bg-[#7DB62F] transition-colors disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* General Error Message */}
          {generalError && (
            <p className="text-[#DC2626] text-sm text-center mt-2">
              {generalError}
            </p>
          )}

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-sm">
            <span className="text-gray-600">Don't have an account yet? </span>
            <Link href="/signup" className="text-[#8DC63F] hover:underline">
              Create an account.
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
