'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function AuthCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [error, setError] = useState<string>('')
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    handleAuthCallback()
  }, [])

  const handleAuthCallback = async () => {
    try {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')
      const provider = searchParams.get('provider')

      if (error) {
        setError(`Authentication failed: ${error}`)
        setStatus('error')
        return
      }

      if (!code || !state || !provider) {
        setError('Missing required authentication parameters')
        setStatus('error')
        return
      }

      // Exchange code for tokens
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          state,
          provider
        })
      })

      const data = await response.json()

      if (response.ok && data.token) {
        // Store JWT token
        localStorage.setItem('woerk-token', data.token)
        setStatus('success')
        
        // Redirect to home page
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        setError(data.error || 'Authentication failed')
        setStatus('error')
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      setError('An unexpected error occurred during authentication')
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
            <p className="text-lg text-gray-600">Authentication</p>
          </div>

          {/* Status Content */}
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            {status === 'processing' && (
              <>
                <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Completing Authentication
                  </h2>
                  <p className="text-gray-600">
                    Please wait while we securely link your accounts...
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
                    Authentication Successful!
                  </h2>
                  <p className="text-gray-600">
                    Your accounts have been successfully linked. Redirecting to your dashboard...
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
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
                    Authentication Failed
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {error}
                  </p>
                  <button 
                    onClick={handleRetry}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Try Again
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