'use client';

import React, { useState } from 'react';

type MealItem = {
  id: string;
  name: string;
  combinations?: string[];
  isNew?: boolean;
};

import { useMealStore } from '@/store/useMealStore';

const PencilIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
  </svg>
);

interface EditableListProps {
  title: string;
  subtitle: string;
  items: MealItem[];
  theme: {
    section: string;
    headerBg: string;
    headerText: string;
    itemHover: string;
    idBg: string;
    idText: string;
    buttonHover: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    badgeHover: string;
  };
  icon: React.ReactNode;
  hasCombinations?: boolean;
  onUpdateItems: (items: MealItem[]) => void;
}

function EditableList({ title, subtitle, items, theme, icon, hasCombinations, onUpdateItems }: EditableListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MealItem | null>(null);

  const handleEditClick = (item: MealItem) => {
    setEditingId(item.id + (item.isNew ? '-new' : ''));
    setEditForm({ ...item, combinations: item.combinations ? [...item.combinations] : [] });
  };

  const handleCancelEdit = () => {
    // If it was a new item, remove it
    if (editForm?.isNew) {
      onUpdateItems(items.filter(i => !i.isNew));
    }
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveEdit = () => {
    if (!editForm || !editForm.name.trim()) return;

    // Validate ID is not empty if it doesn't have combinations or isn't specifically "-"
    const finalForm = { ...editForm, id: editForm.id.trim() || '-' };
    delete finalForm.isNew;

    const updatedItems = items.map(item => {
      // Find the item being edited. Use isNew flag to identify uncommitted new items.
      if (editForm.isNew && item.isNew) return finalForm;
      if (!editForm.isNew && item.id === editForm.id && item.name === items.find(i => i.id === editForm.id)?.name) return finalForm; // Hacky way to match the exact item if IDs collide, but keeping it simple. We should ideally use unique internal IDs, but we'll map by index or exact match if not new.
      return item;
    });

    // A better approach to update:
    let newItems = [...items];
    const index = items.findIndex(i => (editForm.isNew ? i.isNew : i.id === editingId));
    if (index !== -1) {
      newItems[index] = finalForm;
    }
    
    onUpdateItems(newItems);
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (indexToDelete: number) => {
    onUpdateItems(items.filter((_, idx) => idx !== indexToDelete));
  };

  const handleAddNew = () => {
    const newItem: MealItem = {
      id: '',
      name: '',
      combinations: hasCombinations ? [] : undefined,
      isNew: true
    };
    onUpdateItems([...items, newItem]);
    setEditingId(newItem.id + '-new');
    setEditForm(newItem);
  };

  return (
    <section className={`bg-white rounded-3xl shadow-xl overflow-hidden border transition duration-300 flex flex-col h-full ${theme.section}`}>
      <div className={`p-6 flex-shrink-0 ${theme.headerBg}`}>
        <div className="flex items-center gap-3 text-white">
          <div className="opacity-90">{icon}</div>
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <p className={`mt-2 text-sm ${theme.headerText}`}>{subtitle}</p>
      </div>

      <div className="p-6 flex-grow flex flex-col gap-3 overflow-y-auto">
        <ul className="space-y-4">
          {items.map((item, idx) => {
            const isEditing = editingId === (item.id + (item.isNew ? '-new' : '')) || (item.isNew && editForm?.isNew);

            if (isEditing && editForm) {
              return (
                <li key={`edit-${idx}`} className="p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col gap-3 animate-fade-in-up">
                  <div className="flex gap-2">
                    <input
                      className="w-16 px-2 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-center"
                      placeholder="ID"
                      value={editForm.id}
                      onChange={(e) => setEditForm({ ...editForm, id: e.target.value })}
                    />
                    <input
                      className="flex-grow px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Nombre de la comida..."
                      value={editForm.name}
                      autoFocus
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  
                  {hasCombinations && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500 ml-1">Combinaciones (separadas por coma)</label>
                      <input
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Ej: D, 5, V"
                        value={editForm.combinations?.join(', ') || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditForm({ 
                            ...editForm, 
                            combinations: val.split(',').map(s => s.trim()).filter(Boolean) 
                          });
                        }}
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-1">
                    <button 
                      onClick={handleCancelEdit}
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Cancelar"
                    >
                      <XIcon />
                    </button>
                    <button 
                      onClick={handleSaveEdit}
                      className="p-1.5 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                      title="Guardar"
                    >
                      <CheckIcon />
                    </button>
                  </div>
                </li>
              );
            }

            return (
              <li key={`${item.id}-${idx}`} className={`flex flex-col gap-2 p-3 rounded-xl transition-colors group relative ${theme.itemHover}`}>
                <div className="flex items-start gap-4 w-full">
                  <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-transform group-hover:scale-110 ${theme.idBg} ${theme.idText}`}>
                    {item.id}
                  </span>
                  <div className="flex flex-col flex-grow min-w-0 pt-1">
                    <span className="text-gray-800 font-medium leading-tight truncate whitespace-normal break-words">
                      {item.name}
                    </span>
                    
                    {hasCombinations && item.combinations && item.combinations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.combinations.map((comb, i) => (
                          <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border transition-colors ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} ${theme.badgeHover}`}>
                            {comb}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex-shrink-0 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <button 
                      onClick={() => handleEditClick(item)}
                      className={`p-2 rounded-lg text-gray-400 transition-colors ${theme.buttonHover}`}
                      title="Editar"
                    >
                      <PencilIcon />
                    </button>
                    <button 
                      onClick={() => handleDelete(idx)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Add Target Button */}
        {!editForm?.isNew && (
          <button 
            onClick={handleAddNew}
            className={`mt-4 w-full py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-200 text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-gray-50`}
          >
            <PlusIcon />
            <span>Añadir {title.split(' ')[0]}</span>
          </button>
        )}
      </div>
    </section>
  );
}

export default function AdministrarComidasPage() {
  const { 
    ensaladas, 
    acompanantes, 
    cremasCaldos, 
    proteinas, 
    setEnsaladas, 
    setAcompanantes, 
    setCremasCaldos, 
    setProteinas 
  } = useMealStore();

  // Theme Definitions to avoid Tailwind Purge issues
  const themes = {
    ensaladas: {
      section: 'shadow-green-100/50 hover:shadow-green-200 border-green-50',
      headerBg: 'bg-gradient-to-br from-green-400 to-emerald-500',
      headerText: 'text-green-50',
      itemHover: 'hover:bg-green-50',
      idBg: 'bg-green-100',
      idText: 'text-green-700',
      buttonHover: 'hover:text-green-600 hover:bg-green-100',
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-800',
      badgeBorder: 'border-green-200',
      badgeHover: 'group-hover:bg-green-200'
    },
    acompanantes: {
      section: 'shadow-amber-100/50 hover:shadow-amber-200 border-amber-50',
      headerBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
      headerText: 'text-amber-50',
      itemHover: 'hover:bg-amber-50',
      idBg: 'bg-amber-100',
      idText: 'text-amber-700',
      buttonHover: 'hover:text-amber-600 hover:bg-amber-100',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      badgeBorder: 'border-amber-200',
      badgeHover: 'group-hover:bg-amber-200'
    },
    cremasCaldos: {
      section: 'shadow-blue-100/50 hover:shadow-blue-200 border-blue-50',
      headerBg: 'bg-gradient-to-br from-cyan-400 to-blue-500',
      headerText: 'text-blue-50',
      itemHover: 'hover:bg-blue-50',
      idBg: 'bg-blue-100',
      idText: 'text-blue-700',
      buttonHover: 'hover:text-blue-600 hover:bg-blue-100',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      badgeBorder: 'border-blue-200',
      badgeHover: 'group-hover:bg-blue-200'
    },
    proteinas: {
      section: 'shadow-rose-100/50 hover:shadow-rose-200 border-rose-50',
      headerBg: 'bg-gradient-to-br from-rose-400 to-red-500',
      headerText: 'text-rose-50',
      itemHover: 'hover:bg-rose-50',
      idBg: 'bg-rose-100',
      idText: 'text-rose-700',
      buttonHover: 'hover:text-rose-600 hover:bg-rose-100',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      badgeBorder: 'border-rose-200',
      badgeHover: 'group-hover:bg-rose-200'
    }
  };

  return (
    <main className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up h-[calc(100vh-4rem)] flex flex-col">
      <header className="mb-8 text-center flex-shrink-0">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 tracking-tight">
          Administrar Comidas
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          Organiza, combina y descubre el menú de tu semana. Tus cambios se guardarán automáticamente en esta sesión.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-grow min-h-0">
        <EditableList
          title="Ensaladas"
          subtitle="Refrescantes y llenas de vida"
          items={ensaladas}
          onUpdateItems={setEnsaladas}
          theme={themes.ensaladas}
          icon={(
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          )}
        />

        <EditableList
          title="Acompañantes"
          subtitle="El complemento perfecto"
          items={acompanantes}
          onUpdateItems={setAcompanantes}
          theme={themes.acompanantes}
          icon={(
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          )}
        />

        <EditableList
          title="Cremas y Caldos"
          subtitle="Sabor y confort en un plato"
          items={cremasCaldos}
          onUpdateItems={setCremasCaldos}
          theme={themes.cremasCaldos}
          icon={(
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          )}
        />

        <EditableList
          title="Plato Principal"
          subtitle="Las proteínas y sus combinaciones"
          items={proteinas}
          onUpdateItems={setProteinas}
          theme={themes.proteinas}
          hasCombinations
          icon={(
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          )}
        />
      </div>
    </main>
  );
}
