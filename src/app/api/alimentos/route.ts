import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

let cachedFoods: any[] | null = null;

function parseNumber(val: any): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(',', '.');
    return parseFloat(cleaned) || 0;
  }
  return 0;
}

function loadFoods() {
  if (cachedFoods) return cachedFoods;
  
  try {
    const jsonPath = path.join(process.cwd(), 'calories-counter', 'initial-data', 'foods.json');
    if (!fs.existsSync(jsonPath)) {
      console.error("foods.json not found at:", jsonPath);
      return [];
    }
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const items = JSON.parse(rawData);
    
    cachedFoods = items.map((item: any, idx: number) => ({
      id: item.id || `f-${idx}`,
      name: item.name || '',
      group: item.group || 'General',
      calories: parseNumber(item.calories),
      protein: parseNumber(item.protein),
      carbs: parseNumber(item.carbs),
      fat: parseNumber(item.fat),
      fiber: parseNumber(item.fiber),
    }));
    
    return cachedFoods || [];
  } catch (error) {
    console.error("Error loading foods database:", error);
    return [];
  }
}

function cleanString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s]/g, "");    // remove special characters except spaces
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  const foods = loadFoods();
  
  if (!query || query.trim().length < 2) {
    // Return a default list of healthy/popular foods
    return NextResponse.json(foods.slice(0, 30));
  }
  
  const cleanedQuery = cleanString(query);
  const queryWords = cleanedQuery.split(/\s+/).filter(Boolean);
  
  const matches = foods
    .map(food => {
      const cleanedName = cleanString(food.name);
      
      // Count how many search keywords are matched
      let matchCount = 0;
      for (const word of queryWords) {
        if (cleanedName.includes(word)) {
          matchCount++;
        }
      }
      
      // Calculate relevance score
      let score = 0;
      if (matchCount === queryWords.length) {
        score += 10; // All keywords match
        
        // Exact prefix match bonus
        if (cleanedName.startsWith(cleanedQuery)) {
          score += 5;
        }
        // Perfect match bonus
        if (cleanedName === cleanedQuery) {
          score += 15;
        }
      } else if (matchCount > 0) {
        score += matchCount * 2; // Partial matches
      }
      
      // Length penalty to favor concise matches
      score -= (food.name.length / 80);
      
      return { food, score, matchCount };
    })
    .filter(item => item.matchCount > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 35)
    .map(item => item.food);
    
  return NextResponse.json(matches);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { names } = body;
    
    if (!Array.isArray(names) || names.length === 0) {
      return NextResponse.json({ error: "Invalid request. Expected 'names' array." }, { status: 400 });
    }
    
    const foods = loadFoods();
    const results: { [key: string]: any } = {};
    
    for (const name of names) {
      if (!name || name.trim() === '') {
        results[name] = null;
        continue;
      }
      
      const cleanedName = cleanString(name);
      const words = cleanedName.split(/\s+/).filter(Boolean);
      
      if (words.length === 0) {
        results[name] = null;
        continue;
      }
      
      let bestFood = null;
      let bestScore = -9999;
      
      for (const food of foods) {
        const cleanedFoodName = cleanString(food.name);
        const foodWords = cleanedFoodName.split(/\s+/).filter(Boolean);
        
        let matchCount = 0;
        for (const word of words) {
          if (cleanedFoodName.includes(word)) {
            matchCount++;
          }
        }
        
        if (matchCount === 0) continue;
        
        // Calculate matching score
        let score = (matchCount / words.length) * 100;
        
        // Words in food name that are also matched
        let foodWordMatches = 0;
        for (const fw of foodWords) {
          if (words.some(w => fw.includes(w) || w.includes(fw))) {
            foodWordMatches++;
          }
        }
        score += (foodWordMatches / foodWords.length) * 50;
        
        // Exact prefix match
        if (cleanedFoodName.startsWith(cleanedName)) {
          score += 30;
        }
        
        // Perfect match
        if (cleanedFoodName === cleanedName) {
          score += 60;
        }
        
        // Length difference penalty
        score -= Math.abs(food.name.length - name.length) * 0.4;
        
        if (score > bestScore) {
          bestScore = score;
          bestFood = food;
        }
      }
      
      // If we found a matching food and it's a decent score, map it
      if (bestFood && bestScore > 0) {
        results[name] = bestFood;
      } else {
        // Fallback: search for a generic item if we can't find a matching food
        results[name] = null;
      }
    }
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Error in bulk matching foods:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
