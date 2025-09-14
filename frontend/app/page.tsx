'use client'

import { useState, useEffect } from 'react'
import { MainTabs } from "@/components/main-tabs"
import { AuthFlow } from "@/components/auth/auth-flow"

interface User {
  id: string
  email: string
  emailVerified: boolean
  hasLinkedProvider: boolean
  firstName?: string
  lastName?: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already authenticated on load
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('woerk-token')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('woerk-token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('woerk-token')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthComplete = (userData: User) => {
    setUser(userData)
    // Token should be stored during the auth flow
  }

  const handleLogout = () => {
    localStorage.removeItem('woerk-token')
    setUser(null)
  }

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show authentication flow if user is not logged in
  if (!user) {
    return <AuthFlow onAuthComplete={handleAuthComplete} />
  }

  // Show main application if user is authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Woerk</h1>
              <p className="text-gray-600 mt-1">Supercomputer Resource Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName || user.lastName 
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : user.email
                  }
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <MainTabs />
      </main>
    </div>
  );
}