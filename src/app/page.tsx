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

  const meals = await getMeals()
  const formattedMeals = extractResultsFromNotionApi(meals)
  const orderedMeals = formattedMeals.sort((a: meal, b: meal) => (a.order > b.order) ? 1 : -1)


  return (
    <main className='flex py-[3.5vw] flex-col h-screen md:flex-row'>
      <section className='overflow-y-auto  md:w-[72%] '>
        <TimelineComponent meals={orderedMeals} />
      </section>
      <aside className='hidden overflow-y-auto overflow-x-hidden  flex-col gap-4 md:flex block px-[4vw]'>
        <DateString />
        <Clock />
        <Todo />
      </aside>
    </main>
  )
}