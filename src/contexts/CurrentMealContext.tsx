"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { meal } from '@/types/meal.type';

interface CurrentMealContextType {
  currentMeal: meal | null;
  setCurrentMeal: (meal: meal | null) => void;
}

const CurrentMealContext = createContext<CurrentMealContextType | undefined>(undefined);

export function CurrentMealProvider({ children }: { children: ReactNode }) {
  const [currentMeal, setCurrentMeal] = useState<meal | null>(null);

  return (
    <CurrentMealContext.Provider value={{ currentMeal, setCurrentMeal }}>
      {children}
    </CurrentMealContext.Provider>
  );
}

export function useCurrentMeal() {
  const context = useContext(CurrentMealContext);
  if (context === undefined) {
    throw new Error('useCurrentMeal must be used within a CurrentMealProvider');
  }
  return context;
}
