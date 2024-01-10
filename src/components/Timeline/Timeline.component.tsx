"use client"

import { useRef } from 'react';
import TimelineItem from '../TimelineItem/TimelineItem.component';

export default function TimelineComponent({ meals }) {
  const containerRef = useRef();

  return (
    <section ref={containerRef} className='flex flex-col gap-6 over overflow-y-auto'>
      {
        meals.map((meal, index) =>
          <TimelineItem key={meal.id} meal={meal} position={index} containerRef={containerRef} />
        )
      }

    </section>
  )
}
