'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function EmailVerify() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [error, setError] = useState<string>('')
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    handleEmailVerification()
  }, [])

  const handleEmailVerification = async () => {
    try {
      const token = searchParams.get('token')
      const email = searchParams.get('email')

      if (!token || !email) {
        setError('Invalid verification link. Please check your email and try again.')
        setStatus('error')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        
        // Redirect to authentication setup after 3 seconds
        setTimeout(() => {
          router.push(`/?email=${encodeURIComponent(email)}&verified=true`)
        }, 3000)
      } else {
        setError(data.error || 'Email verification failed')
        setStatus('error')
      }
    } catch (error) {
      console.error('Email verification error:', error)
      setError('An unexpected error occurred during verification')
      setStatus('error')
    }
  }

  const handleRetry = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Woerk</h1>
            <p className="text-lg text-gray-600">Email Verification</p>
          </div>

          {/* Status Content */}
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            {status === 'processing' && (
              <>
                <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Verifying Your Email
                  </h2>
                  <p className="text-gray-600">
                    Please wait while we verify your university email address...
                  </p>
                </div>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-green-900 mb-2">
                    Email Verified Successfully!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Your university email has been confirmed. Now you can complete your account setup.
                  </p>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Next:</strong> You'll be redirected to choose an authentication provider 
                      to securely link with your university email.
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-red-900 mb-2">
                    Verification Failed
                  </h2>
                  <div className="text-gray-600 mb-4 space-y-2">
                    <p>{error}</p>
                    <div className="text-sm space-y-1">
                      <p><strong>Common reasons:</strong></p>
                      <ul className="list-disc list-inside text-left space-y-1">
                        <li>The verification link has expired (24 hours)</li>
                        <li>The link has already been used</li>
                        <li>Invalid or corrupted verification token</li>
                      </ul>
                    </div>
                  </div>
                  <button 
                    onClick={handleRetry}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Request New Verification Email
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Help */}
          <div className="text-center text-sm text-gray-500">
            <p>Need help? Contact your system administrator</p>
          </div>
        </div>
      </div>
    </div>
  )
}