'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface EmailVerificationProps {
  email: string
  onVerificationComplete: () => void
  onBack: () => void
  onResendEmail: () => void
}

export function EmailVerification({ 
  email, 
  onVerificationComplete, 
  onBack, 
  onResendEmail 
}: EmailVerificationProps) {
  const [isResending, setIsResending] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(60)

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      await onResendEmail()
      setCountdown(60)
      setCanResend(false)
    } catch (error) {
      console.error('Failed to resend email:', error)
    } finally {
      setIsResending(false)
    }
  }

  const getEmailProvider = (email: string): string => {
    const domain = email.split('@')[1]
    const providers: { [key: string]: string } = {
      'gmail.com': 'Gmail',
      'outlook.com': 'Outlook',
      'hotmail.com': 'Outlook',
      'yahoo.com': 'Yahoo Mail',
      'icloud.com': 'iCloud Mail'
    }
    
    // Check if it's a university domain
    if (domain.endsWith('.edu')) {
      const university = domain.replace('.edu', '').split('.').pop() || domain
      return `${university.charAt(0).toUpperCase() + university.slice(1)} University Email`
    }
    
    return providers[domain] || 'your email provider'
  }

  const getEmailUrl = (email: string): string => {
    const domain = email.split('@')[1]
    const urls: { [key: string]: string } = {
      'gmail.com': 'https://mail.google.com',
      'outlook.com': 'https://outlook.live.com',
      'hotmail.com': 'https://outlook.live.com',
      'yahoo.com': 'https://mail.yahoo.com',
      'icloud.com': 'https://www.icloud.com/mail'
    }
    return urls[domain] || '#'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Woerk</h1>
          <p className="text-lg text-gray-600">Email Verification</p>
        </div>

        {/* Verification Card */}
        <Card>
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <CardTitle className="text-xl">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to confirm your university email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Display */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Verification email sent to:</p>
              <p className="font-medium text-gray-900 break-all">{email}</p>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Next Steps:</h3>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mt-0.5">1</span>
                    <span>Open {getEmailProvider(email)} and check your inbox</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mt-0.5">2</span>
                    <span>Click the verification link in the email</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mt-0.5">3</span>
                    <span>Complete your account setup</span>
                  </li>
                </ol>
              </div>

              {/* Check Email Button */}
              {getEmailUrl(email) !== '#' && (
                <Button 
                  className="w-full" 
                  onClick={() => window.open(getEmailUrl(email), '_blank')}
                >
                  Open {getEmailProvider(email)}
                </Button>
              )}
            </div>

            {/* Resend Email */}
            <div className="space-y-3">
              <div className="text-center text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or
              </div>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleResendEmail}
                disabled={!canResend || isResending}
              >
                {isResending 
                  ? 'Sending...' 
                  : canResend 
                    ? 'Resend Verification Email'
                    : `Resend in ${countdown}s`
                }
              </Button>
            </div>

            {/* Email Not Accessible */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <p className="text-xs text-gray-500 text-center">
                Can't access this email address?
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="w-full"
              >
                ← Use Different Email Address
              </Button>
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800">
                <strong>Security Notice:</strong> Email verification is required to confirm 
                your affiliation with your university. This link will expire in 24 hours.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help */}
        <div className="text-center text-sm text-gray-500">
          <p>Need help? Contact your system administrator</p>
        </div>
      </div>
    </div>
  )
}