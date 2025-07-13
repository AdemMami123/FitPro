'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '@/types/auth'

interface AuthContextType {
  user: User | null
  profile: any | null
  isLoading: boolean
  updateUser: (user: User) => void
  updateProfile: (profile: any) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children, initialUser, initialProfile }: {
  children: React.ReactNode
  initialUser: User | null
  initialProfile: any | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [profile, setProfile] = useState<any | null>(initialProfile)
  const [isLoading, setIsLoading] = useState(false)

  const updateUser = (newUser: User) => {
    setUser(newUser)
  }

  const updateProfile = (newProfile: any) => {
    setProfile(newProfile)
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isLoading,
      updateUser,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
