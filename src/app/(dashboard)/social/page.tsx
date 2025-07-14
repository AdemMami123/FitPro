import SocialHub from '@/components/SocialHub'
import SocialTest from '@/components/SocialTest'

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <SocialTest />
        <div className="mt-6">
          <SocialHub />
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Social & Community - FitPro',
  description: 'Connect with friends, join challenges, and share your fitness journey',
}
