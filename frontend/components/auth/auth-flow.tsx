'use client'

import { useState, useEffect } from 'react'
import { WelcomePage } from './welcome-page'
import { AccountSetup } from './account-setup'
import { EmailVerification } from './email-verification'

interface User {
  id: string
  email: string
  emailVerified: boolean
  hasLinkedProvider: boolean
}

interface AuthFlowProps {
  onAuthComplete: (user: User) => void
}

type AuthStep = 'welcome' | 'verification' | 'setup' | 'complete'

interface AuthState {
  step: AuthStep
  email: string
  isNewAccount: boolean
  user: User | null
}

export function AuthFlow({ onAuthComplete }: AuthFlowProps) {
  const [authState, setAuthState] = useState<AuthState>({
    step: 'welcome',
    email: '',
    isNewAccount: false,
    user: null
  })

  // Check if user is returning from email verification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const email = urlParams.get('email')
    const verified = urlParams.get('verified')
    
    if (email && verified === 'true') {
      // User just verified their email, show setup
      setAuthState({
        step: 'setup',
        email: decodeURIComponent(email),
        isNewAccount: true,
        user: null
      })
      
      // Clean up URL parameters
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
    }
  }, [])

  const checkAccountExists = async (email: string): Promise<{ exists: boolean; user?: User }> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to check account:', error)
      return { exists: false }
    }
  }

  const sendVerificationEmail = async (email: string): Promise<void> => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
    } catch (error) {
      console.error('Failed to send verification email:', error)
      throw error
    }
  }

  const handleEmailVerification = async (token: string, email: string): Promise<void> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setAuthState(prev => ({
          ...prev,
          step: 'setup',
          email: email,
          isNewAccount: true
        }))
      } else {
        // Handle verification failure
        console.error('Email verification failed:', data.error)
      }
    } catch (error) {
      console.error('Email verification error:', error)
    }
  }

  const handleEmailSubmit = async (email: string): Promise<void> => {
    const { exists, user } = await checkAccountExists(email)
    
    if (exists && user) {
      // Existing user - check if they need to complete setup
      if (user.emailVerified && user.hasLinkedProvider) {
        // User is fully set up - redirect to provider selection
        setAuthState({
          step: 'setup',
          email: email,
          isNewAccount: false,
          user: user
        })
      } else if (user.emailVerified && !user.hasLinkedProvider) {
        // Email verified but no provider linked
        setAuthState({
          step: 'setup',
          email: email,
          isNewAccount: false,
          user: user
        })
      } else {
        // Email not verified - resend verification
        await sendVerificationEmail(email)
        setAuthState({
          step: 'verification',
          email: email,
          isNewAccount: false,
          user: user
        })
      }
    } else {
      // New user - send verification email
      await sendVerificationEmail(email)
      setAuthState({
        step: 'verification',
        email: email,
        isNewAccount: true,
        user: null
      })
    }
  }

  const handleProviderSelect = async (provider: string): Promise<void> => {
    try {
      // Redirect to OAuth provider
      const authUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${provider}?email=${encodeURIComponent(authState.email)}`
      window.location.href = authUrl
    } catch (error) {
      console.error('Provider authentication failed:', error)
      throw error
    }
  }

  const handleBack = (): void => {
    setAuthState({
      step: 'welcome',
      email: '',
      isNewAccount: false,
      user: null
    })
  }

  const handleResendEmail = async (): Promise<void> => {
    await sendVerificationEmail(authState.email)
  }

  const handleVerificationComplete = (): void => {
    setAuthState(prev => ({
      ...prev,
      step: 'setup'
    }))
  }

  // Render appropriate step
  switch (authState.step) {
    case 'welcome':
      return <WelcomePage onEmailSubmit={handleEmailSubmit} />
    
    case 'verification':
      return (
        <EmailVerification
          email={authState.email}
          onVerificationComplete={handleVerificationComplete}
          onBack={handleBack}
          onResendEmail={handleResendEmail}
        />
      )
    
    case 'setup':
      return (
        <AccountSetup
          email={authState.email}
          isNewAccount={authState.isNewAccount}
          onProviderSelect={handleProviderSelect}
          onBack={handleBack}
        />
      )
    
    default:
      return <WelcomePage onEmailSubmit={handleEmailSubmit} />
  }
}