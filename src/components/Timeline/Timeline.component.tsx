"use client"

import { useEffect, useRef, useState } from 'react';
import TimelineItem from '../TimelineItem/TimelineItem.component';
import { meal } from '@/types/meal.type';
import useScrollIntoView from './useScrollIntoView';

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

  const [currentMeal, setCurrentMeal] = useState<meal[]>([])

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

    setCurrentMeal(foundCurrentMeal)
  }, [])

  useScrollIntoView(String(currentMeal[0]?.order))

  if (!meals.length) {
    return null;
  }

  return (
    <section ref={containerRef} className='flex flex-col gap-6 over'>
      {
        meals.map((meal, index) =>
          <TimelineItem key={meal.id} meal={meal} position={index} containerRef={containerRef} />
        )
      }

    </section>
  )
}
