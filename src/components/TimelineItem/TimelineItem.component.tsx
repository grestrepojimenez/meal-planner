"use client"
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
export default function TimelineItem({ meal, position, containerRef }) {

  const { isIntersecting, target } = useIntersectionObserver({
    root: containerRef.current,
    rootMargin: '-37%',
    // threshold: 1
  });


  return (
    <article ref={target} id={position} className={
      `
        transition-all  duration-300  
        flex flex-col
        px-12
        text-2xl
        ${isIntersecting
        ? 'w-full min-h-[400px]'
        : ' w-3/4 self-end min-h-[270px]'
      }
       `}>
      <header>
        <h1 className={`
        ${isIntersecting
            ? 'text-clamp-30 mb-10'
            : 'text-right mb-3'
          }
          `}>

          {meal.type}</h1>
      </header>
      <main className={`
          flex flex-col md:flex-row border border-gray-400 h-4/5
        ${isIntersecting
          ? ''
          : 'h-[116px]'
        }
          `}>

        <img className={`object-cover h-auto aspect-square
        ${isIntersecting
            ? 'w-2/5'
            : ' w-1/4'
          } 
        `}
          src={meal.image}></img>
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
            {position} -  {meal.name}
          </h2>
          {isIntersecting &&
            <ul className='text-clamp-18'>
              <li>
                Proteinas: {meal.proteins.map((protein)=> <span>{protein.name} </span>)}
              </li>
              <li>
                Verduras: {meal.vegetables.map((vegetable)=> <span>{vegetable.name} </span>)}
              </li>
              <li>
                Carbohidratos: {meal.carbs.map((carb)=> <span>{carb.name} </span>)}
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
