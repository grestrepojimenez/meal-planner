"use client"
import React, { useState } from 'react'
import { meal } from '@/types/meal.type'


interface ITodoProps {
  currentMeal?: meal
}

export default function Todo({ currentMeal }: ITodoProps) {

  const todos = currentMeal?.todos || []

  const initialTodosWithState = JSON.stringify(todos) || [];

  const [todosWithState, setTodosWithState] = useState<any>(initialTodosWithState);

  const handleOnChange = (id: number) => {
    const uodatedTodosWithState = todosWithState.map((todo: any) => {
      if (todo.id === id) {
        return {
          ...todo,
          checked: !todo.checked
        }
      }
      return todo
    }
    );
    setTodosWithState(uodatedTodosWithState);
    localStorage.setItem('todos', JSON.stringify(uodatedTodosWithState))
  };

  // const checkedTasks = todosWithState.filter(todo => todo.checked)
  // const unCheckedTasks = todosWithState.filter((todo) => !todo.checked)

  return (
    <div className='text-xl mt-3 flex flex-col gap-4 justify-between'>
      <ul className='flex flex-col gap-3'>
        {todos.map(({ id, name }: any) =>
          <li key={id}>
            <input
              type='checkbox'
              id={id}
              name={name}
              value={name}
              checked={false}
              onChange={() => handleOnChange(id)}
              className='h-6 w-6'
            />
            <label className="ml-2" htmlFor={id}>{name}</label>
          </li>
        )}

      </ul>
      <hr className=' border-gray-600' />

      {/* <ul className='flex flex-col gap-3'>
        {checkedTasks.map(({ id, name }) =>
          <li>
            <input
              type='checkbox'
              id={id}
              key={id}
              name={name}
              value={name}
              checked={true}
              onChange={() => handleOnChange(id)}
              className='h-6 w-6'
            />
            <label className="ml-2 line-through" htmlFor={id}>{name}</label>
          </li>
        )}

      </ul> */}


    </div>
  )
}
