"use client"
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { meal } from '@/types/meal.type';
import Image from 'next/image';
import { RefObject, useEffect, useState } from 'react';
import { useMealEnhancement } from '@/hooks/useMealEnhancement';

interface TimelineItemProps {
  meal: meal,
  position: number,
  containerRef: RefObject<HTMLDivElement>,
}

export default function TimelineItem({ meal, position, containerRef }: TimelineItemProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { recipeSteps, isLoading } = useMealEnhancement(meal);
  
  const { isIntersecting, target } = useIntersectionObserver({
    root: containerRef.current,
    rootMargin: '-37%',
    // threshold: 1
  });

  useEffect(() => {
    if (isIntersecting) {
      // console.log('set current meal')
    }
  }, [position, isIntersecting])

  const handleCardClick = () => {
    if (isIntersecting) {
      setIsFlipped(!isFlipped);
    }
  };



  return (
    <article 
      ref={target} 
      className={`
        transition-all duration-500 ease-in-out
        relative
        ${isIntersecting
          ? 'w-full scale-100 opacity-100'
          : 'w-4/5 self-end scale-95 opacity-75'
        }
      `}
      id={String(position+1)}
      role="article"
      aria-labelledby={`meal-title-${position}`}
      aria-describedby={`meal-description-${position}`}
    >
  
      <div 
        className={`
          rounded-xl md:rounded-2xl shadow-lg border cursor-pointer
          transition-all duration-500
          ${isIntersecting 
            ? 'bg-white border-gray-200 shadow-xl hover:shadow-2xl' 
            : 'bg-gray-50 border-gray-300 shadow-md'
          }
        `}
        onClick={handleCardClick}
        style={{ 
          perspective: '1000px',
          minHeight: isIntersecting ? '400px' : 'auto'
        }}
      >
        <div className={`
          relative w-full h-full transition-transform duration-700 transform-style-preserve-3d
          ${isFlipped && isIntersecting ? 'rotate-y-180' : ''}
        `}>
          
          {/* Front of card */}
          <div className=" inset-0 w-full h-full backface-hidden p-4 md:p-6">
            <header className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${isIntersecting 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  #{position + 1}
                </span>
                <div className="flex items-center space-x-2">
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${isIntersecting 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-gray-200 text-gray-600'
                      }
                    `}>
                      {isLoading ? '...' : `200 cal`}
                    </span>
                  <span className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${isIntersecting 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {meal.type}
                  </span>
                </div>
              </div>
              <h1 
                id={`meal-title-${position}`}
                className={`
                font-bold text-gray-800
                ${isIntersecting ? 'text-clamp-30' : 'text-clamp-20'}
                transition-all duration-300
              `}>
                {meal.day}
              </h1>
              {isIntersecting && (
                <p className="text-sm text-gray-500 mt-2">
                  Haz clic para ver la receta paso a paso
                </p>
              )}
            </header>

            <main className={`
              transition-all duration-500
              ${isIntersecting ? 'block' : 'hidden'}
            `}>
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="md:w-2/5">
                  <div className="relative overflow-hidden rounded-lg md:rounded-xl">
                    <Image
                      className="object-cover w-full h-40 sm:h-48 md:h-56 lg:h-64 transition-transform duration-300 hover:scale-105"
                      width={400}
                      height={300}
                      alt={meal.name}
                      src={meal.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                </div>

                <div className="md:w-3/5 space-y-3 md:space-y-4">
                  <h2 
                    id={`meal-description-${position}`}
                    className="text-clamp-20 md:text-clamp-30 font-bold text-gray-800 mb-3 md:mb-4"
                  >
                    {meal.name}
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-1">Proteínas</h3>
                          <p className="text-gray-600 text-sm">
                            {meal.proteins.map((protein: any, index: number) => 
                              <span key={index} className="inline-block mr-2">
                                {protein.name}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-1">Verduras</h3>
                          <p className="text-gray-600 text-sm">
                            {meal.vegetables.map((vegetable: any, index: number) => 
                              <span key={index} className="inline-block mr-2">
                                {vegetable.name}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-1">Carbohidratos</h3>
                          <p className="text-gray-600 text-sm">
                            {meal.carbs.map((carb: any, index: number) => 
                              <span key={index} className="inline-block mr-2">
                                {carb.name}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-1">Grasa</h3>
                          <p className="text-gray-600 text-sm">{meal.fats}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Collapsed view */}
            <div className={`
              transition-all duration-500
              ${!isIntersecting ? 'block' : 'hidden'}
            `}>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    className="object-cover w-full h-full"
                    width={64}
                    height={64}
                    alt={meal.name}
                    src={meal.image}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-clamp-18 font-semibold text-gray-700 mb-1">
                    {meal.name}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500">
                      {meal.proteins.length} proteínas • {meal.vegetables.length} verduras • {meal.carbs.length} carbohidratos
                    </p>
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                        200 cal
                      </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back of card - Recipe Steps */}
          <div className="absolute inset-0 w-full h-full backface-hidden flip-card-back p-4 md:p-6">
            <div className="h-full flex flex-col">
              <header className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    Receta
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(false);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ← Volver
                  </button>
                </div>
                <h2 className="text-clamp-20 md:text-clamp-30 font-bold text-gray-800">
                  {meal.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Paso a paso para preparar tu comida
                </p>
              </header>

              <main className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Generando receta...</span>
                  </div>
                ) : recipeSteps && recipeSteps.length > 0 ? (
                  <div className="space-y-4">
                    {recipeSteps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>No se pudo generar la receta.</p>
                    <p className="text-xs mt-1">Intenta de nuevo más tarde.</p>
                  </div>
                )}
              </main>

                <footer className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Calorías estimadas:</span>
                    <span className="font-semibold text-orange-600">300 cal</span>
                  </div>
                </footer>
            </div>
          </div>
        </div>
      </div>
    </article>
  )



}
