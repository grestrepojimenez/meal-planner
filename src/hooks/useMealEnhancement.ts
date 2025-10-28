"use client"
import { useState, useEffect } from 'react';
import { meal } from '@/types/meal.type';

interface EnhancedMealData {
  recipeSteps: string[] | null;
  isLoading: boolean;
  error: string | null;
}

export function useMealEnhancement(meal: meal): EnhancedMealData {
  const [recipeSteps, setRecipeSteps] = useState<string[] | null>(meal.recipeSteps || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we don't have the data already
    if (!recipeSteps) {
      enhanceMeal();
    }
  }, [meal.id]); // Only re-run when meal ID changes

  const enhanceMeal = async () => {
    if (!meal.name || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const proteins = meal.proteins?.map((p: any) => p.name) || [];
      const vegetables = meal.vegetables?.map((v: any) => v.name) || [];
      const carbs = meal.carbs?.map((c: any) => c.name) || [];
      const fats = meal.fats || '';

      const [ recipeData] = await Promise.all([
        !recipeSteps ? aiService.generateRecipe(meal.name, proteins, vegetables, carbs, fats) : Promise.resolve(null)
      ]);


      if (recipeData && !recipeSteps) {
        setRecipeSteps(recipeData.steps);
      }

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
