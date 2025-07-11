import React from 'react'
import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth.action'
import ThemeToggle from '@/components/ThemeToggle'

const AuthLayout = async ({ children }: { children: ReactNode }) => {
   console.log('Auth Layout: Checking authentication');
   
   const user = await getCurrentUser(); 
   console.log('Auth Layout: Current user:', user ? `${user.email} (${user.id})` : 'null');
   
   if (user) {
     console.log('Auth Layout: User authenticated, redirecting to dashboard');
     redirect('/dashboard');
   }

   console.log('Auth Layout: Rendering auth form');
   return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors'>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🏋️‍♂️ FitPro</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Your AI Fitness Coach</p>
        </div>
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
