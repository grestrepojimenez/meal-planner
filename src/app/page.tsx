"use client";

import { useEffect, useState } from 'react';
import TimelineComponent from '@/components/Timeline/Timeline.component'
import Clock from '@/components/Clock/Clock.component'
import Todo from '@/components/Todo/Todo.component'
import DateString from '@/components/DateString/DateString.component'
import { useMealStore } from '@/store/useMealStore'
import { meal } from '@/types/meal.type'

export default function MainPage() {
  const [mounted, setMounted] = useState(false);
  const generatePlan = useMealStore((state) => state.generatePlan);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50'>
        <div className='animate-pulse text-xl text-gray-500'>Cargando plan de comidas...</div>
      </main>
    );
  }

  try {
    const generatedMeals = generatePlan();
    // Use the stored order or the default mapping order
    const orderedMeals = generatedMeals.sort((a: meal, b: meal) => (a.order > b.order) ? 1 : -1)

    return (
      <main className='flex flex-col lg:flex-row min-h-screen'>
        {/* Main content area */}
        <section className='flex-1 overflow-y-auto bg-white/80 backdrop-blur-sm lg:max-w-[73%]'>
          <TimelineComponent meals={orderedMeals} />
        </section>
        
        {/* Sidebar */}
        <aside className='w-full lg:w-80 xl:w-96 lg:fixed lg:right-0 bg-white/90 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-gray-200 shadow-xl h-full'>
          <div className='p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-y-auto opacity-100'>
            <div className='space-y-4 md:space-y-6'>
              <div className='bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm border border-gray-100'>
                <DateString />
              </div>
              
              <div className='bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm border border-gray-100'>
                <Clock />
              </div>
              
              <div className='bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm border border-gray-100'>
                <Todo />
              </div>
            </div>
          </div>
        </aside>
      </main>
    )
  } catch (error) {
    console.error('Error loading meals:', error);
    return (
      <main className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50'>
        <div className='text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200'>
          <div className='w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center'>
            <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
            </svg>
          </div>
          <h2 className='text-xl font-bold text-gray-800 mb-2'>Error al cargar las comidas</h2>
          <p className='text-gray-600 mb-4'>Hubo un problema procesando el plan local.</p>
          <button 
            onClick={() => window.location.reload()} 
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }
}