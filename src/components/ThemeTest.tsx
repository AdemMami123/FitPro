'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeTest() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme, themes } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading theme...</div>
  }

  const handleThemeChange = (newTheme: string) => {
    console.log('Manually setting theme to:', newTheme)
    setTheme(newTheme)
  }

  return (
    <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Theme Debug Info
      </h3>
      <div className="space-y-2 text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          Current theme: <span className="font-mono font-bold">{theme}</span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Resolved theme: <span className="font-mono font-bold">{resolvedTheme}</span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Available themes: <span className="font-mono">{themes?.join(', ')}</span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          HTML classes: <span className="font-mono text-xs">{typeof document !== 'undefined' ? document.documentElement.className : 'N/A'}</span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Storage key: <span className="font-mono">fitpro-theme</span>
        </p>
      </div>
      <div className="mt-4 space-x-2">
        <button
          onClick={() => handleThemeChange('light')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Set Light
        </button>
        <button
          onClick={() => handleThemeChange('dark')}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors"
        >
          Set Dark
        </button>
      </div>
      
      {/* Visual test - this should change colors */}
      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
        <p className="text-gray-800 dark:text-gray-200 text-sm">
          This box should change colors when you switch themes.
        </p>
      </div>
    </div>
  )
}
