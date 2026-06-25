'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { updatePassword } from '@/lib/auth'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isValidSession, setIsValidSession] = useState(false)

  useEffect(() => {
    // Check if user landed here from a valid reset email link
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true)
      }
    })
  }, [])

  async function handleSubmit() {
    setError('')
    setMessage('')

    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    const { error } = await updatePassword(password)

    if (error) {
      setError('Something went wrong. Please try again.')
      return
    }

    setMessage('Password updated successfully! Redirecting to login...')
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
  }

  if (!isValidSession) {
    return (
      <div>
        <p>Invalid or expired reset link. Please request a new one.</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Reset Password</h1>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <button onClick={handleSubmit}>
        Update Password
      </button>
    </div>
  )
}