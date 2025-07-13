import React from 'react'
import { ReactNode } from 'react'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getUserProfile } from '@/lib/actions/profile.action'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import ThemeToggle from '@/components/ThemeToggle'
import WeightUnitSelector from '@/components/WeightUnitSelector'
import { WeightUnitProvider } from '@/contexts/WeightUnitContext'
import { AuthProvider } from '@/lib/auth-context'

const RootLayout = async ({ children }: { children: ReactNode }) => {
  console.log('Dashboard Layout: Checking authentication');
  
  const user = await getCurrentUser();
  console.log('Dashboard Layout: Current user:', user ? `${user.email} (${user.id})` : 'null');
  
  if (!user) {
    console.log('Dashboard Layout: User not authenticated, redirecting to sign-in');
    redirect('/sign-in');
  }

  // Fetch user profile once at the layout level
  const profile = await getUserProfile();

  console.log('Dashboard Layout: Rendering dashboard');
  return (
    <WeightUnitProvider>
      <AuthProvider initialUser={user} initialProfile={profile}>
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors'>
          <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4 sm:space-x-8">
                  <Link href="/dashboard" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white" prefetch={true}>
                  🏋️‍♂️ FitPro
                </Link>
                
                {/* Navigation Links */}
                <div className="hidden md:flex space-x-6">
                  <Link 
                    href="/dashboard" 
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    prefetch={true}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/profile" 
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    prefetch={true}
                  >
                    Profile
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="hidden sm:block">
                  <WeightUnitSelector />
                </div>
                <span className="hidden lg:block text-gray-700 dark:text-gray-300 text-sm">Welcome back, {user.name}!</span>
                <ThemeToggle />
                <LogoutButton />
              </div>
            </div>
            
            {/* Mobile Navigation */}
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 pt-3 pb-3">
              <div className="flex space-x-4">
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-sm"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-sm"
                >
                  Profile
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {children}
        </main>
      </div>
      </AuthProvider>
    </WeightUnitProvider>
  )
}

export default RootLayout
