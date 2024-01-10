import Image from 'next/image'

import { Client } from '@notionhq/client'
import TimelineComponent from '@/components/Timeline/Timeline.component'
import Clock from '@/components/Clock/Clock.component'
import Todo from '@/components/Todo/Todo.component'
import DateString from '@/components/DateString/DateString.component'

const DATABASE_ID = process.env.DATABASE_ID

const notion = new Client({
  auth: process.env.NOTION_AUTH
})

const extractResultsFromNotionApi = results =>
  results.map(({ properties, id }) => {
    const { Tipo, Proteina, Dia, Name, Imagen, Verduras, Carbohidratos, Grasa, Orden } = properties;
    return {
      id,
      name: Name.title[0]?.plain_text,
      type: Tipo.multi_select[0]?.name,
      protein: Proteina.multi_select[0]?.name,
      vegetable: Verduras.multi_select[0]?.name,
      carbs: Carbohidratos.multi_select[0]?.name,
      fat: Grasa.multi_select[0]?.name,
      dia: Dia.multi_select[0]?.name,
      image: Imagen.files[0]?.file?.url,
      order: Orden.number,
    }
  }
  )

const getMeals = async () => {
  "use server"
  const query = { database_id: DATABASE_ID }
  const { results } = await notion.databases.query(query)
  return results
}

export default async function Home() {

  const meals = await getMeals()
  const formattedMeals = extractResultsFromNotionApi(meals)
  const orderedMeals = formattedMeals.sort((a, b) => (a.order > b.order) ? 1 : -1)

  return (
    <main className='flex py-[3.5vw] flex-col h-screen md:flex-row'>
      <section className='overflow-y-auto  md:w-[72%] '>
        <TimelineComponent meals={orderedMeals} />
      </section>
      <aside className='overflow-y-auto overflow-x-hidden flex flex-col gap-4 md:px-[4vw]'>
        <DateString />
        <Clock />
        <Todo />
      </aside>
    </main>
  )
}