import TimelineComponent from '@/components/Timeline/Timeline.component'
import Clock from '@/components/Clock/Clock.component'
import Todo from '@/components/Todo/Todo.component'
import DateString from '@/components/DateString/DateString.component'

import { Client } from '@notionhq/client'
import { meal } from '@/types/meal.type'

const DATABASE_ID = process.env.DATABASE_ID

const notion = new Client({
  auth: process.env.NOTION_AUTH
})

const extractResultsFromNotionApi = (results: any) =>
  results.map(({ properties, id }: any) => {
    // console.log(properties)
    const { Comida, Proteina, Dia, Detalle, Imagen, Verdura, Carbohidratos, Grasa, Orden, TODOS } = properties;
    return {
      id,
      name: Detalle.rich_text[0]?.plain_text,
      type: Comida.select.name,
      proteins: Proteina.multi_select,
      vegetables: Verdura.multi_select,
      carbs: Carbohidratos.multi_select,
      fats: Grasa.multi_select[0]?.name,
      day: Dia.title[0]?.plain_text,
      image: Imagen.files[0]?.file?.url,
      order: Orden.number,
      todos: TODOS.multi_select,
    }
  }
  )

const getMeals = async () => {
  "use server"
  const query: any = { database_id: DATABASE_ID }
  const { results } = await notion.databases.query(query)
  return results
}

export default async function MainPage() {
  try {
    const meals = await getMeals()
    const formattedMeals = extractResultsFromNotionApi(meals)
    const orderedMeals = formattedMeals.sort((a: meal, b: meal) => (a.order > b.order) ? 1 : -1)

    return (
    <main className='flex flex-col lg:flex-row min-h-screen'>
      {/* Main content area */}
      <section className='flex-1 overflow-y-auto bg-white/80 backdrop-blur-sm lg:max-w-[73%]'>
        <TimelineComponent meals={orderedMeals} />
      </section>
      
      {/* Sidebar */}
      <aside className='w-full lg:w-80 xl:w-96 lg:fixed lg:right-0 bg-white/90 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-gray-200 shadow-xl h-full'>
        <div className='p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-y-auto'>
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
          <p className='text-gray-600 mb-4'>No se pudieron cargar los datos desde Notion.</p>
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