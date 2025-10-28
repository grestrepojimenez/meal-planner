"use client"

import { useEffect, useRef, useState } from 'react';
import TimelineItem from '../TimelineItem/TimelineItem.component';
import { meal } from '@/types/meal.type';
import useScrollIntoView from './useScrollIntoView';
import { useCurrentMeal } from '@/contexts/CurrentMealContext';

interface TimelineComponentProps {
  meals: meal[];
}

function getWeekNumber(date: Date): number {
  const copiedDate = new Date(date);
  // Set the first day of the week as Monday
  copiedDate.setUTCDate(copiedDate.getUTCDate() - (copiedDate.getUTCDay() + 6) % 7);
  // Calculate the number of weeks elapsed since the first day of the year
  const millisecondsInWeek = 604800000; // 7 days in milliseconds
  const weeksElapsed = Math.floor(
    (copiedDate.getTime() - new Date(copiedDate.getUTCFullYear(), 0, 1).getTime()) / millisecondsInWeek
  ) + 1;
  return weeksElapsed;
}

const today = new Date();
const currentWeekNumber = getWeekNumber(today);

export default function TimelineComponent({ meals }: TimelineComponentProps) {
  const containerRef = useRef<HTMLInputElement>(null);
  const { setCurrentMeal } = useCurrentMeal();

  const [currentMealForScroll, setCurrentMealForScroll] = useState<meal[]>([])

  useEffect(() => {
    const date = new Date();
    const dayOfWeek = date.getDay();
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    const dayName = daysOfWeek[dayOfWeek];

    const weekNumber = getWeekNumber(date);
    const isWeekNumberEven = weekNumber % 2 === 0;
    const mealWeekNumber = isWeekNumberEven ? '1' : '2';

    const mealDay = `${dayName} ${mealWeekNumber}`;

    const foundCurrentMeal = meals.filter((meal) => mealDay === meal.day);

    setCurrentMealForScroll(foundCurrentMeal);
    
    // Set the first meal as current meal for the context
    if (foundCurrentMeal.length > 0) {
      setCurrentMeal(foundCurrentMeal[0]);
    } else {
      setCurrentMeal(null);
    }
  }, [meals, setCurrentMeal])

  useScrollIntoView(String(currentMealForScroll[0]?.order))

  if (!meals.length) {
    return null;
  }

  return (
    <section ref={containerRef} className='flex flex-col gap-6 py-6 px-6  mx-auto'>
      <div className='text-center mb-6 px-4'>
        <h1 className='text-clamp-30 font-bold text-gray-800 mb-2'>Plan de Comidas</h1>
      </div>
      
      <div className='space-y-6 md:space-y-8'>
        {
          meals.map((meal, index) =>
            <TimelineItem key={meal.id} meal={meal} position={index} containerRef={containerRef} />
          )
        }
      </div>
    </section>
  )
}
