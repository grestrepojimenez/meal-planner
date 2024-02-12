"use client"
import TimelineComponent from '@/components/Timeline/Timeline.component'
import Clock from '@/components/Clock/Clock.component'
import Todo from '@/components/Todo/Todo.component'
import DateString from '@/components/DateString/DateString.component'
import { useState } from 'react'



export default function MainPage({ meals }) {

  const [currentMeal, setCurrentMeal] = useState({})

  return (
    <main className='flex py-[3.5vw] flex-col h-screen md:flex-row'>
      <section className='overflow-y-auto  md:w-[72%] '>
        <TimelineComponent meals={meals} setCurrentMeal={setCurrentMeal} />
      </section>
      <aside className='overflow-y-auto overflow-x-hidden flex flex-col gap-4 md:px-[4vw]'>
        <DateString />
        <Clock />
        <Todo currentMeal={currentMeal} />
      </aside>
    </main>
  )
}