import { Client } from '@notionhq/client'
import { meal } from '@/types/meal.type'
import MainPage from '@/features/mainPage/MainPage.component'

const DATABASE_ID = process.env.DATABASE_ID

const notion = new Client({
  auth: process.env.NOTION_AUTH
})

const extractResultsFromNotionApi = results =>
  results.map(({ properties, id }) => {
    const { Tipo, Proteina, Dia, Name, Imagen, Verduras, Carbohidratos, Grasa, Orden, TODOS } = properties;
    return {
      id,
      name: Name.title[0]?.plain_text,
      type: Tipo.multi_select[0]?.name,
      proteins: Proteina.multi_select,
      vegetables: Verduras.multi_select,
      carbs: Carbohidratos.multi_select,
      fats: Grasa.multi_select[0]?.name,
      dia: Dia.multi_select[0]?.name,
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
  console.log(results)
  return results
}

export default async function MealsProvider() {

  const meals = await getMeals()
  const formattedMeals = extractResultsFromNotionApi(meals)
  const orderedMeals = formattedMeals.sort((a: meal, b: meal) => (a.order > b.order) ? 1 : -1)

  // const orderedMeals = [{
  //   id: 1,
  //   name: 'Title 1',
  //   type: 'type',
  //   proteins: [
  //     {
  //       name: 'proteins 1 '
  //     }
  //   ],
  //   vegetables: [
  //     {
  //       name: 'vegetable 1 '
  //     }
  //   ],
  //   carbs: [
  //     {
  //       name: 'carb 1 '
  //     }
  //   ],
  //   fats: 'fats',
  //   dia: 'day',
  //   image: '/example1.png',
  //   order: '1',
  //   todos: [
  //     {
  //     id: 0,
  //     name: 'todo 1'
  //   },
  //   {
  //     id: 0,
  //     name: 'todo 2'
  //   }
  // ],
  // }]

  return (
    <MainPage meals={orderedMeals} />
  )
}
