"use client"
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { meal } from '@/types/meal.type';
import Image from 'next/image';
import { RefObject, useEffect } from 'react';

interface TimelineItemProps {
  meal: meal,
  position: number,
  containerRef: RefObject<HTMLDivElement>,
}

export default function TimelineItem({ meal, position, containerRef }: TimelineItemProps) {
  // console.log({meal})
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



  return (
    <article ref={target} className={
      `
        transition-all  duration-300  
        flex flex-col
        px-[3.5vw]
        text-clamp-18
        ${isIntersecting
        ? 'w-full h-auto '
        : ' w-3/4 self-end min-h-[270px]'
      }
       `}
      id={String(position+1)}
    >
      <header>
        <h1 className={`
        ${isIntersecting
            ? 'text-clamp-30 mb-[2vw]'
            : 'text-right mb-3'
          }
          `}>

          {meal.day} - {meal.type}</h1>
      </header>
      <main className={`
          flex flex-col md:flex-row border border-gray-400
        ${isIntersecting
          ? ''
          : 'h-[116px]'
        }
          `}>

        <Image
          className={`object-cover max-h-[170px] md:aspect-square md:max-h-[400px]
        ${isIntersecting
              ? 'md:w-2/5'
              : 'md:w-1/4'
            } 
        `}
          width={700}
          height={400}
          alt={meal.name}
          src={meal.image}
        />

        <div className={`
        ${isIntersecting
            ? 'p-[3vw]'
            : 'p-2 flex flex-col justify-center'
          }
          `}>
          <h2 className={`
        ${isIntersecting
              ? 'text-clamp-30 mb-7'
              : ''
            }
          `}>
            {position+1} -  {meal.name}
          </h2>
          {isIntersecting &&
            <ul className='text-clamp-18'>
              <li>
                Proteinas: {meal.proteins.map((protein: any, index: number) => <span key={index}>{protein.name} </span>)}
              </li>
              <li>
                Verduras: {meal.vegetables.map((vegetable: any, index: number) => <span key={index}>{vegetable.name} </span>)}
              </li>
              <li>
                Carbohidratos: {meal.carbs.map((carb: any, index: number) => <span key={index}>{carb.name} </span>)}
              </li>
              <li>
                Grasa: {meal.fats}
              </li>
            </ul>
          }
        </div>
      </main>

    </article>
  )



}
