import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { meal } from '@/types/meal.type';

export type MealItem = {
  id: string;
  name: string;
  combinations?: string[];
  isNew?: boolean;
};

const initialEnsaladas: MealItem[] = [
  { id: '1', name: 'Repollo con zanahoria, limón y cilantro' },
  { id: '2', name: 'Chop suey' },
  { id: '3', name: 'Ensalada rusa' },
];

const initialAcompanantes: MealItem[] = [
  { id: 'I', name: 'Quinua' },
  { id: 'II', name: 'Arroz integral' },
  { id: 'III', name: 'Arroz blanco' },
  { id: 'IV', name: 'Arroz con zanahoria' },
];

const initialCremasCaldos: MealItem[] = [
  { id: 'A', name: 'Consomé' },
  { id: 'B', name: 'Caldo de costilla' },
  { id: 'C', name: 'Caldo de menudencias' },
];

const initialProteinas: MealItem[] = [
  { id: 'P1', name: 'Pescado cremoso', combinations: ['D', '5', 'V'] },
  { id: 'P2', name: 'Pescado panko', combinations: ['E', '2', 'VI'] },
  { id: 'P3', name: 'Pescado sencillo', combinations: ['G', '4', 'VII', 'III'] },
  { id: 'P4', name: 'Sudado de pollo', combinations: ['1', 'III', 'VII'] },
  { id: 'P5', name: 'Sudado de posta', combinations: ['1', 'III', 'XII'] },
];

// Fallback image
const DEFAULT_IMAGE = '';

interface MealStore {
  ensaladas: MealItem[];
  acompanantes: MealItem[];
  cremasCaldos: MealItem[];
  proteinas: MealItem[];
  setEnsaladas: (items: MealItem[]) => void;
  setAcompanantes: (items: MealItem[]) => void;
  setCremasCaldos: (items: MealItem[]) => void;
  setProteinas: (items: MealItem[]) => void;
  generatePlan: () => meal[];
}

export const useMealStore = create<MealStore>()(
  persist(
    (set, get) => ({
      ensaladas: initialEnsaladas,
      acompanantes: initialAcompanantes,
      cremasCaldos: initialCremasCaldos,
      proteinas: initialProteinas,
      setEnsaladas: (items) => set({ ensaladas: items }),
      setAcompanantes: (items) => set({ acompanantes: items }),
      setCremasCaldos: (items) => set({ cremasCaldos: items }),
      setProteinas: (items) => set({ proteinas: items }),
      generatePlan: () => {
        const state = get();

        // Days available in a 2-week block
        const days = [
          'Lunes 1', 'Martes 1', 'Miercoles 1', 'Jueves 1', 'Viernes 1', 'Sabado 1', 'Domingo 1',
          'Lunes 2', 'Martes 2', 'Miercoles 2', 'Jueves 2', 'Viernes 2', 'Sabado 2', 'Domingo 2'
        ];

        return state.proteinas.map((proteina, index) => {
          const comboIds = proteina.combinations || [];

          const matchingEnsaladas = state.ensaladas.filter(e => comboIds.includes(e.id));
          const matchingAcompanantes = state.acompanantes.filter(e => comboIds.includes(e.id));
          const matchingCremas = state.cremasCaldos.filter(e => comboIds.includes(e.id));

          return {
            id: proteina.id || String(index),
            name: proteina.name,
            type: 'Almuerzo',
            proteins: [{ name: proteina.name }],
            vegetables: matchingEnsaladas.map(e => ({ name: e.name })),
            carbs: matchingAcompanantes.map(a => ({ name: a.name })),
            // Since there's no fats section in administration, just default it
            fats: 'Ninguna',
            day: days[index % days.length],
            image: DEFAULT_IMAGE,
            order: index + 1,
            // If they match any cremas, add to todos or just omit it for now since timeline only checks proteins/vegetables/carbs
            todos: matchingCremas.map(c => ({ name: c.name }))
          } as meal;
        });
      }
    }),
    {
      name: 'meal-planner-storage', // name of the item in the storage (must be unique)
    }
  )
);
