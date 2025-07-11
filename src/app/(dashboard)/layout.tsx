import React from 'react'
import { ReactNode } from 'react'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import ThemeToggle from '@/components/ThemeToggle'

const RootLayout = async ({ children }: { children: ReactNode }) => {
  console.log('Dashboard Layout: Checking authentication');
  
  const user = await getCurrentUser();
  console.log('Dashboard Layout: Current user:', user ? `${user.email} (${user.id})` : 'null');
  
  if (!user) {
    console.log('Dashboard Layout: User not authenticated, redirecting to sign-in');
    redirect('/sign-in');
  }

  console.log('Dashboard Layout: Rendering dashboard');
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors'>
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🏋️‍♂️ FitPro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">Welcome back, {user.name}!</span>
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default RootLayout
