"use client"

import { useRef } from 'react';
import TimelineItem from '../TimelineItem/TimelineItem.component';
import { meal } from '@/types/meal.type';

interface TimelineComponentProps {
  meals: meal[];
}
export default function TimelineComponent({ meals, setCurrentMeal }: TimelineComponentProps) {
  const containerRef = useRef();

  return (
    <section ref={containerRef} className='flex flex-col gap-6 over'>
      {
        meals.map((meal, index) =>
          <TimelineItem key={meal.id} meal={meal} position={index} containerRef={containerRef} setCurrentMeal={setCurrentMeal} />
        )
      }

    </section>
  )
}
