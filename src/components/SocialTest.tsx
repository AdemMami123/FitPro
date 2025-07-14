'use client'

import { useEffect, useState } from 'react'
import { initializeSocialFeatures } from '@/lib/challenges.action'

export default function SocialTest() {
  const [status, setStatus] = useState<string>('idle')
  const [message, setMessage] = useState<string>('')

  const runInitialization = async () => {
    setStatus('loading')
    setMessage('Initializing social features...')
    
    try {
      const result = await initializeSocialFeatures()
      
      if (result.success) {
        setStatus('success')
        setMessage('Social features initialized successfully!')
      } else {
        setStatus('error')
        setMessage(`Error: ${result.error}`)
      }
    } catch (error) {
      setStatus('error')
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Social Features Test</h3>
      
      <div className="mb-4">
        <button
          onClick={runInitialization}
          disabled={status === 'loading'}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {status === 'loading' ? 'Initializing...' : 'Initialize Social Features'}
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded ${
          status === 'success' ? 'bg-green-100 text-green-800' :
          status === 'error' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}
