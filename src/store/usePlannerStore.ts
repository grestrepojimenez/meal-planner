import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PlannedItem {
  id: string; // Unique identifier for the instance in the weekly plan
  name: string;
  foodId?: string | number; // Link to food in the calories-counter database
  grams: number;
  calories: number; // per 100g
  protein: number;  // per 100g
  carbs: number;    // per 100g
  fat: number;      // per 100g
  fiber: number;    // per 100g
  matchedName?: string;
}

export interface WeeklyPlan {
  [day: string]: {
    [mealType: string]: PlannedItem[];
  };
}

interface PlannerStore {
  plan: WeeklyPlan;
  addItem: (day: string, mealType: string, item: Omit<PlannedItem, 'id'>) => void;
  removeItem: (day: string, mealType: string, itemId: string) => void;
  updateGrams: (day: string, mealType: string, itemId: string, grams: number) => void;
  moveItem: (fromDay: string, fromMeal: string, toDay: string, toMeal: string, itemId: string) => void;
  clearPlan: () => void;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MEALS = ['Desayuno', 'Lonchera', 'Almuerzo', 'Algo', 'Cena'];

const generateInitialPlan = (): WeeklyPlan => {
  const plan: WeeklyPlan = {};
  for (const day of DAYS) {
    plan[day] = {};
    for (const meal of MEALS) {
      plan[day][meal] = [];
    }
  }
  return plan;
};

export const usePlannerStore = create<PlannerStore>()(
  persist(
    (set) => ({
      plan: generateInitialPlan(),
      
      addItem: (day, mealType, item) =>
        set((state) => {
          const newPlan = { ...state.plan };
          if (!newPlan[day]) newPlan[day] = {};
          if (!newPlan[day][mealType]) newPlan[day][mealType] = [];
          
          const newItem: PlannedItem = {
            ...item,
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          };
          
          newPlan[day][mealType] = [...newPlan[day][mealType], newItem];
          return { plan: newPlan };
        }),
        
      removeItem: (day, mealType, itemId) =>
        set((state) => {
          const newPlan = { ...state.plan };
          if (newPlan[day] && newPlan[day][mealType]) {
            newPlan[day][mealType] = newPlan[day][mealType].filter((i) => i.id !== itemId);
          }
          return { plan: newPlan };
        }),
        
      updateGrams: (day, mealType, itemId, grams) =>
        set((state) => {
          const newPlan = { ...state.plan };
          if (newPlan[day] && newPlan[day][mealType]) {
            newPlan[day][mealType] = newPlan[day][mealType].map((item) =>
              item.id === itemId ? { ...item, grams: Math.max(1, grams) } : item
            );
          }
          return { plan: newPlan };
        }),
        
      moveItem: (fromDay, fromMeal, toDay, toMeal, itemId) =>
        set((state) => {
          const newPlan = { ...state.plan };
          
          // 1. Find the item in the source day & meal
          if (!newPlan[fromDay] || !newPlan[fromDay][fromMeal]) return state;
          const sourceList = newPlan[fromDay][fromMeal];
          const itemToMove = sourceList.find((i) => i.id === itemId);
          
          if (!itemToMove) return state;
          
          // 2. Remove it from source
          newPlan[fromDay][fromMeal] = sourceList.filter((i) => i.id !== itemId);
          
          // 3. Add it to the destination day & meal
          if (!newPlan[toDay]) newPlan[toDay] = {};
          if (!newPlan[toDay][toMeal]) newPlan[toDay][toMeal] = [];
          
          newPlan[toDay][toMeal] = [...newPlan[toDay][toMeal], itemToMove];
          
          return { plan: newPlan };
        }),
        
      clearPlan: () => set({ plan: generateInitialPlan() }),
    }),
    {
      name: 'weekly-planner-storage', // key name in localStorage
    }
  )
);
