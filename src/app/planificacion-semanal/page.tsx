'use client';

import React, { useState, useEffect } from 'react';
import { useMealStore } from '@/store/useMealStore';
import { usePlannerStore, PlannedItem } from '@/store/usePlannerStore';

// --- Premium Custom SVG Icons ---
const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClearIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const DragIcon = () => (
  <svg className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

interface FoodItem {
  id: string | number;
  name: string;
  group: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MEALS = ['Desayuno', 'Lonchera', 'Almuerzo', 'Algo', 'Cena'];

export default function PlanificacionSemanalPage() {
  const { ensaladas, acompanantes, cremasCaldos, proteinas } = useMealStore();
  const { plan, addItem, removeItem, updateGrams, moveItem, clearPlan } = usePlannerStore();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'mis-comidas' | 'buscar'>('mis-comidas');
  const [activeDay, setActiveDay] = useState('Lunes'); // For mobile layout view
  const [dragOverCell, setDragOverCell] = useState<{ day: string; mealType: string } | null>(null);
  
  // Collapsible accordion states for "Mis Comidas"
  const [openSections, setOpenSections] = useState({
    combos: true,
    proteinas: true,
    acompanantes: false,
    ensaladas: false,
    cremas: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Search query effect
  useEffect(() => {
    if (activeTab !== 'buscar') return;
    
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const res = await fetch(`/api/alimentos?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Error searching foods:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeTab]);

  if (!mounted) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="animate-pulse text-xl text-gray-500">Cargando tu planificador semanal...</div>
      </main>
    );
  }

  // Toggle sections
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, item: any, source?: { day: string; mealType: string }) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ item, source }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, day: string, mealType: string) => {
    e.preventDefault();
    if (dragOverCell?.day !== day || dragOverCell?.mealType !== mealType) {
      setDragOverCell({ day, mealType });
    }
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = async (e: React.DragEvent, targetDay: string, targetMealType: string) => {
    e.preventDefault();
    setDragOverCell(null);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;

      const { item, source } = JSON.parse(dataStr);

      // If it comes from inside the table, move it
      if (source) {
        moveItem(source.day, source.mealType, targetDay, targetMealType, item.id);
        return;
      }

      // If it comes from search/database (has calories defined)
      if (item.group === 'Database' || item.calories !== undefined) {
        addItem(targetDay, targetMealType, {
          name: item.name,
          foodId: item.id,
          grams: 100,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          fiber: item.fiber,
          matchedName: item.name
        });
        return;
      }

      // If it's a Plato Principal (protein) dropped in Almuerzo, import combo!
      if (item.type === 'combo-principal') {
        const comboIds = item.combinations || [];
        const matchingEnsaladas = ensaladas.filter(e => comboIds.includes(e.id));
        const matchingAcompanantes = acompanantes.filter(e => comboIds.includes(e.id));
        const matchingCremas = cremasCaldos.filter(e => comboIds.includes(e.id));

        const comboItems = [
          { name: item.name, label: 'Proteína' },
          ...matchingAcompanantes.map(a => ({ name: a.name, label: 'Acompañamiento' })),
          ...matchingEnsaladas.map(e => ({ name: e.name, label: 'Ensalada' })),
          ...matchingCremas.map(c => ({ name: c.name, label: 'Crema/Caldo' }))
        ];

        // Match them all in a single batch
        try {
          const res = await fetch('/api/alimentos/match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ names: comboItems.map(i => i.name) })
          });
          const matchResults = await res.json();

          for (const cItem of comboItems) {
            const match = matchResults[cItem.name];
            addItem(targetDay, targetMealType, {
              name: cItem.name,
              foodId: match?.id || undefined,
              grams: 100,
              calories: match ? match.calories : 0,
              protein: match ? match.protein : 0,
              carbs: match ? match.carbs : 0,
              fat: match ? match.fat : 0,
              fiber: match ? match.fiber : 0,
              matchedName: match ? match.name : undefined
            });
          }
        } catch (err) {
          console.error("Error batch matching combo:", err);
          // Fallback with 0 calories
          for (const cItem of comboItems) {
            addItem(targetDay, targetMealType, {
              name: cItem.name,
              grams: 100,
              calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0
            });
          }
        }
        return;
      }

      // If it's a single item from Mis Comidas
      try {
        const res = await fetch('/api/alimentos/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ names: [item.name] })
        });
        const matchResults = await res.json();
        const match = matchResults[item.name];

        addItem(targetDay, targetMealType, {
          name: item.name,
          foodId: match?.id || undefined,
          grams: 100,
          calories: match ? match.calories : 0,
          protein: match ? match.protein : 0,
          carbs: match ? match.carbs : 0,
          fat: match ? match.fat : 0,
          fiber: match ? match.fiber : 0,
          matchedName: match ? match.name : undefined
        });
      } catch (err) {
        console.error("Error matching single item:", err);
        addItem(targetDay, targetMealType, {
          name: item.name,
          grams: 100,
          calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0
        });
      }
    } catch (err) {
      console.error("Drop error:", err);
    }
  };

  // --- Calculations for weekly nutrition values ---
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let itemPlannerCount = 0;

  // Calculate day-specific totals
  const dayTotals: { [day: string]: { calories: number; protein: number } } = {};

  for (const day of DAYS) {
    dayTotals[day] = { calories: 0, protein: 0 };
    for (const meal of MEALS) {
      const items = plan[day]?.[meal] || [];
      for (const item of items) {
        const factor = item.grams / 100;
        const itemCal = item.calories * factor;
        const itemProt = item.protein * factor;
        const itemCarb = item.carbs * factor;
        const itemFat = item.fat * factor;
        const itemFib = item.fiber * factor;

        dayTotals[day].calories += itemCal;
        dayTotals[day].protein += itemProt;

        totalCalories += itemCal;
        totalProtein += itemProt;
        totalCarbs += itemCarb;
        totalFat += itemFat;
        totalFiber += itemFib;
        itemPlannerCount++;
      }
    }
  }

  // Daily averages (divide by 7 days)
  const avgCalories = totalCalories / 7;
  const avgProtein = totalProtein / 7;
  const avgCarbs = totalCarbs / 7;
  const avgFat = totalFat / 7;
  const avgFiber = totalFiber / 7;

  // Caloric distribution percentages
  const proteinKcal = totalProtein * 4;
  const carbsKcal = totalCarbs * 4;
  const fatKcal = totalFat * 9;
  const totalMacroKcal = proteinKcal + carbsKcal + fatKcal;

  const pctProtein = totalMacroKcal > 0 ? (proteinKcal / totalMacroKcal) * 100 : 0;
  const pctCarbs = totalMacroKcal > 0 ? (carbsKcal / totalMacroKcal) * 100 : 0;
  const pctFat = totalMacroKcal > 0 ? (fatKcal / totalMacroKcal) * 100 : 0;

  // Visual helper functions
  const formatNum = (num: number) => Math.round(num * 10) / 10;

  return (
    <main className="max-w-[105rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up flex flex-col gap-8 min-h-[calc(100vh-4rem)]">
      {/* Title Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/70 backdrop-blur-md border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-green-500 tracking-tight">
            Planificación Semanal de Comidas
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Diseña el menú de tu semana arrastrando alimentos. Controla tus calorías y macronutrientes de forma automática.
          </p>
        </div>
        {itemPlannerCount > 0 && (
          <button
            onClick={() => {
              if (window.confirm("¿Seguro que deseas vaciar toda la planificación de esta semana?")) {
                clearPlan();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition duration-200 shadow-sm"
          >
            <ClearIcon />
            <span>Limpiar Plan</span>
          </button>
        )}
      </header>

      {/* 1. Nutritional Dashboard */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-gradient-to-br from-white/95 to-slate-50/90 backdrop-blur-lg border border-slate-100 rounded-3xl p-6 shadow-lg">
        {/* Daily average calories */}
        <div className="lg:col-span-4 flex flex-col justify-center items-center p-6 border-r border-slate-100 text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Promedio Diario</span>
          <span className="text-5xl font-black text-slate-800 mt-2 tracking-tight">
            {formatNum(avgCalories)} <span className="text-xl font-bold text-slate-400">kcal</span>
          </span>
          <p className="text-xs text-slate-500 mt-3 max-w-[20rem]">
            Consumo total de la semana: <strong className="text-slate-700">{formatNum(totalCalories)} kcal</strong> distribuidos en tus platos planificados.
          </p>
        </div>

        {/* Macro Distribution Bars */}
        <div className="lg:col-span-5 flex flex-col justify-center gap-4 px-2 lg:px-6 py-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Distribución Energética</span>
          
          {/* Proteína */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Proteína ({formatNum(avgProtein)}g)
              </span>
              <span>{formatNum(pctProtein)}% / ~{formatNum(avgProtein * 4)} kcal</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-rose-400 to-red-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${pctProtein || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Carbohidratos */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Carbohidratos ({formatNum(avgCarbs)}g)
              </span>
              <span>{formatNum(pctCarbs)}% / ~{formatNum(avgCarbs * 4)} kcal</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${pctCarbs || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Grasas */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Grasas ({formatNum(avgFat)}g)
              </span>
              <span>{formatNum(pctFat)}% / ~{formatNum(avgFat * 9)} kcal</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${pctFat || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Nutritional advice assistant */}
        <div className="lg:col-span-3 bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-2xl p-5 border border-indigo-100/50 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest block">Asistente Nutricional</span>
            <p className="text-xs text-indigo-900 leading-relaxed">
              {itemPlannerCount === 0 
                ? "Aún no has planificado comidas. Arrastra platos desde la barra izquierda para comenzar a evaluar tu alimentación."
                : avgCalories < 1200 
                  ? "Tu plan aporta pocas calorías. Considera agregar carbohidratos complejos o grasas saludables para mantener la energía."
                  : avgCalories > 2500
                    ? "El consumo energético es alto. Si buscas pérdida de peso, reduce las porciones de carbohidratos en las cenas."
                    : "¡Buen trabajo! Tu distribución energética y calorías promedio se encuentran en un rango saludable y equilibrado."}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-indigo-100 flex justify-between text-[11px] font-semibold text-indigo-600">
            <span>Fibra promedio: {formatNum(avgFiber)}g</span>
            <span>Total Platos: {itemPlannerCount}</span>
          </div>
        </div>
      </section>

      {/* Main Interactive Planner Grid + Sidebar */}
      <section className="flex flex-col lg:flex-row gap-8 flex-grow items-stretch">
        
        {/* A. Sidebar Left - Food Repositories */}
        <aside className="w-full lg:w-[22rem] bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col flex-shrink-0 h-[48rem]">
          {/* Tabs header */}
          <div className="flex border-b border-gray-100 bg-gray-50 flex-shrink-0">
            <button
              onClick={() => setActiveTab('mis-comidas')}
              className={`flex-1 py-4 text-sm font-bold border-b-2 transition duration-200 ${
                activeTab === 'mis-comidas' 
                  ? 'border-blue-600 text-blue-600 bg-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
              }`}
            >
              Mis Comidas
            </button>
            <button
              onClick={() => setActiveTab('buscar')}
              className={`flex-1 py-4 text-sm font-bold border-b-2 transition duration-200 ${
                activeTab === 'buscar' 
                  ? 'border-blue-600 text-blue-600 bg-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
              }`}
            >
              Buscar en BD
            </button>
          </div>

          <div className="p-4 flex-grow overflow-y-auto flex flex-col gap-4">
            
            {/* TAB 1: Mis Comidas (User-configured meals) */}
            {activeTab === 'mis-comidas' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 italic mb-2 px-1">
                  Arrastra un plato individual o un Plato Principal para importar todo su combo automáticamente.
                </p>

                {/* --- 1. COMBOS / PLATOS PRINCIPALES --- */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden bg-slate-50/50">
                  <button 
                    onClick={() => toggleSection('combos')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-slate-100 to-slate-200/50 hover:bg-slate-200 text-left text-xs font-bold text-slate-700 flex justify-between items-center transition"
                  >
                    <span>PLATO PRINCIPAL (COMBOS COMPLETOS)</span>
                    <span className="text-slate-400">{openSections.combos ? '▲' : '▼'}</span>
                  </button>
                  {openSections.combos && (
                    <div className="p-2 space-y-1.5 max-h-[14rem] overflow-y-auto bg-white border-t border-gray-100">
                      {proteinas.map((prot) => (
                        <div
                          key={prot.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, { ...prot, type: 'combo-principal' })}
                          className="flex flex-col p-2.5 bg-rose-50/50 hover:bg-rose-50 border border-rose-100/60 hover:border-rose-200 rounded-xl cursor-grab active:cursor-grabbing transition group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-rose-800 truncate pr-2">{prot.name}</span>
                            <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded flex-shrink-0">COMBO</span>
                          </div>
                          {prot.combinations && prot.combinations.length > 0 && (
                            <span className="text-[10px] text-gray-500 mt-1 truncate">
                              Combina: {prot.combinations.join(', ')}
                            </span>
                          )}
                        </div>
                      ))}
                      {proteinas.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4">No hay proteínas registradas</p>
                      )}
                    </div>
                  )}
                </div>

                {/* --- 2. PROTEÍNAS INDIVIDUALES --- */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => toggleSection('proteinas')}
                    className="w-full px-4 py-3 bg-red-50 hover:bg-red-100/80 text-left text-xs font-bold text-red-800 flex justify-between items-center transition"
                  >
                    <span>PROTEÍNAS (INDIVIDUALES)</span>
                    <span className="text-red-400">{openSections.proteinas ? '▲' : '▼'}</span>
                  </button>
                  {openSections.proteinas && (
                    <div className="p-2 space-y-1 max-h-[12rem] overflow-y-auto bg-white border-t border-gray-100">
                      {proteinas.map((prot) => (
                        <div
                          key={prot.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, { name: prot.name, type: 'proteina' })}
                          className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-gray-100 hover:border-gray-200 rounded-xl cursor-grab text-xs font-medium text-slate-800 transition truncate"
                        >
                          {prot.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* --- 3. ACOMPAÑANTES --- */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => toggleSection('acompanantes')}
                    className="w-full px-4 py-3 bg-amber-50 hover:bg-amber-100/80 text-left text-xs font-bold text-amber-800 flex justify-between items-center transition"
                  >
                    <span>ACOMPAÑANTES</span>
                    <span className="text-amber-400">{openSections.acompanantes ? '▲' : '▼'}</span>
                  </button>
                  {openSections.acompanantes && (
                    <div className="p-2 space-y-1 max-h-[12rem] overflow-y-auto bg-white border-t border-gray-100">
                      {acompanantes.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, { name: item.name, type: 'acompanante' })}
                          className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-gray-100 hover:border-gray-200 rounded-xl cursor-grab text-xs font-medium text-slate-800 transition truncate"
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* --- 4. ENSALADAS --- */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => toggleSection('ensaladas')}
                    className="w-full px-4 py-3 bg-green-50 hover:bg-green-100/80 text-left text-xs font-bold text-green-800 flex justify-between items-center transition"
                  >
                    <span>ENSALADAS</span>
                    <span className="text-green-400">{openSections.ensaladas ? '▲' : '▼'}</span>
                  </button>
                  {openSections.ensaladas && (
                    <div className="p-2 space-y-1 max-h-[12rem] overflow-y-auto bg-white border-t border-gray-100">
                      {ensaladas.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, { name: item.name, type: 'ensalada' })}
                          className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-gray-100 hover:border-gray-200 rounded-xl cursor-grab text-xs font-medium text-slate-800 transition truncate"
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* --- 5. CREMAS Y CALDOS --- */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => toggleSection('cremas')}
                    className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100/80 text-left text-xs font-bold text-blue-800 flex justify-between items-center transition"
                  >
                    <span>CREMAS Y CALDOS</span>
                    <span className="text-blue-400">{openSections.cremas ? '▲' : '▼'}</span>
                  </button>
                  {openSections.cremas && (
                    <div className="p-2 space-y-1 max-h-[12rem] overflow-y-auto bg-white border-t border-gray-100">
                      {cremasCaldos.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, { name: item.name, type: 'crema' })}
                          className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-gray-100 hover:border-gray-200 rounded-xl cursor-grab text-xs font-medium text-slate-800 transition truncate"
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Buscar en la Base de Datos (Food search) */}
            {activeTab === 'buscar' && (
              <div className="space-y-4 flex flex-col h-full overflow-hidden">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar ej: Huevo, Avellanas, Arepa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                  />
                  <div className="absolute left-3.5 top-3">
                    <SearchIcon />
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto space-y-2 pr-1 max-h-[36rem]">
                  {isSearching ? (
                    <div className="text-center text-xs text-gray-400 py-8 animate-pulse">Buscando en la base de datos...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, { ...item, group: 'Database' })}
                        className="p-3 bg-gradient-to-br from-white to-slate-50 hover:from-blue-50 hover:to-indigo-50 border border-gray-100 hover:border-blue-200 rounded-2xl cursor-grab active:cursor-grabbing transition shadow-sm hover:shadow flex flex-col gap-1.5"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-bold text-xs text-slate-800 leading-tight">{item.name}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-600 font-medium px-1 rounded flex-shrink-0 uppercase tracking-wider">{item.group.substring(0, 15)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 border-t border-dashed border-gray-100 pt-1.5">
                          <span className="font-semibold text-blue-600">{item.calories} kcal <span className="font-normal text-slate-400">/100g</span></span>
                          <span>P: {item.protein}g | C: {item.carbs}g | G: {item.fat}g</span>
                        </div>
                      </div>
                    ))
                  ) : searchQuery.trim().length >= 2 ? (
                    <div className="text-center text-xs text-gray-400 py-8">No se encontraron alimentos en la base de datos.</div>
                  ) : (
                    <div className="text-center text-xs text-gray-400 py-8 italic leading-relaxed">
                      Escribe al menos 2 letras para buscar entre más de 6,000 alimentos de la base de datos nutricional.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* B. Right Panel - Weekly Planning Grid */}
        <div className="flex-1 flex flex-col gap-4 overflow-x-auto min-w-0">
          
          {/* MOBILE VIEW SELECTOR TABS (Lunes - Domingo) */}
          <div className="flex lg:hidden bg-white/80 backdrop-blur border border-gray-200 rounded-2xl p-1 overflow-x-auto gap-1">
            {DAYS.map((day) => {
              const caloriesDay = Math.round(dayTotals[day].calories);
              const isActive = activeDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-xs transition duration-200 flex flex-col items-center gap-0.5 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{day}</span>
                  <span className={`text-[9px] opacity-90 ${isActive ? 'text-blue-100' : 'text-blue-600 font-bold'}`}>{caloriesDay} kcal</span>
                  <span className={`text-[9px] opacity-90 ${isActive ? 'text-rose-100' : 'text-rose-600 font-bold'}`}>{formatNum(dayTotals[day].protein)}g prot</span>
                </button>
              );
            })}
          </div>

          {/* DESKTOP MAIN PLANNER TABLE GRID */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col flex-grow">
            
            {/* GRID DESKTOP CONTAINER */}
            <div className="hidden lg:grid grid-cols-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center border-r border-gray-200">Día</div>
              {MEALS.map((meal) => (
                <div key={meal} className="p-4 text-xs font-black text-slate-700 uppercase tracking-widest text-center border-r last:border-r-0 border-gray-200">
                  {meal}
                </div>
              ))}
            </div>

            <div className="flex-grow flex flex-col overflow-y-auto">
              
              {/* DESKTOP LAYOUT */}
              <div className="hidden lg:flex flex-col">
                {DAYS.map((day) => {
                  const caloriesDay = Math.round(dayTotals[day].calories);
                  return (
                    <div key={day} className="grid grid-cols-6 border-b last:border-b-0 border-gray-200 items-stretch min-h-[7.5rem] hover:bg-slate-50/20 transition-colors">
                      {/* Day Name Indicator Cell */}
                      <div className="p-4 flex flex-col justify-center items-center bg-gray-50/50 border-r border-gray-200 text-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-800">{day}</span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{caloriesDay} kcal</span>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">{formatNum(dayTotals[day].protein)}g prot</span>
                      </div>

                      {/* Meal Column Cells */}
                      {MEALS.map((meal) => {
                        const items = plan[day]?.[meal] || [];
                        const isOver = dragOverCell?.day === day && dragOverCell?.mealType === meal;
                        
                        // Calculate cell totals
                        let cellKcal = 0;
                        let cellProt = 0;
                        for (const item of items) {
                          const factor = item.grams / 100;
                          cellKcal += item.calories * factor;
                          cellProt += item.protein * factor;
                        }

                        return (
                          <div
                            key={meal}
                            onDragOver={(e) => handleDragOver(e, day, meal)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, day, meal)}
                            className={`p-3 border-r last:border-r-0 border-gray-200 flex flex-col gap-2.5 min-h-[6.5rem] transition duration-200 relative ${
                              isOver 
                                ? 'bg-blue-50/60 ring-2 ring-blue-500/30 border-blue-400 z-10' 
                                : 'bg-transparent'
                            }`}
                          >
                            {/* Empty state instruction helper */}
                            {items.length === 0 && (
                              <div className="flex-grow flex items-center justify-center border-2 border-dashed border-gray-100 hover:border-gray-200 rounded-2xl py-6 transition duration-200 select-none">
                                <span className="text-[10px] text-gray-400/80 font-medium text-center px-1">Arrastra aquí</span>
                              </div>
                            )}

                            {/* Render items inside the cell */}
                            {items.map((item) => {
                              const calcKcal = Math.round(item.calories * (item.grams / 100));
                              const calcProt = formatNum(item.protein * (item.grams / 100));
                              return (
                                <div
                                  key={item.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, item, { day, mealType: meal })}
                                  className="group p-2 bg-gradient-to-br from-white to-slate-50 border border-gray-200 rounded-2xl flex flex-col gap-2 relative shadow-sm hover:shadow transition duration-200 text-left select-none animate-fade-in"
                                >
                                  {/* Drag handle & Delete Row */}
                                  <div className="flex justify-between items-center gap-1 pb-1 border-b border-dashed border-slate-100">
                                    <div className="flex items-center gap-1 min-w-0">
                                      <DragIcon />
                                      <span className="font-extrabold text-xs text-slate-800 truncate" title={item.name}>
                                        {item.name}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => removeItem(day, meal, item.id)}
                                      className="opacity-0 group-hover:opacity-100 hover:bg-red-50 p-1 rounded-lg transition duration-200 flex-shrink-0"
                                    >
                                      <TrashIcon />
                                    </button>
                                  </div>

                                  {/* Gram portion input and dynamic calorie/protein counter */}
                                  <div className="flex justify-between items-center gap-2 mt-0.5">
                                    {/* Grams Adjuster */}
                                    <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 flex-shrink-0 scale-95 origin-left">
                                      <button
                                        onClick={() => updateGrams(day, meal, item.id, item.grams - 25)}
                                        className="w-5 h-5 flex items-center justify-center font-black text-slate-600 hover:bg-white rounded transition text-xs select-none"
                                      >
                                        -
                                      </button>
                                      <input
                                        type="number"
                                        value={item.grams}
                                        onChange={(e) => updateGrams(day, meal, item.id, parseInt(e.target.value) || 0)}
                                        className="w-8 text-[11px] font-bold text-center bg-transparent border-none focus:outline-none p-0"
                                      />
                                      <button
                                        onClick={() => updateGrams(day, meal, item.id, item.grams + 25)}
                                        className="w-5 h-5 flex items-center justify-center font-black text-slate-600 hover:bg-white rounded transition text-xs select-none"
                                      >
                                        +
                                      </button>
                                    </div>

                                    {/* Calories & Protein counter */}
                                    <div className="text-right flex flex-col justify-center flex-shrink-0">
                                      <span className="text-[11px] font-bold text-blue-600 leading-tight">{calcKcal} kcal</span>
                                      <span className="text-[10px] font-semibold text-rose-600 leading-tight">{calcProt}g prot</span>
                                    </div>
                                  </div>

                                  {/* Micronutrient Tooltip Info Icon */}
                                  <div className="absolute right-2 bottom-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    <div className="relative group/tooltip">
                                      <InfoIcon />
                                      <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-900/95 text-white text-[10px] rounded-xl p-2.5 opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 shadow-xl leading-normal z-50">
                                        <div className="font-extrabold text-blue-400 mb-1 border-b border-slate-700/60 pb-1">{item.matchedName || item.name}</div>
                                        <div className="grid grid-cols-2 gap-y-0.5 font-medium">
                                          <span>Proteína: {calcProt}g</span>
                                          <span>Carbs: {formatNum(item.carbs * (item.grams / 100))}g</span>
                                          <span>Grasas: {formatNum(item.fat * (item.grams / 100))}g</span>
                                          <span>Fibra: {formatNum(item.fiber * (item.grams / 100))}g</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Cell Totals Footer */}
                            {items.length > 0 && (
                              <div className="mt-auto pt-2 border-t border-slate-100 flex flex-col items-end text-[10px] font-black text-slate-500 gap-0.5 select-none bg-slate-50/40 p-1.5 rounded-xl border border-dashed border-slate-200/50">
                                <div className="flex justify-between w-full">
                                  <span>Total:</span>
                                  <span className="text-blue-700 font-extrabold">{Math.round(cellKcal)} kcal</span>
                                </div>
                                <div className="flex justify-between w-full">
                                  <span></span>
                                  <span className="text-rose-700 font-extrabold">{formatNum(cellProt)}g prot</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* MOBILE LAYOUT VIEW */}
              <div className="flex lg:hidden flex-col p-4 gap-6 bg-slate-50/40">
                <div className="flex justify-between items-center bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                  <span className="font-extrabold text-slate-800 text-sm">Resumen {activeDay}</span>
                  <div className="flex gap-2">
                    <span className="font-black text-blue-600 text-xs bg-blue-50 px-3 py-1 rounded-full">
                      {Math.round(dayTotals[activeDay]?.calories || 0)} kcal
                    </span>
                    <span className="font-black text-rose-600 text-xs bg-rose-50 px-3 py-1 rounded-full">
                      {formatNum(dayTotals[activeDay]?.protein || 0)}g prot
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {MEALS.map((meal) => {
                    const items = plan[activeDay]?.[meal] || [];
                    const isOver = dragOverCell?.day === activeDay && dragOverCell?.mealType === meal;
                    
                    // Calculate cell totals for mobile
                    let cellKcal = 0;
                    let cellProt = 0;
                    for (const item of items) {
                      const factor = item.grams / 100;
                      cellKcal += item.calories * factor;
                      cellProt += item.protein * factor;
                    }

                    return (
                      <div
                        key={meal}
                        onDragOver={(e) => handleDragOver(e, activeDay, meal)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, activeDay, meal)}
                        className={`bg-white border border-gray-200 rounded-3xl p-4 flex flex-col gap-3 min-h-[6.5rem] shadow-sm transition duration-200 ${
                          isOver ? 'ring-2 ring-blue-500 bg-blue-50/40' : ''
                        }`}
                      >
                        {/* Meal Title inside Card */}
                        <span className="font-extrabold text-xs text-slate-700 uppercase tracking-widest border-b border-gray-100 pb-1.5">
                          {meal}
                        </span>

                        {items.length === 0 && (
                          <p className="text-xs text-gray-400 italic text-center py-4 select-none">
                            Arrastra alimentos aquí
                          </p>
                        )}

                        {items.map((item) => {
                          const calcKcal = Math.round(item.calories * (item.grams / 100));
                          const calcProt = formatNum(item.protein * (item.grams / 100));
                          return (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, item, { day: activeDay, mealType: meal })}
                              className="p-3 bg-slate-50 border border-gray-100 rounded-xl flex items-center justify-between gap-4 select-none"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <DragIcon />
                                <div className="flex flex-col min-w-0">
                                  <span className="font-bold text-xs text-slate-800 truncate">{item.name}</span>
                                  <span className="text-[10px] text-gray-500">
                                    P: {calcProt}g | C: {formatNum(item.carbs * (item.grams / 100))}g
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 flex-shrink-0">
                                {/* Grams counter input */}
                                <div className="flex items-center bg-white rounded-lg border border-gray-200 p-0.5 scale-90">
                                  <button
                                    onClick={() => updateGrams(activeDay, meal, item.id, item.grams - 25)}
                                    className="w-5 h-5 flex items-center justify-center font-black text-slate-600 hover:bg-slate-100 rounded text-xs select-none"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-[10px] font-bold text-center select-none">{item.grams}g</span>
                                  <button
                                    onClick={() => updateGrams(activeDay, meal, item.id, item.grams + 25)}
                                    className="w-5 h-5 flex items-center justify-center font-black text-slate-600 hover:bg-slate-100 rounded text-xs select-none"
                                  >
                                    +
                                  </button>
                                </div>

                                <div className="text-right flex flex-col justify-center">
                                  <span className="text-xs font-bold text-blue-600 leading-tight">{calcKcal} kcal</span>
                                  <span className="text-[10px] font-medium text-rose-600 leading-tight">{calcProt}g prot</span>
                                </div>

                                <button
                                  onClick={() => removeItem(activeDay, meal, item.id)}
                                  className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Cell Totals Footer */}
                        {items.length > 0 && (
                          <div className="mt-2 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs font-black text-slate-500 bg-slate-50/50 p-2.5 rounded-xl border border-dashed border-slate-200/50 select-none">
                            <span>Total {meal}:</span>
                            <div className="flex gap-3">
                              <span className="text-blue-700 font-extrabold">{Math.round(cellKcal)} kcal</span>
                              <span className="text-rose-700 font-extrabold">{formatNum(cellProt)}g prot</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>

      </section>
    </main>
  );
}
