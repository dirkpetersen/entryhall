'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface WelcomePageProps {
  onEmailSubmit: (email: string) => void
}

export function WelcomePage({ onEmailSubmit }: WelcomePageProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateEduEmail = (email: string): boolean => {
    const eduRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu$/
    return eduRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validate .edu email
    if (!validateEduEmail(email)) {
      setError('Please enter a valid university email address ending with .edu')
      setIsLoading(false)
      return
    }

    try {
      // Pass email to parent component for further processing
      await onEmailSubmit(email)
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Woerk Branding */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Woerk</h1>
          <p className="text-lg text-gray-600 mb-8">
            Comprehensive Resource Management Platform
          </p>
        </div>

        {/* Welcome Card */}
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-center">Welcome to Woerk</CardTitle>
            <CardDescription className="text-center">
              Access your supercomputer resources and manage your research projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Description */}
            <div className="mb-6 space-y-2 text-sm text-gray-600">
              <p>
                <strong>Woerk</strong> is your gateway to AI supercomputer facilities, providing:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Self-service project and resource management</li>
                <li>Resource allocation and usage tracking</li>
                <li>Multi-university federation support</li>
                <li>Integration with research infrastructure</li>
                <li>Web-based terminal and file management</li>
              </ul>
            </div>

            {/* Email Entry Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  University Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className={error ? 'border-red-500' : ''}
                  required
                />
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                <p className="text-xs text-gray-500">
                  Only university email addresses (.edu) are accepted
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !email}
              >
                {isLoading ? 'Checking...' : 'Next'}
              </Button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                By proceeding, you agree to authenticate with your university credentials
                and link additional identity providers as required.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Need help? Contact your system administrator</p>
        </div>
      </div>
    </div>
  )
}