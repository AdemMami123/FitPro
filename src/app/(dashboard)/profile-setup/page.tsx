import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getUserProfile, isProfileComplete } from '@/lib/actions/profile.action'
import ProfileSetupClient from './ProfileSetupClient'

export default async function ProfileSetupPage() {
  console.log('ProfileSetupPage: Getting current user');
  
  const user = await getCurrentUser()
  console.log('ProfileSetupPage: Current user:', user ? `${user.email} (${user.id})` : 'null');
  
  // This check is redundant since the layout already handles authentication,
  // but keeping it for safety
  if (!user) {
    console.log('ProfileSetupPage: No user found, redirecting to sign-in');
    redirect('/sign-in')
  }

  console.log('ProfileSetupPage: Getting user profile');
  const profile = await getUserProfile()
  console.log('ProfileSetupPage: Profile:', profile ? 'exists' : 'null');
  
  const profileComplete = await isProfileComplete()
  console.log('ProfileSetupPage: Profile complete:', profileComplete);

  // If profile is already complete, redirect to dashboard
  if (profileComplete) {
    console.log('ProfileSetupPage: Profile complete, redirecting to dashboard');
    redirect('/dashboard')
  }

  console.log('ProfileSetupPage: Rendering profile setup form');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to FitPro! 🏋️‍♂️
          </h1>
          <p className="text-xl text-gray-600">
            Let's set up your profile to create your personalized fitness journey
          </p>
        </div>
        
        <ProfileSetupClient initialData={profile} />
      </div>
    </div>
  )
}
