'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AccountSetupProps {
  email: string
  isNewAccount: boolean
  onProviderSelect: (provider: string) => void
  onBack: () => void
}

interface AuthProvider {
  id: string
  name: string
  description: string
  icon: string
  popular?: boolean
}

const authProviders: AuthProvider[] = [
  {
    id: 'google',
    name: 'Google',
    description: 'Sign in with your Google account',
    icon: '🟢',
    popular: true
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Sign in with your GitHub account',
    icon: '⚫',
    popular: true
  },
  {
    id: 'orcid',
    name: 'ORCID',
    description: 'Sign in with your ORCID researcher ID',
    icon: '🟩'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Sign in with your LinkedIn account',
    icon: '🔵'
  }
]

export function AccountSetup({ email, isNewAccount, onProviderSelect, onBack }: AccountSetupProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleProviderSelect = async (providerId: string) => {
    setIsLoading(true)
    setSelectedProvider(providerId)
    
    try {
      await onProviderSelect(providerId)
    } catch (error) {
      console.error('Provider selection failed:', error)
    } finally {
      setIsLoading(false)
      setSelectedProvider('')
    }
  }

  const getUniversityFromEmail = (email: string): string => {
    const domain = email.split('@')[1]
    return domain.replace('.edu', '').split('.').pop() || domain
  }

  const university = getUniversityFromEmail(email)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Woerk</h1>
          <p className="text-sm text-gray-600">
            {university.charAt(0).toUpperCase() + university.slice(1)} University
          </p>
        </div>

        {/* Account Setup Card */}
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-center">
              {isNewAccount ? 'Complete Account Setup' : 'Sign In'}
            </CardTitle>
            <CardDescription className="text-center">
              {isNewAccount 
                ? 'Link your university email with an authentication provider'
                : 'Continue with your preferred authentication method'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Display */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">University Email</p>
              <p className="font-medium text-gray-900">{email}</p>
            </div>

            {/* New Account Instructions */}
            {isNewAccount && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Account Setup Process:</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Select an authentication provider below</li>
                  <li>2. Complete authentication with your chosen provider</li>
                  <li>3. Your accounts will be securely linked</li>
                  <li>4. Access your Woerk dashboard</li>
                </ol>
              </div>
            )}

            {/* Provider Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">
                Choose Authentication Provider
              </h3>
              
              {/* Popular Providers */}
              <div className="space-y-2">
                {authProviders.filter(p => p.popular).map((provider) => (
                  <Button
                    key={provider.id}
                    variant="outline"
                    className="w-full h-12 justify-start space-x-3"
                    onClick={() => handleProviderSelect(provider.id)}
                    disabled={isLoading}
                  >
                    <span className="text-lg">{provider.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-xs text-gray-500">{provider.description}</div>
                    </div>
                    {isLoading && selectedProvider === provider.id && (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    )}
                  </Button>
                ))}
              </div>

              {/* Other Providers */}
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Other Options:</p>
                <div className="space-y-2">
                  {authProviders.filter(p => !p.popular).map((provider) => (
                    <Button
                      key={provider.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start space-x-3"
                      onClick={() => handleProviderSelect(provider.id)}
                      disabled={isLoading}
                    >
                      <span>{provider.icon}</span>
                      <span className="font-medium">{provider.name}</span>
                      {isLoading && selectedProvider === provider.id && (
                        <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-800">
                <strong>Secure:</strong> Your university email and authentication provider 
                will be securely linked. We store only necessary identifiers, not passwords.
              </p>
            </div>

            {/* Back Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              disabled={isLoading}
              className="w-full"
            >
              ← Use Different Email
            </Button>
          </CardContent>
        </Card>

        {/* Help */}
        <div className="text-center text-sm text-gray-500">
          <p>Having trouble? Contact your system administrator</p>
        </div>
      </div>
    </div>
  )
}