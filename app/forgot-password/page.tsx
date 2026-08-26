"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AtSign, X, Loader2 } from 'lucide-react'
import { resetPassword } from '@/lib/auth'
import { BTN_LOGIN } from '@/lib/appConfig'
import { getMessage } from '@/lib/messages'
import Image from 'next/image'
import AuthLeftPanel from '@/components/AuthLeftPanel'

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setEmailError('')
    setGeneralError('')

    if (!validateEmail(email)) {
      setEmailError('Invalid email address')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await resetPassword(email)
      
      if (error) {
        setGeneralError(getMessage('error', 'generic'))
        setIsLoading(false)
        return
      }

      // Success - switch to success state
      setIsSuccess(true)
      setIsLoading(false)
    } catch (error) {
      setGeneralError(getMessage('error', 'generic'))
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/login')
  }

  const handleClose = () => {
    router.push('/login')
  }

  return (
    <div className="flex h-screen w-full">
      <AuthLeftPanel />

      {/* Right Panel */}
      <div className="relative w-full lg:w-[60%] h-full bg-white flex items-center justify-center px-6 sm:px-12 py-10">
        {/* X Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

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

          {!isSuccess ? (
            // STATE 1: Form State
            <>
              {/* Heading */}
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2">
                Forgot your password?
              </h2>
              <p className="text-sm text-[#333333] mb-6">
                Don't worry! Enter the registered Email address below and we'll send you a link to reset your password.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your email address
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
                        if (generalError) setGeneralError('')
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

                {/* Send Reset Link Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#8DC63F] text-white rounded-lg py-3 text-base font-semibold hover:bg-[#7DB62F] transition-colors disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                {/* General Error */}
                {generalError && (
                  <p className="text-[#DC2626] text-sm text-center">{generalError}</p>
                )}
              </form>
            </>
          ) : (
            // STATE 2: Success State
            <>
              {/* Success Heading */}
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2">
                Password reset link sent!
              </h2>
              <p className="text-sm text-[#333333] mb-6">
                {getMessage('success', 'passwordReset')}
              </p>

              {/* Back to Login Button */}
              <button
                onClick={handleBackToLogin}
                className="w-full bg-[#8DC63F] text-white rounded-lg py-3 text-base font-semibold hover:bg-[#7DB62F] transition-colors"
              >
                {BTN_LOGIN}
              </button>
            </>
          )}

          {/* Footer */}
          <p className="text-xs text-[#999999] text-center mt-8 sm:mt-12">
            © 2026 GreenRoot Student Internship Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
