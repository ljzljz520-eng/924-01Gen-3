import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Dish, Combo, Category, TemplateConfig, Allergen } from '@/types'

interface MenuStore {
  dishes: Dish[]
  combos: Combo[]
  categories: Category[]
  templateConfig: TemplateConfig
  addDish: (dish: Omit<Dish, 'id'>) => void
  updateDish: (id: string, updates: Partial<Dish>) => void
  deleteDish: (id: string) => void
  batchPriceAdjust: (ids: string[], mode: 'percent' | 'fixed', value: number) => void
  addCombo: (combo: Omit<Combo, 'id' | 'savings'>) => void
  updateCombo: (id: string, updates: Partial<Combo>) => void
  deleteCombo: (id: string) => void
  addCategory: (name: string) => void
  updateCategory: (id: string, name: string) => void
  deleteCategory: (id: string) => void
  reorderCategories: (categories: Category[]) => void
  updateTemplateConfig: (config: Partial<TemplateConfig>) => void
}

const defaultCategories: Category[] = [
  { id: 'cat-1', name: '凉菜', order: 0 },
  { id: 'cat-2', name: '热菜', order: 1 },
  { id: 'cat-3', name: '主食', order: 2 },
  { id: 'cat-4', name: '饮品', order: 3 },
]

const defaultDishes: Dish[] = [
  { id: 'dish-1', name: '口水鸡', price: 38, category: 'cat-1', spiciness: 3, allergens: ['peanut', 'sesame'] as Allergen[], description: '经典川菜凉菜，麻辣鲜香' },
  { id: 'dish-2', name: '凉拌黄瓜', price: 18, category: 'cat-1', spiciness: 1, allergens: [] as Allergen[], description: '清脆爽口，蒜香浓郁' },
  { id: 'dish-3', name: '麻婆豆腐', price: 32, category: 'cat-2', spiciness: 4, allergens: ['soy'] as Allergen[], description: '麻辣鲜烫，嫩滑入味' },
  { id: 'dish-4', name: '宫保鸡丁', price: 36, category: 'cat-2', spiciness: 3, allergens: ['peanut'] as Allergen[], description: '酸甜微辣，花生香脆' },
  { id: 'dish-5', name: '清蒸鲈鱼', price: 68, category: 'cat-2', spiciness: 0, allergens: ['seafood'] as Allergen[], description: '鲜嫩清甜，原汁原味' },
  { id: 'dish-6', name: '米饭', price: 3, category: 'cat-3', spiciness: 0, allergens: [] as Allergen[], description: '东北珍珠米' },
  { id: 'dish-7', name: '担担面', price: 22, category: 'cat-3', spiciness: 4, allergens: ['peanut', 'gluten'] as Allergen[], description: '芝麻酱香，面条筋道' },
  { id: 'dish-8', name: '酸梅汤', price: 12, category: 'cat-4', spiciness: 0, allergens: [] as Allergen[], description: '古法熬制，酸甜解腻' },
  { id: 'dish-9', name: '柠檬茶', price: 15, category: 'cat-4', spiciness: 0, allergens: [] as Allergen[], description: '鲜柠檬现泡，清爽怡人' },
]

const defaultCombos: Combo[] = [
  { id: 'combo-1', name: '双人套餐', dishIds: ['dish-4', 'dish-3', 'dish-6', 'dish-8'], comboPrice: 72, savings: 11 },
  { id: 'combo-2', name: '单人简餐', dishIds: ['dish-7', 'dish-8'], comboPrice: 28, savings: 6 },
]

let _counter = 100
function genId(prefix: string) {
  _counter++
  return `${prefix}-${_counter}`
}

export const useMenuStore = create<MenuStore>()(
  persist(
    (set) => ({
      dishes: defaultDishes,
      combos: defaultCombos,
      categories: defaultCategories,
      templateConfig: {
        size: 'A4-trifold',
        showFoldLines: true,
        showCropMarks: true,
        showSafeZone: true,
      },

      addDish: (dish) =>
        set((s) => ({ dishes: [...s.dishes, { ...dish, id: genId('dish') }] })),

      updateDish: (id, updates) =>
        set((s) => ({
          dishes: s.dishes.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),

      deleteDish: (id) =>
        set((s) => ({
          dishes: s.dishes.filter((d) => d.id !== id),
          combos: s.combos.map((c) => ({
            ...c,
            dishIds: c.dishIds.filter((did) => did !== id),
          })),
        })),

      batchPriceAdjust: (ids, mode, value) =>
        set((s) => ({
          dishes: s.dishes.map((d) => {
            if (!ids.includes(d.id)) return d
            const newPrice =
              mode === 'percent'
                ? Math.round(d.price * (1 + value / 100))
                : Math.max(0, d.price + value)
            return { ...d, price: newPrice }
          }),
        })),

      addCombo: (combo) => {
        const id = genId('combo')
        const totalOriginal = combo.dishIds.reduce((sum, did) => {
          const dish = defaultDishes.find((d) => d.id === did)
          return sum + (dish?.price ?? 0)
        }, 0)
        const savings = totalOriginal - combo.comboPrice
        set((s) => ({ combos: [...s.combos, { ...combo, id, savings }] }))
      },

      updateCombo: (id, updates) =>
        set((s) => ({
          combos: s.combos.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteCombo: (id) =>
        set((s) => ({ combos: s.combos.filter((c) => c.id !== id) })),

      addCategory: (name) =>
        set((s) => ({
          categories: [
            ...s.categories,
            { id: genId('cat'), name, order: s.categories.length },
          ],
        })),

      updateCategory: (id, name) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, name } : c
          ),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories
            .filter((c) => c.id !== id)
            .map((c, i) => ({ ...c, order: i })),
          dishes: s.dishes.filter((d) => d.category !== id),
        })),

      reorderCategories: (categories) => set({ categories }),

      updateTemplateConfig: (config) =>
        set((s) => ({
          templateConfig: { ...s.templateConfig, ...config },
        })),
    }),
    { name: 'menu-designer-store' }
  )
)
