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
      <section className='overflow-y-auto  md:w-[70%] '>
        <TimelineComponent meals={meals} setCurrentMeal={setCurrentMeal} />
      </section>
      <aside className='hidden md:flex px-[4vw] max-w-[30%] flex-col overflow-y-auto overflow-x-hidden gap-4'>
        <DateString />
        <Clock />
        <Todo currentMeal={currentMeal} />
      </aside>
    </main>
  )
}