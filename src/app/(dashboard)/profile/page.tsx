import { getCurrentUser } from '@/lib/actions/auth.action'
import { getUserProfile } from '@/lib/actions/profile.action'
import { redirect } from 'next/navigation'
import ProfileUpdateClient from './ProfileUpdateClient'

export default async function ProfileUpdatePage() {
  console.log('ProfileUpdatePage: Getting current user');
  const user = await getCurrentUser();
  
  console.log('ProfileUpdatePage: Current user:', user ? `${user.email} (${user.id})` : 'null');

  if (!user) {
    console.log('ProfileUpdatePage: No user found, redirecting to sign-in');
    redirect('/sign-in');
  }

  console.log('ProfileUpdatePage: Getting user profile');
  const profile = await getUserProfile();
  console.log('ProfileUpdatePage: Profile:', profile ? 'exists' : 'null');

  console.log('ProfileUpdatePage: Rendering profile update form');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Update Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Keep your fitness profile up to date for better workout recommendations
            </p>
          </div>
          
          <ProfileUpdateClient initialData={profile} />
        </div>
      </div>
    </div>
  );
}
