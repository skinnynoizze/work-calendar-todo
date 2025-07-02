// Funciones genéricas para manejo de categorías

// Interfaz genérica para entidades con categoría
interface EntityWithCategory {
  category?: string;
  color?: string;
}

// Función genérica para extraer categorías únicas
export const getUniqueCategories = <T extends EntityWithCategory>(
  entities: T[]
): Array<{ name: string; color: string }> => {
  const categoryMap = new Map<string, string>();
  
  entities.forEach(entity => {
    if (entity.category && !categoryMap.has(entity.category)) {
      categoryMap.set(entity.category, entity.color || '#3B82F6');
    }
  });
  
  return Array.from(categoryMap.entries()).map(([name, color]) => ({ name, color }));
}; 