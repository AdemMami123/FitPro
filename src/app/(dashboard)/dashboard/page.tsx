import { getCurrentUser } from '@/lib/actions/auth.action'
import { getUserProfile, isProfileComplete } from '@/lib/actions/profile.action'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  // This check is redundant since the layout already handles authentication,
  // but keeping it for safety
  if (!user) {
    redirect('/sign-in')
  }

  const profile = await getUserProfile()
  const profileComplete = await isProfileComplete()

  // If profile is not complete, redirect to profile setup
  if (!profileComplete) {
    redirect('/profile-setup')
  }

  return <DashboardClient user={user} profile={profile} />
}
