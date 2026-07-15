'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createAdminAccount, verifySecretKey } from '@/lib/adminSetup'

export default function AdminSetupPage() {
  const [secretKey, setSecretKey] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [keyError, setKeyError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [personalEmail, setPersonalEmail] = useState('')
  const [officialEmail, setOfficialEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [adminId, setAdminId] = useState('')

  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ')

  async function handleVerifyAccess() {
    setKeyError('')
    setIsLoading(true)

    const isValid = await verifySecretKey(secretKey)

    if (isValid) {
      setIsVerified(true)
    } else {
      setKeyError('Invalid secret key. Access denied.')
    }

    setIsLoading(false)
  }

  function resetForm() {
    setFirstName('')
    setMiddleName('')
    setLastName('')
    setPersonalEmail('')
    setOfficialEmail('')
    setPhone('')
    setPassword('')
    setShowPassword(false)
    setAdminId('')
    setError('')
    setSuccess(false)
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.')
      return
    }

    if (!adminId.trim()) {
      setError('Admin ID is required.')
      return
    }

    if (!officialEmail.trim()) {
      setError('Official email is required.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setIsLoading(true)

    const { error: createError } = await createAdminAccount({
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim(),
      personalEmail: personalEmail.trim() || undefined,
      officialEmail: officialEmail.trim(),
      phone: phone.trim() || undefined,
      password,
      adminId: adminId.trim(),
    })

    if (createError) {
      setError(createError.message || 'Failed to create admin account.')
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {!isVerified ? (
          <Card className="bg-white shadow-lg border-0 ring-0">
            <CardHeader className="items-center text-center pb-2">
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src="/greenroot-logo.svg"
                  alt="GreenRoot"
                  width={36}
                  height={36}
                />
                <span className="text-2xl font-bold text-gray-900">GreenRoot</span>
              </div>
              <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2 justify-center">
                <ShieldAlert className="w-5 h-5 text-[#8DC63F]" />
                Restricted Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secretKey">Secret Key</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="secretKey"
                    type="password"
                    value={secretKey}
                    onChange={(e) => {
                      setSecretKey(e.target.value)
                      if (keyError) setKeyError('')
                    }}
                    placeholder="Enter secret key"
                    disabled={isLoading}
                    className="bg-[#F5F5F5] border-0 h-11 pl-10"
                  />
                </div>
                {keyError && (
                  <p className="text-sm text-[#DC2626]">{keyError}</p>
                )}
              </div>
              <Button
                type="button"
                onClick={handleVerifyAccess}
                disabled={isLoading || !secretKey}
                className="w-full h-11 bg-[#8DC63F] text-white hover:bg-[#7DB62F] font-semibold"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Verify Access'
                )}
              </Button>
            </CardContent>
          </Card>
        ) : success ? (
          <Card className="bg-white shadow-lg border-0 ring-0">
            <CardContent className="pt-8 pb-6 text-center space-y-6">
              <CheckCircle2 className="w-16 h-16 text-[#8DC63F] mx-auto" />
              <h2 className="text-2xl font-bold text-[#1A1A1A]">
                Admin Account Created!
              </h2>
              <div className="bg-[#F5F5F5] rounded-lg p-4 text-left space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                  <p className="text-sm font-medium text-gray-900">{fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Official Email</p>
                  <p className="text-sm font-medium text-gray-900">{officialEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Admin ID</p>
                  <p className="text-sm font-medium text-gray-900">{adminId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Temp Password</p>
                  <p className="text-sm font-medium text-gray-900 font-mono">{password}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Share credentials securely with the admin.
              </p>
              <Button
                type="button"
                onClick={resetForm}
                className="w-full h-11 bg-[#8DC63F] text-white hover:bg-[#7DB62F] font-semibold"
              >
                Create Another Admin
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white shadow-lg border-0 ring-0">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src="/greenroot-logo.svg"
                  alt="GreenRoot"
                  width={32}
                  height={32}
                />
                <span className="text-xl font-bold text-gray-900">GreenRoot</span>
              </div>
              <CardTitle className="text-xl font-bold text-[#1A1A1A]">
                Create Admin Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First"
                      disabled={isLoading}
                      className="bg-[#F5F5F5] border-0 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="Optional"
                      disabled={isLoading}
                      className="bg-[#F5F5F5] border-0 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last"
                      disabled={isLoading}
                      className="bg-[#F5F5F5] border-0 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminId">Admin ID *</Label>
                  <Input
                    id="adminId"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value.toUpperCase())}
                    placeholder="ADM-XXXXXXXX"
                    disabled={isLoading}
                    className="bg-[#F5F5F5] border-0 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="officialEmail">Official Email *</Label>
                  <Input
                    id="officialEmail"
                    type="email"
                    value={officialEmail}
                    onChange={(e) => setOfficialEmail(e.target.value)}
                    placeholder="admin@greenroot.com"
                    disabled={isLoading}
                    className="bg-[#F5F5F5] border-0 h-11"
                  />
                  <p className="text-xs text-gray-500">Used for login</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalEmail">Personal Email</Label>
                  <Input
                    id="personalEmail"
                    type="email"
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    placeholder="optional@email.com"
                    disabled={isLoading}
                    className="bg-[#F5F5F5] border-0 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    disabled={isLoading}
                    className="bg-[#F5F5F5] border-0 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Temporary Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      disabled={isLoading}
                      className="bg-[#F5F5F5] border-0 h-11 pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-[#DC2626] text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-[#8DC63F] text-white hover:bg-[#7DB62F] font-semibold"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Create Admin Account'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
