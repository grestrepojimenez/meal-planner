"use client"
import React, { useState, useEffect, useMemo } from 'react'
import { useCurrentMeal } from '@/contexts/CurrentMealContext'

interface TodoItem {
  id: string;
  name: string;
  checked: boolean;
}

export default function Todo() {
  const { currentMeal } = useCurrentMeal();
  
  // Memoize todos to prevent infinite re-renders
  const todos = useMemo(() => currentMeal?.todos || [], [currentMeal?.todos]);
  
  // Initialize todos with checked state from localStorage
  const [todosWithState, setTodosWithState] = useState<TodoItem[]>([]);

  useEffect(() => {
    if (todos.length === 0) {
      setTodosWithState([]);
      return;
    }

    // Load saved todos from localStorage
    const savedTodos = localStorage.getItem('todos');
    const parsedTodos = savedTodos ? JSON.parse(savedTodos) : {};
    
    // Initialize todos with their saved state
    const initializedTodos = todos.map((todo: any) => ({
      id: todo.id,
      name: todo.name,
      checked: parsedTodos[todo.id] || false
    }));
    
    setTodosWithState(initializedTodos);
  }, [todos]);

  const handleOnChange = (id: string) => {
    const updatedTodos = todosWithState.map((todo) => {
      if (todo.id === id) {
        return {
          ...todo,
          checked: !todo.checked
        }
      }
      return todo
    });
    
    setTodosWithState(updatedTodos);
    
    // Save to localStorage as a key-value map for easier lookup
    const todosMap = updatedTodos.reduce((acc, todo) => {
      acc[todo.id] = todo.checked;
      return acc;
    }, {} as Record<string, boolean>);
    
    localStorage.setItem('todos', JSON.stringify(todosMap));
  };

  const checkedTasks = todosWithState.filter(todo => todo.checked);
  const unCheckedTasks = todosWithState.filter(todo => !todo.checked);

  if (todos.length === 0) {
    return (
      <div className='text-xl mt-3 flex flex-col gap-4 justify-between'>
        <p className='text-gray-500 text-center'>No hay tareas para esta comida</p>
      </div>
    );
  }

  return (
    <div className='text-xl mt-3 flex flex-col gap-4 justify-between'>
      <h3 className='text-clamp-20 font-semibold text-gray-800 mb-2'>Tareas Pendientes</h3>
      <ul className='flex flex-col gap-3' role="list" aria-label="Lista de tareas pendientes">
        {unCheckedTasks.map((todo) =>
          <li key={todo.id} className='flex items-center'>
            <input
              type='checkbox'
              id={todo.id}
              name={todo.name}
              value={todo.name}
              checked={todo.checked}
              onChange={() => handleOnChange(todo.id)}
              className='h-5 w-5 text-blue-600 rounded focus:ring-blue-500'
              aria-describedby={`todo-description-${todo.id}`}
            />
            <label 
              className="ml-3 text-gray-700 cursor-pointer" 
              htmlFor={todo.id}
              id={`todo-description-${todo.id}`}
            >
              {todo.name}
            </label>
          </li>
        )}
      </ul>
      
      {checkedTasks.length > 0 && (
        <>
          <hr className='border-gray-300' />
          <h4 className='text-clamp-18 font-medium text-gray-600 mb-2'>Completadas</h4>
          <ul className='flex flex-col gap-3' role="list" aria-label="Lista de tareas completadas">
            {checkedTasks.map((todo) =>
              <li key={todo.id} className='flex items-center'>
                <input
                  type='checkbox'
                  id={`checked-${todo.id}`}
                  name={todo.name}
                  value={todo.name}
                  checked={todo.checked}
                  onChange={() => handleOnChange(todo.id)}
                  className='h-5 w-5 text-green-600 rounded focus:ring-green-500'
                  aria-describedby={`checked-description-${todo.id}`}
                />
                <label 
                  className="ml-3 text-gray-500 line-through cursor-pointer" 
                  htmlFor={`checked-${todo.id}`}
                  id={`checked-description-${todo.id}`}
                >
                  {todo.name}
                </label>
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  )
}
