"use client"
import { useState, useEffect } from 'react';
import { meal } from '@/types/meal.type';

interface EnhancedMealData {
  recipeSteps: string[] | null;
  isLoading: boolean;
  error: string | null;
}

export function useMealEnhancement(meal: meal, shouldFetch: boolean = false): EnhancedMealData {
  const [recipeSteps, setRecipeSteps] = useState<string[] | null>(meal.recipeSteps || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we don't have the data already and we should fetch (card flipped)
    if (shouldFetch && !recipeSteps && !isLoading && !error) {
      enhanceMeal();
    }
  }, [meal.id, shouldFetch, recipeSteps]); 

  const enhanceMeal = async () => {
    if (!meal.name || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const proteins = meal.proteins?.map((p: any) => p.name) || [];
      const vegetables = meal.vegetables?.map((v: any) => v.name) || [];
      const carbs = meal.carbs?.map((c: any) => c.name) || [];

      // Simulate API network latency
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockSteps = [
        `Prepara los ingredientes para tu ${meal.name}.`,
        `Cocina cuidadosamente las proteínas (${proteins.join(', ') || 'al gusto'}).`,
        `Acompaña con vegetales frescos (${vegetables.join(', ') || 'de temporada'}).`,
        `Agrega carbohidratos para darte energía (${carbs.join(', ') || 'para acompañar'}).`,
        `Sirve caliente y disfruta de tu comida.`
      ];

      setRecipeSteps(mockSteps);

    } catch (err) {
      console.error('Error enhancing meal:', err);
      setError('Error al obtener información adicional');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recipeSteps,
    isLoading,
    error,
  };
}
