'use client'

import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/firebase/client'

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      // Clear client-side Firebase Auth session
      await signOut(auth)
      
      // Clear server-side session cookie
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      
      // Always redirect to sign-in, regardless of API response
      window.location.href = '/sign-in'
    } catch (error) {
      console.error('Logout error:', error)
      // Redirect to sign-in even on error
      window.location.href = '/sign-in'
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button 
      onClick={handleLogout}
      disabled={isLoading}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
    >
      {isLoading ? 'Logging out...' : 'Logout'}
    </button>
  )
}
