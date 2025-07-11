'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type WeightUnit = 'kg' | 'lbs'

interface WeightUnitContextType {
  unit: WeightUnit
  setUnit: (unit: WeightUnit) => void
  convertWeight: (weight: number, fromUnit: WeightUnit, toUnit: WeightUnit) => number
  formatWeight: (weight: number) => string
}

const WeightUnitContext = createContext<WeightUnitContextType | undefined>(undefined)

export const useWeightUnit = () => {
  const context = useContext(WeightUnitContext)
  if (!context) {
    throw new Error('useWeightUnit must be used within a WeightUnitProvider')
  }
  return context
}

interface WeightUnitProviderProps {
  children: ReactNode
}

export const WeightUnitProvider = ({ children }: WeightUnitProviderProps) => {
  const [unit, setUnit] = useState<WeightUnit>('kg')

  // Load saved preference from localStorage
  useEffect(() => {
    const savedUnit = localStorage.getItem('weightUnit') as WeightUnit
    if (savedUnit && (savedUnit === 'kg' || savedUnit === 'lbs')) {
      setUnit(savedUnit)
    }
  }, [])

  // Save preference to localStorage
  const updateUnit = (newUnit: WeightUnit) => {
    setUnit(newUnit)
    localStorage.setItem('weightUnit', newUnit)
  }

  // Convert weight between units
  const convertWeight = (weight: number, fromUnit: WeightUnit, toUnit: WeightUnit): number => {
    if (fromUnit === toUnit) return weight
    
    if (fromUnit === 'kg' && toUnit === 'lbs') {
      return weight * 2.20462
    } else if (fromUnit === 'lbs' && toUnit === 'kg') {
      return weight / 2.20462
    }
    
    return weight
  }

  // Format weight with unit
  const formatWeight = (weight: number): string => {
    return `${weight.toFixed(weight % 1 === 0 ? 0 : 1)} ${unit}`
  }

  const value = {
    unit,
    setUnit: updateUnit,
    convertWeight,
    formatWeight
  }

  return (
    <WeightUnitContext.Provider value={value}>
      {children}
    </WeightUnitContext.Provider>
  )
}
