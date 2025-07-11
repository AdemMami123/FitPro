"use client"

import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

export default function ThemeTest() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Theme Test Page</h1>
        
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Current Theme Info:</h2>
            <p><strong>Theme:</strong> {theme}</p>
            <p><strong>Resolved Theme:</strong> {resolvedTheme}</p>
          </div>

          <div className="space-x-4">
            <button
              onClick={() => setTheme('light')}
              className={`px-4 py-2 rounded ${
                theme === 'light' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              Light Mode
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-4 py-2 rounded ${
                theme === 'dark' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              Dark Mode
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`px-4 py-2 rounded ${
                theme === 'system' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              System
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Gradient Test</h3>
            <p>This should look the same in both themes.</p>
          </div>

          <div className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Border and Background Test</h3>
            <p>This card should have different colors in light and dark modes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
