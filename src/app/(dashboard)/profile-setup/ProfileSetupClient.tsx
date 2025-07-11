'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ProfileSetup from '@/components/ProfileSetup'
import { updateUserProfile } from '@/lib/actions/profile.action'
import { UserProfile } from '@/types/fitness'

interface ProfileSetupClientProps {
  initialData: UserProfile | null
}

export default function ProfileSetupClient({ initialData }: ProfileSetupClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleProfileComplete = async (profileData: Partial<UserProfile>) => {
    setIsSubmitting(true)
    setError('')

    try {
      const result = await updateUserProfile(profileData)
      
      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Profile setup error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative">
      {isSubmitting && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Setting up your profile...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <ProfileSetup
        onComplete={handleProfileComplete}
        initialData={initialData || undefined}
      />
    </div>
  )
}
