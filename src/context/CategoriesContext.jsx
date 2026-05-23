// CategoriesContext — единый источник правды по категориям.
// При запуске подгружает GET /api/categories и мерджит с локальной CATEGORIES
// (для иконок/slug-ов знакомых нам категорий). Новые категории (которые создал
// админ) сразу появляются в селектах и каталоге.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { categoriesApi } from '../api';
import { CATEGORIES as STATIC_CATEGORIES } from '../data/products';

const CategoriesContext = createContext();

// Утилита: транслит названия категории в slug.
// Используется для новых категорий, которых нет в STATIC_CATEGORIES.
function slugify(text) {
  const m = {
    а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',
    к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',
    х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya',
  };
  return String(text || '').toLowerCase()
    .split('').map(ch => m[ch] ?? ch).join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || `cat-${Math.random().toString(36).slice(2, 7)}`;
}

export function CategoriesProvider({ children }) {
  const [list, setList]     = useState(STATIC_CATEGORIES); // оптимистичный старт со статичных
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const fromApi = await categoriesApi.list();
      // Мерджим: для каждой категории с бэка ищем статический slug по backendId или backendName.
      const merged = [
        STATIC_CATEGORIES.find(c => c.id === 'all'),
      ];
      for (const dto of fromApi) {
        const known = STATIC_CATEGORIES.find(
          c => c.backendId === dto.id || c.backendName === dto.name
        );
        if (known) {
          merged.push({
            ...known,
            backendId: dto.id,
            backendName: dto.name,
            productsCount: dto.productsCount,
          });
        } else {
          // Новая категория, неизвестная фронту. Используем slug = backendId
          // (для роута /catalog/123). label = name. Иконка fallback на 'all'.
          merged.push({
            id: `cat-${dto.id}`,        // slug для URL — стабильный
            label: dto.name,
            backendId: dto.id,
            backendName: dto.name,
            productsCount: dto.productsCount,
            _custom: true,
          });
        }
      }
      setList(merged.filter(Boolean));
    } catch {
      // оставляем статический список
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const value = useMemo(() => ({
    categories: list,
    loading,
    reload,
    // Утилита: вернуть категорию по фронтовому slug или backendId.
    findBySlug: (slug) => list.find(c => c.id === slug),
    findByBackendId: (id) => list.find(c => c.backendId === Number(id)),
  }), [list, loading, reload]);

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export const useCategories = () => useContext(CategoriesContext);
