'use client'

import { useState } from 'react'
import { resetPassword } from '@/lib/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit() {
    setError('')
    setMessage('')

    if (!email) {
      setError('Please enter your email')
      return
    }

    const { error } = await resetPassword(email)

    if (error) {
      setError('Something went wrong. Please try again.')
      return
    }

    setMessage('Check your email for the reset link!')
  }

  return (
    <div>
      <h1>Forgot Password</h1>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <button onClick={handleSubmit}>
        Send Reset Link
      </button>
    </div>
  )
}