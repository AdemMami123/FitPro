'use client'

import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase/client'
import { signUp, setSessionCookie } from '@/lib/actions/auth.action'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      console.log('Starting sign-up process for:', email);
      
      // Create user with Firebase Auth first
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log('Firebase Auth user created:', userCredential.user.uid);
      
      // Get ID token
      const idToken = await userCredential.user.getIdToken()
      console.log('ID token obtained');
      
      // Set session cookie first
      const sessionResult = await setSessionCookie(idToken)
      console.log('Session cookie result:', sessionResult);
      
      if (!sessionResult.success) {
        // If session creation fails, delete the Firebase Auth user
        await userCredential.user.delete()
        setError('Failed to create session. Please try again.')
        setLoading(false)
        return
      }
      
      // Now create user profile in Firestore
      const result = await signUp({ name, email, password })
      console.log('Sign-up result:', result);
      
      if (result.success) {
        console.log('User created successfully, redirecting to profile setup');
        // Use window.location.href to ensure proper navigation
        window.location.href = '/profile-setup'
      } else {
        // If Firestore creation fails, we should delete the Firebase Auth user
        await userCredential.user.delete()
        setError(result.error || 'Failed to create user profile')
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/email-already-in-use') {
        setError('This email address is already registered. Please use a different email or sign in instead.')
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.')
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else {
        setError('Failed to create account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
